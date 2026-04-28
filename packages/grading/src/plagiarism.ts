/**
 * Plagiarism similarity service per Phase 12.
 * Pairwise similarity within assignment (embeddings + MinHash).
 * Per Hard Rule 6: surfaces as a review signal, never auto-penalizes.
 * AI-content detection is explicitly NOT performed.
 */

export interface SimilarityResult {
  submissionId: string;
  comparedSubmissionId: string;
  similarityScore: number;
  /** Specific passage pairs with high similarity. */
  passages: Array<{
    sourceStart: number;
    sourceEnd: number;
    targetStart: number;
    targetEnd: number;
    score: number;
  }>;
}

export class PlagiarismSimilarityService {
  /**
   * Compute pairwise similarity for all submissions of an assignment.
   * Results are stored as review signals — never auto-penalize.
   */
  async computeForAssignment(assignmentId: string): Promise<SimilarityResult[]> {
    // TODO: Phase 12
    // 1. Get all submissions for the assignment
    // 2. Compute embedding-based similarity (cosine similarity)
    // 3. Compute MinHash-based similarity for exact/near-exact copies
    // 4. Flag submissions above threshold for review queue
    return [];
  }

  /**
   * Check a single submission against external web sources.
   */
  async webSearchSimilarity(
    submissionId: string,
    passages: string[],
  ): Promise<Array<{ passage: string; url: string; score: number }>> {
    // TODO: Phase 12 — web search on suspicious passages
    return [];
  }
}
