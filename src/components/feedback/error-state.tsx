import { AlertTriangle } from 'lucide-react';

import type { ReactNode } from 'react';

export interface ErrorStateProps {
  action?: ReactNode;
  message: string;
  recovery?: string;
  title: string;
}

const DEFAULT_RECOVERY =
  'This can happen when the API is unavailable, your session expired, or the request could not be completed. Retry the action, refresh the page, or sign in again if the problem continues.';

export function ErrorState({
  action,
  message,
  recovery = DEFAULT_RECOVERY,
  title,
}: ErrorStateProps): ReactNode {
  return (
    <div className="rounded-md border border-danger/30 bg-white p-4 text-danger">
      <div className="flex gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6">{message}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{recovery}</p>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
