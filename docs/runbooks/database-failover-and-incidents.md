# Database Failover Runbook

## Symptoms
- Application errors: "connection refused" or "too many connections".
- Neon dashboard shows instance unhealthy.

## Immediate Actions
1. Check Neon status: https://neonstatus.com
2. If regional outage, switch to read replica (if configured).
3. Notify Super Admin; pause grading if write path is down.

## Recovery
1. Neon auto-recovers from most issues.
2. After recovery, verify RLS policies are intact.
3. Run: `SELECT * FROM pg_policies;` to confirm.
4. Resume grading operations.

---

# Incident Response Runbook

## Severity Levels
- **P1**: Data breach, cross-tenant data leak, grade corruption → immediate response, all hands.
- **P2**: Grading outage, API down → 30-minute response.
- **P3**: Degraded performance, partial feature failure → 4-hour response.
- **P4**: UI bug, non-critical feature → next business day.

## P1 Response
1. Declare incident in team channel.
2. Super Admin: pause all grading.
3. Preserve all logs (do not rotate).
4. If cross-tenant leak: revoke all sessions, force re-authentication.
5. Notify affected institutions within 72 hours (GDPR).
6. Post-mortem within 5 business days.

## P2 Response
1. Identify root cause from logs and traces.
2. Apply fix or workaround.
3. Communicate ETA to affected users.
4. Post-mortem within 10 business days.

---

# Reranker Failure Runbook

## Symptoms
- RetrievalService logs: "Cohere rerank API error".
- Grading quality may degrade (less precise citations).

## Resolution
1. Check Cohere status: https://status.cohere.com
2. The retrieval pipeline falls back to RRF-only fusion (no reranking).
3. Log warning: "Reranker unavailable, using RRF-only ranking."
4. Monitor grading quality — may see lower retrieval precision.
5. Do NOT pause grading unless quality drops unacceptably.
6. Resume reranking when Cohere recovers.
