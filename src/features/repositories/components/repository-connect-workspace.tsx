'use client';

import { CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { useAuth } from '@/features/auth/auth-provider';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { repositoryService, RepositoryApiError } from '@/services/repositories/repository-service';

import { ProviderCard } from './provider-card';
import { ProviderRepositoryList } from './provider-repository-list';
import { ZipUploadCard } from './zip-upload-card';

import type {
  OAuthRepositoryProvider,
  ProviderRepository,
  RepositoryConnection,
} from '@/types/repository';
import type { ReactNode } from 'react';

interface ProviderDefinition {
  provider: OAuthRepositoryProvider;
  title: string;
  description: string;
}

const PROVIDERS: ProviderDefinition[] = [
  {
    description: 'Connect repository access for GitHub projects.',
    provider: 'GITHUB',
    title: 'GitHub',
  },
  {
    description: 'Connect repository access for Bitbucket projects.',
    provider: 'BITBUCKET',
    title: 'Bitbucket',
  },
];

const EMPTY_PROVIDER_REPOSITORIES: Record<OAuthRepositoryProvider, ProviderRepository[]> = {
  BITBUCKET: [],
  GITHUB: [],
};

function getRepositoryErrorMessage(error: unknown): string {
  if (error instanceof RepositoryApiError) {
    return error.message;
  }

  return 'Repository request failed.';
}

function getRepositoryRecoveryMessage(errorMessage: string): string {
  if (errorMessage.includes('GitHub OAuth is not configured')) {
    return 'Set GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and GITHUB_CALLBACK_URL in the backend environment, restart the API, then start GitHub connection again. ZIP upload remains available without OAuth credentials.';
  }

  if (errorMessage.includes('Bitbucket OAuth is not configured')) {
    return 'Set BITBUCKET_CLIENT_ID, BITBUCKET_CLIENT_SECRET, and BITBUCKET_CALLBACK_URL in the backend environment, restart the API, then start Bitbucket connection again. ZIP upload remains available without OAuth credentials.';
  }

  return 'Provider requests require a valid session and provider credentials. Retry the action, reconnect the provider if credentials expired, or upload a ZIP instead.';
}

export function RepositoryConnectWorkspace(): ReactNode {
  const searchParams = useSearchParams();
  const { accessToken, status } = useAuth();
  const [actionError, setActionError] = useState<string | null>(null);
  const [connections, setConnections] = useState<RepositoryConnection[]>([]);
  const [importingExternalId, setImportingExternalId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProvider, setLoadingProvider] = useState<OAuthRepositoryProvider | null>(null);
  const [providerRepositories, setProviderRepositories] = useState(EMPTY_PROVIDER_REPOSITORIES);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadingZip, setUploadingZip] = useState(false);

  const callbackStatus = searchParams.get('status');
  const callbackProvider = searchParams.get('provider');
  const callbackError = searchParams.get('reason');

  const callbackMessage = useMemo((): string | null => {
    if (callbackStatus === 'connected' && callbackProvider) {
      return `${callbackProvider.toUpperCase()} connected.`;
    }

    if (callbackStatus === 'error') {
      return callbackError ?? 'Repository provider connection failed.';
    }

    return null;
  }, [callbackError, callbackProvider, callbackStatus]);

  const loadConnections = useCallback(async (): Promise<void> => {
    if (!accessToken) {
      return;
    }

    setActionError(null);
    setIsLoading(true);

    try {
      setConnections(await repositoryService.listConnections(accessToken));
    } catch (requestError) {
      setActionError(getRepositoryErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status !== 'authenticated' || !accessToken) {
      return undefined;
    }

    const token = accessToken;
    let isMounted = true;

    async function loadInitialConnections(): Promise<void> {
      try {
        const nextConnections = await repositoryService.listConnections(token);

        if (!isMounted) {
          return;
        }

        setActionError(null);
        setConnections(nextConnections);
      } catch (requestError) {
        if (isMounted) {
          setActionError(getRepositoryErrorMessage(requestError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialConnections();

    return (): void => {
      isMounted = false;
    };
  }, [accessToken, status]);

  async function handleConnect(provider: OAuthRepositoryProvider): Promise<void> {
    if (!accessToken) {
      return;
    }

    setActionError(null);
    setLoadingProvider(provider);

    try {
      const result = await repositoryService.getConnectUrl(accessToken, provider);
      window.location.assign(result.authorizationUrl);
    } catch (requestError) {
      setActionError(getRepositoryErrorMessage(requestError));
      setLoadingProvider(null);
    }
  }

  async function handleDisconnect(provider: OAuthRepositoryProvider): Promise<void> {
    if (!accessToken) {
      return;
    }

    setActionError(null);
    setLoadingProvider(provider);

    try {
      await repositoryService.disconnectProvider(accessToken, provider);
      setProviderRepositories((currentRepositories) => ({
        ...currentRepositories,
        [provider]: [],
      }));
      await loadConnections();
    } catch (requestError) {
      setActionError(getRepositoryErrorMessage(requestError));
    } finally {
      setLoadingProvider(null);
    }
  }

  async function handleLoadRepositories(provider: OAuthRepositoryProvider): Promise<void> {
    if (!accessToken) {
      return;
    }

    setActionError(null);
    setLoadingProvider(provider);

    try {
      const repositories = await repositoryService.listProviderRepositories(accessToken, provider);
      setProviderRepositories((currentRepositories) => ({
        ...currentRepositories,
        [provider]: repositories,
      }));
    } catch (requestError) {
      setActionError(getRepositoryErrorMessage(requestError));
    } finally {
      setLoadingProvider(null);
    }
  }

  async function handleImportRepository(
    connection: RepositoryConnection,
    repository: ProviderRepository,
  ): Promise<void> {
    if (!accessToken) {
      return;
    }

    setActionError(null);
    setImportingExternalId(repository.externalId);

    try {
      await repositoryService.importRepository(accessToken, {
        connectionId: connection.id,
        externalId: repository.externalId,
      });
      setSuccessMessage(`${repository.fullName} added.`);
    } catch (requestError) {
      setActionError(getRepositoryErrorMessage(requestError));
    } finally {
      setImportingExternalId(null);
    }
  }

  async function handleZipUpload(file: File): Promise<void> {
    if (!accessToken) {
      return;
    }

    setActionError(null);
    setUploadingZip(true);

    try {
      const result = await repositoryService.uploadZip(accessToken, file);
      setSuccessMessage(`${result.repository.fullName} uploaded.`);
      await loadConnections();
    } catch (requestError) {
      setActionError(getRepositoryErrorMessage(requestError));
    } finally {
      setUploadingZip(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="w-full">
        <div className="mb-8">
          <p className="text-sm font-semibold text-accent">Repository intake</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Connect code sources</h1>
        </div>

        {callbackStatus === 'connected' && callbackMessage ? (
          <div className="mb-6 flex items-center gap-3 rounded-md border border-success/30 bg-success/5 p-4 text-success">
            <CheckCircle2 aria-hidden="true" className="size-5" />
            <p className="text-sm font-medium">{callbackMessage}</p>
          </div>
        ) : null}

        {callbackStatus === 'error' && callbackMessage ? (
          <div className="mb-6">
            <ErrorState
              message={callbackMessage}
              recovery="The provider did not complete authorization. Check that the OAuth app callback URL and scopes are configured, then start the connection again."
              title="Connection failed"
            />
          </div>
        ) : null}

        {actionError ? (
          <div className="mb-6">
            <ErrorState
              message={actionError}
              recovery={getRepositoryRecoveryMessage(actionError)}
              title="Repository error"
            />
          </div>
        ) : null}

        {successMessage ? (
          <div className="mb-6 rounded-md border border-success/30 bg-success/5 p-4 text-sm font-medium text-success">
            {successMessage}
          </div>
        ) : null}

        {isLoading ? <LoadingState label="Loading connections" /> : null}

        {!isLoading ? (
          <div className="grid gap-6">
            {PROVIDERS.map((definition) => {
              const connection =
                connections.find(
                  (item) => item.provider === definition.provider && item.status === 'ACTIVE',
                ) ?? null;

              return (
                <ProviderCard
                  connection={connection}
                  description={definition.description}
                  isBusy={loadingProvider === definition.provider}
                  key={definition.provider}
                  onConnect={() => {
                    void handleConnect(definition.provider);
                  }}
                  onDisconnect={() => {
                    void handleDisconnect(definition.provider);
                  }}
                  onLoadRepositories={() => {
                    void handleLoadRepositories(definition.provider);
                  }}
                  provider={definition.provider}
                  title={definition.title}
                >
                  {connection ? (
                    <ProviderRepositoryList
                      importingExternalId={importingExternalId}
                      onImport={(repository) => {
                        void handleImportRepository(connection, repository);
                      }}
                      repositories={providerRepositories[definition.provider]}
                    />
                  ) : null}
                </ProviderCard>
              );
            })}

            <ZipUploadCard
              isUploading={uploadingZip}
              onUpload={(file) => {
                void handleZipUpload(file);
              }}
            />
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
