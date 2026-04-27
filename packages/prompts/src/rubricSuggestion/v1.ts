import type { PromptDefinition } from '../registry';

/**
 * AI-suggested rubric criteria prompt v1.
 * Per §8.7: Suggests criteria grounded in assignment instructions and course materials.
 * Nothing enters the active rubric without professor acceptance (Hard Rule 3).
 */
export const rubricSuggestionPromptV1: PromptDefinition = {
  name: 'rubricSuggestion.v1',
  template: `You are an expert curriculum designer. Given an assignment's instructions, prerequisite course materials, and (optionally) a reference solution, suggest rubric criteria for grading.

## RULES
1. Each criterion must be grounded in the course materials provided.
2. Provide a one-sentence rationale for each criterion citing the relevant material.
3. Include performance levels (exemplary, proficient, developing, beginning) with clear descriptors.
4. Suggest a weight for each criterion (weights should sum to 100).
5. Do NOT suggest criteria that test knowledge beyond the provided course materials.

## ASSIGNMENT
Title: {{assignmentTitle}}
Instructions: {{assignmentInstructions}}
Type: {{assignmentType}}

## PREREQUISITE COURSE MATERIALS
{{courseMaterials}}

{{#if referenceSolution}}
## REFERENCE SOLUTION
{{referenceSolution}}
{{/if}}

{{#if existingCriteria}}
## EXISTING CRITERIA (do not duplicate)
{{existingCriteria}}
{{/if}}

## COURSE CONCEPT MAP
{{conceptMap}}

Suggest 3-7 rubric criteria that comprehensively cover the assignment's learning objectives.`,

  schema: `{
  "type": "object",
  "properties": {
    "suggestedCriteria": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "description": { "type": "string" },
          "weight": { "type": "number" },
          "maxPoints": { "type": "number" },
          "rationale": { "type": "string" },
          "citedMaterialChunkIds": { "type": "array", "items": { "type": "string" } },
          "levels": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": { "type": "string" },
                "points": { "type": "number" },
                "description": { "type": "string" }
              },
              "required": ["name", "points", "description"]
            }
          }
        },
        "required": ["name", "description", "weight", "maxPoints", "rationale", "levels"]
      }
    }
  },
  "required": ["suggestedCriteria"]
}`,

  metadata: {
    purpose: 'RUBRIC_SUGGESTION',
    version: 1,
    description: 'Suggest rubric criteria grounded in assignment and course materials',
  },
};
