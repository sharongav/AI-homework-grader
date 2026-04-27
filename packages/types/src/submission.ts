import { z } from 'zod';

export const SubmissionFileSchema = z.object({
  filename: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  storageKey: z.string(),
});

export type SubmissionFile = z.infer<typeof SubmissionFileSchema>;

export const LatePolicySchema = z.object({
  gracePeriodMinutes: z.number().default(0),
  penaltyPercentPerDay: z.number().min(0).max(100).default(0),
  maxLateDays: z.number().min(0).default(0),
});

export type LatePolicy = z.infer<typeof LatePolicySchema>;

export const AIConfigSchema = z.object({
  strictness: z.enum(['lenient', 'standard', 'strict']).default('standard'),
  gradeStyle: z.boolean().default(false),
  allowedTopics: z.array(z.string()).optional(),
  deniedTopics: z.array(z.string()).optional(),
});

export type AIConfig = z.infer<typeof AIConfigSchema>;
