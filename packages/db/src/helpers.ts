import { prisma } from './client';
import type { Prisma } from '@prisma/client';

/**
 * Get a course with its school and university for scope verification.
 */
export async function getCourseWithScope(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      school: {
        include: {
          university: {
            include: {
              systemPolicy: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Get eligible materials for an assignment based on prerequisites.
 * Falls back to weekTag filter if no prerequisites are defined (Hard Rule 2).
 */
export async function getEligibleMaterialsForAssignment(assignmentId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      prerequisites: true,
    },
  });

  if (!assignment) {
    throw new Error(`Assignment ${assignmentId} not found`);
  }

  // If explicit prerequisites exist, use them
  if (assignment.prerequisites.length > 0) {
    const materialIds = assignment.prerequisites
      .filter((p: any) => p.refType === 'MATERIAL')
      .map((p: any) => p.refId);

    const chunkIds = assignment.prerequisites
      .filter((p: any) => p.refType === 'MATERIAL_CHUNK')
      .map((p: any) => p.refId);

    const materialChunks = await prisma.materialChunk.findMany({
      where: {
        OR: [
          { materialId: { in: materialIds } },
          { id: { in: chunkIds } },
        ],
      },
      include: {
        material: true,
      },
    });

    return materialChunks;
  }

  // Fallback: weekTag ≤ assignment.availableFromWeek
  if (assignment.availableFromWeek != null) {
    return prisma.materialChunk.findMany({
      where: {
        material: {
          courseId: assignment.courseId,
        },
        weekTag: {
          lte: assignment.availableFromWeek,
        },
      },
      include: {
        material: true,
      },
    });
  }

  // No prerequisites and no week tag — return all course materials
  return prisma.materialChunk.findMany({
    where: {
      material: {
        courseId: assignment.courseId,
      },
    },
    include: {
      material: true,
    },
  });
}

/**
 * Get submission with all related data needed for the grading pipeline.
 */
export async function getSubmissionForGrading(submissionId: string) {
  return prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      assignment: {
        include: {
          rubric: {
            include: {
              versions: {
                orderBy: { versionNumber: 'desc' as const },
                take: 1,
              },
            },
          },
          prerequisites: true,
          course: {
            include: {
              school: {
                include: {
                  university: {
                    include: {
                      systemPolicy: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Check if adding a new submission would exceed resubmission limits.
 */
export async function checkResubmissionLimit(
  assignmentId: string,
  studentId: string,
): Promise<{ allowed: boolean; currentAttempts: number; maxAllowed: number }> {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment) {
    throw new Error(`Assignment ${assignmentId} not found`);
  }

  const existingSubmissions = await prisma.submission.count({
    where: {
      assignmentId,
      studentId,
    },
  });

  return {
    allowed: existingSubmissions < assignment.maxResubmissions + 1,
    currentAttempts: existingSubmissions,
    maxAllowed: assignment.maxResubmissions + 1,
  };
}

/**
 * Compute the idempotency key for a grading job.
 * Per Hard Rule 16: hash(submissionId, attemptNumber, promptVersion, rubricVersionId, retrievalConfigId, modelSnapshot)
 */
export function computeIdempotencyKey(params: {
  submissionId: string;
  attemptNumber: number;
  promptVersion: string;
  rubricVersionId: string;
  retrievalConfigId: string;
  modelSnapshot: string;
}): string {
  const input = [
    params.submissionId,
    params.attemptNumber.toString(),
    params.promptVersion,
    params.rubricVersionId,
    params.retrievalConfigId,
    params.modelSnapshot,
  ].join('|');

  // Use a simple hash for now; in production use crypto.createHash('sha256')
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `grade_${Math.abs(hash).toString(36)}`;
}
