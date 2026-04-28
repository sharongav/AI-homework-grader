/**
 * Submission detail page with split-pane feedback viewer.
 * Per §8.6 / Phase 9: submission renderer + feedback notes + rubric sidebar.
 */

import { FeedbackViewer } from '@/components/feedback-viewer';

export default async function SubmissionPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;
  // TODO: Load submission, grade, feedback via tRPC
  // Per Hard Rule 9: students see approved feedback only

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-3">
        <div>
          <h1 className="text-lg font-semibold">Submission Details</h1>
          <p className="text-sm text-muted-foreground">
            Submission {submissionId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted">
            Ask a Follow-Up
          </button>
          <button className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted">
            Request Appeal
          </button>
        </div>
      </div>

      {/* Split-pane feedback viewer */}
      <div className="flex-1 overflow-hidden">
        <FeedbackViewer
          submissionContent=""
          submissionFormat="text"
          annotations={[]}
          criterionScores={[]}
          totalScore={0}
          maxTotalScore={0}
          strengths={[]}
          weaknesses={[]}
          conceptMastery={[]}
          nextSteps={[]}
          encouragement=""
        />
      </div>
    </div>
  );
}
