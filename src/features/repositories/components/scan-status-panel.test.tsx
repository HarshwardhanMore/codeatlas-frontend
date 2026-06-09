import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ScanStatusPanel } from './scan-status-panel';

import type { RepositoryScan } from '@/types/repository';

const scan: RepositoryScan = {
  createdAt: '2026-06-08T00:00:00.000Z',
  errorMessage: null,
  finishedAt: null,
  id: 'scan-id',
  metadata: null,
  progress: 40,
  repositoryId: 'repository-id',
  startedAt: '2026-06-08T00:00:00.000Z',
  status: 'RUNNING',
  updatedAt: '2026-06-08T00:00:00.000Z',
};

describe(ScanStatusPanel.name, () => {
  it('renders active scan progress and cancellation control', () => {
    render(
      <ScanStatusPanel
        isCancelling={false}
        onCancel={vi.fn()}
        progress={{
          message: 'Preparing repository workspace',
          progress: 40,
          stage: 'Preparing repository workspace',
          updatedAt: '2026-06-08T00:00:00.000Z',
        }}
        scan={scan}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Running' })).toBeInTheDocument();
    expect(screen.getAllByText('Preparing repository workspace')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
  });

  it('renders empty scan state', () => {
    render(<ScanStatusPanel isCancelling={false} onCancel={vi.fn()} progress={null} scan={null} />);

    expect(
      screen.getByText('No analysis has been started for this repository.'),
    ).toBeInTheDocument();
  });
});
