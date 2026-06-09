import { Suspense } from 'react';

import { LoadingState } from '@/components/feedback/loading-state';
import { AppShell } from '@/components/layout/app-shell';
import { ApiCatalogWorkspace } from '@/features/repositories/components/api-catalog-workspace';

import type { ReactNode } from 'react';

export default function RepositoryApisPage(): ReactNode {
  return (
    <AppShell>
      <Suspense fallback={<LoadingState label="Loading API catalog" />}>
        <ApiCatalogWorkspace />
      </Suspense>
    </AppShell>
  );
}
