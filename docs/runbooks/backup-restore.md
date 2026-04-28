# Backup Restore Runbook

## Backup Schedule
- **PostgreSQL**: Nightly snapshot, 30-day retention.
- **Object Storage (R2/S3)**: Nightly backup, 30-day retention.
- **Cross-region replication**: Within-region only (EU stays in EU, US stays in US).

## RPO / RTO
- RPO: 24 hours (nightly backups)
- RTO: 4 hours (standard outage)

## Restore Procedure

### 1. Database Restore
```bash
# List available snapshots
neon branches list --project-id $PROJECT_ID

# Create a restore branch from snapshot
neon branches create --project-id $PROJECT_ID \
  --parent-id $SNAPSHOT_BRANCH_ID \
  --name restore-$(date +%Y%m%d)

# Verify data integrity
psql $RESTORE_DB_URL -c "SELECT COUNT(*) FROM \"User\";"
psql $RESTORE_DB_URL -c "SELECT COUNT(*) FROM \"Submission\";"
psql $RESTORE_DB_URL -c "SELECT COUNT(*) FROM \"Grade\";"

# Point application to restored database
# Update DATABASE_URL in environment config
```

### 2. Object Storage Restore
```bash
# Sync from backup bucket
aws s3 sync s3://backup-bucket/ s3://primary-bucket/ --region $REGION
```

### 3. Verify
- Run smoke test: create a submission, verify grading pipeline works.
- Check RLS: verify tenant isolation is intact.
- Check that latest grades and feedback are consistent.

## Quarterly Drill
- Schedule: First Monday of each quarter.
- Duration: Must complete within declared RTO (4 hours).
- Steps:
  1. Take a fresh backup.
  2. Restore to a staging environment.
  3. Verify all data integrity checks pass.
  4. Run E2E test suite against restored environment.
  5. Document results and any improvements needed.
