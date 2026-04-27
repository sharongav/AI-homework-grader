# AI Homework Grader Platform

A production-grade university homework grading platform powered by AI.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start local services (Postgres, Redis, MinIO, Mailhog)
docker compose up -d

# Run database migrations and seed
pnpm db:migrate
pnpm db:seed

# Start development
pnpm dev
```

## Architecture

```
homework-platform/
  apps/
    web/          # Next.js 15 (UI + tRPC API)
    worker/       # BullMQ grading & ingestion workers
  services/
    sandbox/      # Isolated code execution (Docker + gVisor)
  packages/
    db/           # Prisma schema, client, RLS middleware
    ui/           # shadcn component library
    types/        # Shared TypeScript types
    config/       # Shared ESLint, TS, Tailwind configs
    prompts/      # Versioned prompt templates
    evals/        # Golden datasets & eval runners
    auth/         # Auth utilities & RBAC
    grading/      # Unified grading pipeline
    retrieval/    # RAG service
    notifications/# Email & in-app notifications
```

## Key Principles

1. **Drafts, not verdicts** — AI produces structured drafts; humans release
2. **Course-scoped grading** — RAG over professor's materials only
3. **Evidence or no deduction** — Every point off cites a rubric criterion + course material
4. **Quality over cost** — Frontier model on the grading path, always
5. **Privacy first** — FERPA, GDPR, per-tenant RLS, PII stripping

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed the database |
| `pnpm worker:dev` | Start the worker in dev mode |
| `pnpm evals:run` | Run all eval suites |
| `pnpm evals:prompts` | Run prompt eval suite |
| `pnpm evals:redteam` | Run red-team injection suite |
| `pnpm evals:rag` | Run RAG retrieval eval suite |
