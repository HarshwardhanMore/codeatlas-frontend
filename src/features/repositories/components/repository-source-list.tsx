import { Archive, GitBranch, GitFork } from 'lucide-react';
import Link from 'next/link';

import type { RepositoryProvider, RepositorySource } from '@/types/repository';
import type { ReactNode } from 'react';

export interface RepositorySourceListProps {
  repositories: RepositorySource[];
}

function getRepositoryIcon(provider: RepositoryProvider): typeof Archive {
  if (provider === 'GITHUB') {
    return GitFork;
  }

  if (provider === 'BITBUCKET') {
    return GitBranch;
  }

  return Archive;
}

export function RepositorySourceList({ repositories }: RepositorySourceListProps): ReactNode {
  return (
    <div className="grid gap-4">
      {repositories.map((repository) => {
        const Icon = getRepositoryIcon(repository.provider);

        return (
          <article
            className="grid gap-4 rounded-lg border border-border bg-surface p-5 shadow-soft md:grid-cols-[1fr_auto] md:items-center"
            key={repository.id}
          >
            <div className="flex min-w-0 gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-slate-50 text-accent">
                <Icon aria-hidden="true" className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-foreground">
                  {repository.fullName}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {[repository.provider, repository.visibility, repository.language]
                    .filter(Boolean)
                    .join(' / ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted">
                {repository.defaultBranch ?? 'No default branch'}
              </p>
              <Link
                className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
                href={`/repositories/detail?id=${repository.id}`}
              >
                Open
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
