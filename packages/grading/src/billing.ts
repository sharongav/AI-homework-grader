/**
 * Billing aggregation service per Phase 11b.
 * Rolls up UsageRecord rows into CourseBilling table, bucketed by month and kind.
 * Budget enforcement: at 100% cap, force autoReleaseEnabled=false (Hard Rule 11).
 */

export type UsageKind =
  | 'LLM_GRADING'
  | 'LLM_VERIFICATION'
  | 'LLM_HYDE'
  | 'LLM_QUERY_REWRITE'
  | 'LLM_COMPRESSION'
  | 'LLM_RUBRIC_SUGGESTION'
  | 'LLM_FOLLOWUP_CHAT'
  | 'LLM_CONCEPT_EXTRACTION'
  | 'EMBEDDING'
  | 'RERANKING'
  | 'TRANSCRIPTION'
  | 'STORAGE';

export interface UsageRecord {
  id: string;
  courseId: string;
  assignmentId?: string;
  submissionId?: string;
  kind: UsageKind;
  modelSnapshot: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  createdAt: Date;
}

export class BillingService {
  /**
   * Check if a course has budget remaining before making an expensive call.
   * Per §9.12: at 100%, force autoRelease off. Never downgrade model (HR 11).
   */
  async checkBudget(courseId: string): Promise<{
    withinBudget: boolean;
    currentSpendUsd: number;
    budgetUsd: number;
    percentUsed: number;
  }> {
    // TODO: Phase 11b
    return {
      withinBudget: true,
      currentSpendUsd: 0,
      budgetUsd: 500,
      percentUsed: 0,
    };
  }

  /**
   * Record a usage event. Every LLM call, embedding, reranking, transcription
   * call emits a UsageRecord tagged with courseId, assignmentId, submissionId.
   */
  async recordUsage(record: Omit<UsageRecord, 'id' | 'createdAt'>): Promise<void> {
    // TODO: Phase 11b
  }

  /**
   * Nightly (and on-demand) aggregation job.
   * Rolls up UsageRecord into CourseBilling bucketed by month and kind.
   */
  async aggregate(month: string): Promise<void> {
    // TODO: Phase 11b
  }

  /**
   * Check budget thresholds and send alerts.
   * Thresholds: 50%, 80%, 100%.
   */
  async checkAlerts(courseId: string): Promise<void> {
    // TODO: Phase 11b — trigger notifications at thresholds
  }

  /**
   * Reconciliation test: compare UsageRecord totals against provider invoices.
   * Drift > 2% opens an alert.
   */
  async reconcile(month: string): Promise<{
    ourTotal: number;
    providerTotal: number;
    drift: number;
    alert: boolean;
  }> {
    // TODO: Phase 11b
    return { ourTotal: 0, providerTotal: 0, drift: 0, alert: false };
  }
}
