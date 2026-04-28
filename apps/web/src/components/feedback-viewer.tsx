'use client';

/**
 * Split-pane feedback viewer per §8.6 / Phase 9.
 * Left: submission renderer. Right: notes pane. Sidebar: rubric.
 * Bidirectional highlighting between annotations and submission spans.
 * Color-coded: strength (green), deduction (red), observation (blue).
 */

import { useState } from 'react';

interface Annotation {
  id: string;
  startOffset: number;
  endOffset: number;
  type: 'STRENGTH' | 'DEDUCTION' | 'OBSERVATION';
  text: string;
  criterionName?: string;
  citation?: {
    chunkId: string;
    excerpt: string;
    sectionPath: string;
  };
}

interface CriterionScore {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
}

interface FeedbackViewerProps {
  submissionContent: string;
  submissionFormat: 'pdf' | 'docx' | 'code' | 'text' | 'jupyter' | 'markdown';
  annotations: Annotation[];
  criterionScores: CriterionScore[];
  totalScore: number;
  maxTotalScore: number;
  strengths: string[];
  weaknesses: string[];
  conceptMastery: Array<{ concept: string; level: string }>;
  nextSteps: string[];
  encouragement: string;
  /** Whether to show reviewer-only affordances. Per Hard Rule 9: hidden for students. */
  isReviewer?: boolean;
  confidence?: number;
  rawModelOutput?: string;
}

export function FeedbackViewer(props: FeedbackViewerProps) {
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);
  const [showCitation, setShowCitation] = useState<string | null>(null);

  const typeColors = {
    STRENGTH: 'bg-strength/10 border-strength text-strength',
    DEDUCTION: 'bg-deduction/10 border-deduction text-deduction',
    OBSERVATION: 'bg-observation/10 border-observation text-observation',
  };

  const typeIcons = {
    STRENGTH: '✓',
    DEDUCTION: '✗',
    OBSERVATION: '○',
  };

  const typeLabels = {
    STRENGTH: 'Strength',
    DEDUCTION: 'Deduction',
    OBSERVATION: 'Observation',
  };

  return (
    <div className="flex h-full">
      {/* Left pane: Submission */}
      <div className="flex-1 overflow-y-auto border-r p-6">
        <h3 className="mb-4 text-lg font-semibold">Submission</h3>
        <div className="whitespace-pre-wrap rounded-lg border bg-card p-4 font-mono text-sm">
          {props.submissionContent || (
            <p className="text-muted-foreground">
              Submission content will be rendered here based on format.
            </p>
          )}
        </div>
      </div>

      {/* Right pane: Feedback notes */}
      <div className="w-96 overflow-y-auto p-6">
        {/* Score header */}
        <div className="mb-6 rounded-lg border bg-card p-4">
          <div className="text-center">
            <p className="text-3xl font-bold">
              {props.totalScore}/{props.maxTotalScore}
            </p>
            <p className="text-sm text-muted-foreground">Total Score</p>
            {props.isReviewer && props.confidence !== undefined && (
              <p className="mt-1 text-xs text-muted-foreground">
                Confidence: {(props.confidence * 100).toFixed(0)}%
              </p>
            )}
          </div>
        </div>

        {/* Criterion scores */}
        <div className="mb-6 space-y-3">
          <h4 className="font-semibold">Criteria</h4>
          {props.criterionScores.map((cs) => (
            <div key={cs.id} className="rounded border bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{cs.name}</span>
                <span className="text-sm font-bold">
                  {cs.score}/{cs.maxScore}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{cs.feedback}</p>
            </div>
          ))}
        </div>

        {/* Annotations */}
        <div className="mb-6 space-y-2">
          <h4 className="font-semibold">Annotations</h4>
          {props.annotations.map((ann) => (
            <button
              key={ann.id}
              className={`w-full rounded border p-3 text-left text-sm transition-colors ${
                typeColors[ann.type]
              } ${activeAnnotation === ann.id ? 'ring-2 ring-ring' : ''}`}
              onClick={() =>
                setActiveAnnotation(activeAnnotation === ann.id ? null : ann.id)
              }
              aria-label={`${typeLabels[ann.type]}: ${ann.text}`}
            >
              <div className="flex items-center gap-2">
                <span>{typeIcons[ann.type]}</span>
                <span className="font-medium">{typeLabels[ann.type]}</span>
              </div>
              <p className="mt-1">{ann.text}</p>
              {ann.citation && (
                <button
                  className="mt-2 text-xs underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCitation(
                      showCitation === ann.id ? null : ann.id,
                    );
                  }}
                >
                  Cite: {ann.citation.sectionPath}
                </button>
              )}
              {showCitation === ann.id && ann.citation && (
                <div className="mt-2 rounded bg-muted p-2 text-xs">
                  <p className="font-medium">{ann.citation.sectionPath}</p>
                  <p className="mt-1 italic">{ann.citation.excerpt}</p>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Structured feedback sections */}
        <div className="space-y-4">
          {props.strengths.length > 0 && (
            <FeedbackSection title="Strengths" items={props.strengths} />
          )}
          {props.weaknesses.length > 0 && (
            <FeedbackSection title="Areas for Improvement" items={props.weaknesses} />
          )}
          {props.conceptMastery.length > 0 && (
            <div>
              <h4 className="mb-2 font-semibold">Concept Mastery</h4>
              <div className="space-y-1">
                {props.conceptMastery.map((cm, i) => (
                  <div key={i} className="flex items-center justify-between rounded border bg-card px-3 py-2 text-sm">
                    <span>{cm.concept}</span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {cm.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {props.nextSteps.length > 0 && (
            <FeedbackSection title="Next Steps" items={props.nextSteps} />
          )}
          {props.encouragement && (
            <div>
              <h4 className="mb-2 font-semibold">Encouragement</h4>
              <p className="rounded border bg-card p-3 text-sm">
                {props.encouragement}
              </p>
            </div>
          )}
        </div>

        {/* Reviewer-only: raw model output */}
        {props.isReviewer && props.rawModelOutput && (
          <details className="mt-6">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
              Raw Model Output
            </summary>
            <pre className="mt-2 overflow-auto rounded border bg-muted p-3 text-xs">
              {props.rawModelOutput}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

function FeedbackSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div>
      <h4 className="mb-2 font-semibold">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="rounded border bg-card px-3 py-2 text-sm">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
