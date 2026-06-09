import { deepseek } from './deepseek';
import OpenAI from 'openai';
import * as fs from 'node:fs';
import pLimit from 'p-limit';
import { z } from 'zod';
import { AppError } from '@/shared/errors/errors';
import { SYSTEM_PROMPT, buildBatchPrompt } from './build-prompt';

import {
  EnrichedTerm,
  ParsedTerm,
  CheckpointData,
  CheckpointDataSchema,
} from '../scripts/parse-schemas';

// ─── Config ──────────────────────────────────

interface EnrichOptions {
  concurrency?: number; // Max in-flight requests (default: 10)
  maxRetries?: number; // Max retries per batch (default: 3)
  checkpointPath?: string; // Path to checkpoint file; omit to disable
  checkpointInterval?: number; // Save checkpoint every N batches (default: 5)
}

const DEFAULT_OPTIONS: Required<EnrichOptions> = {
  concurrency: 10,
  maxRetries: 3,
  checkpointPath: './checkpoint.log',
  checkpointInterval: 5,
};

const BATCH_SIZE = 20;

// ─── Response Schema ──────────────────────────────────

const EnrichedItemSchema = z.object({
  targetDefinition: z.string().optional(),
  sourceTags: z.array(z.string()).length(3),
  targetTags: z.array(z.string()).length(3),
});

const EnrichedBatchSchema = z.array(EnrichedItemSchema);

// Structured output schema passed directly to the API
const RESPONSE_FORMAT = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'enriched_batch',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          targetDefinition: { type: 'string' },
          sourceTags: {
            type: 'array',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 3,
          },
          targetTags: {
            type: 'array',
            items: { type: 'string' },
            minItems: 3,
            maxItems: 3,
          },
        },
        required: ['sourceTags', 'targetTags'],
      },
    },
    strict: true,
  },
} as const;

// ─── Main ──────────────────────────────────

export async function AIEnrichTerm(
  parsedTerms: ParsedTerm[],
  options: EnrichOptions = {},
): Promise<EnrichedTerm[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const total = parsedTerms.length;
  const totalBatches = Math.ceil(total / BATCH_SIZE);
  const limit = pLimit(opts.concurrency);
  const startTime = Date.now();

  // 1. Resume from checkpoint
  const checked = loadCheckpoint(opts.checkpointPath, total);
  const results = checked.length === 0 ? new Array(total).fill(null) : checked;

  const completed = results.filter(Boolean).length;
  if (completed > 0) {
    console.log(`[checkpoint] Resuming — ${completed}/${total} already done`);
  }

  // 2. Dispatch batches
  let processedBatches = 0;

  const tasks = Array.from({ length: totalBatches }, (_, batchIndex) =>
    limit(async () => {
      const startIndex = batchIndex * BATCH_SIZE;
      const batchTerms = parsedTerms.slice(startIndex, startIndex + BATCH_SIZE);

      // Skip batch if all entries are already done
      if (batchTerms.every((_, i) => results[startIndex + i] !== null)) return;

      const enriched = await enrichBatch(
        batchTerms,
        batchIndex,
        opts.maxRetries,
      );
      enriched.forEach((item, i) => {
        if (item !== null) results[startIndex + i] = item;
      });

      processedBatches++;

      // 2.1 Print progress
      const totalSuccess = results.filter(Boolean).length;
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = totalSuccess / elapsed;
      const remaining = (total - totalSuccess) / rate;
      process.stdout.write(
        `\r[progress] ${totalSuccess}/${total} | batch ${processedBatches}/${totalBatches} | ${rate.toFixed(1)} terms/s | ETA ${formatSeconds(remaining)}   `,
      );

      // 2.2 Save checkpoint
      if (
        opts.checkpointPath &&
        processedBatches % opts.checkpointInterval === 0
      ) {
        saveCheckpoint(opts.checkpointPath, results);
      }
    }),
  );

  await Promise.all(tasks);
  process.stdout.write('\n');

  // 3. Fall back to raw data for any entries that ultimately failed
  let finalFailed = 0;
  results.forEach((r, i) => {
    if (r === null) {
      results[i] = { ...parsedTerms[i] };
      finalFailed++;
    }
  });
  if (finalFailed > 0) {
    console.warn(
      `[warn] ${finalFailed} term(s) failed — falling back to raw data`,
    );
  }

  console.log(`Done: ${total} terms processed`);
  return results as EnrichedTerm[];
}

// ─── Batch Request with Retry ──────────────────────────────────

async function enrichBatch(
  terms: ParsedTerm[],
  batchIndex: number,
  maxRetries: number,
): Promise<(EnrichedTerm | null)[]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    try {
      const response = await deepseek.chat.completions.create(
        {
          model: 'deepseek-v4-flash',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildBatchPrompt(terms) },
          ],
          response_format: RESPONSE_FORMAT,
        },
        { signal: controller.signal },
      );

      const content = response.choices[0].message.content ?? '[]';
      const parsed = EnrichedBatchSchema.safeParse(JSON.parse(content));

      if (!parsed.success || parsed.data.length !== terms.length) {
        throw new AppError(
          `enrichBatch[${batchIndex}]: response length mismatch or schema error`,
        );
      }

      return parsed.data.map((item, i) => ({ ...terms[i], ...item }));
    } catch (err: unknown) {
      const isLast = attempt === maxRetries;

      if (err instanceof Error && err.name === 'AbortError') {
        console.error(
          `\n[timeout] batch[${batchIndex}] attempt ${attempt} timed out`,
        );
        if (isLast) return new Array(terms.length).fill(null);
        continue;
      }

      if (!(err instanceof OpenAI.APIError)) {
        console.error(`\n[error] batch[${batchIndex}] unexpected error:`, err);
        return new Array(terms.length).fill(null);
      }

      if (isLast) {
        console.error(
          `\n[error] batch[${batchIndex}] failed after all retries: ${err.message}`,
        );
        return new Array(terms.length).fill(null);
      }

      const delay =
        err.status === 429
          ? 15_000 + jitter(3_000)
          : Math.min(1_000 * 2 ** attempt + jitter(500), 30_000);
      await sleep(delay);
    } finally {
      clearTimeout(timeout);
    }
  }

  return new Array(terms.length).fill(null);
}

// ─── Checkpoint Helpers ──────────────────────────────────

function saveCheckpoint(path: string, results: (EnrichedTerm | null)[]) {
  try {
    const data: CheckpointData = { results, completedAt: Date.now() };
    fs.writeFileSync(path + '.tmp', JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(path + '.tmp', path);
  } catch (err) {
    console.warn(`[checkpoint] Failed to save:`, err);
  }
}

function loadCheckpoint(path: string, total: number): (EnrichedTerm | null)[] {
  if (!path || !fs.existsSync(path)) return [];
  try {
    const parsed = CheckpointDataSchema.safeParse(
      JSON.parse(fs.readFileSync(path, 'utf-8')),
    );
    if (!parsed.success) return [];
    if (parsed.data.results.length !== total) {
      console.warn(`[checkpoint] Length mismatch — ignoring checkpoint`);
      return [];
    }
    return parsed.data.results;
  } catch {
    console.warn('[checkpoint] Failed to read — ignoring checkpoint');
    return [];
  }
}

// ─── Utilities ──────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function jitter(maxMs: number): number {
  return Math.floor(Math.random() * maxMs);
}

function formatSeconds(s: number): string {
  if (!Number.isFinite(s)) return '--';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m > 0 ? `${m}m${sec}s` : `${sec}s`;
}
