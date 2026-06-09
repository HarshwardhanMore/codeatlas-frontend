'use client';

import { Download, Search } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/auth-provider';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { repositoryService, RepositoryApiError } from '@/services/repositories/repository-service';

import { ApiMethodBadge } from './api-method-badge';
import { SchemaViewer } from './schema-viewer';

import type {
  ApiHttpMethod,
  DetectedApi,
  PaginationMetadata,
  RepositorySource,
} from '@/types/repository';
import type { ReactNode } from 'react';

const PAGE_LIMIT = 25;
const methodFilters: (ApiHttpMethod | 'ALL')[] = ['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

function getRepositoryErrorMessage(error: unknown): string {
  if (error instanceof RepositoryApiError) {
    return error.message;
  }

  return 'API catalog request failed.';
}

export function ApiCatalogWorkspace(): ReactNode {
  const searchParams = useSearchParams();
  const repositoryId = searchParams.get('id');
  const { accessToken, status } = useAuth();
  const [apis, setApis] = useState<DetectedApi[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOpenApi, setIsLoadingOpenApi] = useState(false);
  const [methodFilter, setMethodFilter] = useState<ApiHttpMethod | 'ALL'>('ALL');
  const [offset, setOffset] = useState(0);
  const [openApiJson, setOpenApiJson] = useState<unknown>(null);
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null);
  const [repository, setRepository] = useState<RepositorySource | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status !== 'authenticated' || !accessToken || !repositoryId) {
      return undefined;
    }

    const token = accessToken;
    const currentRepositoryId = repositoryId;
    let isMounted = true;

    async function loadCatalog(): Promise<void> {
      setIsLoading(true);

      try {
        const [repositories, nextApis] = await Promise.all([
          repositoryService.listRepositories(token),
          repositoryService.listRepositoryApis(token, currentRepositoryId, {
            limit: PAGE_LIMIT,
            method: methodFilter === 'ALL' ? undefined : methodFilter,
            offset,
            search: searchQuery,
          }),
        ]);

        if (!isMounted) {
          return;
        }

        setApis(nextApis.items);
        setError(null);
        setPagination(nextApis.pagination);
        setRepository(repositories.find((item) => item.id === currentRepositoryId) ?? null);
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

    void loadCatalog();

    return (): void => {
      isMounted = false;
    };
  }, [accessToken, methodFilter, offset, repositoryId, searchQuery, status]);

  async function handleLoadOpenApi(): Promise<void> {
    if (!accessToken || !repositoryId) {
      return;
    }

    setIsLoadingOpenApi(true);
    setError(null);

    try {
      setOpenApiJson(await repositoryService.getRepositoryOpenApi(accessToken, repositoryId));
    } catch (requestError) {
      setError(getRepositoryErrorMessage(requestError));
    } finally {
      setIsLoadingOpenApi(false);
    }
  }

  function handleMethodFilterChange(method: ApiHttpMethod | 'ALL'): void {
    setMethodFilter(method);
    setOffset(0);
  }

  function handleSearchSubmit(): void {
    setSearchQuery(searchInput.trim());
    setOffset(0);
  }

  const totalApis = pagination?.total ?? apis.length;
  const hasActiveFilters = methodFilter !== 'ALL' || searchQuery.length > 0;

  return (
    <ProtectedRoute>
      <div className="w-full">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">API catalog</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">
              {repository?.fullName ?? 'Repository APIs'}
            </h1>
          </div>
          <Button
            disabled={isLoadingOpenApi || totalApis === 0}
            onClick={() => {
              void handleLoadOpenApi();
            }}
            variant="secondary"
          >
            <Download aria-hidden="true" className="mr-2 size-4" />
            {isLoadingOpenApi ? 'Loading OpenAPI' : 'OpenAPI'}
          </Button>
        </div>

        {error ? (
          <div className="mb-6">
            <ErrorState
              action={
                repositoryId ? (
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
                    href={`/repositories/detail?id=${repositoryId}`}
                  >
                    Open repository
                  </Link>
                ) : null
              }
              message={error}
              recovery="The catalog is generated by completed repository scans. Open the repository to verify scan status, then run or retry analysis if needed."
              title="API catalog error"
            />
          </div>
        ) : null}

        {isLoading ? <LoadingState label="Loading API catalog" /> : null}

        {!isLoading && !error && totalApis === 0 && !hasActiveFilters ? (
          <EmptyState
            action={
              repositoryId ? (
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90"
                  href={`/repositories/detail?id=${repositoryId}`}
                >
                  Analyze repository
                </Link>
              ) : null
            }
            description="Run repository analysis first. If a scan completes and this state remains, the scanner did not detect supported NestJS or Express routes in the source."
            title="No APIs detected"
          />
        ) : null}

        {!isLoading && !error && (totalApis > 0 || hasActiveFilters) ? (
          <div className="grid gap-6">
            <section className="rounded-lg border border-border bg-surface p-5 shadow-soft">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <form
                  className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSearchSubmit();
                  }}
                >
                  <Input
                    label="Search APIs"
                    name="api-search"
                    onChange={(event) => {
                      setSearchInput(event.target.value);
                    }}
                    placeholder="Path, controller, handler, or file"
                    value={searchInput}
                  />
                  <Button className="sm:mt-7" type="submit" variant="secondary">
                    <Search aria-hidden="true" className="mr-2 size-4" />
                    Search
                  </Button>
                </form>
                <div className="flex flex-wrap gap-2">
                  {methodFilters.map((method) => (
                    <button
                      className={
                        methodFilter === method
                          ? 'h-8 rounded-md bg-accent px-3 text-xs font-semibold text-white'
                          : 'h-8 rounded-md border border-border bg-surface px-3 text-xs font-semibold text-muted hover:bg-slate-50'
                      }
                      key={method}
                      onClick={() => {
                        handleMethodFilterChange(method);
                      }}
                      type="button"
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between text-sm text-muted">
                <span>{totalApis.toString()} endpoints</span>
                {pagination ? (
                  <span>
                    Showing {(pagination.offset + 1).toString()}-
                    {Math.min(pagination.offset + apis.length, pagination.total).toString()}
                  </span>
                ) : null}
              </div>

              {apis.length === 0 ? (
                <div className="mt-5">
                  <EmptyState
                    description="No detected APIs match the current search and method filters. Adjust the filters or open the repository to run a fresh scan."
                    title="No matching APIs"
                  />
                </div>
              ) : (
                <div className="mt-5 overflow-hidden rounded-md border border-border">
                  <div className="grid grid-cols-[6rem_1fr_8rem_12rem] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-normal text-muted">
                    <span>Method</span>
                    <span>Path</span>
                    <span>Framework</span>
                    <span>Details</span>
                  </div>
                  <div className="divide-y divide-border">
                    {apis.map((api) => (
                      <div
                        className="grid grid-cols-[6rem_1fr_8rem_12rem] items-center gap-3 px-4 py-4"
                        key={api.id}
                      >
                        <ApiMethodBadge method={api.method} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {api.path}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted">
                            {api.controllerName ?? 'Express route'} / {api.handlerName ?? 'inline'}
                          </p>
                        </div>
                        <span className="text-sm text-muted">{api.framework}</span>
                        <div className="flex gap-2">
                          <Link
                            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground hover:bg-slate-50"
                            href={`/apis/detail?id=${api.id}`}
                          >
                            Open
                          </Link>
                          <Link
                            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground hover:bg-slate-50"
                            href={`/apis/history?id=${api.id}`}
                          >
                            History
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pagination ? (
                <div className="mt-5 flex justify-end gap-3">
                  <Button
                    disabled={!pagination.hasPrevious}
                    onClick={() => {
                      setOffset(Math.max(0, offset - PAGE_LIMIT));
                    }}
                    variant="secondary"
                  >
                    Previous
                  </Button>
                  <Button
                    disabled={!pagination.hasNext}
                    onClick={() => {
                      setOffset(offset + PAGE_LIMIT);
                    }}
                    variant="secondary"
                  >
                    Next
                  </Button>
                </div>
              ) : null}
            </section>

            {openApiJson ? <SchemaViewer label="OpenAPI" value={openApiJson} /> : null}
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
