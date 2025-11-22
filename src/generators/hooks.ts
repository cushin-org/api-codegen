import fs from 'fs/promises';
import path from 'path';
import { BaseGenerator } from './base.js';
import type { APIEndpoint } from '../config/schema.js';

export class HooksGenerator extends BaseGenerator {
  async generate(): Promise<void> {
    const content = this.generateContent();
    const outputPath = path.join(this.context.config.outputDir, 'hooks.ts');

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, content, 'utf-8');
  }

  private generateContent(): string {
    const useClientDirective = this.context.config.options?.useClientDirective ?? true;
    
    const imports = `${useClientDirective ? "'use client';\n" : ''}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  UseQueryOptions, 
  UseMutationOptions,
  QueryKey 
} from '@tanstack/react-query';
import { apiClient } from './client';
import type { 
  APIEndpoints, 
  ExtractBody, 
  ExtractParams, 
  ExtractQuery, 
  ExtractResponse 
} from './types';
`;

    const hooks: string[] = [];

    Object.entries(this.context.apiConfig.endpoints).forEach(([name, endpoint]) => {
      if (this.isQueryEndpoint(endpoint)) {
        hooks.push(this.generateQueryHook(name, endpoint));
      } else {
        hooks.push(this.generateMutationHook(name, endpoint));
      }
    });

    return imports + '\n' + hooks.join('\n\n');
  }

  private generateQueryHook(name: string, endpoint: APIEndpoint): string {
    const hookPrefix = this.context.config.options?.hookPrefix || 'use';
    const hookName = `${hookPrefix}${this.capitalize(name)}`;
    const signature = this.getEndpointSignature(name, endpoint);
    const queryTags = this.getQueryTags(endpoint);

    const paramDef = signature.hasParams ? `params: ${signature.paramType}` : '';
    const queryDef = signature.hasQuery ? `query?: ${signature.queryType}` : '';
    const optionsDef = `options?: Omit<UseQueryOptions<${signature.responseType}, Error, ${signature.responseType}, QueryKey>, 'queryKey' | 'queryFn'>`;

    const paramsList = [paramDef, queryDef, optionsDef]
      .filter(Boolean)
      .join(',\n  ');

    const queryKeyParts = [
      ...queryTags.map((tag) => `'${tag}'`),
      signature.hasParams ? 'params' : 'undefined',
      signature.hasQuery ? 'query' : 'undefined',
    ];

    const clientCallArgs: string[] = [];
    if (signature.hasParams) clientCallArgs.push('params');
    if (signature.hasQuery) clientCallArgs.push('query');

    return `/**
 * ${endpoint.description || `Query hook for ${name}`}
 * @tags ${queryTags.join(', ') || 'none'}
 */
export function ${hookName}(
  ${paramsList}
) {
  return useQuery({
    queryKey: [${queryKeyParts.join(', ')}] as const,
    queryFn: () => apiClient.${name}(${clientCallArgs.join(', ')}),
    ...options,
  });
}`;
  }

  private generateMutationHook(name: string, endpoint: APIEndpoint): string {
    const hookPrefix = this.context.config.options?.hookPrefix || 'use';
    const hookName = `${hookPrefix}${this.capitalize(name)}`;
    const signature = this.getEndpointSignature(name, endpoint);
    const invalidationTags = this.getInvalidationTags(endpoint);

    let inputType = 'void';
    if (signature.hasParams && signature.hasBody) {
      inputType = `{ params: ${signature.paramType}; body: ${signature.bodyType} }`;
    } else if (signature.hasParams) {
      inputType = signature.paramType;
    } else if (signature.hasBody) {
      inputType = signature.bodyType;
    }

    const invalidationQueries = invalidationTags.length > 0
      ? invalidationTags
          .map((tag) => `      queryClient.invalidateQueries({ queryKey: ['${tag}'] });`)
          .join('\n')
      : '      // No automatic invalidations';

    return `/**
 * ${endpoint.description || `Mutation hook for ${name}`}
 * @tags ${endpoint.tags?.join(', ') || 'none'}
 */
export function ${hookName}(
  options?: Omit<UseMutationOptions<${signature.responseType}, Error, ${inputType}>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ${inputType === 'void' ? '() => {' : '(input) => {'}
      ${this.generateMutationCall(name, signature.hasParams, signature.hasBody)}
    },
    onSuccess: (data, variables, context) => {
      // Invalidate related queries
${invalidationQueries}
      
      // Call user's onSuccess if provided
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}`;
  }
}
