'use client';

import { KeyRound, Link2, ShieldCheck, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/auth-provider';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { repositoryService, RepositoryApiError } from '@/services/repositories/repository-service';

import type { RepositoryConnection, RepositorySource } from '@/types/repository';
import type { ReactNode } from 'react';

function getSettingsErrorMessage(error: unknown): string {
  if (error instanceof RepositoryApiError) {
    return error.message;
  }

  return 'Settings data could not be loaded.';
}

function formatDate(value: string | null): string {
  if (!value) {
    return 'Not recorded';
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function SettingsWorkspace(): ReactNode {
  const auth = useAuth();
  const [connections, setConnections] = useState<RepositoryConnection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [repositories, setRepositories] = useState<RepositorySource[]>([]);

  useEffect(() => {
    if (auth.status !== 'authenticated' || !auth.accessToken) {
      return undefined;
    }

    const token = auth.accessToken;
    let isMounted = true;

    async function loadInitialSettings(): Promise<void> {
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
          setError(getSettingsErrorMessage(requestError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialSettings();

    return (): void => {
      isMounted = false;
    };
  }, [auth.accessToken, auth.status]);

  async function reloadSettings(): Promise<void> {
    if (!auth.accessToken) {
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const [nextConnections, nextRepositories] = await Promise.all([
        repositoryService.listConnections(auth.accessToken),
        repositoryService.listRepositories(auth.accessToken),
      ]);

      setConnections(nextConnections);
      setRepositories(nextRepositories);
    } catch (requestError) {
      setError(getSettingsErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout(): Promise<void> {
    setError(null);
    setIsLoggingOut(true);

    try {
      await auth.logout();
      window.location.assign('/login');
    } catch {
      setError('Logout could not be completed.');
      setIsLoggingOut(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="w-full">
        <div className="mb-8">
          <p className="text-sm font-semibold text-accent">Workspace settings</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            Profile, security, and sources
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            Review the current account, active session, provider connections, and repository
            management paths. Billing is intentionally not part of this workspace.
          </p>
        </div>

        {error ? (
          <div className="mb-6">
            <ErrorState
              action={
                <Button
                  onClick={() => {
                    void reloadSettings();
                  }}
                  variant="secondary"
                >
                  Retry settings load
                </Button>
              }
              message={error}
              recovery="The settings view uses the same protected repository APIs as the rest of the workspace. Retry the load or sign in again if your session expired."
              title="Settings error"
            />
          </div>
        ) : null}

        {isLoading ? <LoadingState label="Loading settings" /> : null}

        {!isLoading ? (
          <div className="grid gap-6">
            <section className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-lg border border-border bg-surface p-6 shadow-soft">
                <div className="flex items-center gap-3">
                  <UserRound aria-hidden="true" className="size-5 text-accent" />
                  <h2 className="text-lg font-semibold text-foreground">Profile</h2>
                </div>
                <dl className="mt-5 grid gap-4 text-sm">
                  <div>
                    <dt className="font-medium text-muted">Name</dt>
                    <dd className="mt-1 text-foreground">{auth.user?.name ?? 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted">Email</dt>
                    <dd className="mt-1 text-foreground">{auth.user?.email ?? 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted">Status</dt>
                    <dd className="mt-1 text-foreground">{auth.user?.status ?? 'Unknown'}</dd>
                  </div>
                </dl>
              </article>

              <article className="rounded-lg border border-border bg-surface p-6 shadow-soft">
                <div className="flex items-center gap-3">
                  <ShieldCheck aria-hidden="true" className="size-5 text-accent" />
                  <h2 className="text-lg font-semibold text-foreground">Security</h2>
                </div>
                <div className="mt-5 grid gap-4 text-sm">
                  <p className="text-muted">
                    The current session uses short-lived JWT access tokens and refresh rotation.
                    Repository provider credentials are encrypted server-side and are not shown
                    here.
                  </p>
                  <div>
                    <p className="font-medium text-muted">Roles</p>
                    <p className="mt-1 text-foreground">
                      {auth.user?.roles.length ? auth.user.roles.join(', ') : 'No roles assigned'}
                    </p>
                  </div>
                  <Button
                    disabled={isLoggingOut}
                    onClick={() => {
                      void handleLogout();
                    }}
                    variant="secondary"
                  >
                    <KeyRound aria-hidden="true" className="mr-2 size-4" />
                    {isLoggingOut ? 'Signing out' : 'Sign out'}
                  </Button>
                </div>
              </article>
            </section>

            <section className="rounded-lg border border-border bg-surface p-6 shadow-soft">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <Link2 aria-hidden="true" className="size-5 text-accent" />
                    <h2 className="text-lg font-semibold text-foreground">Connected providers</h2>
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    GitHub and Bitbucket are repository providers only. They are not login
                    providers.
                  </p>
                </div>
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
                  href="/repositories/connect"
                >
                  Manage providers
                </Link>
              </div>

              {connections.length > 0 ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {connections.map((connection) => (
                    <article
                      className="rounded-md border border-border bg-white p-4"
                      key={connection.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {connection.provider}
                          </p>
                          <p className="mt-1 text-sm text-muted">
                            {connection.username ??
                              connection.displayName ??
                              connection.providerUserId}
                          </p>
                        </div>
                        <span className="rounded-md bg-slate-50 px-2 py-1 text-xs font-semibold text-success">
                          {connection.status}
                        </span>
                      </div>
                      <p className="mt-4 text-xs text-muted">
                        Last validated {formatDate(connection.lastValidatedAt)}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5">
                  <EmptyState
                    action={
                      <Link
                        className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90"
                        href="/repositories/connect"
                      >
                        Connect provider
                      </Link>
                    }
                    description="No GitHub or Bitbucket provider is connected. Connect a provider when you want to import hosted repositories, or use ZIP upload from the same intake page."
                    title="No connected providers"
                  />
                </div>
              )}
            </section>

            <section className="rounded-lg border border-border bg-surface p-6 shadow-soft">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Repository management</h2>
                  <p className="mt-2 text-sm text-muted">
                    {repositories.length.toString()} repository sources are available for scanning,
                    API catalog review, change history, and AI assistant context.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
                    href="/repositories"
                  >
                    View repositories
                  </Link>
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90"
                    href="/repositories/connect"
                  >
                    Add repository
                  </Link>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
