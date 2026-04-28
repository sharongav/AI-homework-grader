import type { PromptDefinition } from '../registry';

/**
 * Contextual compression prompt v1.
 * Per §8.5 step E: compress retrieved parent chunks to extract only
 * sentences relevant to the rubric criterion being scored.
 */
export const contextualCompressionPromptV1: PromptDefinition = {
  name: 'contextualCompression.v1',
  template: `You are a precision text extractor. Given a passage from course materials and a rubric criterion, extract ONLY the sentences and paragraphs that are directly relevant to evaluating the criterion. Preserve exact wording — do not paraphrase.

## RUBRIC CRITERION
Name: {{criterionName}}
Description: {{criterionDescription}}
Max Points: {{maxPoints}}

## ASSIGNMENT CONTEXT
Title: {{assignmentTitle}}
Instructions (summary): {{assignmentSummary}}

## COURSE MATERIAL PASSAGE
Source: {{sectionHeadingPath}}
Page: {{pageNumber}}

{{passageText}}

## YOUR TASK
Extract only the sentences from the passage above that a grader would need to evaluate this specific rubric criterion. Include:
- Definitions relevant to the criterion
- Formulas, theorems, or rules that apply
- Examples that illustrate the expected standard
- Specific instructions from the professor about this topic

Do NOT include tangential information, biographical context, or unrelated examples. If nothing in the passage is relevant to this criterion, return an empty extraction.`,
  schema: `{
  "type": "object",
  "properties": {
    "extractedText": { "type": "string" },
    "relevanceScore": { "type": "number", "minimum": 0, "maximum": 1 },
    "keyTerms": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["extractedText", "relevanceScore"]
}`,
  metadata: {
    purpose: 'CONTEXTUAL_COMPRESSION',
    modelTier: 'frontier',
    version: 1,
  },
};
