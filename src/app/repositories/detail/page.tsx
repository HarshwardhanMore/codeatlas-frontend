import { Suspense } from 'react';

import { LoadingState } from '@/components/feedback/loading-state';
import { AppShell } from '@/components/layout/app-shell';
import { RepositoryDetailWorkspace } from '@/features/repositories/components/repository-detail-workspace';

import type { ReactNode } from 'react';

export default function RepositoryDetailPage(): ReactNode {
  return (
    <AppShell>
      <Suspense fallback={<LoadingState label="Loading repository" />}>
        <RepositoryDetailWorkspace />
      </Suspense>
    </AppShell>
  );
}
