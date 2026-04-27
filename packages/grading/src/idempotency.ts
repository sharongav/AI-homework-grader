import { createHash } from 'crypto';

/**
 * Compute idempotency key for a grading job.
 * Per Hard Rule 16: hash(submissionId, attemptNumber, promptVersion, rubricVersionId, retrievalConfigId, modelSnapshot)
 */
export function computeIdempotencyKey(params: {
  submissionId: string;
  attemptNumber: number;
  promptVersion: string;
  rubricVersionId: string;
  retrievalConfigId: string;
  modelSnapshot: string;
}): string {
  const input = [
    params.submissionId,
    params.attemptNumber.toString(),
    params.promptVersion,
    params.rubricVersionId,
    params.retrievalConfigId,
    params.modelSnapshot,
  ].join('|');

  return createHash('sha256').update(input).digest('hex');
}
