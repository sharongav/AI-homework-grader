# Professor Guide

## Getting Started

1. **Sign in** and complete **2FA setup** (mandatory for all staff).
2. Your dashboard shows your courses, pending reviews, and recent activity.

## Creating a Course

1. Go to **Courses** → **Create Course**.
2. Set the course name, code, term, timezone, and school.
3. Configure defaults:
   - **Release policy**: Manual (recommended) or Auto for high-confidence grades.
   - **Max resubmissions**: Capped by the university admin's system policy.

## Uploading Course Materials

**This is critical** — the AI grades only against what you upload.

1. Go to your course → **Materials** → **Upload Material**.
2. Supported formats: PDF, DOCX, PPTX, Markdown, plain text.
3. Scanned or handwritten documents are rejected — materials must be typed/digital.
4. After upload, the system:
   - Extracts text and builds a section hierarchy.
   - Chunks the content semantically (~300 token child chunks, ~1500 token parents).
   - Creates embeddings for similarity search.
   - Suggests concepts covered — review and accept/discard each one.
5. Tag materials with week numbers for automatic prerequisite filtering.

## Creating Assignments

1. Go to your course → **Assignments** → **Create Assignment**.
2. Fill in:
   - **Instructions**: Rich text or Markdown.
   - **Due date**: Shown with timezone abbreviation.
   - **Prerequisites**: Select specific materials and concepts students should know.
   - **Late policy**: None, percentage per day, or flat deduction.
   - **Resubmissions**: 0 to N (capped by admin policy).

## Building Rubrics

1. In the assignment editor, go to the **Rubric** tab.
2. Add criteria manually with weights and performance levels.
3. Or click **Suggest Criteria (AI)** — the AI analyzes your:
   - Assignment instructions
   - Prerequisite materials
   - Reference solution (if provided)
   - Course concept map
4. Review each suggestion: **Accept**, **Edit & Accept**, or **Discard**.
5. Nothing enters the rubric without your explicit acceptance.
6. Editing a rubric after grades exist creates a new version — old grades stay pinned.

## Auto-Release Settings

- Each assignment has an **auto-release toggle**.
- When ON + confidence threshold met + no flags → grade releases to student automatically.
- When OFF → all grades go to the review queue.
- Recommended: keep OFF for subjective assignments; consider ON for objective tasks.

## Reviewing Grades

1. Go to **Review Queue** — sorted by lowest confidence first.
2. Use the split-pane viewer to see:
   - Student's submission (left)
   - AI feedback with confidence scores (right)
   - Full retrieval snapshot (which course materials the AI used)
3. **Approve** if the grade is correct.
4. **Edit** specific criterion scores or feedback.
5. **Override** to replace the grade entirely (must provide a reason).
6. Overrides create a new grade record — the original is preserved for audit.

## Dry-Run Grading

Before publishing an assignment, test the grading pipeline:

1. Click **Dry-Run Grade** on the assignment edit page.
2. Upload a sample submission.
3. See exactly what the AI would produce.
4. Billed separately to a dry-run bucket.

## Analytics

View class-wide performance metrics:
- Grade distributions and trends
- Concept mastery heatmaps
- Common mistakes digest
- At-risk student identification

## Billing

You can view your course's AI usage costs:
- Current month spend with breakdown by type
- Per-assignment costs
- Budget remaining before system cap
