'use client';

/**
 * Follow-up chat component per §8.8.
 * Student can ask AI follow-up questions about their feedback.
 * Grounded in: submission, rubric, grade, feedback, citations, RetrievalSnapshot.
 * The chat never modifies the released grade.
 */

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  role: 'student' | 'ai';
  content: string;
  citations?: Array<{
    chunkId: string;
    excerpt: string;
    sectionPath: string;
  }>;
  timestamp: Date;
}

interface FollowUpChatProps {
  submissionId: string;
  gradeId: string;
  maxMessages?: number;
  messagesUsed?: number;
}

export function FollowUpChat({
  submissionId,
  gradeId,
  maxMessages = 20,
  messagesUsed = 0,
}: FollowUpChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const remainingMessages = maxMessages - messagesUsed - messages.filter((m: any) => m.role === 'student').length;
  const isAtLimit = remainingMessages <= 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading || isAtLimit) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'student',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Call tRPC mutation for follow-up chat
      // This will use the frontier model per Hard Rule 11
      // Subject to prompt injection defense per §9.1
      const aiResponse: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'ai',
        content: 'Follow-up chat will be available once the grading engine is connected.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'ai',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold">Ask a Follow-Up Question</h3>
        <p className="text-xs text-muted-foreground">
          Ask about your feedback. The AI will explain using course materials.
          {remainingMessages > 0 && (
            <> ({remainingMessages} questions remaining)</>
          )}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Ask a question about your feedback to get started.
          </div>
        )}

        {messages.map((msg: any) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                msg.role === 'student'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p>{msg.content}</p>
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2 space-y-1 border-t pt-2">
                  {msg.citations.map((cite: any, i: number) => (
                    <p key={i} className="text-xs opacity-80">
                      📖 {cite.sectionPath}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2 text-sm">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isAtLimit ? (
        <div className="border-t px-4 py-3 text-center">
          <p className="text-sm text-muted-foreground">
            You&apos;ve used all your follow-up questions for this submission.
          </p>
          <p className="mt-1 text-sm">
            <a href="#appeal" className="font-medium text-primary hover:underline">
              Request an appeal
            </a>
            {' '}or ask your professor in office hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="border-t px-4 py-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your feedback..."
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
