# Admin Guide

## University Admin

### Schools
- Create and manage schools (e.g., School of Engineering, School of Business).
- Assign School Managers to each school.

### System Policies
- **Max Resubmissions**: University-wide cap. Course-level settings can be lower, never higher.
- **Max File Size**: Maximum upload size per file.
- **Monthly Spending Cap**: Per-course monthly AI spending limit.
- **Default Locale**: Default language for new courses.
- **Auto-Release Threshold**: Default confidence threshold for auto-release.

### Users
- View all users with role assignments.
- Search and filter by role.
- Assign or remove role assignments.

### Billing
- University-wide spend overview.
- Drill-down by school, then by course.
- Month-over-month trends.
- Export to CSV/Excel/PDF.
- Budget threshold alerts at 50%, 80%, 100%.

### Audit Log
- All system events with full filtering.
- Sign-ins, 2FA challenges, permission denials.
- Grade approvals, overrides, releases.
- Role assignments, settings changes.

## School Manager

### Responsibilities
- Manage courses within your school.
- Create courses and assign Heads of Course and Professors.
- View school-wide analytics and billing.
- Override per-course budget downward (never upward).

### Course Creation
1. Navigate to your school → **Create Course**.
2. Assign Head of Course and Professor.
3. Course defaults inherit from System Policies.

## Data Region
- Set at university creation time.
- **Immutable after first submission** — grayed out in the UI.
- Determines where data is stored and which AI API regions are used.

## 2FA Requirements
- All staff accounts require TOTP 2FA on first sign-in.
- Staff are locked out of features until 2FA is set up.
- Backup codes are provided once — store them securely.
