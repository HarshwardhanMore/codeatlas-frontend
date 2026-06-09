'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/auth-provider';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { repositoryService, RepositoryApiError } from '@/services/repositories/repository-service';

import { RepositorySourceList } from './repository-source-list';

import type { RepositoryConnection, RepositorySource } from '@/types/repository';
import type { ReactNode } from 'react';

function getRepositoryErrorMessage(error: unknown): string {
  if (error instanceof RepositoryApiError) {
    return error.message;
  }

  return 'Repository sources could not be loaded.';
}

export function RepositoriesWorkspace(): ReactNode {
  const { accessToken, status } = useAuth();
  const [connections, setConnections] = useState<RepositoryConnection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [repositories, setRepositories] = useState<RepositorySource[]>([]);

  useEffect(() => {
    if (status !== 'authenticated' || !accessToken) {
      return undefined;
    }

    const token = accessToken;
    let isMounted = true;

    async function loadWorkspace(): Promise<void> {
      try {
        const [nextConnections, nextRepositories] = await Promise.all([
          repositoryService.listConnections(token),
          repositoryService.listRepositories(token),
        ]);

        if (!isMounted) {
          return;
        }

        setConnections(nextConnections);
        setError(null);
        setRepositories(nextRepositories);
      } catch (requestError) {
        if (isMounted) {
          setError(getRepositoryErrorMessage(requestError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadWorkspace();

    return (): void => {
      isMounted = false;
    };
  }, [accessToken, status]);

  return (
    <ProtectedRoute>
      <div className="w-full">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">Repository sources</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Connected codebases</h1>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90"
            href="/repositories/connect"
          >
            Connect source
          </Link>
        </div>

        {error ? (
          <ErrorState
            message={error}
            recovery="Repository data comes from the protected backend API. Refresh this page, retry after the API is reachable, or sign in again if the session expired."
            title="Repository error"
          />
        ) : null}

        {isLoading ? <LoadingState label="Loading repository sources" /> : null}

        {!isLoading && !error ? (
          <div className="grid gap-6">
            <section className="grid gap-4 md:grid-cols-3">
              {connections.map((connection) => (
                <div
                  className="rounded-lg border border-border bg-surface p-5 shadow-soft"
                  key={connection.id}
                >
                  <p className="text-sm font-semibold text-foreground">{connection.provider}</p>
                  <p className="mt-2 truncate text-sm text-muted">
                    {connection.username ?? connection.displayName ?? connection.providerUserId}
                  </p>
                  <p className="mt-4 text-xs font-medium text-success">{connection.status}</p>
                </div>
              ))}
            </section>

            {repositories.length > 0 ? (
              <RepositorySourceList repositories={repositories} />
            ) : (
              <EmptyState
                action={
                  <Button
                    onClick={() => {
                      window.location.assign('/repositories/connect');
                    }}
                  >
                    Connect source
                  </Button>
                }
                description="Connect GitHub, Bitbucket, or upload a ZIP project. After a source is added, open it here to run analysis and generate API intelligence."
                title="No repository sources"
              />
            )}
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
