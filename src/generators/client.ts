import fs from 'fs/promises';
import path from 'path';
import { BaseGenerator } from './base.js';

export class ClientGenerator extends BaseGenerator {
  async generate(): Promise<void> {
    await this.generateClientFile();
    
    if (this.context.config.provider === 'nextjs') {
      await this.generateServerClientFile();
    }
  }

  private async generateClientFile(): Promise<void> {
    const content = this.generateClientContent();
    const outputPath = path.join(this.context.config.outputDir, 'client.ts');

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, content, 'utf-8');
  }

  private async generateServerClientFile(): Promise<void> {
    const content = this.generateServerClientContent();
    const outputPath = path.join(this.context.config.outputDir, 'server-client.ts');

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, content, 'utf-8');
  }

  private generateClientContent(): string {
    const useClientDirective = this.context.config.options?.useClientDirective ?? true;
    
    return `${useClientDirective ? "'use client';\n" : ''}
import { createAPIClient } from '@vietbus/api-codegen/client';
import type { AuthCallbacks } from '@vietbus/api-codegen/client';
import { apiConfig } from '../config/endpoints';
import type { APIEndpoints } from './types';

// Type-safe API client methods
type APIClientMethods = {
  [K in keyof APIEndpoints]: APIEndpoints[K] extends {
    method: infer M;
    params?: infer P;
    query?: infer Q;
    body?: infer B;
    response: infer R;
  }
    ? M extends 'GET'
      ? P extends { _type: any }
        ? Q extends { _type: any }
          ? (params: P['_type'], query?: Q['_type']) => Promise<R['_type']>
          : (params: P['_type']) => Promise<R['_type']>
        : Q extends { _type: any }
          ? (query?: Q['_type']) => Promise<R['_type']>
          : () => Promise<R['_type']>
      : P extends { _type: any }
        ? B extends { _type: any }
          ? (params: P['_type'], body: B['_type']) => Promise<R['_type']>
          : (params: P['_type']) => Promise<R['_type']>
        : B extends { _type: any }
          ? (body: B['_type']) => Promise<R['_type']>
          : () => Promise<R['_type']>
    : never;
};

// Export singleton instance (will be initialized later)
export let apiClient: APIClientMethods & {
  refreshAuth: () => Promise<void>;
  updateAuthCallbacks: (callbacks: AuthCallbacks) => void;
};

/**
 * Initialize API client with auth callbacks
 * Call this function in your auth provider setup
 * 
 * @example
 * const authCallbacks = {
 *   getTokens: () => getStoredTokens(),
 *   setTokens: (tokens) => storeTokens(tokens),
 *   clearTokens: () => clearStoredTokens(),
 *   onAuthError: () => router.push('/login'),
 *   onRefreshToken: async () => {
 *     const newToken = await refreshAccessToken();
 *     return newToken;
 *   },
 * };
 * 
 * initializeAPIClient(authCallbacks);
 */
export const initializeAPIClient = (authCallbacks: AuthCallbacks) => {
  apiClient = createAPIClient(apiConfig, authCallbacks) as any;
  return apiClient;
};

// Export for custom usage
export { createAPIClient };
export type { AuthCallbacks };
`;
  }

  private generateServerClientContent(): string {
    return `import { createAPIClient } from '@vietbus/api-codegen/client';
import { apiConfig } from '../config/endpoints';
import type { APIEndpoints } from './types';

// Type-safe API client methods for server-side
type APIClientMethods = {
  [K in keyof APIEndpoints]: APIEndpoints[K] extends {
    method: infer M;
    params?: infer P;
    query?: infer Q;
    body?: infer B;
    response: infer R;
  }
    ? M extends 'GET'
      ? P extends { _type: any }
        ? Q extends { _type: any }
          ? (params: P['_type'], query?: Q['_type']) => Promise<R['_type']>
          : (params: P['_type']) => Promise<R['_type']>
        : Q extends { _type: any }
          ? (query?: Q['_type']) => Promise<R['_type']>
          : () => Promise<R['_type']>
      : P extends { _type: any }
        ? B extends { _type: any }
          ? (params: P['_type'], body: B['_type']) => Promise<R['_type']>
          : (params: P['_type']) => Promise<R['_type']>
        : B extends { _type: any }
          ? (body: B['_type']) => Promise<R['_type']>
          : () => Promise<R['_type']>
    : never;
};

/**
 * Server-side API client (no auth, direct API calls)
 * Use this in Server Components, Server Actions, and Route Handlers
 */
export const serverClient = createAPIClient(apiConfig) as APIClientMethods;
`;
  }
}
