/**
 * Prometheus-style metrics per §9.5.
 * Counters, histograms, gauges for the grading pipeline.
 */

import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('homework-platform');

/** Grading duration histogram, labeled by stage and outcome. */
export const gradingDurationHistogram = meter.createHistogram(
  'grading_duration_seconds',
  {
    description: 'Duration of grading pipeline stages',
    unit: 's',
  },
);

/** Grading outcome counter, labeled by outcome type. */
export const gradingOutcomeCounter = meter.createCounter(
  'grading_outcome_total',
  {
    description: 'Count of grading outcomes by type',
  },
);

/** Retrieval recall@10 gauge. */
export const retrievalRecallGauge = meter.createObservableGauge(
  'retrieval_recall_at_10',
  {
    description: 'Retrieval recall at 10 metric',
  },
);

/** Model call cost counter (USD), labeled by model, purpose, university. */
export const modelCallCostCounter = meter.createCounter(
  'model_call_cost_usd_total',
  {
    description: 'Total cost of model API calls in USD',
    unit: 'usd',
  },
);

/** Follow-up chat messages counter, labeled by university. */
export const followUpChatCounter = meter.createCounter(
  'follow_up_chat_messages_total',
  {
    description: 'Total follow-up chat messages sent',
  },
);

/** Rubric suggestion acceptance rate gauge. */
export const rubricSuggestionAcceptanceGauge = meter.createObservableGauge(
  'rubric_suggestion_acceptance_rate',
  {
    description: 'Rate at which AI-suggested rubric criteria are accepted',
  },
);
