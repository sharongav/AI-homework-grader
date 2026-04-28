# OpenAI Outage Runbook

## RPO / RTO
- RPO: 0 (no data loss — submissions are persisted before grading)
- RTO: 30 minutes (grading pauses, resumes on recovery)

## Symptoms
- Worker logs show connection errors or 5xx from OpenAI API.
- Grading jobs failing with "OpenAI API error" status.
- https://status.openai.com shows incident.

## Immediate Actions

### 1. Do NOT downgrade models (Hard Rule 11)
Never switch to a cheaper/smaller model to work around an outage.

### 2. Pause grading via Super Admin console
1. Log in as Super Admin.
2. Go to **Emergency Controls** → **Pause All Grading**.
3. New submissions go to PENDING state and wait in queue.
4. Already-processing jobs will fail and be retried automatically.

### 3. Notify affected course staff
- Send notification to all professors with pending submissions.
- Message: "AI grading is temporarily paused due to an upstream service issue. Your submissions are safe and will be graded once service resumes."

## Recovery
1. Monitor https://status.openai.com for resolution.
2. Test with a dry-run grade to confirm API is responding.
3. Resume grading via Super Admin → **Emergency Controls** → **Resume Grading**.
4. Queue will drain automatically with backoff.

## For Cohere/Voyage outages
- Same principle: pause, don't downgrade.
- If only the reranker (Cohere) is down, the retrieval pipeline can fall back to RRF-only ranking with degraded precision. Log a warning.
- If embeddings (Voyage) are down, new material ingestion pauses but existing embeddings are still searchable.
