'use client';

/**
 * "How Grading Works" transparency page per Phase 17.
 * Linked from every feedback view.
 */
export default function TransparencyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8">How Grading Works</h1>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">AI-Assisted, Human-Approved</h2>
          <p className="text-muted-foreground">
            Your homework is graded by an AI system (OpenAI&apos;s frontier model) that evaluates
            your work against course materials uploaded by your professor. Every grade is a draft
            until your instructor reviews and approves it.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Evidence-Based Feedback</h2>
          <p className="text-muted-foreground">
            Every deduction references specific course materials — lecture slides, textbook chapters,
            or other resources your professor has provided. You can click on citations to see exactly
            what the AI referenced.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">What the AI Can and Cannot Do</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>The AI grades only against materials your professor has uploaded.</li>
            <li>It never invents criteria that aren&apos;t in the rubric.</li>
            <li>It never accuses you of cheating — similarity flags are handled separately by your instructor.</li>
            <li>It reports a confidence score; low-confidence grades get extra instructor attention.</li>
            <li>Your instructor can always override any AI decision.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Your Privacy</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Your name and email are replaced with pseudonyms before the AI sees your work.</li>
            <li>Your submission content is never used to train AI models.</li>
            <li>All data handling follows FERPA and GDPR requirements.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Follow-Up Questions</h2>
          <p className="text-muted-foreground">
            After your grade is released, you can ask follow-up questions about your feedback.
            The AI answers based on your course materials. If it detects a potential error,
            it flags your instructor for review — it never changes your grade on its own.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Appeals</h2>
          <p className="text-muted-foreground">
            If you believe your grade contains an error, you can submit a formal appeal.
            Your instructor will review your submission and the AI&apos;s reasoning, and
            respond with their decision.
          </p>
        </div>
      </section>
    </div>
  );
}
