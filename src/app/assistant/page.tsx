import { AppShell } from '@/components/layout/app-shell';
import { AssistantWorkspace } from '@/features/assistant/components/assistant-workspace';

import type { ReactNode } from 'react';

export default function AssistantPage(): ReactNode {
  return (
    <AppShell>
      <AssistantWorkspace />
    </AppShell>
  );
}
