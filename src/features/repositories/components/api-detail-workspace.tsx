'use client';

import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { useAuth } from '@/features/auth/auth-provider';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { repositoryService, RepositoryApiError } from '@/services/repositories/repository-service';

import { ApiMethodBadge } from './api-method-badge';
import { SchemaViewer } from './schema-viewer';

import type { ApiDocumentationResponse } from '@/types/repository';
import type { ReactNode } from 'react';

function getApiErrorMessage(error: unknown): string {
  if (error instanceof RepositoryApiError) {
    return error.message;
  }

  return 'API details could not be loaded.';
}

export function ApiDetailWorkspace(): ReactNode {
  const searchParams = useSearchParams();
  const apiId = searchParams.get('id');
  const { accessToken, status } = useAuth();
  const [apiDetails, setApiDetails] = useState<ApiDocumentationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated' || !accessToken || !apiId) {
      return undefined;
    }

    const token = accessToken;
    const currentApiId = apiId;
    let isMounted = true;

    async function loadApi(): Promise<void> {
      try {
        const response = await repositoryService.getApi(token, currentApiId);

        if (!isMounted) {
          return;
        }

        setApiDetails(response);
        setError(null);
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

    void loadApi();

    return (): void => {
      isMounted = false;
    };
  }, [accessToken, apiId, status]);

  const api = apiDetails?.api ?? null;

  return (
    <ProtectedRoute>
      <div className="w-full">
        {isLoading ? <LoadingState label="Loading API details" /> : null}

        {error ? (
          <div className="mb-6">
            <ErrorState
              message={error}
              recovery="API details are available only for detected APIs owned by your repositories. Return to the API catalog and open an endpoint from the current scan."
              title="API details error"
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
                    {api.controllerName ?? 'Express route'} / {api.handlerName ?? 'inline'} /{' '}
                    {api.framework}
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {api.filePath}:{api.lineNumber}
                  </p>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-md border border-border bg-slate-50 px-4 py-3 text-sm text-muted">
                    <div className="flex items-center gap-2">
                      <ShieldCheck aria-hidden="true" className="size-4 text-accent" />
                      <span>
                        {api.authMetadata?.authRequired ? 'Auth required' : 'Auth not detected'}
                      </span>
                    </div>
                    {api.authMetadata?.roles.length ? (
                      <p className="mt-2 text-xs">Roles: {api.authMetadata.roles.join(', ')}</p>
                    ) : null}
                  </div>
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
                    href={`/apis/history?id=${api.id}`}
                  >
                    History
                  </Link>
                </div>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <SchemaViewer label="Request schema" value={api.requestSchema} />
              <SchemaViewer label="Response schema" value={api.responseSchema} />
            </div>

            <SchemaViewer label="OpenAPI" value={apiDetails?.documentation?.openApiJson ?? null} />

            <section className="rounded-lg border border-border bg-surface p-5 shadow-soft">
              <h2 className="text-sm font-semibold text-foreground">Documentation</h2>
              <pre className="mt-4 whitespace-pre-wrap rounded-md border border-border bg-slate-50 p-4 text-sm leading-7 text-foreground">
                {apiDetails?.documentation?.markdown ?? 'Documentation has not been generated.'}
              </pre>
            </section>
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
