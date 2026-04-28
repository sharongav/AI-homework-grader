/**
 * Unified grading pipeline per §8.2.
 * One code path for all assignment types.
 *
 * Steps:
 * 1. Ingest submission (per-format rules from §8.1)
 * 2. Pre-check (virus scan, size, format, sanitization)
 * 3. Idempotency check (Hard Rule 16)
 * 4. Scope retrieval (RAG per §8.5)
 * 5. Unified grading call (frontier model — Hard Rule 11)
 * 6. Structured output validation with retry (§9.2)
 * 7. Verification pass (second frontier model call)
 * 8. Aggregate scores
 * 9. Persist (Grade, Feedback, Annotations, RetrievalSnapshot)
 * 10. Route for release (auto-release or human review)
 */

import { z } from 'zod';
import { sanitizeStudentContent, wrapStudentContent } from './sanitizer';
import { computeIdempotencyKey } from './idempotency';

// ─── Types ───────────────────────────────────────────────────

export interface GradingJobData {
  submissionId: string;
  assignmentId: string;
  courseId: string;
  universityId: string;
  attemptNumber: number;
  isDryRun?: boolean;
}

export type GradingOutcome =
  | 'RELEASED'
  | 'HELD_FOR_APPROVAL'
  | 'FLAGGED_FOR_REVIEW'
  | 'NEEDS_MANUAL_GRADE'
  | 'FAILED';

export interface GradingResult {
  success: boolean;
  gradeId?: string;
  outcome: GradingOutcome;
  reason?: string;
  durationMs: number;
}

export interface CriterionGrade {
  criterionId: string;
  criterionName: string;
  score: number;
  maxScore: number;
  confidence: number;
  reasoning: string;
  citations: Array<{
    chunkId: string;
    excerpt: string;
    sectionPath: string;
  }>;
  annotations: Array<{
    startOffset: number;
    endOffset: number;
    type: 'STRENGTH' | 'DEDUCTION' | 'OBSERVATION';
    text: string;
  }>;
}

export interface GradingOutput {
  totalScore: number;
  maxTotalScore: number;
  overallConfidence: number;
  criterionGrades: CriterionGrade[];
  strengths: string[];
  weaknesses: string[];
  conceptMastery: Array<{ concept: string; level: string }>;
  nextSteps: string[];
  encouragement: string;
}

// ─── Pipeline ────────────────────────────────────────────────

export class GradingPipeline {
  /**
   * Execute the full grading pipeline for a submission.
   */
  async execute(job: GradingJobData): Promise<GradingResult> {
    const startTime = Date.now();

    try {
      // Step 1: Ingest submission
      const ingestedContent = await this.ingestSubmission(job.submissionId);

      // Step 2: Pre-checks
      await this.preCheck(ingestedContent);

      // Step 3: Idempotency check (Hard Rule 16)
      // TODO: load promptVersion, rubricVersionId, retrievalConfigId, modelSnapshot from DB/config
      const idempotencyKey = computeIdempotencyKey({
        submissionId: job.submissionId,
        attemptNumber: job.attemptNumber,
        promptVersion: 'grading.unified.v1',
        rubricVersionId: 'pending',
        retrievalConfigId: 'pending',
        modelSnapshot: 'pending',
      });
      const existingGrade = await this.checkIdempotency(idempotencyKey);
      if (existingGrade) {
        return {
          success: true,
          gradeId: existingGrade,
          outcome: 'RELEASED',
          reason: 'Idempotency hit — returning existing grade',
          durationMs: Date.now() - startTime,
        };
      }

      // Step 4: Scope retrieval (RAG per §8.5)
      const rubricCriteria = await this.loadRubricCriteria(job.assignmentId);
      const retrieval = await this.scopeRetrieval(job, rubricCriteria);

      // Step 5: Unified grading call
      const sanitizedContent = sanitizeStudentContent(ingestedContent.text);
      const wrappedContent = wrapStudentContent(sanitizedContent, 'submission');

      const gradingOutput = await this.unifiedGradingCall({
        submissionContent: wrappedContent,
        rubricCriteria,
        retrievedMaterials: retrieval.chunks,
        sandboxEvidence: ingestedContent.sandboxResults,
      });

      // Step 6: Structured output validation
      const validatedOutput = await this.validateOutput(gradingOutput);

      // Step 7: Verification pass
      const verification = await this.verificationPass(
        validatedOutput,
        wrappedContent,
        rubricCriteria,
        retrieval.chunks,
      );

      if (!verification.passed) {
        // Mismatches → HELD_FOR_APPROVAL
        return await this.finalizeGrade(job, validatedOutput, {
          outcome: 'HELD_FOR_APPROVAL',
          reason: verification.reason || 'Verification pass flagged inconsistencies',
          durationMs: Date.now() - startTime,
          retrievalSnapshotId: retrieval.snapshotId,
          idempotencyKey,
        });
      }

      // Step 8: Aggregate scores
      const aggregated = this.aggregateScores(validatedOutput, rubricCriteria);

      // Step 9-10: Persist and route for release
      const autoRelease = await this.checkAutoRelease(
        job.assignmentId,
        aggregated.overallConfidence,
        aggregated.criterionGrades,
      );

      const outcome: GradingOutcome = autoRelease
        ? 'RELEASED'
        : 'HELD_FOR_APPROVAL';

      return await this.finalizeGrade(job, aggregated, {
        outcome,
        reason: autoRelease
          ? 'Auto-released: confidence threshold met'
          : 'Held for human review',
        durationMs: Date.now() - startTime,
        retrievalSnapshotId: retrieval.snapshotId,
        idempotencyKey,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      return {
        success: false,
        outcome: 'FAILED',
        reason: err.message,
        durationMs: Date.now() - startTime,
      };
    }
  }

  // ─── Pipeline Stages ────────────────────────────────────

  private async ingestSubmission(submissionId: string): Promise<{
    text: string;
    files: Array<{ name: string; mimeType: string; content: string }>;
    sandboxResults?: {
      passed: boolean;
      testResults: Array<{
        name: string;
        passed: boolean;
        output: string;
        error?: string;
      }>;
      stdout: string;
      stderr: string;
    };
  }> {
    // TODO: Phase 8 — per-format ingestion from §8.1
    // PDF/images → vision input (no OCR ever)
    // DOCX → mammoth with inline images as vision attachments
    // Code → text, notebooks → structured cell mix
    // ZIP → enumerate and ingest each file
    return { text: '', files: [] };
  }

  private async preCheck(content: {
    text: string;
    files: Array<{ name: string; mimeType: string; content: string }>;
  }): Promise<void> {
    // TODO: virus scan, size check, format validation
    // Prompt injection sanitization (§9.1 Layer 3)
    // Plagiarism similarity score (stored, never auto-penalizes)
  }

  private async checkIdempotency(key: string): Promise<string | null> {
    // TODO: Check Redis for idempotency key
    return null;
  }

  private async loadRubricCriteria(
    assignmentId: string,
  ): Promise<
    Array<{ id: string; name: string; description: string; maxScore: number; weight: number }>
  > {
    // TODO: Load rubric criteria from the assignment's active rubric version
    return [];
  }

  private async scopeRetrieval(
    job: GradingJobData,
    rubricCriteria: Array<{ id: string; name: string; description: string }>,
  ): Promise<{
    chunks: Array<{ id: string; text: string; sectionPath: string; score: number }>;
    snapshotId: string;
  }> {
    // TODO: Call RetrievalService.retrieve() per §8.5
    return { chunks: [], snapshotId: '' };
  }

  private async unifiedGradingCall(params: {
    submissionContent: string;
    rubricCriteria: Array<{ id: string; name: string; description: string; maxScore: number }>;
    retrievedMaterials: Array<{ id: string; text: string; sectionPath: string }>;
    sandboxEvidence?: {
      passed: boolean;
      testResults: Array<{ name: string; passed: boolean; output: string; error?: string }>;
      stdout: string;
      stderr: string;
    };
  }): Promise<GradingOutput> {
    // TODO: Phase 8 — OpenAI frontier model call
    // Use prompt from packages/prompts/src/grading/unified.v1.ts
    // PII stripped before call, rehydrated after
    // Structured output with strict JSON schema
    throw new Error('Grading call not yet implemented');
  }

  private async validateOutput(output: GradingOutput): Promise<GradingOutput> {
    // TODO: §9.2 — Zod validation, retry with repair prompt on failure
    return output;
  }

  private async verificationPass(
    output: GradingOutput,
    submissionContent: string,
    rubricCriteria: Array<{ id: string; name: string; description: string }>,
    retrievedMaterials: Array<{ id: string; text: string }>,
  ): Promise<{ passed: boolean; reason?: string }> {
    // TODO: Phase 8 — second frontier model call per §8.2 step 7
    // Checks: scoring-evidence alignment, out-of-scope criteria, injection bypass
    return { passed: true };
  }

  private aggregateScores(
    output: GradingOutput,
    criteria: Array<{ id: string; weight: number }>,
  ): GradingOutput {
    // Apply rubric weights, compute total score, per-criterion + overall confidence
    let totalScore = 0;
    let maxTotal = 0;
    let confidenceSum = 0;

    for (const cg of output.criterionGrades) {
      const criterion = criteria.find((c) => c.id === cg.criterionId);
      const weight = criterion?.weight ?? 1;
      totalScore += cg.score * weight;
      maxTotal += cg.maxScore * weight;
      confidenceSum += cg.confidence;
    }

    return {
      ...output,
      totalScore,
      maxTotalScore: maxTotal,
      overallConfidence:
        output.criterionGrades.length > 0
          ? confidenceSum / output.criterionGrades.length
          : 0,
    };
  }

  private async checkAutoRelease(
    assignmentId: string,
    overallConfidence: number,
    criterionGrades: CriterionGrade[],
  ): Promise<boolean> {
    // TODO: Check Assignment.autoReleaseEnabled + confidence threshold
    // All criterion confidences must also exceed the threshold
    return false; // Default: don't auto-release
  }

  private async finalizeGrade(
    job: GradingJobData,
    output: GradingOutput,
    meta: {
      outcome: GradingOutcome;
      reason: string;
      durationMs: number;
      retrievalSnapshotId: string;
      idempotencyKey: string;
    },
  ): Promise<GradingResult> {
    // TODO: Phase 8 — persist to DB
    // Create Grade (isDraft=true), Feedback, Annotations
    // Write ModelCallLog entries, raw output
    // Set submission status based on outcome
    // If RELEASED, set releasedToStudentAt = now() and notify student
    // Store idempotency key in Redis

    return {
      success: true,
      gradeId: crypto.randomUUID(),
      outcome: meta.outcome,
      reason: meta.reason,
      durationMs: meta.durationMs,
    };
  }
}
