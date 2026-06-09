'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { useAuth } from '@/features/auth/auth-provider';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { repositoryService, RepositoryApiError } from '@/services/repositories/repository-service';

import { ApiChangeTimeline } from './api-change-timeline';
import { ApiMethodBadge } from './api-method-badge';
import { ApiRiskBadge } from './api-risk-badge';
import { SchemaViewer } from './schema-viewer';

import type { ApiChange, ApiDocumentationResponse, ApiSnapshot } from '@/types/repository';
import type { ReactNode } from 'react';

function getApiErrorMessage(error: unknown): string {
  if (error instanceof RepositoryApiError) {
    return error.message;
  }

  return 'API history could not be loaded.';
}

export function ApiHistoryWorkspace(): ReactNode {
  const searchParams = useSearchParams();
  const apiId = searchParams.get('id');
  const { accessToken, status } = useAuth();
  const [apiDetails, setApiDetails] = useState<ApiDocumentationResponse | null>(null);
  const [changes, setChanges] = useState<ApiChange[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ApiSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated' || !accessToken || !apiId) {
      return undefined;
    }

    const token = accessToken;
    const currentApiId = apiId;
    let isMounted = true;

    async function loadHistory(): Promise<void> {
      try {
        const [apiResponse, nextHistory, nextChanges] = await Promise.all([
          repositoryService.getApi(token, currentApiId),
          repositoryService.listApiHistory(token, currentApiId),
          repositoryService.listApiChanges(token, currentApiId),
        ]);

        if (!isMounted) {
          return;
        }

        setApiDetails(apiResponse);
        setChanges(nextChanges.items);
        setError(null);
        setHistory(nextHistory);
      } catch (requestError) {
        if (isMounted) {
          setError(getApiErrorMessage(requestError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadHistory();

    return (): void => {
      isMounted = false;
    };
  }, [accessToken, apiId, status]);

  const latestChange = useMemo(() => changes[0] ?? null, [changes]);
  const api = apiDetails?.api ?? null;

  return (
    <ProtectedRoute>
      <div className="w-full">
        {isLoading ? <LoadingState label="Loading API history" /> : null}

        {error ? (
          <div className="mb-6">
            <ErrorState
              message={error}
              recovery="API history requires snapshots from completed scans. Return to the API catalog or run another repository analysis if the endpoint was removed."
              title="API history error"
            />
          </div>
        ) : null}

        {!isLoading && api ? (
          <div className="grid gap-6">
            <section className="rounded-lg border border-border bg-surface p-6 shadow-soft">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <ApiMethodBadge method={api.method} />
                  <h1 className="mt-4 text-3xl font-semibold text-foreground">{api.path}</h1>
                  <p className="mt-3 text-sm text-muted">
                    {history.length.toString()} versions / {changes.length.toString()} changes
                  </p>
                </div>
                {latestChange ? <ApiRiskBadge severity={latestChange.severity} /> : null}
              </div>
            </section>

            <ApiChangeTimeline changes={changes} />

            {latestChange ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <SchemaViewer label="Before" value={latestChange.oldSnapshot?.schemaJson ?? null} />
                <SchemaViewer label="After" value={latestChange.newSnapshot?.schemaJson ?? null} />
              </div>
            ) : (
              <EmptyState
                description="Snapshots exist, but no changes have been detected for this API yet. Run another scan after source changes to compare the next contract version."
                title="No version differences"
              />
            )}

            <section className="rounded-lg border border-border bg-surface p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-foreground">Versions</h2>
              <div className="mt-5 divide-y divide-border overflow-hidden rounded-md border border-border">
                {history.map((snapshot) => (
                  <div
                    className="grid gap-3 bg-white p-4 md:grid-cols-[1fr_auto]"
                    key={snapshot.id}
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Version {snapshot.version.toString()}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Contract {snapshot.contractHash.slice(0, 12)}
                      </p>
                    </div>
                    <p className="text-sm text-muted">{snapshot.createdAt}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
