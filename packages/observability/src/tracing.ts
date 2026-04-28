/**
 * OpenTelemetry SDK initialization.
 * Per §9.5: stdout in dev, OTLP to Grafana Tempo / Honeycomb in staging/prod.
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';

const isProduction = process.env.NODE_ENV === 'production';
const isStaging = process.env.NODE_ENV === 'staging';

function getTraceExporter() {
  if (isProduction || isStaging) {
    return new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    });
  }
  return new ConsoleSpanExporter();
}

function getMetricReader() {
  if (isProduction || isStaging) {
    return new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/metrics',
      }),
      exportIntervalMillis: 60_000,
    });
  }
  return undefined;
}

const serviceName = process.env.OTEL_SERVICE_NAME || 'homework-platform';
const serviceVersion = process.env.npm_package_version || '0.0.0';

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: serviceVersion,
  }),
  traceExporter: getTraceExporter(),
  metricReader: getMetricReader(),
  instrumentations: [new HttpInstrumentation()],
});

export function initTelemetry() {
  sdk.start();

  process.on('SIGTERM', () => {
    sdk.shutdown().catch(console.error);
  });
}

export { sdk };
