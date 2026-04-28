import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, staffProcedure } from '../trpc';
import { prisma } from '@homework-platform/db';

export const materialRouter = createTRPCRouter({
  /** List materials for a course. */
  listByCourse: staffProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      return prisma.courseMaterial.findMany({
        where: { courseId: input.courseId },
        include: {
          _count: { select: { chunks: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }),

  /** Upload a course material. */
  upload: staffProcedure
    .input(
      z.object({
        courseId: z.string(),
        title: z.string().min(1).max(300),
        type: z.enum(['LECTURE_NOTES', 'SLIDES', 'TEXTBOOK_CHAPTER', 'CODE_SAMPLE', 'SYLLABUS', 'OTHER']),
        fileName: z.string(),
        mimeType: z.string(),
        sizeBytes: z.number().int().positive(),
        storageKey: z.string(),
        weekNumber: z.number().int().min(1).optional(),
        topicTags: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const material = await prisma.courseMaterial.create({
        data: {
          courseId: input.courseId,
          title: input.title,
          kind: input.type === 'LECTURE_NOTES' ? 'PDF' :
                input.type === 'SLIDES' ? 'PPTX' :
                input.type === 'CODE_SAMPLE' ? 'TEXT' :
                input.type === 'TEXTBOOK_CHAPTER' ? 'PDF' : 'TEXT',
          storageKey: input.storageKey,
          weekTag: input.weekNumber,
          topicTags: input.topicTags,
        },
      });

      // TODO: Enqueue ingestion job to BullMQ for chunking + embedding

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'MATERIAL_UPLOADED',
          targetType: 'CourseMaterial',
          targetId: material.id,
          metadata: { title: input.title, fileName: input.fileName },
        },
      });

      return { materialId: material.id };
    }),

  /** Delete a material (soft-delete). */
  delete: staffProcedure
    .input(z.object({ materialId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const material = await prisma.courseMaterial.findUnique({ where: { id: input.materialId } });
      if (!material) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Material not found' });
      }

      await prisma.courseMaterial.delete({
        where: { id: input.materialId },
      });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'MATERIAL_DELETED',
          targetType: 'CourseMaterial',
          targetId: input.materialId,
        },
      });

      return { success: true };
    }),

  /** Get ingestion status for a material. */
  ingestionStatus: staffProcedure
    .input(z.object({ materialId: z.string() }))
    .query(async ({ ctx, input }) => {
      const material = await prisma.courseMaterial.findUnique({
        where: { id: input.materialId },
        include: { _count: { select: { chunks: true } } },
      });
      if (!material) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Material not found' });
      }
      return {
        status: material._count.chunks > 0 ? 'COMPLETED' : 'PENDING',
        chunkCount: material._count.chunks,
      };
    }),

  /** Search course materials using hybrid retrieval. */
  search: staffProcedure
    .input(
      z.object({
        courseId: z.string(),
        query: z.string().min(1),
        limit: z.number().int().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      // TODO: Call RetrievalService for hybrid dense+sparse search
      return { results: [] as Array<{ chunkId: string; text: string; score: number; sectionPath: string }> };
    }),

  /** Review concept suggestions for a material. */
  conceptSuggestions: staffProcedure
    .input(z.object({ materialId: z.string() }))
    .query(async ({ ctx, input }) => {
      return prisma.conceptSuggestion.findMany({
        where: { materialId: input.materialId },
        orderBy: { createdAt: 'desc' },
      });
    }),

  /** Accept/discard a concept suggestion. Hard Rule 3: nothing auto-applied. */
  resolveConceptSuggestion: staffProcedure
    .input(
      z.object({
        suggestionId: z.string(),
        action: z.enum(['ACCEPT', 'EDIT_AND_ACCEPT', 'DISCARD']),
        editedName: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const suggestion = await prisma.conceptSuggestion.findUnique({
        where: { id: input.suggestionId },
      });
      if (!suggestion) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Suggestion not found' });
      }

      await prisma.conceptSuggestion.update({
        where: { id: input.suggestionId },
        data: {
          status: input.action === 'DISCARD' ? 'DISCARDED' : 'ACCEPTED',
          actionedById: ctx.userId!,
          actionedAt: new Date(),
        },
      });

      if (input.action !== 'DISCARD') {
        // Extract concept info from the suggestedConcepts JSON
        const concepts = suggestion.suggestedConcepts as Array<{ name: string; description?: string }>;
        const firstConcept = concepts?.[0];
        const name = input.action === 'EDIT_AND_ACCEPT' && input.editedName
          ? input.editedName
          : firstConcept?.name || 'Unnamed Concept';

        const concept = await prisma.concept.create({
          data: {
            courseId: suggestion.courseId,
            name,
          },
        });

        return { success: true, conceptId: concept.id };
      }

      return { success: true };
    }),

  /** Get a single material by ID. */
  get: staffProcedure
    .input(z.object({ materialId: z.string() }))
    .query(async ({ input }) => {
      const material = await prisma.courseMaterial.findUnique({
        where: { id: input.materialId },
        include: {
          _count: { select: { chunks: true } },
        },
      });
      if (!material) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Material not found' });
      }
      return material;
    }),

  /** Update week tag for a material. */
  updateWeekTag: staffProcedure
    .input(
      z.object({
        materialId: z.string(),
        weekTag: z.number().int().min(1).nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const material = await prisma.courseMaterial.findUnique({ where: { id: input.materialId } });
      if (!material) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Material not found' });
      }

      const updated = await prisma.courseMaterial.update({
        where: { id: input.materialId },
        data: { weekTag: input.weekTag },
      });

      // Propagate week tag to all chunks
      await prisma.materialChunk.updateMany({
        where: { materialId: input.materialId },
        data: { weekTag: input.weekTag },
      });

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'MATERIAL_WEEK_TAG_UPDATED',
          targetType: 'CourseMaterial',
          targetId: input.materialId,
          metadata: { weekTag: input.weekTag },
        },
      });

      return updated;
    }),

  /** Get chunks for a material. */
  getChunks: staffProcedure
    .input(
      z.object({
        materialId: z.string(),
        chunkLevel: z.enum(['CHILD', 'PARENT']).optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ input }) => {
      const where = {
        materialId: input.materialId,
        ...(input.chunkLevel && { chunkLevel: input.chunkLevel }),
      };

      const [items, total] = await Promise.all([
        prisma.materialChunk.findMany({
          where,
          select: {
            id: true,
            chunkIndex: true,
            text: true,
            weekTag: true,
            chunkLevel: true,
            parentChunkId: true,
            sectionHeadingPath: true,
            pageNumber: true,
            startChar: true,
            endChar: true,
            chunkType: true,
            conceptIds: true,
          },
          orderBy: { chunkIndex: 'asc' },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        prisma.materialChunk.count({ where }),
      ]);

      return { items, total };
    }),

  /** Trigger re-ingestion of a material. */
  ingest: staffProcedure
    .input(z.object({ materialId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const material = await prisma.courseMaterial.findUnique({ where: { id: input.materialId } });
      if (!material) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Material not found' });
      }

      // Delete existing chunks for re-ingestion
      await prisma.materialChunk.deleteMany({
        where: { materialId: input.materialId },
      });

      // TODO: Enqueue ingestion job to BullMQ for chunking + embedding

      await prisma.auditLog.create({
        data: {
          actorId: ctx.userId!,
          action: 'MATERIAL_REINGEST_TRIGGERED',
          targetType: 'CourseMaterial',
          targetId: input.materialId,
        },
      });

      return { success: true, status: 'PENDING' };
    }),
});
