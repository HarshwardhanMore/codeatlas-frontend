'use client';

import { CheckCircle2, GitBranch, GitFork, Unplug } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import type { OAuthRepositoryProvider, RepositoryConnection } from '@/types/repository';
import type { ReactNode } from 'react';

export interface ProviderCardProps {
  provider: OAuthRepositoryProvider;
  title: string;
  description: string;
  connection: RepositoryConnection | null;
  isBusy: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onLoadRepositories: () => void;
  children?: ReactNode;
}

export function ProviderCard({
  children,
  connection,
  description,
  isBusy,
  onConnect,
  onDisconnect,
  onLoadRepositories,
  provider,
  title,
}: ProviderCardProps): ReactNode {
  const connected = connection?.status === 'ACTIVE';
  const Icon = provider === 'GITHUB' ? GitFork : GitBranch;

  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-slate-50 text-accent">
            <Icon aria-hidden="true" className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
            <div
              className={cn(
                'mt-4 inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-medium',
                connected
                  ? 'border-success/30 bg-success/5 text-success'
                  : 'border-border bg-slate-50 text-muted',
              )}
            >
              {connected ? (
                <CheckCircle2 aria-hidden="true" className="size-3.5" />
              ) : (
                <Unplug aria-hidden="true" className="size-3.5" />
              )}
              {connected ? `Connected as ${connection.username ?? title}` : 'Disconnected'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {connected ? (
          <>
            <Button disabled={isBusy} onClick={onLoadRepositories} variant="secondary">
              Load repositories
            </Button>
            <Button disabled={isBusy} onClick={onDisconnect} variant="ghost">
              Disconnect
            </Button>
          </>
        ) : (
          <Button disabled={isBusy} onClick={onConnect}>
            Connect {title}
          </Button>
        )}
      </div>

      {children ? <div className="mt-6 border-t border-border pt-6">{children}</div> : null}
    </section>
  );
}
