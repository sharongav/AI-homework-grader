/**
 * Material Ingestion Pipeline — Phase 5
 * Per §8.5: extract → section tree → semantic chunking → parent-child pairing
 * → dense indexing → sparse indexing → concept tagging
 */

import { z } from 'zod';

// ─── Types ───────────────────────────────────────────────────

export interface IngestionJobData {
  materialId: string;
  courseId: string;
  universityId: string;
  storageKey: string;
  fileName: string;
  mimeType: string;
  weekNumber?: number;
}

export interface SectionNode {
  heading: string;
  level: number;
  children: SectionNode[];
  startChar: number;
  endChar: number;
}

export interface RawChunk {
  content: string;
  sectionHeadingPath: string;
  pageNumber?: number;
  startChar: number;
  endChar: number;
  chunkType: 'CHILD' | 'PARENT';
  parentChunkIndex?: number;
}

export type IngestionStage =
  | 'extracting'
  | 'chunking'
  | 'embedding'
  | 'indexing'
  | 'concept_extraction'
  | 'completed'
  | 'failed';

export const IngestionProgressSchema = z.object({
  materialId: z.string().uuid(),
  stage: z.enum([
    'extracting',
    'chunking',
    'embedding',
    'indexing',
    'concept_extraction',
    'completed',
    'failed',
  ]),
  progress: z.number().min(0).max(100),
  message: z.string().optional(),
  error: z.string().optional(),
});

export type IngestionProgress = z.infer<typeof IngestionProgressSchema>;
