import { Suspense } from 'react';

import { LoadingState } from '@/components/feedback/loading-state';
import { AppShell } from '@/components/layout/app-shell';
import { RepositoryConnectWorkspace } from '@/features/repositories/components/repository-connect-workspace';

import type { ReactNode } from 'react';

export default function RepositoryConnectPage(): ReactNode {
  return (
    <AppShell>
      <Suspense fallback={<LoadingState label="Loading repository intake" />}>
        <RepositoryConnectWorkspace />
      </Suspense>
    </AppShell>
  );
}
