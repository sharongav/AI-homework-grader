-- ─────────────────────────────────────────────────────────────
-- Post-migration raw SQL: RLS, indices, constraints
-- Per §6 and Phase 1 acceptance criteria
-- ─────────────────────────────────────────────────────────────

-- ═══ Extensions ═══
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ═══ Super Admin Role (bypasses RLS) ═══
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'super_admin_role') THEN
    CREATE ROLE super_admin_role NOLOGIN;
  END IF;
END $$;

-- ═══ Partial Unique Index: exactly one SUPER_ADMIN ═══
-- Per Hard Rule 12: Super Admin is a singleton
CREATE UNIQUE INDEX IF NOT EXISTS "User_unique_super_admin"
  ON "User" ("systemRole")
  WHERE "systemRole" = 'SUPER_ADMIN';

-- ═══ HNSW Index on MaterialChunk embedding ═══
-- Per §6: m=16, ef_construction=64 for Voyage AI voyage-3 (1024 dims)
CREATE INDEX IF NOT EXISTS "MaterialChunk_embedding_hnsw_idx"
  ON "MaterialChunk"
  USING hnsw ("embedding" vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ═══ GIN Index for full-text search ═══
CREATE INDEX IF NOT EXISTS "MaterialChunk_content_trgm_idx"
  ON "MaterialChunk"
  USING gin ("content" gin_trgm_ops);

-- ═══ Check Constraint: maxResubmissions ═══
-- Per Phase 1: Assignment.maxResubmissions <= SystemPolicy.maxResubmissionsPerAssignment
-- Note: Cross-table check constraints aren't natively supported in PostgreSQL.
-- Enforced via trigger instead.
CREATE OR REPLACE FUNCTION check_max_resubmissions()
RETURNS TRIGGER AS $$
DECLARE
  system_max INTEGER;
BEGIN
  SELECT "maxResubmissionsPerAssignment" INTO system_max
  FROM "SystemPolicy"
  LIMIT 1;

  IF system_max IS NOT NULL AND NEW."maxResubmissions" > system_max THEN
    RAISE EXCEPTION 'maxResubmissions (%) exceeds system policy cap (%)',
      NEW."maxResubmissions", system_max;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_max_resubmissions ON "Assignment";
CREATE TRIGGER trg_check_max_resubmissions
  BEFORE INSERT OR UPDATE ON "Assignment"
  FOR EACH ROW
  EXECUTE FUNCTION check_max_resubmissions();

-- ═══ Row-Level Security (RLS) ═══
-- Per Hard Rule 15: Per-tenant RLS on all tenant-scoped tables.
-- Key: SET LOCAL app.current_university_id in the DB middleware.

-- Helper function to get current university ID from session var
CREATE OR REPLACE FUNCTION current_university_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_university_id', true), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper function to check if current role is super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_setting('app.is_super_admin', true) = 'true';
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- ─── Enable RLS on tenant-scoped tables ─────────────────────

-- School (scoped to university)
ALTER TABLE "School" ENABLE ROW LEVEL SECURITY;
CREATE POLICY school_tenant_policy ON "School"
  USING (is_super_admin() OR "universityId" = current_university_id());

-- User (scoped to university)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_tenant_policy ON "User"
  USING (is_super_admin() OR "universityId" = current_university_id());

-- RoleAssignment (scoped via user → university)
ALTER TABLE "RoleAssignment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY role_assignment_tenant_policy ON "RoleAssignment"
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "User" u WHERE u.id = "userId" AND u."universityId" = current_university_id()
  ));

-- Course (scoped via school → university)
ALTER TABLE "Course" ENABLE ROW LEVEL SECURITY;
CREATE POLICY course_tenant_policy ON "Course"
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "School" s WHERE s.id = "schoolId" AND s."universityId" = current_university_id()
  ));

-- Enrollment
ALTER TABLE "Enrollment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY enrollment_tenant_policy ON "Enrollment"
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "User" u WHERE u.id = "userId" AND u."universityId" = current_university_id()
  ));

-- CourseMaterial (scoped via course → school → university)
ALTER TABLE "CourseMaterial" ENABLE ROW LEVEL SECURITY;
CREATE POLICY course_material_tenant_policy ON "CourseMaterial"
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "Course" c
    JOIN "School" s ON s.id = c."schoolId"
    WHERE c.id = "courseId" AND s."universityId" = current_university_id()
  ));

-- MaterialChunk (scoped via material → course)
ALTER TABLE "MaterialChunk" ENABLE ROW LEVEL SECURITY;
CREATE POLICY material_chunk_tenant_policy ON "MaterialChunk"
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "CourseMaterial" cm
    JOIN "Course" c ON c.id = cm."courseId"
    JOIN "School" s ON s.id = c."schoolId"
    WHERE cm.id = "materialId" AND s."universityId" = current_university_id()
  ));

-- Assignment
ALTER TABLE "Assignment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY assignment_tenant_policy ON "Assignment"
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "Course" c
    JOIN "School" s ON s.id = c."schoolId"
    WHERE c.id = "courseId" AND s."universityId" = current_university_id()
  ));

-- Rubric
ALTER TABLE "Rubric" ENABLE ROW LEVEL SECURITY;
CREATE POLICY rubric_tenant_policy ON "Rubric"
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "Course" c
    JOIN "School" s ON s.id = c."schoolId"
    WHERE c.id = "courseId" AND s."universityId" = current_university_id()
  ));

-- Submission
ALTER TABLE "Submission" ENABLE ROW LEVEL SECURITY;
CREATE POLICY submission_tenant_policy ON "Submission"
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "Assignment" a
    JOIN "Course" c ON c.id = a."courseId"
    JOIN "School" s ON s.id = c."schoolId"
    WHERE a.id = "assignmentId" AND s."universityId" = current_university_id()
  ));

-- Grade
ALTER TABLE "Grade" ENABLE ROW LEVEL SECURITY;
CREATE POLICY grade_tenant_policy ON "Grade"
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "Submission" sub
    JOIN "Assignment" a ON a.id = sub."assignmentId"
    JOIN "Course" c ON c.id = a."courseId"
    JOIN "School" s ON s.id = c."schoolId"
    WHERE sub.id = "submissionId" AND s."universityId" = current_university_id()
  ));

-- Feedback
ALTER TABLE "Feedback" ENABLE ROW LEVEL SECURITY;
CREATE POLICY feedback_tenant_policy ON "Feedback"
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "Grade" g
    JOIN "Submission" sub ON sub.id = g."submissionId"
    JOIN "Assignment" a ON a.id = sub."assignmentId"
    JOIN "Course" c ON c.id = a."courseId"
    JOIN "School" s ON s.id = c."schoolId"
    WHERE g.id = "gradeId" AND s."universityId" = current_university_id()
  ));

-- Annotation
ALTER TABLE "Annotation" ENABLE ROW LEVEL SECURITY;
CREATE POLICY annotation_tenant_policy ON "Annotation"
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "Feedback" f
    JOIN "Grade" g ON g.id = f."gradeId"
    JOIN "Submission" sub ON sub.id = g."submissionId"
    JOIN "Assignment" a ON a.id = sub."assignmentId"
    JOIN "Course" c ON c.id = a."courseId"
    JOIN "School" s ON s.id = c."schoolId"
    WHERE f.id = "feedbackId" AND s."universityId" = current_university_id()
  ));

-- Appeal
ALTER TABLE "Appeal" ENABLE ROW LEVEL SECURITY;
CREATE POLICY appeal_tenant_policy ON "Appeal"
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "Grade" g
    JOIN "Submission" sub ON sub.id = g."submissionId"
    JOIN "Assignment" a ON a.id = sub."assignmentId"
    JOIN "Course" c ON c.id = a."courseId"
    JOIN "School" s ON s.id = c."schoolId"
    WHERE g.id = "gradeId" AND s."universityId" = current_university_id()
  ));

-- AuditLog
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_log_tenant_policy ON "AuditLog"
  USING (is_super_admin() OR "universityId" = current_university_id());

-- Notification
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
CREATE POLICY notification_tenant_policy ON "Notification"
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "User" u WHERE u.id = "userId" AND u."universityId" = current_university_id()
  ));

-- ModelCallLog
ALTER TABLE "ModelCallLog" ENABLE ROW LEVEL SECURITY;
CREATE POLICY model_call_log_tenant_policy ON "ModelCallLog"
  USING (is_super_admin() OR "universityId" = current_university_id());

-- UsageRecord
ALTER TABLE "UsageRecord" ENABLE ROW LEVEL SECURITY;
CREATE POLICY usage_record_tenant_policy ON "UsageRecord"
  USING (is_super_admin() OR "universityId" = current_university_id());

-- CourseBilling
ALTER TABLE "CourseBilling" ENABLE ROW LEVEL SECURITY;
CREATE POLICY course_billing_tenant_policy ON "CourseBilling"
  USING (is_super_admin() OR EXISTS (
    SELECT 1 FROM "Course" c
    JOIN "School" s ON s.id = c."schoolId"
    WHERE c.id = "courseId" AND s."universityId" = current_university_id()
  ));

-- ─── Grant super_admin_role bypass ──────────────────────────
-- The super_admin_role bypasses all RLS policies
GRANT ALL ON ALL TABLES IN SCHEMA public TO super_admin_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO super_admin_role;

-- ═══ Immutable grades after release ═══
-- Per Hard Rule 14: grades are immutable after release
CREATE OR REPLACE FUNCTION prevent_grade_mutation_after_release()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD."releasedAt" IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot modify a grade after it has been released (Hard Rule 14)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_grade_immutable_after_release ON "Grade";
CREATE TRIGGER trg_grade_immutable_after_release
  BEFORE UPDATE ON "Grade"
  FOR EACH ROW
  EXECUTE FUNCTION prevent_grade_mutation_after_release();
