import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Homework Grader',
  description:
    'University homework grading platform powered by AI. Professors create courses, students submit work, AI grades with evidence-based feedback.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
