import { FileSearch } from 'lucide-react';

import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ action, description, title }: EmptyStateProps): ReactNode {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-start rounded-lg border border-border bg-surface p-8 shadow-soft">
      <div className="mb-5 flex size-11 items-center justify-center rounded-md border border-border bg-slate-50 text-accent">
        <FileSearch aria-hidden="true" className="size-5" />
      </div>
      <h1 className="text-3xl font-semibold tracking-normal text-foreground">{title}</h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
