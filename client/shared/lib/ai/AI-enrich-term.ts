import { deepseek } from './deepseek';
import OpenAI from 'openai';
import * as fs from 'node:fs';
import pLimit from 'p-limit';
import { AppError } from '@/shared/errors/errors';
import { SYSTEM_PROMPT } from './prompts';

import {
  EnrichedTerm,
  ParsedTerm,
  CheckpointData,
  CheckpointDataSchema,
  EnrichedSchema,
} from '../scripts/parse-schemas';
export interface EnrichOptions {
  concurrency?: number; // Max in-flight requests (default: 10)
  maxRetries?: number; // Max retries per batch (default: 3)
  checkpointPath?: string; // Path to checkpoint file; omit to disable
}

export const DEFAULT_OPTIONS: Required<EnrichOptions> = {
  concurrency: 50,
  maxRetries: 3,
  checkpointPath: './checkpoint.log',
};

// Structured output schema passed directly to the API
export const RESPONSE_FORMAT = {
  type: 'json_object' as const,
};

export async function AIEnrichTerm(
  parsedTerms: ParsedTerm[],
  options: EnrichOptions = {},
): Promise<EnrichedTerm[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const total = parsedTerms.length;
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
  let processed = 0;

  const tasks = parsedTerms.map((term, i) =>
    limit(async () => {
      // 2.1 Skip completed term
      if (results[i] != null) return;

      // 2.2 Send enrich request
      const enriched = await enrichTerm(term, opts.maxRetries);
      if (enriched) results[i] = enriched;

      processed++;

      // 2.3 Print progress and save checkpoint
      if (processed % 50 === 0 || processed === total) {
        const totalSuccess = results.filter(Boolean).length;
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = totalSuccess / elapsed;
        const remaining = (total - totalSuccess) / rate;
        process.stdout.write(
          `\r[progress] ${totalSuccess}/${total} | ${rate.toFixed(1)} terms/s | ETA ${formatSeconds(remaining)}   `,
        );
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

async function enrichTerm(
  term: ParsedTerm,
  maxRetries: number,
): Promise<EnrichedTerm | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    try {
      const response = await deepseek.chat.completions.create(
        {
          model: 'deepseek-v4-flash',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: JSON.stringify(term) },
          ],
          response_format: RESPONSE_FORMAT,
        },
        { signal: controller.signal },
      );

      const content = response.choices[0].message.content ?? '[]';
      const parsed = EnrichedSchema.safeParse(JSON.parse(content));
      if (!parsed.success) throw new AppError('Parsed failed');

      return { ...parsed.data, ...term };
    } catch (err: unknown) {
      const isLast = attempt === maxRetries;

      if (err instanceof Error && err.name === 'AbortError') {
        console.error(`\n[timeout] timed out`);
        if (isLast) return null;
        continue;
      }

      if (!(err instanceof OpenAI.APIError)) {
        console.error(`\n[error] unexpected error:`, err);
        return null;
      }

      if (isLast) {
        console.error(`\n[error] Failed after all retries: ${err.message}`);
        return null;
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

  return null;
}

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
