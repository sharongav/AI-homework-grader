# Data Processing Agreement (DPA) Template

**Between:** [Institution Name] ("Data Controller") and [Platform Operator] ("Data Processor")

## 1. Definitions
- **Personal Data**: Any information relating to an identified or identifiable natural person (student, instructor, or staff).
- **Processing**: Any operation performed on personal data, including collection, storage, and analysis by AI models.
- **Sub-processor**: Third-party services used by the Processor (e.g., OpenAI, Cohere, Voyage AI, Vercel, Neon).

## 2. Scope of Processing
The Processor processes personal data solely for the purpose of:
- Authenticating users and managing access control.
- Ingesting course materials and creating searchable indexes.
- Grading student submissions against professor-uploaded rubrics and materials.
- Providing feedback and follow-up chat on released grades.
- Generating analytics and billing reports.

## 3. Data Minimization
- Student names, emails, and IDs are pseudonymized before being sent to any AI model.
- The Processor does not use personal data for model training.
- Only data necessary for the stated purposes is processed.

## 4. Sub-processors
| Sub-processor | Purpose | Data Region |
|---|---|---|
| OpenAI | AI grading and chat | US/EU (per config) |
| Voyage AI | Text embeddings | US |
| Cohere | Search reranking | US |
| Vercel | Web hosting | US/EU (per config) |
| Neon | Database hosting | US/EU (per config) |
| Upstash | Redis caching | US/EU (per config) |
| Resend | Email delivery | US |

## 5. Data Subject Rights
The Processor supports:
- **Right of access**: Data export endpoint (GDPR Art. 15).
- **Right to portability**: Structured data export (GDPR Art. 20).
- **Right to erasure**: Data deletion with cryptographic erasure (GDPR Art. 17).
- **Right to rectification**: Instructor grade overrides (GDPR Art. 16).

## 6. Security Measures
- Encryption in transit (TLS 1.3) and at rest.
- Row-Level Security (RLS) for tenant isolation.
- Mandatory 2FA for staff accounts.
- Regular security audits and penetration testing.
- Incident response within 72 hours.

## 7. Data Retention
- Grades and academic records: 7 years (FERPA).
- Model call logs: 1 year.
- Audit logs: 3 years.
- Configurable per institution.

## 8. Breach Notification
The Processor will notify the Controller within 72 hours of becoming aware of a personal data breach, providing:
- Nature of the breach.
- Categories and approximate number of data subjects affected.
- Likely consequences.
- Measures taken or proposed.

## 9. Term and Termination
Upon termination, the Processor will delete or return all personal data within 30 days, providing written confirmation of deletion.

---

**Signatures:**

Controller: ___________________ Date: ___________

Processor: ___________________ Date: ___________
