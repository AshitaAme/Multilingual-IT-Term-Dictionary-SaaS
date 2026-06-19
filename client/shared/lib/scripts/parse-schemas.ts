import z from 'zod';

export const ParsedTermSchema = z.object({
  source: z.string().trim().nonempty(), // source language term
  sourceLang: z.string().trim().nonempty(), // source language code
  target: z.string().trim().nonempty(), // target language term
  targetLang: z.string().trim().nonempty(), // target language code
  sourceDefinition: z.string().optional(), // optional definition from descripGrp
});

export const EnrichedTermSchema = ParsedTermSchema.extend({
  targetDefinition: z.string().optional(),
  sourceTags: z.array(z.string()).optional(),
  targetTags: z.array(z.string()).optional(),
});

export type ParsedTerm = z.infer<typeof ParsedTermSchema>;
export type EnrichedTerm = z.infer<typeof EnrichedTermSchema>;

// AI response schema
export const EnrichedSchema = z.object({
  targetDefinition: z.string().min(1).optional(),
  sourceTags: z.array(z.string().min(1)).optional(),
  targetTags: z.array(z.string().min(1)).optional(),
});

export const CheckpointDataSchema = z.object({
  results: z.array(EnrichedTermSchema.nullable()),
  completedAt: z.number(),
});

export type CheckpointData = z.infer<typeof CheckpointDataSchema>;
