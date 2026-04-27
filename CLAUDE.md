# AI Homework Grader — CLAUDE.md

## Product Goal
A university homework grading platform where professors create courses, upload materials, define assignments; students submit homework; and an AI grading engine (OpenAI frontier model) produces draft grades and feedback that staff review, refine, and release.

## Stack
- **Frontend + BFF:** Next.js 15 (App Router), TypeScript strict, Tailwind CSS, shadcn/ui, React Query, Zod
- **API:** tRPC (internal), REST (LMS/3rd-party)
- **Database:** PostgreSQL 16 + pgvector, Prisma ORM
- **Queue:** BullMQ on Redis
- **File storage:** Cloudflare R2 / AWS S3 (per-region)
- **AI (grading path):** OpenAI frontier model (GPT-5.4), always latest snapshot
- **AI (auxiliary):** Cheaper OpenAI models for non-grading tasks only
- **Embeddings:** Voyage AI voyage-3
- **Reranker:** Cohere rerank-v3.5
- **Auth:** Clerk (or NextAuth)
- **Email:** Resend
- **Testing:** Vitest (unit), Playwright (E2E), k6 (load)
- **CI/CD:** GitHub Actions
- **Deployment:** Vercel + Railway/Fly.io + Neon/Supabase
- **Monitoring:** Sentry, PostHog, OpenTelemetry, BetterStack

## 16 Hard Product Rules (NON-NEGOTIABLE)
1. AI output is always a draft. Released grades must carry an `approvedBy` user reference.
2. Never grade against material not yet taught. Retriever filters by prerequisite set.
3. Never invent rubric criteria. AI grades exactly what professor defined.
4. Evidence or no deduction. Every deduction cites rubric criterion + material chunk.
5. Confidence gates release. Low confidence → human review, regardless of auto-release.
6. Never accuse cheating automatically. Plagiarism = review signal only.
7. Always allow human override. Any staff can change any grade with a note.
8. Always persist full grading context. Prompt version, model snapshot, rubric version, materials, raw output.
9. Students only see approved grades. Never show drafts, confidence, or raw output.
10. Fail loud, fail safe. Pipeline failures → FAILED/NEEDS_MANUAL_GRADE, never silent wrong grades.
11. Quality over cost on grading path. Always frontier model. Never silently downgrade.
12. Super Admin is singleton. One account, enforced by DB unique partial index.
13. Student content is untrusted data. 4-layer prompt injection defense.
14. Grades immutable after release. Overrides create new rows. Rubrics and prompts versioned.
15. Per-tenant RLS at Postgres layer. SET LOCAL app.current_university_id on every request.
16. Every grading job is idempotent. Deterministic idempotency key checked before running.

## Coding Rules
- TypeScript strict mode everywhere
- Zod for all external input validation
- Conventional commits (feat:, fix:, chore:, etc.)
- Tests required for all business logic
- No `any` types
- No direct DB queries outside packages/db
- All API routes enforce RBAC
- Structured JSON logging (pino) with traceId/spanId
- Never log raw student content at INFO level

## Do-Nots
- No monolithic grading prompts — compose from versioned templates
- No direct production secrets in code
- No unstructured model output — always use structured output with Zod schema
- No silent model downgrades on the grading path
- No OCR on student submissions — ever. Vision model or manual review.
- No auto-penalty for plagiarism
- No AI-content detection in v1
- No mutation of released grades — create new Grade rows
- No mutation of PromptVersion or RubricVersion after reference

## Architecture Boundaries
- `apps/web` — Next.js UI + API (tRPC/REST)
- `apps/worker` — BullMQ consumers for grading, ingestion, notifications
- `services/sandbox` — Isolated code execution (Docker + gVisor)
- `packages/db` — Prisma schema, client, RLS middleware, helpers
- `packages/ui` — shadcn component library
- `packages/types` — Shared TypeScript types
- `packages/config` — ESLint, TS, Tailwind configs
- `packages/prompts` — Versioned prompt templates (hashed, registered on boot)
- `packages/evals` — Golden datasets, eval runners, red-team suite
- `packages/auth` — Auth utilities, RBAC helpers
- `packages/grading` — Unified grading pipeline orchestration
- `packages/retrieval` — RAG service + RetrievalSnapshot writer
- `packages/notifications` — Email + in-app dispatch

## Testing Requirements
- Unit: Vitest — all pure logic
- Integration: DB layer, worker pipeline with mocked APIs, RLS policies
- E2E: Playwright — critical user journeys
- Load: k6 — deadline spike simulation
- AI regression: golden submission set
- Prompt eval: per-prompt golden fixtures with metrics
- RAG eval: Recall@10, MRR, nDCG@10 gates
- Red-team: 100% injection defense pass rate gates CI

## Security
- RLS on every tenant-scoped table
- PII stripped before model calls, rehydrated on return
- 4-layer prompt injection defense
- Content moderation on uploads (virus scan, magic bytes, PDF/DOCX/ZIP hardening)
- TOTP 2FA mandatory for staff, optional for students
- Short-lived JWTs, session rotation
- CSP, HSTS, SRI
- Rate limiting per user and per IP

## Deployment
- Environments: dev (local), staging, production
- Data residency: per-tenant (US, EU, OTHER), immutable after first submission
- Backups: nightly Postgres + object storage, 30-day retention
