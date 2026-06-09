import { ParsedTerm } from '../scripts/parse-schemas';

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

export const SYSTEM_PROMPT = `You are a terminology enrichment assistant.
Given a JSON array of terms, return a JSON array of the same length and order.
Each output object must have:
- targetDefinition: translate sourceDefinition to targetLang; omit field if sourceDefinition is absent
- sourceTags: array of exactly 3 tags in sourceLang for the source term
- targetTags: sourceTags translated to targetLang (same order, same length)

Preferred tags (use exact spelling when they fit):
${PRESET_TAGS.join(', ')}

Rules:
- Only add custom tags if none of the preferred tags fit
- sourceTags and targetTags must always have equal length
- Respond ONLY with a raw JSON array, no markdown, no extra fields`;

/** Constructs the enrichment prompt for a single term */
export function buildBatchPrompt(terms: ParsedTerm[]): string {
  return JSON.stringify(
    terms.map(
      ({ source, target, sourceLang, targetLang, sourceDefinition }) => ({
        source,
        target,
        sourceLang,
        targetLang,
        ...(sourceDefinition ? { sourceDefinition } : {}),
      }),
    ),
  );
}
