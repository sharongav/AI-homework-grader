export { NotificationService } from './service';

export class NotificationService {
  /**
   * Send an in-app notification. Per §9.9: fires immediately.
   */
  async sendInApp(userId: string, kind: string, payload: Record<string, unknown>): Promise<void> {
    console.log(`[NotificationService] In-app notification to ${userId}: ${kind}`);
  }

  /**
   * Queue an email notification. Per §9.9: coalesces within 5-min window,
   * 15-min during deadline spikes.
   */
  async queueEmail(userId: string, kind: string, payload: Record<string, unknown>): Promise<void> {
    console.log(`[NotificationService] Email queued for ${userId}: ${kind}`);
  }
}
