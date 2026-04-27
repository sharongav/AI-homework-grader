import type { PromptDefinition } from '../registry';

/**
 * HyDE (Hypothetical Document Embeddings) prompt v1.
 * Per §8.5 step B: generates hypothetical correct answers for better retrieval.
 */
export const hydePromptV1: PromptDefinition = {
  name: 'hyde.v1',
  template: `You are an expert in the subject matter of this course. Given a rubric criterion and assignment context, generate a hypothetical correct answer that a strong student would write.

This hypothetical answer will be used to search for relevant course materials. Write it in a style similar to course lecture notes and textbooks — use technical terminology accurately.

## ASSIGNMENT
Title: {{assignmentTitle}}
Instructions: {{assignmentInstructions}}

## RUBRIC CRITERION
{{criterionName}}: {{criterionDescription}}

Generate a concise hypothetical correct answer (200-400 words) that demonstrates full mastery of this criterion. Use the same vocabulary and style as course materials.`,

  schema: `{
  "type": "object",
  "properties": {
    "hypotheticalAnswer": { "type": "string" },
    "keyTerms": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["hypotheticalAnswer", "keyTerms"]
}`,

  metadata: {
    purpose: 'HYDE_EXPANSION',
    version: 1,
    description: 'Generate hypothetical document embeddings for better retrieval precision',
  },
};
