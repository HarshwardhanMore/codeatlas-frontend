import { Suspense } from 'react';

import { LoadingState } from '@/components/feedback/loading-state';
import { AppShell } from '@/components/layout/app-shell';
import { ApiHistoryWorkspace } from '@/features/repositories/components/api-history-workspace';

import type { ReactNode } from 'react';

export default function ApiHistoryPage(): ReactNode {
  return (
    <AppShell>
      <Suspense fallback={<LoadingState label="Loading API history" />}>
        <ApiHistoryWorkspace />
      </Suspense>
    </AppShell>
  );
}
