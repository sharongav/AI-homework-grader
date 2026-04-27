import type { PromptDefinition } from '../registry';

export const queryRewritePromptV1: PromptDefinition = {
  name: 'queryRewrite.v1',
  template: `You are a search query optimizer. Given a rubric criterion and assignment context, generate 3-5 diverse search queries that would find the most relevant course materials for grading this criterion.

Think about: what would a student answering this correctly need to know? Which course concepts does this criterion test? What terminology would the course materials use?

## ASSIGNMENT
Title: {{assignmentTitle}}
Instructions: {{assignmentInstructions}}

## RUBRIC CRITERION
{{criterionName}}: {{criterionDescription}}

Generate diverse paraphrased search queries that approach the concept from different angles.`,

  schema: `{
  "type": "object",
  "properties": {
    "queries": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 3,
      "maxItems": 5
    }
  },
  "required": ["queries"]
}`,

  metadata: {
    purpose: 'QUERY_REWRITE',
    version: 1,
    description: 'Generate diverse search queries for multi-query retrieval expansion',
  },
};
