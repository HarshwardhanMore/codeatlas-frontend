'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/auth-provider';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { repositoryService, RepositoryApiError } from '@/services/repositories/repository-service';

import { ScanHistoryList } from './scan-history-list';
import { ScanStatusPanel } from './scan-status-panel';

import type { RepositoryScan, RepositorySource, ScanProgressSnapshot } from '@/types/repository';
import type { ReactNode } from 'react';

const ACTIVE_SCAN_STATUSES = new Set(['QUEUED', 'RUNNING']);
const POLL_INTERVAL_MS = 3000;

function getRepositoryErrorMessage(error: unknown): string {
  if (error instanceof RepositoryApiError) {
    return error.message;
  }

  return 'Repository request failed.';
}

export function RepositoryDetailWorkspace(): ReactNode {
  const searchParams = useSearchParams();
  const repositoryId = searchParams.get('id');
  const { accessToken, status } = useAuth();
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [progress, setProgress] = useState<ScanProgressSnapshot | null>(null);
  const [repository, setRepository] = useState<RepositorySource | null>(null);
  const [scans, setScans] = useState<RepositoryScan[]>([]);

  const activeScan = useMemo(
    () => scans.find((scan) => scan.id === activeScanId) ?? scans[0] ?? null,
    [activeScanId, scans],
  );

  useEffect(() => {
    if (status !== 'authenticated' || !accessToken || !repositoryId) {
      return undefined;
    }

    const currentRepositoryId = repositoryId;
    const token = accessToken;
    let isMounted = true;

    async function loadRepository(): Promise<void> {
      try {
        const [repositories, nextScans] = await Promise.all([
          repositoryService.listRepositories(token),
          repositoryService.listScans(token, currentRepositoryId),
        ]);
        const nextRepository = repositories.find((item) => item.id === currentRepositoryId) ?? null;

        if (!isMounted) {
          return;
        }

        if (!nextRepository) {
          setError('Repository was not found.');
          setRepository(null);
        } else {
          setError(null);
          setRepository(nextRepository);
        }

        setScans(nextScans);
        setActiveScanId(
          nextScans.find((scan) => ACTIVE_SCAN_STATUSES.has(scan.status))?.id ??
            nextScans[0]?.id ??
            null,
        );
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

    void loadRepository();

    return (): void => {
      isMounted = false;
    };
  }, [accessToken, repositoryId, status]);

  useEffect(() => {
    if (
      !accessToken ||
      !activeScanId ||
      !activeScan ||
      !ACTIVE_SCAN_STATUSES.has(activeScan.status)
    ) {
      return undefined;
    }

    const currentScanId = activeScanId;
    const token = accessToken;
    let isMounted = true;

    async function refreshScanStatus(): Promise<void> {
      try {
        const response = await repositoryService.getScanStatus(token, currentScanId);

        if (!isMounted) {
          return;
        }

        setProgress(response.progress);
        setScans((currentScans) =>
          currentScans.map((scan) => (scan.id === response.scan.id ? response.scan : scan)),
        );
      } catch (requestError) {
        if (isMounted) {
          setError(getRepositoryErrorMessage(requestError));
        }
      }
    }

    const interval = window.setInterval(() => {
      void refreshScanStatus();
    }, POLL_INTERVAL_MS);
    void refreshScanStatus();

    return (): void => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [accessToken, activeScan, activeScanId]);

  async function handleStartScan(): Promise<void> {
    if (!accessToken || !repositoryId) {
      return;
    }

    setError(null);
    setIsStarting(true);

    try {
      const response = await repositoryService.createScan(accessToken, repositoryId);
      setActiveScanId(response.scan.id);
      setProgress(null);
      setScans((currentScans) => [response.scan, ...currentScans]);
    } catch (requestError) {
      setError(getRepositoryErrorMessage(requestError));
    } finally {
      setIsStarting(false);
    }
  }

  async function handleCancelScan(): Promise<void> {
    if (!accessToken || !activeScan) {
      return;
    }

    setError(null);
    setIsCancelling(true);

    try {
      const response = await repositoryService.cancelScan(accessToken, activeScan.id);
      setScans((currentScans) =>
        currentScans.map((scan) => (scan.id === response.scan.id ? response.scan : scan)),
      );
    } catch (requestError) {
      setError(getRepositoryErrorMessage(requestError));
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="w-full">
        {isLoading ? <LoadingState label="Loading repository" /> : null}

        {error ? (
          <div className="mb-6">
            <ErrorState
              action={
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
                  href="/repositories"
                >
                  Back to repositories
                </Link>
              }
              message={error}
              recovery="This usually means the repository is unavailable, your session expired, or the provider credentials cannot materialize the source. Reopen the repository list or reconnect the source."
              title="Repository error"
            />
          </div>
        ) : null}

        {!isLoading && repository ? (
          <div className="grid gap-6">
            <section className="rounded-lg border border-border bg-surface p-6 shadow-soft">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-accent">{repository.provider}</p>
                  <h1 className="mt-2 text-3xl font-semibold text-foreground">
                    {repository.fullName}
                  </h1>
                  <p className="mt-3 text-sm text-muted">
                    {[repository.visibility, repository.language, repository.defaultBranch]
                      .filter(Boolean)
                      .join(' / ')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
                    href={`/repositories/apis?id=${repository.id}`}
                  >
                    API catalog
                  </Link>
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
                    href={`/repositories/dependencies?id=${repository.id}`}
                  >
                    Dependencies
                  </Link>
                  <Button disabled={isStarting} onClick={() => void handleStartScan()}>
                    {isStarting ? 'Queueing' : 'Analyze'}
                  </Button>
                </div>
              </div>
            </section>

            <ScanStatusPanel
              isCancelling={isCancelling}
              onCancel={() => {
                void handleCancelScan();
              }}
              progress={progress}
              scan={activeScan}
            />

            <ScanHistoryList scans={scans} />
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
