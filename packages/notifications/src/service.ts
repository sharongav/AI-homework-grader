/**
 * Notification service per Phase 13.
 * Email via Resend; in-app via notification drawer.
 * Batching/coalescing with 5-minute default, 15-minute deadline-window extension (§9.9).
 */

export type NotificationKind =
  | 'GRADE_RELEASED'
  | 'SUBMISSION_RECEIVED'
  | 'REVIEW_NEEDED'
  | 'APPEAL_FILED'
  | 'APPEAL_RESOLVED'
  | 'BUDGET_WARNING'
  | 'BUDGET_EXCEEDED'
  | 'GRADING_FAILED'
  | 'MATERIAL_INGESTED'
  | 'THREAD_FLAGGED'
  | 'ASSIGNMENT_PUBLISHED'
  | 'DEADLINE_REMINDER'
  | 'TWO_FA_REQUIRED';

export type NotificationChannel = 'in_app' | 'email';

export interface NotificationPayload {
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  actionUrl?: string;
  channels: NotificationChannel[];
  batchUntil?: Date;
  metadata?: Record<string, string>;
}

export class NotificationService {
  async send(payload: NotificationPayload): Promise<void> {
    // TODO: Phase 13 — check preferences, batch, in-app + email
  }

  async notifyCourseStaff(
    courseId: string,
    kind: NotificationKind,
    title: string,
    body: string,
    actionUrl?: string,
  ): Promise<void> {
    // TODO: Phase 13
  }

  async processBatch(): Promise<void> {
    // TODO: Phase 13 — coalesce pending notifications
  }

  async markRead(userId: string, notificationIds: string[]): Promise<void> {
    // TODO: Phase 13
  }

  async getUnreadCount(userId: string): Promise<number> {
    return 0;
  }

  async sendInApp(userId: string, kind: string, payload: Record<string, unknown>): Promise<void> {
    // TODO: Phase 13
  }

  async queueEmail(userId: string, kind: string, payload: Record<string, unknown>): Promise<void> {
    // TODO: Phase 13
  }
}
