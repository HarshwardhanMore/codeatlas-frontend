import { AppShell } from '@/components/layout/app-shell';
import { SettingsWorkspace } from '@/features/settings/components/settings-workspace';

import type { ReactNode } from 'react';

export default function SettingsPage(): ReactNode {
  return (
    <AppShell>
      <SettingsWorkspace />
    </AppShell>
  );
}
