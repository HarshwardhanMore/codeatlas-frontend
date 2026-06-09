import type { RepositoryScan } from '@/types/repository';
import type { ReactNode } from 'react';

export interface ScanHistoryListProps {
  scans: RepositoryScan[];
}

export function ScanHistoryList({ scans }: ScanHistoryListProps): ReactNode {
  if (scans.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-surface p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-foreground">Scan history</h2>
        <p className="mt-2 text-sm text-muted">
          No scans have been recorded yet. Use Analyze on this repository to queue the first scan;
          the worker will update progress and store API intelligence when it completes.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-soft">
      <h2 className="text-lg font-semibold text-foreground">Scan history</h2>
      <div className="mt-5 divide-y divide-border overflow-hidden rounded-md border border-border">
        {scans.map((scan) => (
          <div className="grid gap-3 bg-white p-4 md:grid-cols-[1fr_auto]" key={scan.id}>
            <div>
              <p className="text-sm font-semibold text-foreground">{scan.status}</p>
              <p className="mt-1 text-xs text-muted">Started {scan.startedAt ?? scan.createdAt}</p>
            </div>
            <p className="text-sm font-medium text-muted">{scan.progress}%</p>
          </div>
        ))}
      </div>
    </section>
  );
}
