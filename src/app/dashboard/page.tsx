import { AppShell } from '@/components/layout/app-shell';
import { DashboardWorkspace } from '@/features/dashboard/components/dashboard-workspace';

import type { ReactNode } from 'react';

export default function DashboardPage(): ReactNode {
  return (
    <AppShell>
      <DashboardWorkspace />
    </AppShell>
  );
}
