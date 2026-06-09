import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ApiChangeTimeline } from './api-change-timeline';

import type { ApiChange } from '@/types/repository';

const change: ApiChange = {
  apiId: 'api-id',
  changeType: 'MODIFIED',
  createdAt: '2026-06-08T00:00:00.000Z',
  description: 'Response fields were removed.',
  id: 'change-id',
  metadata: {
    diff: {
      response: {
        removed: [
          {
            path: 'name',
          },
        ],
      },
    },
    riskScore: 90,
  },
  newSnapshot: null,
  newSnapshotId: null,
  oldSnapshot: null,
  oldSnapshotId: null,
  repositoryId: 'repository-id',
  scanId: 'scan-id-12345678',
  severity: 'HIGH',
};

describe(ApiChangeTimeline.name, () => {
  it('renders change descriptions and risk score', () => {
    render(<ApiChangeTimeline changes={[change]} />);

    expect(screen.getByText('MODIFIED')).toBeInTheDocument();
    expect(screen.getByText('Response fields were removed.')).toBeInTheDocument();
    expect(screen.getByText('Risk 90')).toBeInTheDocument();
  });
});
