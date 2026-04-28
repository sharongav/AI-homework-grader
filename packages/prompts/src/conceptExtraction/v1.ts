import type { PromptDefinition } from '../registry';

/**
 * Concept extraction prompt v1.
 * Used during material ingestion to suggest course concepts from uploaded materials.
 */
export const conceptExtractionPromptV1: PromptDefinition = {
  name: 'conceptExtraction.v1',
  template: `You are an expert curriculum analyst. Given a section of course material, identify the key concepts being taught.

## COURSE CONTEXT
Course: {{courseName}}
Material Title: {{materialTitle}}
Section Path: {{sectionPath}}

## MATERIAL CONTENT
{{materialContent}}

## EXISTING CONCEPTS IN THIS COURSE
{{existingConcepts}}

## YOUR TASK
Identify the key academic concepts taught in this material section. For each concept:
1. Name: a concise, canonical name (e.g., "Euler-Lagrange Equation", "Binary Search Tree")
2. Relationship: is this a new concept or a sub-concept of an existing one?
3. Introduced: what week/section does this concept first appear?

Return your analysis in the structured format below. Only include concepts that are TAUGHT in this material, not merely mentioned in passing.`,
  schema: `{
  "type": "object",
  "properties": {
    "concepts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "parentConceptName": { "type": "string", "nullable": true },
          "rationale": { "type": "string" },
          "citedSection": { "type": "string" }
        },
        "required": ["name", "rationale", "citedSection"]
      }
    }
  },
  "required": ["concepts"]
}`,
  metadata: {
    purpose: 'CONCEPT_EXTRACTION',
    modelTier: 'auxiliary',
    version: 1,
  },
};
