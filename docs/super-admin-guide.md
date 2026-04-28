# Super Admin Guide

## Bootstrap

The Super Admin account is created once at system install time:

1. Run the bootstrap script against an empty database.
2. Enter the Super Admin email.
3. A sealed one-time token is generated — use it to claim the account.
4. The partial unique index prevents a second Super Admin from ever being created.

## Capabilities

### Tenant Explorer
- Tree view: Platform → University → School → Course → Assignment → Submission → Grade.
- Every node is clickable and opens the same view the user at that scope would see.
- Read-only by default.

### Cross-Tenant Analytics
- Platform-wide submissions per day.
- Grade distribution across all universities.
- Model-call count and cost.
- Latency percentiles (p50/p95/p99).
- Failure rate by status.
- Top-10 courses and universities by spend.
- Follow-up chat volume.
- Rubric suggestion acceptance rate.

### Model Routing
- Edit grading model snapshot (e.g., `gpt-5.4-2026-03-15`).
- Edit follow-up chat model snapshot.
- Edit auxiliary model snapshot.
- Each change requires typed confirmation and is audit-logged.
- Hot-reloaded by workers without restart.

### Feature Flags
- Toggle features per tenant, per school, or globally.
- Hard Rules are never behind a flag.

### Impersonation
- "View as" any user — read-only session.
- Red banner always visible: "Super Admin impersonating {name}."
- Write operations disabled by default.
- Enabling writes requires a typed reason → audit-logged.

### Emergency Controls
- **Pause all grading**: Queue drains, new submissions go to PENDING.
- **Force failed**: Move stuck submissions to FAILED with operator note.
- **Rollback prompt**: Revert to previous prompt version.
- **Revoke API key**: Platform-wide key revocation.

### Audit Log
- Full-text search across all tenants.
- Filters: actor, action, target type, date range.
- Super Admin access to the audit viewer is itself logged (meta-audit).

## Account Security
- Mandatory TOTP 2FA.
- 30-minute idle session timeout.
- Optional IP allow-list.
- Backup codes stored once at bootstrap.
