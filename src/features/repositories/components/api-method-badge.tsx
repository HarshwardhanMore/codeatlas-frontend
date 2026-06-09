import { cn } from '@/utils/cn';

import type { ApiHttpMethod } from '@/types/repository';
import type { ReactNode } from 'react';

export interface ApiMethodBadgeProps {
  method: ApiHttpMethod;
}

const methodClasses: Record<ApiHttpMethod, string> = {
  DELETE: 'border-danger/30 bg-danger/5 text-danger',
  GET: 'border-success/30 bg-success/5 text-success',
  PATCH: 'border-amber-600/30 bg-amber-50 text-amber-700',
  POST: 'border-accent/30 bg-accent/5 text-accent',
  PUT: 'border-sky-700/30 bg-sky-50 text-sky-800',
};

export function ApiMethodBadge({ method }: ApiMethodBadgeProps): ReactNode {
  return (
    <span
      className={cn(
        'inline-flex h-7 min-w-16 items-center justify-center rounded-md border px-2 text-xs font-semibold',
        methodClasses[method],
      )}
    >
      {method}
    </span>
  );
}
