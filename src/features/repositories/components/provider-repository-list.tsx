'use client';

import { GitPullRequestArrow, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { ProviderRepository } from '@/types/repository';
import type { ReactNode } from 'react';

export interface ProviderRepositoryListProps {
  importingExternalId: string | null;
  repositories: ProviderRepository[];
  onImport: (repository: ProviderRepository) => void;
}

export function ProviderRepositoryList({
  importingExternalId,
  onImport,
  repositories,
}: ProviderRepositoryListProps): ReactNode {
  if (repositories.length === 0) {
    return <p className="text-sm text-muted">No repositories returned from this provider.</p>;
  }

  return (
    <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
      {repositories.map((repository) => (
        <div
          className="grid gap-4 bg-white p-4 md:grid-cols-[1fr_auto] md:items-center"
          key={repository.externalId}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <GitPullRequestArrow aria-hidden="true" className="size-4 shrink-0 text-accent" />
              <p className="truncate text-sm font-semibold text-foreground">
                {repository.fullName}
              </p>
            </div>
            <p className="mt-1 text-xs text-muted">
              {[repository.visibility, repository.language, repository.defaultBranch]
                .filter(Boolean)
                .join(' / ')}
            </p>
          </div>
          <Button
            disabled={importingExternalId === repository.externalId}
            onClick={() => {
              onImport(repository);
            }}
            variant="secondary"
          >
            <Plus aria-hidden="true" className="mr-2 size-4" />
            {importingExternalId === repository.externalId ? 'Adding' : 'Add'}
          </Button>
        </div>
      ))}
    </div>
  );
}
