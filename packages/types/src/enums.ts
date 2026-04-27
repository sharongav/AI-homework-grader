// ─────────────────────────────────────────────────────────────
// Enums matching the Prisma schema
// ─────────────────────────────────────────────────────────────

export const DataRegion = {
  US: 'US',
  EU: 'EU',
  OTHER: 'OTHER',
} as const;
export type DataRegion = (typeof DataRegion)[keyof typeof DataRegion];

export const SystemRole = {
  STUDENT: 'STUDENT',
  UNIV_ADMIN: 'UNIV_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;
export type SystemRole = (typeof SystemRole)[keyof typeof SystemRole];

export const CourseRole = {
  GRADER: 'GRADER',
  TA: 'TA',
  PROFESSOR: 'PROFESSOR',
  HEAD_OF_COURSE: 'HEAD_OF_COURSE',
  SCHOOL_MANAGER: 'SCHOOL_MANAGER',
} as const;
export type CourseRole = (typeof CourseRole)[keyof typeof CourseRole];

export const ScopeType = {
  COURSE: 'COURSE',
  SCHOOL: 'SCHOOL',
} as const;
export type ScopeType = (typeof ScopeType)[keyof typeof ScopeType];

export const EnrollmentStatus = {
  ACTIVE: 'ACTIVE',
  DROPPED: 'DROPPED',
  COMPLETED: 'COMPLETED',
  WITHDRAWN: 'WITHDRAWN',
} as const;
export type EnrollmentStatus = (typeof EnrollmentStatus)[keyof typeof EnrollmentStatus];

export const MaterialKind = {
  PDF: 'PDF',
  DOCX: 'DOCX',
  PPTX: 'PPTX',
  MARKDOWN: 'MARKDOWN',
  TEXT: 'TEXT',
  VIDEO: 'VIDEO',
  IMAGE: 'IMAGE',
} as const;
export type MaterialKind = (typeof MaterialKind)[keyof typeof MaterialKind];

export const ChunkLevel = {
  CHILD: 'CHILD',
  PARENT: 'PARENT',
} as const;
export type ChunkLevel = (typeof ChunkLevel)[keyof typeof ChunkLevel];

export const ChunkType = {
  PROSE: 'PROSE',
  EQUATION: 'EQUATION',
  CODE: 'CODE',
  TABLE: 'TABLE',
  FIGURE_CAPTION: 'FIGURE_CAPTION',
  LIST: 'LIST',
} as const;
export type ChunkType = (typeof ChunkType)[keyof typeof ChunkType];

export const AssignmentType = {
  OBJECTIVE: 'OBJECTIVE',
  OPEN_RESPONSE: 'OPEN_RESPONSE',
  MATH: 'MATH',
  CODE: 'CODE',
  MIXED: 'MIXED',
} as const;
export type AssignmentType = (typeof AssignmentType)[keyof typeof AssignmentType];

export const PrerequisiteRefType = {
  MATERIAL: 'MATERIAL',
  MATERIAL_CHUNK: 'MATERIAL_CHUNK',
  CONCEPT: 'CONCEPT',
} as const;
export type PrerequisiteRefType = (typeof PrerequisiteRefType)[keyof typeof PrerequisiteRefType];

export const SubmissionStatus = {
  PENDING: 'PENDING',
  GRADING: 'GRADING',
  DRAFT_READY: 'DRAFT_READY',
  HELD_FOR_APPROVAL: 'HELD_FOR_APPROVAL',
  FLAGGED_FOR_REVIEW: 'FLAGGED_FOR_REVIEW',
  RELEASED: 'RELEASED',
  FAILED: 'FAILED',
  NEEDS_MANUAL_GRADE: 'NEEDS_MANUAL_GRADE',
} as const;
export type SubmissionStatus = (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

export const ReleasePolicy = {
  AUTO: 'AUTO',
  HOLD_FOR_APPROVAL: 'HOLD_FOR_APPROVAL',
} as const;
export type ReleasePolicy = (typeof ReleasePolicy)[keyof typeof ReleasePolicy];

export const AnnotationKind = {
  STRENGTH: 'STRENGTH',
  DEDUCTION: 'DEDUCTION',
  OBSERVATION: 'OBSERVATION',
} as const;
export type AnnotationKind = (typeof AnnotationKind)[keyof typeof AnnotationKind];

export const ModelCallPurpose = {
  GRADING: 'GRADING',
  VERIFICATION: 'VERIFICATION',
  CONCEPT_EXTRACTION: 'CONCEPT_EXTRACTION',
  EMBEDDING: 'EMBEDDING',
  TRANSCRIPTION: 'TRANSCRIPTION',
  RERANK: 'RERANK',
  HYDE_EXPANSION: 'HYDE_EXPANSION',
  QUERY_REWRITE: 'QUERY_REWRITE',
  RUBRIC_SUGGESTION: 'RUBRIC_SUGGESTION',
  FOLLOWUP_CHAT: 'FOLLOWUP_CHAT',
  CONTEXTUAL_COMPRESSION: 'CONTEXTUAL_COMPRESSION',
  OTHER: 'OTHER',
} as const;
export type ModelCallPurpose = (typeof ModelCallPurpose)[keyof typeof ModelCallPurpose];

export const ModelCallStatus = {
  OK: 'OK',
  MALFORMED_OUTPUT: 'MALFORMED_OUTPUT',
  RATE_LIMITED: 'RATE_LIMITED',
  UPSTREAM_ERROR: 'UPSTREAM_ERROR',
  TIMED_OUT: 'TIMED_OUT',
} as const;
export type ModelCallStatus = (typeof ModelCallStatus)[keyof typeof ModelCallStatus];

export const UsageKind = {
  LLM_GRADING: 'LLM_GRADING',
  LLM_FOLLOWUP_CHAT: 'LLM_FOLLOWUP_CHAT',
  LLM_RUBRIC_SUGGESTION: 'LLM_RUBRIC_SUGGESTION',
  LLM_VERIFICATION: 'LLM_VERIFICATION',
  LLM_EMBEDDING: 'LLM_EMBEDDING',
  LLM_RERANK: 'LLM_RERANK',
  LLM_HYDE: 'LLM_HYDE',
  LLM_QUERY_REWRITE: 'LLM_QUERY_REWRITE',
  LLM_CONTEXTUAL_COMPRESSION: 'LLM_CONTEXTUAL_COMPRESSION',
  LLM_CONCEPT_EXTRACTION: 'LLM_CONCEPT_EXTRACTION',
  TRANSCRIPTION: 'TRANSCRIPTION',
  STORAGE_GB_MONTH: 'STORAGE_GB_MONTH',
  STORAGE_BACKUP_GB_MONTH: 'STORAGE_BACKUP_GB_MONTH',
} as const;
export type UsageKind = (typeof UsageKind)[keyof typeof UsageKind];

export const SuggestionStatus = {
  PENDING: 'PENDING',
  PARTIALLY_ACCEPTED: 'PARTIALLY_ACCEPTED',
  ACCEPTED: 'ACCEPTED',
  DISCARDED: 'DISCARDED',
} as const;
export type SuggestionStatus = (typeof SuggestionStatus)[keyof typeof SuggestionStatus];

export const AppealStatus = {
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
} as const;
export type AppealStatus = (typeof AppealStatus)[keyof typeof AppealStatus];

export const FollowupThreadStatus = {
  ACTIVE: 'ACTIVE',
  FLAGGED_TO_INSTRUCTOR: 'FLAGGED_TO_INSTRUCTOR',
  CLOSED: 'CLOSED',
} as const;
export type FollowupThreadStatus =
  (typeof FollowupThreadStatus)[keyof typeof FollowupThreadStatus];

export const FollowupMessageRole = {
  STUDENT: 'STUDENT',
  AI: 'AI',
  INSTRUCTOR: 'INSTRUCTOR',
} as const;
export type FollowupMessageRole =
  (typeof FollowupMessageRole)[keyof typeof FollowupMessageRole];
