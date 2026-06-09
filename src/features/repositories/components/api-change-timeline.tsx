import { GitCompareArrows } from 'lucide-react';

import { ApiRiskBadge } from './api-risk-badge';

import type { ApiChange } from '@/types/repository';
import type { ReactNode } from 'react';

export interface ApiChangeTimelineProps {
  changes: ApiChange[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getRiskScore(change: ApiChange): string {
  if (!isRecord(change.metadata) || typeof change.metadata['riskScore'] !== 'number') {
    return 'n/a';
  }

  return change.metadata['riskScore'].toString();
}

function getChangedFieldSummary(change: ApiChange): string {
  if (!isRecord(change.metadata) || !isRecord(change.metadata['diff'])) {
    return change.changeType;
  }

  const diff = change.metadata['diff'];
  const fields: string[] = [];

  for (const section of ['request', 'response']) {
    const sectionDiff = diff[section];

    if (!isRecord(sectionDiff)) {
      continue;
    }

    for (const bucket of ['added', 'removed', 'typeChanged']) {
      const value = sectionDiff[bucket];

      if (Array.isArray(value) && value.length > 0) {
        fields.push(`${section}.${bucket}:${value.length.toString()}`);
      }
    }
  }

  if (isRecord(diff['auth']) && diff['auth']['authRequiredChanged'] === true) {
    fields.push('auth.required');
  }

  if (diff['methodChanged'] === true) {
    fields.push('method');
  }

  return fields.length > 0 ? fields.join(' / ') : change.changeType;
}

export function ApiChangeTimeline({ changes }: ApiChangeTimelineProps): ReactNode {
  if (changes.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-surface p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-foreground">Change timeline</h2>
        <p className="mt-2 text-sm text-muted">No API changes have been recorded yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-soft">
      <h2 className="text-lg font-semibold text-foreground">Change timeline</h2>
      <div className="mt-5 divide-y divide-border overflow-hidden rounded-md border border-border">
        {changes.map((change) => (
          <article className="grid gap-4 bg-white p-4 md:grid-cols-[auto_1fr_auto]" key={change.id}>
            <div className="flex size-10 items-center justify-center rounded-md border border-border bg-slate-50 text-accent">
              <GitCompareArrows aria-hidden="true" className="size-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{change.changeType}</p>
                <ApiRiskBadge severity={change.severity} />
              </div>
              <p className="mt-2 text-sm text-muted">{change.description}</p>
              <p className="mt-2 text-xs text-muted">{getChangedFieldSummary(change)}</p>
            </div>
            <div className="text-right text-xs text-muted">
              <p>Risk {getRiskScore(change)}</p>
              <p className="mt-2">Scan {change.scanId.slice(0, 8)}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
