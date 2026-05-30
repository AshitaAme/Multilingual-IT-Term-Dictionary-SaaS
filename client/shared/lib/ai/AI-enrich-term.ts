import { ParsedTerm } from '../scripts/parse-tbx';
import { deepseek } from './deepseek';
import OpenAI from 'openai';
import * as fs from 'node:fs';
import pLimit from 'p-limit';
import z from 'zod';

// ========== Types ==========
export interface EnrichTerm extends ParsedTerm {
  targetDefinition?: string;
  sourceTags?: string[];
  targetTags?: string[];
}

interface CheckpointData {
  results: (EnrichTerm | null)[];
  completedAt: number;
}

/** Zod schema for validating the AI response shape */
const EnrichedSchema = z.object({
  targetDefinition: z.string().min(1).optional(),
  sourceTags: z.array(z.string().min(1)).optional(),
  targetTags: z.array(z.string().min(1)).optional(),
});

// ========== Config ==========
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

// ========== Entry Point ==========
/**
 * Enriches an array of parsed terms with AI-generated definitions and tags.
 * Supports checkpointing to resume interrupted runs.
 */
export async function AIEnrichTerm(
  parsedTerms: ParsedTerm[],
  options: EnrichOptions = {},
): Promise<EnrichTerm[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const total = parsedTerms.length;
  const limit = pLimit(opts.concurrency);
  let completed = 0;
  const startTime = Date.now();

  // 1. Resume from checkpoint if there exists
  const results: (EnrichTerm | null)[] = loadCheckpoint(
    opts.checkpointPath,
    total,
  );

  const alreadyDone = results.filter(Boolean).length;
  if (alreadyDone > 0) {
    console.log(`[checkpoint] Resuming: ${alreadyDone}/${total} already done`);
  }

  // 2. Enrich parsedTerms with AI
  const tasks = parsedTerms.map((term, index) =>
    // 2.1 Use limit to persist concurrency at 30
    limit(async () => {
      if (results[index] !== null) return; // Skip already-processed entries

      // 2.2 Send request to AI API
      results[index] = await enrichSingleTerm(term, index, opts.maxRetries);
      completed++;

      // 2.3 Print progress every 50 completions or on the final item
      if (completed % 50 === 0 || completed === total - alreadyDone) {
        const doneTotal = results.filter(Boolean).length;
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = completed / elapsed;
        const remaining = (total - doneTotal) / rate;
        process.stdout.write(
          `\r[progress] ${doneTotal}/${total} | ${rate.toFixed(1)} terms/s | ETA ${formatSeconds(remaining)}   `,
        );
      }

      // 2.4 Persist checkpoint at the configured interval
      if (opts.checkpointPath && completed % opts.checkpointInterval === 0) {
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
  console.log(`✅ Done: ${total} terms processed`);
  return results as EnrichTerm[];
}

// ========== AI Processing with Retry ==========

/**
 * Calls the AI API for a single term, retrying on transient errors.
 * Returns null if all attempts fail.
 */
async function enrichSingleTerm(
  term: ParsedTerm,
  index: number,
  maxRetries: number,
): Promise<EnrichTerm | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await deepseek.chat.completions.create({
        model: 'deepseek-v4-flash',
        messages: [{ role: 'user', content: buildPrompt(term) }],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content ?? '{}';
      const parsed = EnrichedSchema.safeParse(JSON.parse(content));
      if (parsed.success) {
        const { targetDefinition, sourceTags, targetTags } = parsed.data;
        return { ...term, targetDefinition, sourceTags, targetTags };
      } else return null;
    } catch (err: unknown) {
      const isLast = attempt === maxRetries;

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
    }
  }

  return null;
}

// ========== Prompt Builder ==========

/** Preferred tag vocabulary; reused across prompts for consistency */
const PRESET_TAGS = [
  'computerArchitecture',
  'frontend',
  'backend',
  'ai',
  'data',
  'cloudService',
  'git',
  'nextjs',
];

/** Constructs the enrichment prompt for a single term */
function buildPrompt(term: ParsedTerm): string {
  const defInstruction = term.definition
    ? `translate this definition to ${term.targetLang}: "${term.definition}"`
    : 'omit this field (do not include it in the response)';

  const lines = [
    'You are a terminology enrichment assistant. Return a JSON object with these fields:',
    `- targetDefinition: ${defInstruction}`,
    `- sourceTags: array of 3-5 tags in ${term.sourceLang} for the term "${term.source}"`,
    `- targetTags: translate sourceTags to ${term.targetLang}`,
    '',
    'Preferred tags (use these when they fit, exact spelling):',
    PRESET_TAGS.join(', '),
    '',
    `Source (${term.sourceLang}): ${term.source}`,
    `Target (${term.targetLang}): ${term.target}`,
    '',
    'Rules:',
    '- Prefer tags from the preferred list above; only add custom tags if none of them fit',
    '- sourceTags and targetTags must be arrays of strings',
    `- All values must be proper ${term.sourceLang}/${term.targetLang}, no placeholders`,
    '- Respond ONLY with raw JSON, no markdown, no extra fields',
  ];

  return lines.join('\n');
}

// ========== Checkpoint Helpers ==========

/** Serializes current results to a JSON checkpoint file */
function saveCheckpoint(path: string, results: (EnrichTerm | null)[]): void {
  try {
    const data: CheckpointData = { results, completedAt: Date.now() };
    fs.writeFileSync(path, JSON.stringify(data), 'utf-8');
  } catch (e) {
    console.warn('[checkpoint] Failed to save:', e);
  }
}

/**
 * Loads a checkpoint file and returns its results array.
 * Returns a fresh null-filled array if the file is absent, unreadable, or mismatched.
 */
function loadCheckpoint(path: string, total: number): (EnrichTerm | null)[] {
  if (!path || !fs.existsSync(path)) {
    return new Array(total).fill(null);
  }
  try {
    const data: CheckpointData = JSON.parse(fs.readFileSync(path, 'utf-8'));
    if (data.results.length !== total) {
      console.warn('[checkpoint] Length mismatch — ignoring checkpoint');
      return new Array(total).fill(null);
    }
    return data.results;
  } catch {
    console.warn('[checkpoint] Failed to read — ignoring checkpoint');
    return new Array(total).fill(null);
  }
}

// ========== Utilities ==========
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
