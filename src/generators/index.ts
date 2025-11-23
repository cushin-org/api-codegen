import { HooksGenerator } from './hooks.js';
import { ServerActionsGenerator } from './actions.js';
import { ServerQueriesGenerator } from './queries.js';
import { TypesGenerator } from './types.js';
import { ClientGenerator } from './client.js';
import { RuntimeGenerator } from './runtime.js';
import type { GeneratorContext } from './base.js';

export class CodeGenerator {
  constructor(private context: GeneratorContext) {}

  async generate(): Promise<void> {
    const generators = this.getGenerators();

    for (const generator of generators) {
      await generator.generate();
    }
  }

  private getGenerators() {
    const generators: Array<any> = [];

    // Always generate runtime and types
    generators.push(new RuntimeGenerator(this.context));
    generators.push(new TypesGenerator(this.context));

    // Generate client if enabled
    if (this.context.config.generateClient) {
      generators.push(new ClientGenerator(this.context));
    }

    // Generate hooks if enabled
    if (this.context.config.generateHooks) {
      generators.push(new HooksGenerator(this.context));
    }

    // Generate server actions if enabled (Next.js only)
    if (
      this.context.config.generateServerActions &&
      this.context.config.provider === 'nextjs'
    ) {
      generators.push(new ServerActionsGenerator(this.context));
    }

    // Generate server queries if enabled (Next.js only)
    if (
      this.context.config.generateServerQueries &&
      this.context.config.provider === 'nextjs'
    ) {
      generators.push(new ServerQueriesGenerator(this.context));
    }

    return generators;
  }
}
