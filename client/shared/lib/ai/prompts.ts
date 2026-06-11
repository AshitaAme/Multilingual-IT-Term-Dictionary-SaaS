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

export const ENRICH_TERM_SYSTEM_PROMPT = `You are a terminology enrichment assistant.
Given a JSON term, return a JSON object of the same length and order.
Output object must have:
- targetDefinition: translate sourceDefinition to targetLang; omit field if sourceDefinition is absent
- sourceTags: array of exactly 3 IT or technology related tags in sourceLang for the source term
- targetTags: sourceTags translated to targetLang (same order, same length)

Preferred tags (use exact spelling when they fit):
${PRESET_TAGS.join(', ')}

Rules:
- Only add custom tags if none of the preferred tags fit
- sourceTags and targetTags must always have equal length
- Respond ONLY with a raw JSON object, no markdown, no extra fields`;

export const GENERATE_TERM_SYSTEM_PROMPT = '';
