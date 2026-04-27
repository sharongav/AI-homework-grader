import { createHash } from 'crypto';

export interface PromptDefinition {
  name: string;
  template: string;
  schema: string;
  metadata: {
    purpose: string;
    version: number;
    description: string;
  };
}

const registry = new Map<string, PromptDefinition>();

export function registerPrompt(prompt: PromptDefinition): void {
  registry.set(prompt.name, prompt);
}

export function getPromptVersion(name: string): PromptDefinition | undefined {
  return registry.get(name);
}

export function computePromptHash(prompt: PromptDefinition): string {
  const content = prompt.template + prompt.schema;
  return createHash('sha256').update(content).digest('hex');
}

export function loadPromptRegistry(): Map<string, PromptDefinition> {
  return new Map(registry);
}
