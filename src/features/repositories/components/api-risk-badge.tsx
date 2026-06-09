import { cn } from '@/utils/cn';

import type { ApiChangeSeverity } from '@/types/repository';
import type { ReactNode } from 'react';

export interface ApiRiskBadgeProps {
  severity: ApiChangeSeverity;
}

const severityClasses: Record<ApiChangeSeverity, string> = {
  HIGH: 'border-danger/30 bg-danger/5 text-danger',
  INFO: 'border-slate-300 bg-slate-50 text-muted',
  LOW: 'border-success/30 bg-success/5 text-success',
  MEDIUM: 'border-amber-600/30 bg-amber-50 text-amber-700',
};

export function ApiRiskBadge({ severity }: ApiRiskBadgeProps): ReactNode {
  return (
    <span
      className={cn(
        'inline-flex h-7 min-w-20 items-center justify-center rounded-md border px-2 text-xs font-semibold',
        severityClasses[severity],
      )}
    >
      {severity}
    </span>
  );
}
