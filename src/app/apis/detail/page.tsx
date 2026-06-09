import { Suspense } from 'react';

import { LoadingState } from '@/components/feedback/loading-state';
import { AppShell } from '@/components/layout/app-shell';
import { ApiDetailWorkspace } from '@/features/repositories/components/api-detail-workspace';

import type { ReactNode } from 'react';

export default function ApiDetailPage(): ReactNode {
  return (
    <AppShell>
      <Suspense fallback={<LoadingState label="Loading API details" />}>
        <ApiDetailWorkspace />
      </Suspense>
    </AppShell>
  );
}
