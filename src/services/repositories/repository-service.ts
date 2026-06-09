import type {
  AuthorizationUrlResponse,
  ApiChange,
  ApiChangeSeverity,
  ApiChangeType,
  ApiDocumentationResponse,
  ApiFramework,
  ApiHttpMethod,
  ApiSnapshot,
  DetectedApi,
  DependencyGraphResponse,
  DisconnectProviderResponse,
  OAuthRepositoryProvider,
  PaginatedResponse,
  ProviderRepository,
  RepositoryConnection,
  RepositoryMutationResponse,
  RepositoryProviderStatus,
  RepositoryScan,
  RepositorySource,
  ScanMutationResponse,
  ScanStatusResponse,
} from '@/types/repository';

const DEFAULT_API_URL = 'http://localhost:3001';
const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? DEFAULT_API_URL;
const INTEGRATIONS_BASE_URL = `${API_BASE_URL}/api/v1/integrations`;
const REPOSITORIES_BASE_URL = `${API_BASE_URL}/api/v1/repositories`;

export class RepositoryApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RepositoryApiError';
  }
}

interface RepositoryRequestOptions extends RequestInit {
  accessToken: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractErrorMessage(payload: unknown): string {
  if (!isRecord(payload)) {
    return 'Repository request failed.';
  }

  const message = payload['message'];

  if (typeof message === 'string') {
    return message;
  }

  if (Array.isArray(message) && typeof message[0] === 'string') {
    return message[0];
  }

  return 'Repository request failed.';
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function requestJson<TResponse>(
  url: string,
  { accessToken, ...init }: RepositoryRequestOptions,
): Promise<TResponse> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);

  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json');
  }

  const response = await fetch(url, {
    ...init,
    credentials: 'include',
    headers,
  });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new RepositoryApiError(extractErrorMessage(payload));
  }

  return payload as TResponse;
}

function providerPath(provider: OAuthRepositoryProvider): string {
  return provider.toLowerCase();
}

function appendQueryValue(
  params: URLSearchParams,
  key: string,
  value: string | number | undefined,
): void {
  if (value === undefined || value === '') {
    return;
  }

  params.set(key, value.toString());
}

function appendQuery(url: string, params: URLSearchParams): string {
  const query = params.toString();

  return query ? `${url}?${query}` : url;
}

export interface ListRepositoryApisOptions {
  framework?: ApiFramework;
  limit?: number;
  method?: ApiHttpMethod;
  offset?: number;
  search?: string;
}

export interface ListApiChangesOptions {
  changeType?: ApiChangeType;
  limit?: number;
  offset?: number;
  search?: string;
  severity?: ApiChangeSeverity;
}

function buildRepositoryApisUrl(repositoryId: string, options: ListRepositoryApisOptions): string {
  const params = new URLSearchParams();

  appendQueryValue(params, 'framework', options.framework);
  appendQueryValue(params, 'limit', options.limit);
  appendQueryValue(params, 'method', options.method);
  appendQueryValue(params, 'offset', options.offset);
  appendQueryValue(params, 'search', options.search?.trim());

  return appendQuery(`${REPOSITORIES_BASE_URL}/${repositoryId}/apis`, params);
}

function buildApiChangesUrl(baseUrl: string, options: ListApiChangesOptions): string {
  const params = new URLSearchParams();

  appendQueryValue(params, 'changeType', options.changeType);
  appendQueryValue(params, 'limit', options.limit);
  appendQueryValue(params, 'offset', options.offset);
  appendQueryValue(params, 'search', options.search?.trim());
  appendQueryValue(params, 'severity', options.severity);

  return appendQuery(baseUrl, params);
}

export const repositoryService = {
  getConnectUrl(
    accessToken: string,
    provider: OAuthRepositoryProvider,
  ): Promise<AuthorizationUrlResponse> {
    return requestJson<AuthorizationUrlResponse>(
      `${INTEGRATIONS_BASE_URL}/${providerPath(provider)}/connect`,
      {
        accessToken,
        method: 'GET',
      },
    );
  },

  getProviderStatus(
    accessToken: string,
    provider: OAuthRepositoryProvider,
  ): Promise<RepositoryProviderStatus> {
    return requestJson<RepositoryProviderStatus>(
      `${INTEGRATIONS_BASE_URL}/${providerPath(provider)}/status`,
      {
        accessToken,
        method: 'GET',
      },
    );
  },

  listConnections(accessToken: string): Promise<RepositoryConnection[]> {
    return requestJson<RepositoryConnection[]>(`${INTEGRATIONS_BASE_URL}/connections`, {
      accessToken,
      method: 'GET',
    });
  },

  listProviderRepositories(
    accessToken: string,
    provider: OAuthRepositoryProvider,
  ): Promise<ProviderRepository[]> {
    return requestJson<ProviderRepository[]>(
      `${INTEGRATIONS_BASE_URL}/${providerPath(provider)}/repositories`,
      {
        accessToken,
        method: 'GET',
      },
    );
  },

  disconnectProvider(
    accessToken: string,
    provider: OAuthRepositoryProvider,
  ): Promise<DisconnectProviderResponse> {
    return requestJson<DisconnectProviderResponse>(
      `${INTEGRATIONS_BASE_URL}/${providerPath(provider)}`,
      {
        accessToken,
        method: 'DELETE',
      },
    );
  },

  listRepositories(accessToken: string): Promise<RepositorySource[]> {
    return requestJson<RepositorySource[]>(REPOSITORIES_BASE_URL, {
      accessToken,
      method: 'GET',
    });
  },

  importRepository(
    accessToken: string,
    input: { connectionId: string; externalId: string },
  ): Promise<RepositoryMutationResponse> {
    return requestJson<RepositoryMutationResponse>(`${REPOSITORIES_BASE_URL}/import`, {
      accessToken,
      body: JSON.stringify(input),
      method: 'POST',
    });
  },

  uploadZip(accessToken: string, file: File): Promise<RepositoryMutationResponse> {
    const body = new FormData();
    body.set('file', file);

    return requestJson<RepositoryMutationResponse>(`${REPOSITORIES_BASE_URL}/upload-zip`, {
      accessToken,
      body,
      method: 'POST',
    });
  },

  createScan(accessToken: string, repositoryId: string): Promise<ScanMutationResponse> {
    return requestJson<ScanMutationResponse>(`${REPOSITORIES_BASE_URL}/${repositoryId}/scans`, {
      accessToken,
      method: 'POST',
    });
  },

  listScans(accessToken: string, repositoryId: string): Promise<RepositoryScan[]> {
    return requestJson<RepositoryScan[]>(`${REPOSITORIES_BASE_URL}/${repositoryId}/scans`, {
      accessToken,
      method: 'GET',
    });
  },

  getScan(accessToken: string, scanId: string): Promise<ScanMutationResponse> {
    return requestJson<ScanMutationResponse>(`${API_BASE_URL}/api/v1/scans/${scanId}`, {
      accessToken,
      method: 'GET',
    });
  },

  getScanStatus(accessToken: string, scanId: string): Promise<ScanStatusResponse> {
    return requestJson<ScanStatusResponse>(`${API_BASE_URL}/api/v1/scans/${scanId}/status`, {
      accessToken,
      method: 'GET',
    });
  },

  cancelScan(accessToken: string, scanId: string): Promise<ScanMutationResponse> {
    return requestJson<ScanMutationResponse>(`${API_BASE_URL}/api/v1/scans/${scanId}`, {
      accessToken,
      method: 'DELETE',
    });
  },

  listRepositoryApis(
    accessToken: string,
    repositoryId: string,
    options: ListRepositoryApisOptions = {},
  ): Promise<PaginatedResponse<DetectedApi>> {
    return requestJson<PaginatedResponse<DetectedApi>>(
      buildRepositoryApisUrl(repositoryId, options),
      {
        accessToken,
        method: 'GET',
      },
    );
  },

  getApi(accessToken: string, apiId: string): Promise<ApiDocumentationResponse> {
    return requestJson<ApiDocumentationResponse>(`${API_BASE_URL}/api/v1/apis/${apiId}`, {
      accessToken,
      method: 'GET',
    });
  },

  getRepositoryOpenApi(accessToken: string, repositoryId: string): Promise<unknown> {
    return requestJson<unknown>(`${REPOSITORIES_BASE_URL}/${repositoryId}/openapi.json`, {
      accessToken,
      method: 'GET',
    });
  },

  listApiHistory(accessToken: string, apiId: string): Promise<ApiSnapshot[]> {
    return requestJson<ApiSnapshot[]>(`${API_BASE_URL}/api/v1/apis/${apiId}/history`, {
      accessToken,
      method: 'GET',
    });
  },

  listApiChanges(
    accessToken: string,
    apiId: string,
    options: ListApiChangesOptions = {},
  ): Promise<PaginatedResponse<ApiChange>> {
    return requestJson<PaginatedResponse<ApiChange>>(
      buildApiChangesUrl(`${API_BASE_URL}/api/v1/apis/${apiId}/changes`, options),
      {
        accessToken,
        method: 'GET',
      },
    );
  },

  listRepositoryChanges(
    accessToken: string,
    repositoryId: string,
    options: ListApiChangesOptions = {},
  ): Promise<PaginatedResponse<ApiChange>> {
    return requestJson<PaginatedResponse<ApiChange>>(
      buildApiChangesUrl(`${REPOSITORIES_BASE_URL}/${repositoryId}/changes`, options),
      {
        accessToken,
        method: 'GET',
      },
    );
  },

  listScanChanges(
    accessToken: string,
    scanId: string,
    options: ListApiChangesOptions = {},
  ): Promise<PaginatedResponse<ApiChange>> {
    return requestJson<PaginatedResponse<ApiChange>>(
      buildApiChangesUrl(`${API_BASE_URL}/api/v1/scans/${scanId}/changes`, options),
      {
        accessToken,
        method: 'GET',
      },
    );
  },

  getDependencyGraph(accessToken: string, repositoryId: string): Promise<DependencyGraphResponse> {
    return requestJson<DependencyGraphResponse>(
      `${REPOSITORIES_BASE_URL}/${repositoryId}/dependencies`,
      {
        accessToken,
        method: 'GET',
      },
    );
  },
};
