import { Suspense } from 'react';

import { LoadingState } from '@/components/feedback/loading-state';
import { AppShell } from '@/components/layout/app-shell';
import { DependencyGraphWorkspace } from '@/features/repositories/components/dependency-graph-workspace';

import type { ReactNode } from 'react';

export default function RepositoryDependenciesPage(): ReactNode {
  return (
    <AppShell>
      <Suspense fallback={<LoadingState label="Loading dependency graph" />}>
        <DependencyGraphWorkspace />
      </Suspense>
    </AppShell>
  );
}
