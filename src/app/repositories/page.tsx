import { AppShell } from '@/components/layout/app-shell';
import { RepositoriesWorkspace } from '@/features/repositories/components/repositories-workspace';

import type { ReactNode } from 'react';

export default function RepositoriesPage(): ReactNode {
  return (
    <AppShell>
      <RepositoriesWorkspace />
    </AppShell>
  );
}
