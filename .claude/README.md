# Homework Platform — Claude Code Configuration

## Project Overview
This is a university AI homework grading platform. See CLAUDE.md for full conventions.

## Key Commands
- `/dev` — start all services
- `/test` — run test suite
- `/lint` — lint and format check
- `/migrate` — run database migrations
- `/seed` — seed database with test data
- `/grade-eval` — run grading eval suite

## Subagent Roles
- `reviewer` — code review focused on security (§10), hard rules (§3), and performance
- `db-expert` — database queries, migrations, RLS policies
- `prompt-engineer` — prompt template authoring and eval design

## Hard Rules (from CLAUDE.md)
1. AI output is always a draft — never auto-release without human review (unless explicitly configured)
2. Grade only against what was taught (course-scoped RAG)
3. Never invent grading criteria
4. Every deduction cites evidence
5. Confidence gates route to human review
6. Never auto-accuse of cheating
7. Human override is always available
8. Full context persistence (model version, prompt version, rubric version, retrieved materials)
9. Students see approved feedback only
10. Fail-loud, fail-safe
11. Quality over cost on the grading path
12. Super Admin is a singleton
13. Student content is untrusted data
14. Grades are immutable after release
15. Per-tenant RLS on all tenant-scoped tables
16. Idempotent grading jobs
