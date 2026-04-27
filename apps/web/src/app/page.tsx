import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <span className="text-xl font-bold">AI Homework Grader</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            AI-Powered Homework Grading
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            A university platform where professors create courses, upload materials, and define
            assignments. Students submit their work, and an AI grading engine produces
            evidence-based draft grades that course staff review and release.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/sign-up"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Get Started
            </Link>
            <Link
              href="/about"
              className="text-sm font-semibold leading-6 text-foreground"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Feature grid */}
        <div className="mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Drafts, Not Verdicts"
            description="AI produces structured drafts with confidence scores. Every grade is reviewed by a human before release."
            icon="📝"
          />
          <FeatureCard
            title="Course-Scoped Grading"
            description="AI grades only against what was taught — using professor-uploaded materials, not general knowledge."
            icon="📚"
          />
          <FeatureCard
            title="Evidence-Based Feedback"
            description="Every deduction cites a rubric criterion and a specific course material. No unexplained point deductions."
            icon="🔍"
          />
          <FeatureCard
            title="Split-Pane Review"
            description="Students see annotated feedback anchored to exact locations in their submission."
            icon="📊"
          />
          <FeatureCard
            title="Follow-Up Chat"
            description="Students can ask AI clarifying questions about their feedback, grounded in course materials."
            icon="💬"
          />
          <FeatureCard
            title="Privacy First"
            description="FERPA & GDPR compliant. Per-tenant data isolation. PII stripped before AI processing."
            icon="🔒"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>AI Homework Grader Platform — Quality over cost on the grading path.</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 text-left shadow-sm">
      <div className="mb-3 text-2xl">{icon}</div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
