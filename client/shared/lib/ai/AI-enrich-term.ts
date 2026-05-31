import { deepseek } from './deepseek';
import OpenAI from 'openai';
import * as fs from 'node:fs';
import pLimit from 'p-limit';
import z from 'zod';
import { AppError } from '@/shared/errors/errors';
import {
  EnrichedTerm,
  EnrichedTermSchema,
  ParsedTerm,
} from '../scripts/transfer-tbx';
import { buildPrompt } from './build-prompt';

// ─── Type ──────────────────────────────────

const CheckpointDataSchema = z.object({
  results: z.array(EnrichedTermSchema.nullable()),
  completedAt: z.number(),
});

export type CheckpointData = z.infer<typeof CheckpointDataSchema>;

// AI response schema
const EnrichedSchema = z.object({
  targetDefinition: z.string().min(1).optional(),
  sourceTags: z.array(z.string().min(1)).optional(),
  targetTags: z.array(z.string().min(1)).optional(),
});

// ─── Config ──────────────────────────────────
interface EnrichOptions {
  concurrency?: number; // Max number of in-flight requests (default: 30)
  maxRetries?: number; // Max retries per term (default: 3)
  checkpointPath?: string; // Path to checkpoint file; omit to disable
  checkpointInterval?: number; // Save checkpoint every N completions (default: 200)
}

const DEFAULT_OPTIONS: Required<EnrichOptions> = {
  concurrency: 30,
  maxRetries: 3,
  checkpointPath: '',
  checkpointInterval: 200,
};

export async function AIEnrichTerm(
  parsedTerms: ParsedTerm[],
  options: EnrichOptions = {},
): Promise<EnrichedTerm[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const total = parsedTerms.length;
  const limit = pLimit(opts.concurrency);
  const startTime = Date.now();

  // 1. Resume from checkpoint if there exists
  const checked = loadCheckpoint(opts.checkpointPath, total);
  const results: (EnrichedTerm | null)[] =
    // In case of null, it is used to indicate uncompleted request and hold index in array
    checked.length === 0 ? new Array(total).fill(null) : checked;

  const completed = results.filter(Boolean).length;
  if (completed > 0) {
    console.log(
      `${AIEnrichTerm.name}: [checkpoint] Resuming - ${completed}/${total} already done`,
    );
  }

  // 2. Enrich parsedTerms with AI
  const unProcessed = total - completed;
  let processed = 0;

  const tasks = parsedTerms.map((term, index) =>
    // 2.1 Use limit to persist concurrency at 30
    limit(async () => {
      if (results[index] !== null) return; // Skip already-processed entries

      // 2.2 Send request to AI API
      results[index] = await enrichSingleTerm(term, index, opts.maxRetries);
      processed++;

      // 2.3 Print progress every 50 terms or on the final item
      if (processed % 50 === 0 || processed === unProcessed) {
        const totalSuccess = results.filter(Boolean).length;
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = processed / elapsed;
        const remaining = (total - totalSuccess) / rate;

        process.stdout.write(
          `\r[progress] ${totalSuccess}/${total} | ${rate.toFixed(1)} terms/s | ETA ${formatSeconds(remaining)}   `,
        );
      }

      // 2.4 Persist checkpoint at the configured interval
      if (opts.checkpointPath && processed % opts.checkpointInterval === 0) {
        saveCheckpoint(opts.checkpointPath, results);
      }
    }),
  );

  await Promise.all(tasks);
  process.stdout.write('\n');

  // 3. Fall back to raw term data for any entries that ultimately failed
  let finalFailed = 0;
  results.forEach((r, i) => {
    if (r === null) {
      results[i] = { ...parsedTerms[i] };
      finalFailed++;
    }
  });
  if (finalFailed > 0) {
    console.warn(
      `[warn] ${finalFailed} term(s) failed; falling back to raw data`,
    );
  }

  // 4. Remove checkpoint file on clean completion
  if (opts.checkpointPath && fs.existsSync(opts.checkpointPath)) {
    fs.unlinkSync(opts.checkpointPath);
  }

  // 5. Return results
  console.log(`Done: ${total} terms processed`);
  return results as EnrichedTerm[];
}

// ─── AI Processing with Retry ──────────────────────────────────

/**
 * Calls the AI API for a single term, retrying on transient errors.
 * Returns null if all attempts fail.
 */
async function enrichSingleTerm(
  term: ParsedTerm,
  index: number,
  maxRetries: number,
): Promise<EnrichedTerm | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await deepseek.chat.completions.create(
        {
          model: 'deepseek-v4-flash',
          messages: [{ role: 'user', content: buildPrompt(term) }],
          response_format: { type: 'json_object' },
        },
        { signal: controller.signal },
      );

      const content = response.choices[0].message.content ?? '{}';
      const parsed = EnrichedSchema.safeParse(JSON.parse(content));
      if (parsed.success) {
        const { targetDefinition, sourceTags, targetTags } = parsed.data;
        if (sourceTags?.length != targetTags?.length) {
          throw new AppError(`${enrichSingleTerm}: Unmatched tags generated`);
        }
        return { ...term, targetDefinition, sourceTags, targetTags };
      } else return null;
    } catch (err: unknown) {
      const isLast = attempt === maxRetries;

      if (err instanceof Error && err.name === 'AbortError') {
        console.error(
          `\n[timeout] term[${index}] attempt ${attempt} timed out`,
        );
        if (isLast) {
          console.error(
            `\n[error] term[${index}] "${term.source}" failed after all retries: ${err.message}`,
          );
          return null;
        }
        continue;
      }

      if (!(err instanceof OpenAI.APIError)) {
        console.error(`\n[error] term[${index}] unexpected error:`, err);
        return null;
      }

      if (isLast) {
        console.error(
          `\n[error] term[${index}] "${term.source}" failed after all retries: ${err.message}`,
        );
        return null;
      }

      // Back off longer on rate-limit errors (429), otherwise use exponential backoff
      const delay =
        err.status === 429
          ? 15000 + jitter(3000)
          : Math.min(1000 * 2 ** attempt + jitter(500), 30000);
      await sleep(delay);
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
}
// ─── Checkpoint Helpers ──────────────────────────────────

// Sava generated data to checkpoint file
function saveCheckpoint(path: string, results: (EnrichedTerm | null)[]) {
  try {
    const data: CheckpointData = { results, completedAt: Date.now() };

    // Write to temp file first to prevent writing failure damages original checkpoint file
    fs.writeFileSync(path + '.tmp', JSON.stringify(data), 'utf-8');
    fs.renameSync(path + '.tmp', path);
  } catch (err) {
    console.warn(`${saveCheckpoint.name} Failed to save:`, err);
  }
}

// Get previously generated data from checkpoint file
function loadCheckpoint(path: string, total: number): (EnrichedTerm | null)[] {
  if (!path || !fs.existsSync(path)) return [];
  try {
    const parsed = CheckpointDataSchema.safeParse(
      JSON.parse(fs.readFileSync(path, 'utf-8')),
    );

    if (!parsed.success) return [];
    if (parsed.data.results.length !== total) {
      console.warn(
        `${saveCheckpoint.name}: Length mismatch — ignoring checkpoint`,
      );
      return [];
    }
    return parsed.data.results;
  } catch {
    console.warn('[checkpoint] Failed to read — ignoring checkpoint');
    return [];
  }
}

// ─── Utilities ──────────────────────────────────

/** Resolves after `ms` milliseconds */
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Returns a random integer in [0, maxMs) for retry jitter */
function jitter(maxMs: number): number {
  return Math.floor(Math.random() * maxMs);
}

/** Formats a duration in seconds as "Xm Ys" or "Ys", returning "--" for non-finite values */
function formatSeconds(s: number): string {
  if (!Number.isFinite(s)) return '--';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m > 0 ? `${m}m${sec}s` : `${sec}s`;
}
