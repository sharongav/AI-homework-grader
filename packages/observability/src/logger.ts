/**
 * Structured JSON logging with pino.
 * Per §9.5: traceId, spanId, submissionId, userId, universityId on every line.
 * Never log raw student submission content at INFO; DEBUG only, stripped in production.
 */

import pino from 'pino';
import { context, trace } from '@opentelemetry/api';

/** Extracts OpenTelemetry trace context and injects into pino log lines. */
function otelMixin() {
  const span = trace.getSpan(context.active());
  if (!span) return {};

  const spanContext = span.spanContext();
  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
    traceFlags: spanContext.traceFlags,
  };
}

export type LogContext = {
  submissionId?: string;
  userId?: string;
  universityId?: string;
  courseId?: string;
  assignmentId?: string;
  jobId?: string;
};

const isProduction = process.env.NODE_ENV === 'production';

export function createLogger(name: string, baseContext?: LogContext) {
  return pino({
    name,
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    mixin: otelMixin,
    // In production, output pure JSON. In dev, use pino-pretty.
    transport: isProduction
      ? undefined
      : { target: 'pino-pretty', options: { colorize: true } },
    // Redact sensitive fields from production logs
    redact: isProduction
      ? {
          paths: [
            'studentContent',
            'submissionContent',
            'rawContent',
            'password',
            'token',
            'accessToken',
            'refreshToken',
          ],
          censor: '[REDACTED]',
        }
      : undefined,
    ...(baseContext ? { base: baseContext } : {}),
  });
}

/** Default application logger */
export const logger = createLogger('homework-platform');
