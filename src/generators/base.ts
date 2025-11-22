import type { APIConfig, APIEndpoint } from '../config/schema.js';
import type { ResolvedConfig } from '../config/index.js';

export interface GeneratorContext {
  config: ResolvedConfig;
  apiConfig: APIConfig;
}

export abstract class BaseGenerator {
  constructor(protected context: GeneratorContext) {}

  abstract generate(): Promise<void>;

  protected isQueryEndpoint(endpoint: APIEndpoint): boolean {
    return endpoint.method === 'GET';
  }

  protected isMutationEndpoint(endpoint: APIEndpoint): boolean {
    return !this.isQueryEndpoint(endpoint);
  }

  protected capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  protected getQueryTags(endpoint: APIEndpoint): string[] {
    return endpoint.tags || [];
  }

  protected getInvalidationTags(endpoint: APIEndpoint): string[] {
    const tags = endpoint.tags || [];
    return tags.filter((tag) => tag !== 'query' && tag !== 'mutation');
  }

  protected hasParams(endpoint: APIEndpoint): boolean {
    return !!endpoint.params;
  }

  protected hasQuery(endpoint: APIEndpoint): boolean {
    return !!endpoint.query;
  }

  protected hasBody(endpoint: APIEndpoint): boolean {
    return !!endpoint.body;
  }

  protected getEndpointSignature(
    name: string,
    endpoint: APIEndpoint,
  ): {
    hasParams: boolean;
    hasQuery: boolean;
    hasBody: boolean;
    paramType: string;
    queryType: string;
    bodyType: string;
    responseType: string;
  } {
    const hasParams = this.hasParams(endpoint);
    const hasQuery = this.hasQuery(endpoint);
    const hasBody = this.hasBody(endpoint);

    return {
      hasParams,
      hasQuery,
      hasBody,
      paramType: hasParams
        ? `ExtractParams<APIEndpoints['${name}']>`
        : 'never',
      queryType: hasQuery
        ? `ExtractQuery<APIEndpoints['${name}']>`
        : 'never',
      bodyType: hasBody ? `ExtractBody<APIEndpoints['${name}']>` : 'never',
      responseType: `ExtractResponse<APIEndpoints['${name}']>`,
    };
  }

  protected generateMutationCall(
    name: string,
    hasParams: boolean,
    hasBody: boolean,
  ): string {
    if (hasParams && hasBody) {
      return `return apiClient.${name}(input.params, input.body);`;
    } else if (hasParams) {
      return `return apiClient.${name}(input);`;
    } else if (hasBody) {
      return `return apiClient.${name}(input);`;
    } else {
      return `return apiClient.${name}();`;
    }
  }
}
