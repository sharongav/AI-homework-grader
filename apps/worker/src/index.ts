import { Worker, Queue } from 'bullmq';
import { Redis } from 'ioredis';
import pino from 'pino';
import { GradingPipeline } from '@homework-platform/grading';
import type { GradingJobData } from '@homework-platform/grading';

const logger = pino({
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty' }
      : undefined,
});

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

// ── Queues ───────────────────────────────────────────────────
export const gradingQueue = new Queue('grading', { connection });
export const ingestionQueue = new Queue('material-ingestion', { connection });
export const notificationQueue = new Queue('notifications', { connection });

// ── Grading Worker ───────────────────────────────────────────
const pipeline = new GradingPipeline();

const gradingWorker = new Worker(
  'grading',
  async (job) => {
    const data = job.data as GradingJobData;
    logger.info({ submissionId: data.submissionId, jobId: job.id }, 'Processing grading job');

    const result = await pipeline.execute(data);

    if (!result.success) {
      throw new Error(result.reason || 'Grading pipeline failed');
    }

    logger.info(
      { submissionId: data.submissionId, outcome: result.outcome, durationMs: result.durationMs },
      'Grading pipeline completed',
    );

    return result;
  },
  {
    connection,
    concurrency: 5,
  },
);

gradingWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Grading job completed');
});

gradingWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err.message }, 'Grading job failed');
});

// ── Ingestion Worker ─────────────────────────────────────────
const ingestionWorker = new Worker(
  'material-ingestion',
  async (job) => {
    const { materialId } = job.data;
    logger.info({ materialId, jobId: job.id }, 'Processing ingestion job');

    // Placeholder — Phase 5 implements the full ingestion pipeline
    logger.info({ materialId }, 'Ingestion pipeline not yet implemented');

    return { status: 'pending', materialId };
  },
  {
    connection,
    concurrency: 3,
  },
);

// ── Notification Worker ──────────────────────────────────────
const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    const { userId, kind, payload } = job.data;
    logger.info({ userId, kind, jobId: job.id }, 'Processing notification');

    // Placeholder — Phase 13
    return { status: 'sent', userId, kind };
  },
  {
    connection,
    concurrency: 10,
  },
);

// ── Startup ──────────────────────────────────────────────────
logger.info('Worker started. Listening for jobs on queues: grading, material-ingestion, notifications');

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Closing workers...');
  await gradingWorker.close();
  await ingestionWorker.close();
  await notificationWorker.close();
  await connection.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Closing workers...');
  await gradingWorker.close();
  await ingestionWorker.close();
  await notificationWorker.close();
  await connection.quit();
  process.exit(0);
});
