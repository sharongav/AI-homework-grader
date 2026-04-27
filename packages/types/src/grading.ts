import { z } from 'zod';

// ── Structured output schema for the grading model ──────────
export const CriterionGradeSchema = z.object({
  criterionId: z.string(),
  criterionName: z.string(),
  score: z.number(),
  maxScore: z.number(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  evidenceCitations: z.array(
    z.object({
      chunkId: z.string(),
      chunkLabel: z.string(),
      relevantText: z.string(),
    }),
  ),
  deductions: z.array(
    z.object({
      points: z.number(),
      reason: z.string(),
      criterionId: z.string(),
      citedChunkId: z.string().optional(),
      citedChunkLabel: z.string().optional(),
    }),
  ),
});

export type CriterionGrade = z.infer<typeof CriterionGradeSchema>;

export const GradingOutputSchema = z.object({
  criterionGrades: z.array(CriterionGradeSchema),
  totalScore: z.number(),
  maxTotalScore: z.number(),
  overallConfidence: z.number().min(0).max(1),
  strengths: z.array(
    z.object({
      text: z.string(),
      anchorJson: z.record(z.unknown()).optional(),
      criterionId: z.string().optional(),
    }),
  ),
  weaknesses: z.array(
    z.object({
      text: z.string(),
      anchorJson: z.record(z.unknown()).optional(),
      criterionId: z.string(),
      citedChunkId: z.string().optional(),
      citedChunkLabel: z.string().optional(),
    }),
  ),
  conceptAnalysis: z.array(
    z.object({
      conceptId: z.string(),
      conceptName: z.string(),
      status: z.enum(['mastered', 'developing', 'needs_work']),
    }),
  ),
  practiceRecommendations: z.array(
    z.object({
      text: z.string(),
      relatedMaterialIds: z.array(z.string()),
    }),
  ),
  encouragement: z.string(),
  generalObservations: z.array(z.string()),
  annotations: z.array(
    z.object({
      anchorJson: z.record(z.unknown()),
      body: z.string(),
      kind: z.enum(['STRENGTH', 'DEDUCTION', 'OBSERVATION']),
      criterionId: z.string().optional(),
      citedChunkIds: z.array(z.string()),
    }),
  ),
});

export type GradingOutput = z.infer<typeof GradingOutputSchema>;

// ── Verification pass output ────────────────────────────────
export const VerificationOutputSchema = z.object({
  overallValid: z.boolean(),
  issues: z.array(
    z.object({
      type: z.enum([
        'scoring_mismatch',
        'uncited_deduction',
        'out_of_scope_criterion',
        'injection_bypass_suspected',
        'evidence_not_in_materials',
      ]),
      description: z.string(),
      criterionId: z.string().optional(),
    }),
  ),
});

export type VerificationOutput = z.infer<typeof VerificationOutputSchema>;
