# Security & Privacy Policy

## Data Handling

### Student Data
- Student submissions and personal data are stored in tenant-isolated databases.
- Row-Level Security (RLS) ensures no cross-tenant data leakage.
- All data is encrypted in transit (TLS 1.3) and at rest.
- PII is stripped from all AI model calls using stable pseudonyms and rehydrated on return.

### AI Model Interactions
- We use OpenAI's frontier models for grading and follow-up chat.
- Student names, emails, and IDs are replaced with pseudonyms before sending to the model.
- Model interactions are logged for audit purposes but never used for model training.
- We do not use AI-content detection (per Hard Rule 6).

### Data Residency
- Data region (US or EU) is set at university creation and cannot be changed after first submission.
- Cross-region replication stays within the same regulatory region.
- Backups never cross regional boundaries.

## Access Control
- Role-based access control (RBAC) with 8 hierarchical roles.
- Mandatory TOTP 2FA for all staff accounts.
- 30-minute idle session timeout for Super Admin.
- All access attempts are audit-logged.

## FERPA Compliance
- Student educational records are protected per FERPA requirements.
- Data retention follows configurable policies (default: 7 years for grades, 1 year for model call logs).
- Parents/guardians can request access through the institution's FERPA officer.

## GDPR Compliance
- Data export endpoints: students and staff can request a full export of their data.
- Data deletion endpoints: "right to be forgotten" with cryptographic erasure.
- Data Processing Agreement (DPA) template available for institutions.
- 72-hour breach notification commitment.

## Security Measures
- Content Security Policy (CSP), HSTS, SRI on external scripts.
- Virus scanning and magic-byte validation on all file uploads.
- Rate limiting on all API endpoints.
- Dependency auditing and secret scanning in CI.
- Red-team prompt injection testing with 100% pass rate merge gate.
- Quarterly penetration testing.

## Incident Response
- Severity-based response times (P1: immediate, P2: 30 min, P3: 4 hours).
- Emergency controls: pause grading, force-fail submissions, revoke API keys.
- Full audit trail with meta-audit for Super Admin access.

## Contact
For security concerns, contact: security@[your-domain].com
