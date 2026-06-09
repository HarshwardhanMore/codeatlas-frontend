'use client';

import { AlertTriangle, CheckCircle2, Clock, LoaderCircle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import type { RepositoryScan, ScanProgressSnapshot, ScanStatus } from '@/types/repository';
import type { ReactNode } from 'react';

export interface ScanStatusPanelProps {
  isCancelling: boolean;
  onCancel: () => void;
  progress: ScanProgressSnapshot | null;
  scan: RepositoryScan | null;
}

const statusLabels: Record<ScanStatus, string> = {
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  QUEUED: 'Queued',
  RUNNING: 'Running',
};

function isActiveStatus(status: ScanStatus): boolean {
  return status === 'QUEUED' || status === 'RUNNING';
}

interface StatusIconProps {
  status: ScanStatus;
}

function StatusIcon({ status }: StatusIconProps): ReactNode {
  const className = cn('size-5', status === 'RUNNING' ? 'animate-spin' : '');

  if (status === 'COMPLETED') {
    return <CheckCircle2 aria-hidden="true" className={className} />;
  }

  if (status === 'FAILED') {
    return <AlertTriangle aria-hidden="true" className={className} />;
  }

  if (status === 'CANCELLED') {
    return <XCircle aria-hidden="true" className={className} />;
  }

  if (status === 'RUNNING') {
    return <LoaderCircle aria-hidden="true" className={className} />;
  }

  return <Clock aria-hidden="true" className={className} />;
}

export function ScanStatusPanel({
  isCancelling,
  onCancel,
  progress,
  scan,
}: ScanStatusPanelProps): ReactNode {
  if (!scan) {
    return (
      <section className="rounded-lg border border-border bg-surface p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-foreground">Analysis status</h2>
        <p className="mt-2 text-sm text-muted">No analysis has been started for this repository.</p>
      </section>
    );
  }

  const percentage = progress?.progress ?? scan.progress;
  const stage = progress?.stage ?? scan.status;
  const message = progress?.message ?? statusLabels[scan.status];
  const progressWidth = Math.min(Math.max(percentage, 0), 100).toString();

  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div
            className={cn(
              'flex size-11 shrink-0 items-center justify-center rounded-md border',
              scan.status === 'FAILED'
                ? 'border-danger/30 bg-danger/5 text-danger'
                : 'border-border bg-slate-50 text-accent',
            )}
          >
            <StatusIcon status={scan.status} />
          </div>
          <div>
            <p className="text-sm font-semibold text-accent">Analysis status</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              {statusLabels[scan.status]}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">{message}</p>
          </div>
        </div>

        {isActiveStatus(scan.status) ? (
          <Button disabled={isCancelling} onClick={onCancel} variant="ghost">
            {isCancelling ? 'Cancelling' : 'Cancel'}
          </Button>
        ) : null}
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted">
          <span>{stage}</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>

      {scan.errorMessage ? (
        <p className="mt-4 text-sm leading-6 text-danger">{scan.errorMessage}</p>
      ) : null}
    </section>
  );
}
