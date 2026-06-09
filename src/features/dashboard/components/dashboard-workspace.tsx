'use client';

import { Activity, AlertTriangle, Boxes, GitBranch, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/auth-provider';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { dashboardService, DashboardApiError } from '@/services/dashboard/dashboard-service';

import type {
  DashboardActivity,
  DashboardBreakdownItem,
  DashboardOverview,
} from '@/types/dashboard';
import type {
  ApiChangeSeverity,
  ApiFramework,
  RepositoryProvider,
  ScanStatus,
} from '@/types/repository';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface MetricCardProps {
  description: string;
  icon: LucideIcon;
  label: string;
  value: number;
}

interface BreakdownListProps<TKey extends string> {
  items: DashboardBreakdownItem<TKey>[];
}

const severityClasses: Record<ApiChangeSeverity, string> = {
  HIGH: 'text-danger',
  INFO: 'text-muted',
  LOW: 'text-success',
  MEDIUM: 'text-warning',
};

function getDashboardErrorMessage(error: unknown): string {
  if (error instanceof DashboardApiError) {
    return error.message;
  }

  return 'Dashboard could not be loaded.';
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getActivityHref(activity: DashboardActivity): string | null {
  if (activity.apiId) {
    return `/apis/detail?id=${activity.apiId}`;
  }

  if (activity.repositoryId) {
    return `/repositories/detail?id=${activity.repositoryId}`;
  }

  return null;
}

function MetricCard({ description, icon: Icon, label, value }: MetricCardProps): ReactNode {
  return (
    <article className="rounded-lg border border-border bg-surface p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{value.toString()}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-md border border-border bg-slate-50 text-accent">
          <Icon aria-hidden="true" className="size-5" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">{description}</p>
    </article>
  );
}

function BreakdownList<TKey extends string>({ items }: BreakdownListProps<TKey>): ReactNode {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div className="flex items-center justify-between gap-4 text-sm" key={item.key}>
          <span className="font-medium text-foreground">{item.key}</span>
          <span className="text-muted">{item.count.toString()}</span>
        </div>
      ))}
    </div>
  );
}

function ActivityList({ activity }: { activity: DashboardActivity[] }): ReactNode {
  if (activity.length === 0) {
    return (
      <EmptyState
        description="Recent activity appears after repositories are added, scans run, APIs are discovered, or API contracts change."
        title="No recent activity"
      />
    );
  }

  return (
    <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
      {activity.map((item) => {
        const href = getActivityHref(item);
        const content = (
          <div className="grid gap-2 bg-white p-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{item.description}</p>
              <p className="mt-1 text-xs text-muted">{formatDate(item.occurredAt)}</p>
            </div>
            {item.severity ? (
              <span className={`text-sm font-semibold ${severityClasses[item.severity]}`}>
                {item.severity}
              </span>
            ) : null}
            {item.status ? (
              <span className="text-sm font-semibold text-muted">{item.status}</span>
            ) : null}
          </div>
        );

        return href ? (
          <Link
            className="block hover:bg-slate-50"
            href={href}
            key={`${item.type}-${item.occurredAt}`}
          >
            {content}
          </Link>
        ) : (
          <div key={`${item.type}-${item.occurredAt}`}>{content}</div>
        );
      })}
    </div>
  );
}

export function DashboardWorkspace(): ReactNode {
  const { accessToken, status } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' || !accessToken) {
      return undefined;
    }

    const token = accessToken;
    let isMounted = true;

    async function loadDashboard(): Promise<void> {
      setIsLoading(true);

      try {
        const nextOverview = await dashboardService.getOverview(token);

        if (!isMounted) {
          return;
        }

        setError(null);
        setOverview(nextOverview);
      } catch (requestError) {
        if (isMounted) {
          setError(getDashboardErrorMessage(requestError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return (): void => {
      isMounted = false;
    };
  }, [accessToken, status]);

  const hasNoProductData =
    overview !== null &&
    overview.repositoryOverview.totalRepositories === 0 &&
    overview.scanSummary.totalScans === 0 &&
    overview.apiIntelligence.totalApis === 0 &&
    overview.riskOverview.totalChanges === 0;

  return (
    <ProtectedRoute>
      <div className="w-full">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">
              Engineering intelligence overview
            </h1>
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
            recovery="Dashboard metrics are calculated from protected repository, scan, API, and change records. Refresh the page, verify the backend is reachable, or sign in again if the session expired."
            title="Dashboard error"
          />
        ) : null}

        {isLoading ? <LoadingState label="Loading dashboard" /> : null}

        {!isLoading && !error && hasNoProductData ? (
          <EmptyState
            action={
              <Button
                onClick={() => {
                  window.location.assign('/repositories/connect');
                }}
              >
                Add first repository
              </Button>
            }
            description="Connect GitHub, Bitbucket, or upload a ZIP project. After analysis runs, this dashboard will show repository coverage, scan health, API inventory, risk, and recent activity."
            title="No engineering intelligence yet"
          />
        ) : null}

        {!isLoading && !error && overview && !hasNoProductData ? (
          <div className="grid gap-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                description="Selected code sources owned by this account."
                icon={GitBranch}
                label="Repositories"
                value={overview.repositoryOverview.totalRepositories}
              />
              <MetricCard
                description="Queued, running, completed, failed, and cancelled analyses."
                icon={Activity}
                label="Scans"
                value={overview.scanSummary.totalScans}
              />
              <MetricCard
                description="Discovered NestJS and Express endpoints from completed scans."
                icon={Boxes}
                label="APIs"
                value={overview.apiIntelligence.totalApis}
              />
              <MetricCard
                description="High-severity API contract changes from version comparisons."
                icon={ShieldAlert}
                label="Breaking changes"
                value={overview.riskOverview.breakingChanges}
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <article className="rounded-lg border border-border bg-surface p-5 shadow-soft">
                <h2 className="text-lg font-semibold text-foreground">Repository sources</h2>
                <div className="mt-5">
                  <BreakdownList<RepositoryProvider>
                    items={overview.repositoryOverview.providers}
                  />
                </div>
              </article>
              <article className="rounded-lg border border-border bg-surface p-5 shadow-soft">
                <h2 className="text-lg font-semibold text-foreground">Scan status</h2>
                <p className="mt-2 text-sm text-muted">
                  {overview.scanSummary.activeScans.toString()} active /{' '}
                  {overview.scanSummary.failedScans.toString()} failed
                </p>
                <div className="mt-5">
                  <BreakdownList<ScanStatus> items={overview.scanSummary.statuses} />
                </div>
              </article>
              <article className="rounded-lg border border-border bg-surface p-5 shadow-soft">
                <h2 className="text-lg font-semibold text-foreground">API intelligence</h2>
                <div className="mt-5">
                  <BreakdownList<ApiFramework> items={overview.apiIntelligence.frameworks} />
                </div>
              </article>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1fr_2fr]">
              <article className="rounded-lg border border-border bg-surface p-5 shadow-soft">
                <div className="flex items-center gap-2">
                  <AlertTriangle aria-hidden="true" className="text-warning size-5" />
                  <h2 className="text-lg font-semibold text-foreground">Risk overview</h2>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {overview.riskOverview.totalChanges.toString()} total contract changes
                </p>
                <div className="mt-5">
                  <BreakdownList<ApiChangeSeverity> items={overview.riskOverview.severities} />
                </div>
              </article>
              <article className="rounded-lg border border-border bg-surface p-5 shadow-soft">
                <h2 className="text-lg font-semibold text-foreground">Recent activity</h2>
                <div className="mt-5">
                  <ActivityList activity={overview.recentActivity} />
                </div>
              </article>
            </section>
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
