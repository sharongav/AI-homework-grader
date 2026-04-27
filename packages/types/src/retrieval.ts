import { z } from 'zod';

export const RetrievalScoresSchema = z.record(z.string(), z.number());

export type RetrievalScores = z.infer<typeof RetrievalScoresSchema>;

export const RetrievalConfigSchema = z.object({
  embedderModel: z.string(),
  embedderVersion: z.string(),
  rerankerModel: z.string(),
  rerankerVersion: z.string(),
  rrfKWeight: z.number().default(60),
  chunkStrategyVersion: z.string(),
});

export type RetrievalConfigInput = z.infer<typeof RetrievalConfigSchema>;
