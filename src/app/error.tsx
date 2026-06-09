'use client';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { ReactNode } from 'react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): ReactNode {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="w-full max-w-lg rounded-lg border border-border bg-surface p-8 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-danger/30 bg-danger/5 text-danger">
            <AlertTriangle aria-hidden="true" className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-danger">Application error</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">Something went wrong</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              The current view could not be rendered. Retry the view or return to a stable route.
            </p>
            {error.digest ? (
              <p className="mt-3 text-xs text-muted">Error digest: {error.digest}</p>
            ) : null}
            <div className="mt-6">
              <Button onClick={reset}>Retry</Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
