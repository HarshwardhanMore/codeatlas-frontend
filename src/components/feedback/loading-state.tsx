import { LoaderCircle } from 'lucide-react';

import type { ReactNode } from 'react';

export interface LoadingStateProps {
  label: string;
}

export function LoadingState({ label }: LoadingStateProps): ReactNode {
  return (
    <div className="flex items-center gap-3 text-sm text-muted">
      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
