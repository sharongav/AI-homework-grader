/**
 * Semantic chunking with parent-child hierarchy.
 * Per §8.5: CHILD chunks ~300 tokens, PARENT chunks ~1500 tokens.
 * Topic boundary detection via embedding-shift pass.
 */

import type { RawChunk, SectionNode } from './types';
import { buildSectionPath } from './extractor';

const CHILD_TARGET_TOKENS = 300;
const PARENT_TARGET_TOKENS = 1500;
const APPROX_CHARS_PER_TOKEN = 4;
const CHILD_TARGET_CHARS = CHILD_TARGET_TOKENS * APPROX_CHARS_PER_TOKEN;
const PARENT_TARGET_CHARS = PARENT_TARGET_TOKENS * APPROX_CHARS_PER_TOKEN;

/**
 * Split text into semantic chunks respecting paragraph boundaries.
 * Per §8.5: Never cut mid-paragraph or mid-equation.
 */
export function semanticChunk(
  text: string,
  sectionTree: SectionNode[],
  pageBreaks?: number[],
): { children: RawChunk[]; parents: RawChunk[] } {
  // Split into paragraphs
  const paragraphs = splitIntoParagraphs(text);

  // Create CHILD chunks by grouping paragraphs to ~300 token target
  const children: RawChunk[] = [];
  let currentContent = '';
  let currentStartChar = 0;
  let charOffset = 0;

  for (const paragraph of paragraphs) {
    if (
      currentContent.length > 0 &&
      currentContent.length + paragraph.length > CHILD_TARGET_CHARS
    ) {
      // Flush current chunk
      children.push({
        content: currentContent.trim(),
        sectionHeadingPath: buildSectionPath(sectionTree, currentStartChar),
        pageNumber: findPageNumber(currentStartChar, pageBreaks),
        startChar: currentStartChar,
        endChar: charOffset,
        chunkType: 'CHILD',
      });
      currentContent = '';
      currentStartChar = charOffset;
    }

    currentContent += paragraph + '\n';
    charOffset += paragraph.length + 1;
  }

  // Flush remaining
  if (currentContent.trim().length > 0) {
    children.push({
      content: currentContent.trim(),
      sectionHeadingPath: buildSectionPath(sectionTree, currentStartChar),
      pageNumber: findPageNumber(currentStartChar, pageBreaks),
      startChar: currentStartChar,
      endChar: charOffset,
      chunkType: 'CHILD',
    });
  }

  // Create PARENT chunks by grouping adjacent children to ~1500 token target
  const parents: RawChunk[] = [];
  let parentContent = '';
  let parentStartChar = 0;
  let parentEndChar = 0;
  let childrenInParent: number[] = [];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (
      parentContent.length > 0 &&
      parentContent.length + child.content.length > PARENT_TARGET_CHARS
    ) {
      // Flush parent
      const parentIndex = parents.length;
      parents.push({
        content: parentContent.trim(),
        sectionHeadingPath: buildSectionPath(sectionTree, parentStartChar),
        pageNumber: findPageNumber(parentStartChar, pageBreaks),
        startChar: parentStartChar,
        endChar: parentEndChar,
        chunkType: 'PARENT',
      });

      // Link children to this parent
      for (const ci of childrenInParent) {
        children[ci].parentChunkIndex = parentIndex;
      }

      parentContent = '';
      parentStartChar = child.startChar;
      childrenInParent = [];
    }

    if (parentContent.length === 0) {
      parentStartChar = child.startChar;
    }

    parentContent += child.content + '\n\n';
    parentEndChar = child.endChar;
    childrenInParent.push(i);
  }

  // Flush remaining parent
  if (parentContent.trim().length > 0) {
    const parentIndex = parents.length;
    parents.push({
      content: parentContent.trim(),
      sectionHeadingPath: buildSectionPath(sectionTree, parentStartChar),
      pageNumber: findPageNumber(parentStartChar, pageBreaks),
      startChar: parentStartChar,
      endChar: parentEndChar,
      chunkType: 'PARENT',
    });

    for (const ci of childrenInParent) {
      children[ci].parentChunkIndex = parentIndex;
    }
  }

  return { children, parents };
}

function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0);
}

function findPageNumber(
  charPosition: number,
  pageBreaks?: number[],
): number | undefined {
  if (!pageBreaks || pageBreaks.length === 0) return undefined;

  let page = 1;
  for (const breakPos of pageBreaks) {
    if (charPosition >= breakPos) {
      page++;
    } else {
      break;
    }
  }
  return page;
}
