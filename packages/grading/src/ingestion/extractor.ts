/**
 * Text extraction from various file formats.
 * Per §8.5 step 1: PDF via pdfjs, DOCX via mammoth, PPTX via slide-text,
 * markdown/text as-is, video via Whisper transcription.
 */

import type { SectionNode } from './types';

export interface ExtractedContent {
  text: string;
  sectionTree: SectionNode[];
  pageCount?: number;
  metadata: Record<string, string>;
}

/**
 * Classify a document as TYPED | SCANNED | HANDWRITTEN.
 * Per Phase 5: scanned/handwritten course materials rejected at upload.
 */
export async function classifyDocument(
  buffer: Buffer,
  mimeType: string,
): Promise<'TYPED' | 'SCANNED' | 'HANDWRITTEN'> {
  // For PDF: rasterize first page, run small auxiliary model classification
  if (mimeType === 'application/pdf') {
    // TODO: Implement first-page rasterization + classification
    // Using a cheap auxiliary model (not the frontier model)
    return 'TYPED';
  }

  // DOCX, PPTX, text, markdown are always typed
  if (
    mimeType.includes('wordprocessingml') ||
    mimeType.includes('presentationml') ||
    mimeType.startsWith('text/')
  ) {
    return 'TYPED';
  }

  return 'TYPED';
}

/**
 * Extract text and section structure from a file.
 */
export async function extractContent(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<ExtractedContent> {
  switch (mimeType) {
    case 'application/pdf':
      return extractPdf(buffer);
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return extractDocx(buffer);
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return extractPptx(buffer);
    case 'text/markdown':
    case 'text/plain':
      return extractText(buffer, mimeType);
    default:
      return extractText(buffer, mimeType);
  }
}

async function extractPdf(buffer: Buffer): Promise<ExtractedContent> {
  // TODO: Use pdfjs-dist to extract text with page numbers
  // Preserve structure for section tree building
  const text = buffer.toString('utf-8'); // Placeholder
  return {
    text,
    sectionTree: [],
    pageCount: 1,
    metadata: { format: 'pdf' },
  };
}

async function extractDocx(buffer: Buffer): Promise<ExtractedContent> {
  // TODO: Use mammoth to extract text preserving section tree
  // mammoth.extractRawText(buffer) + heading parsing
  const text = buffer.toString('utf-8'); // Placeholder
  return {
    text,
    sectionTree: [],
    metadata: { format: 'docx' },
  };
}

async function extractPptx(buffer: Buffer): Promise<ExtractedContent> {
  // TODO: Extract slide-by-slide text
  const text = buffer.toString('utf-8'); // Placeholder
  return {
    text,
    sectionTree: [],
    metadata: { format: 'pptx' },
  };
}

async function extractText(
  buffer: Buffer,
  mimeType: string,
): Promise<ExtractedContent> {
  const text = buffer.toString('utf-8');

  // For markdown, parse headings into section tree
  const sectionTree: SectionNode[] = [];
  if (mimeType === 'text/markdown') {
    const lines = text.split('\n');
    let charOffset = 0;
    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        sectionTree.push({
          heading: headingMatch[2],
          level: headingMatch[1].length,
          children: [],
          startChar: charOffset,
          endChar: charOffset + line.length,
        });
      }
      charOffset += line.length + 1;
    }
  }

  return { text, sectionTree, metadata: { format: mimeType } };
}

/**
 * Build heading hierarchy path for a position in the document.
 * E.g., "Ch. 4 > 4.2 Lagrangians > Worked example"
 */
export function buildSectionPath(
  sectionTree: SectionNode[],
  charPosition: number,
): string {
  const path: string[] = [];

  function search(nodes: SectionNode[]): boolean {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nextStart =
        i + 1 < nodes.length ? nodes[i + 1].startChar : Infinity;

      if (charPosition >= node.startChar && charPosition < nextStart) {
        path.push(node.heading);
        search(node.children);
        return true;
      }
    }
    return false;
  }

  search(sectionTree);
  return path.join(' > ');
}
