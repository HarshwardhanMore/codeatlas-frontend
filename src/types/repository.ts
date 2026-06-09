export type RepositoryProvider = 'GITHUB' | 'BITBUCKET' | 'ZIP';
export type OAuthRepositoryProvider = Exclude<RepositoryProvider, 'ZIP'>;
export type RepositoryConnectionStatus = 'ACTIVE' | 'REVOKED';

export interface RepositoryConnection {
  id: string;
  provider: RepositoryProvider;
  providerUserId: string;
  username: string | null;
  displayName: string | null;
  scopes: string[];
  status: RepositoryConnectionStatus;
  expiresAt: string | null;
  lastValidatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RepositoryProviderStatus {
  provider: OAuthRepositoryProvider;
  connected: boolean;
  connection: RepositoryConnection | null;
}

export interface ProviderRepository {
  externalId: string;
  name: string;
  fullName: string;
  url: string;
  defaultBranch: string | null;
  visibility: string | null;
  language: string | null;
}

export interface RepositorySource {
  id: string;
  provider: RepositoryProvider;
  externalId: string;
  name: string;
  fullName: string;
  url: string;
  defaultBranch: string | null;
  visibility: string | null;
  language: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RepositoryMutationResponse {
  repository: RepositorySource;
}

export type ScanStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type ApiHttpMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
export type ApiFramework = 'EXPRESS' | 'NESTJS';
export type ApiChangeType = 'ADDED' | 'DEPRECATED' | 'MODIFIED' | 'REMOVED';
export type ApiChangeSeverity = 'HIGH' | 'INFO' | 'LOW' | 'MEDIUM';

export interface ScanProgressSnapshot {
  progress: number;
  stage: string;
  message: string;
  updatedAt: string;
}

export interface RepositoryScan {
  id: string;
  repositoryId: string;
  status: ScanStatus;
  progress: number;
  startedAt: string | null;
  finishedAt: string | null;
  errorMessage: string | null;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface ScanMutationResponse {
  scan: RepositoryScan;
}

export interface ScanStatusResponse {
  scan: RepositoryScan;
  progress: ScanProgressSnapshot;
}

export interface AuthorizationUrlResponse {
  authorizationUrl: string;
}

export interface DisconnectProviderResponse {
  provider: OAuthRepositoryProvider;
  disconnected: boolean;
}

export interface PaginationMetadata {
  hasNext: boolean;
  hasPrevious: boolean;
  limit: number;
  offset: number;
  total: number;
}

export interface PaginatedResponse<TItem> {
  items: TItem[];
  pagination: PaginationMetadata;
}

export interface ApiSchemaProperty {
  format?: string;
  items?: ApiSchemaProperty;
  properties?: Record<string, ApiSchemaProperty>;
  required?: string[];
  type: string;
}

export interface ApiParameterSchema {
  in: 'header' | 'path' | 'query';
  name: string;
  required: boolean;
  schema: ApiSchemaProperty;
}

export interface ApiRequestSchema {
  body: ApiSchemaProperty | null;
  parameters: ApiParameterSchema[];
}

export interface ApiResponseSchema {
  body: ApiSchemaProperty | null;
  confidence: 'HIGH' | 'LOW' | 'MEDIUM';
  statusCode: number;
  typeName: string | null;
}

export interface ApiAuthMetadata {
  authRequired: boolean;
  guards: string[];
  middleware: string[];
  roles: string[];
}

export interface DetectedApi {
  id: string;
  repositoryId: string;
  scanId: string;
  method: ApiHttpMethod;
  path: string;
  framework: ApiFramework;
  controllerName: string | null;
  handlerName: string | null;
  filePath: string;
  lineNumber: number;
  requestSchema: ApiRequestSchema | null;
  responseSchema: ApiResponseSchema | null;
  authMetadata: ApiAuthMetadata | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiDocumentation {
  markdown: string;
  openApiJson: unknown;
}

export interface ApiDocumentationResponse {
  api: DetectedApi;
  documentation: ApiDocumentation | null;
}

export interface ApiSnapshot {
  id: string;
  apiId: string;
  scanId: string;
  version: number;
  contractHash: string;
  schemaJson: unknown;
  createdAt: string;
}

export interface ApiChange {
  id: string;
  repositoryId: string;
  scanId: string;
  apiId: string;
  oldSnapshotId: string | null;
  newSnapshotId: string | null;
  changeType: ApiChangeType;
  severity: ApiChangeSeverity;
  description: string;
  metadata: unknown;
  createdAt: string;
  oldSnapshot: ApiSnapshot | null;
  newSnapshot: ApiSnapshot | null;
}

export type DependencyGraphNodeType = 'EXTERNAL' | 'FILE';

export interface DependencyGraphNode {
  id: string;
  label: string;
  language: string | null;
  path: string | null;
  type: DependencyGraphNodeType;
}

export interface DependencyGraphEdge {
  id: string;
  kind: string;
  source: string;
  specifier: string;
  target: string;
}

export interface DependencyGraphResponse {
  edges: DependencyGraphEdge[];
  nodes: DependencyGraphNode[];
  repositoryId: string;
  scanId: string | null;
}
