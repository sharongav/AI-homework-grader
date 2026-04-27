import { PermissionAction } from '@homework-platform/types';

/**
 * Permission matrix per §2.2 of the build plan.
 * Maps each role to the set of actions it can perform.
 */
export const ROLE_PERMISSIONS: Record<string, Set<string>> = {
  STUDENT: new Set([
    PermissionAction.SUBMIT_HOMEWORK,
    PermissionAction.VIEW_OWN_GRADE,
    PermissionAction.ASK_AI_FOLLOWUP,
  ]),

  GRADER: new Set([
    PermissionAction.REVIEW_OVERRIDE_GRADE,
    PermissionAction.TOGGLE_AUTO_RELEASE,
    PermissionAction.VIEW_SUBMISSIONS,
  ]),

  TA: new Set([
    PermissionAction.TOGGLE_AUTO_RELEASE,
    PermissionAction.VIEW_SUBMISSIONS,
    PermissionAction.UPLOAD_MATERIALS,
  ]),

  PROFESSOR: new Set([
    PermissionAction.REVIEW_OVERRIDE_GRADE,
    PermissionAction.CREATE_ASSIGNMENT,
    PermissionAction.TOGGLE_AUTO_RELEASE,
    PermissionAction.DEFINE_PREREQUISITES,
    PermissionAction.REQUEST_RUBRIC_SUGGESTIONS,
    PermissionAction.SET_RESUBMISSION_COUNT,
    PermissionAction.SET_RELEASE_POLICY,
    PermissionAction.VIEW_OWN_COURSE_BILLING,
    PermissionAction.VIEW_SUBMISSIONS,
    PermissionAction.UPLOAD_MATERIALS,
    PermissionAction.VIEW_ANALYTICS,
    PermissionAction.EXPORT_GRADEBOOK,
    PermissionAction.MANAGE_COURSE,
  ]),

  HEAD_OF_COURSE: new Set([
    PermissionAction.REVIEW_OVERRIDE_GRADE,
    PermissionAction.CREATE_ASSIGNMENT,
    PermissionAction.TOGGLE_AUTO_RELEASE,
    PermissionAction.DEFINE_PREREQUISITES,
    PermissionAction.REQUEST_RUBRIC_SUGGESTIONS,
    PermissionAction.SET_RESUBMISSION_COUNT,
    PermissionAction.SET_RELEASE_POLICY,
    PermissionAction.VIEW_OWN_COURSE_BILLING,
    PermissionAction.VIEW_SUBMISSIONS,
    PermissionAction.UPLOAD_MATERIALS,
    PermissionAction.VIEW_ANALYTICS,
    PermissionAction.EXPORT_GRADEBOOK,
    PermissionAction.MANAGE_COURSE,
  ]),

  SCHOOL_MANAGER: new Set([
    PermissionAction.REVIEW_OVERRIDE_GRADE,
    PermissionAction.CREATE_ASSIGNMENT,
    PermissionAction.TOGGLE_AUTO_RELEASE,
    PermissionAction.DEFINE_PREREQUISITES,
    PermissionAction.REQUEST_RUBRIC_SUGGESTIONS,
    PermissionAction.SET_RESUBMISSION_COUNT,
    PermissionAction.SET_RELEASE_POLICY,
    PermissionAction.VIEW_OWN_COURSE_BILLING,
    PermissionAction.VIEW_SCHOOL_BILLING,
    PermissionAction.VIEW_SUBMISSIONS,
    PermissionAction.UPLOAD_MATERIALS,
    PermissionAction.VIEW_ANALYTICS,
    PermissionAction.EXPORT_GRADEBOOK,
    PermissionAction.MANAGE_COURSE,
    PermissionAction.MANAGE_SCHOOL,
    PermissionAction.ASSIGN_HEAD_OF_COURSE,
  ]),

  UNIV_ADMIN: new Set([
    PermissionAction.REVIEW_OVERRIDE_GRADE,
    PermissionAction.CREATE_ASSIGNMENT,
    PermissionAction.TOGGLE_AUTO_RELEASE,
    PermissionAction.DEFINE_PREREQUISITES,
    PermissionAction.REQUEST_RUBRIC_SUGGESTIONS,
    PermissionAction.SET_RESUBMISSION_COUNT,
    PermissionAction.SET_RELEASE_POLICY,
    PermissionAction.SET_SYSTEM_RESUBMISSION_CAP,
    PermissionAction.VIEW_OWN_COURSE_BILLING,
    PermissionAction.VIEW_SCHOOL_BILLING,
    PermissionAction.VIEW_UNIVERSITY_BILLING,
    PermissionAction.CREATE_SCHOOL,
    PermissionAction.ASSIGN_HEAD_OF_COURSE,
    PermissionAction.MANAGE_UNIVERSITY,
    PermissionAction.MANAGE_COURSE,
    PermissionAction.MANAGE_SCHOOL,
    PermissionAction.VIEW_SUBMISSIONS,
    PermissionAction.UPLOAD_MATERIALS,
    PermissionAction.VIEW_ANALYTICS,
    PermissionAction.EXPORT_GRADEBOOK,
  ]),

  SUPER_ADMIN: new Set([
    ...Object.values(PermissionAction),
  ]),
};
