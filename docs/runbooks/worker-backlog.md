# Worker Backlog Runbook

## Symptoms
- Review queue growing faster than draining.
- Grading times exceeding 90-second SLA.
- Students see "being reviewed" for extended periods.

## Investigation
1. Check worker process health: `docker ps | grep worker`
2. Check Redis queue depth: `redis-cli LLEN bull:grading:wait`
3. Check for rate limiting: grep worker logs for 429 responses.
4. Check OpenAI API status: https://status.openai.com

## Resolution Steps

### Temporary: Scale workers
```bash
# Scale worker replicas
docker-compose up -d --scale worker=5
```

### Rate limiting hit
- Check if we're hitting per-minute or per-day limits.
- Per Hard Rule 11: NEVER downgrade to a cheaper model.
- Contact OpenAI to request limit increase.
- Enable queue priority: grade deadline-adjacent submissions first.

### Worker crash loop
1. Check worker logs: `docker logs homework-worker --tail 100`
2. Look for OOM kills, unhandled rejections, or connection errors.
3. Restart workers: `docker-compose restart worker`

## Escalation
- If backlog > 1 hour: notify engineering lead.
- If backlog > 4 hours: consider using Super Admin emergency "pause grading" control.
