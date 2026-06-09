import '@testing-library/jest-dom/vitest';

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DashboardWorkspace } from './dashboard-workspace';

import type { DashboardOverview } from '@/types/dashboard';
import type { ReactNode } from 'react';

const getOverviewMock = vi.hoisted(() => vi.fn());

vi.mock('@/features/auth/auth-provider', () => ({
  useAuth: () => ({
    accessToken: 'access-token',
    status: 'authenticated',
  }),
}));

vi.mock('@/features/auth/components/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@/services/dashboard/dashboard-service', () => ({
  DashboardApiError: class DashboardApiError extends Error {},
  dashboardService: {
    getOverview: getOverviewMock,
  },
}));

const emptyOverview: DashboardOverview = {
  apiIntelligence: {
    frameworks: [
      {
        count: 0,
        key: 'NESTJS',
      },
      {
        count: 0,
        key: 'EXPRESS',
      },
    ],
    totalApis: 0,
  },
  generatedAt: '2026-06-09T00:00:00.000Z',
  recentActivity: [],
  repositoryOverview: {
    providers: [
      {
        count: 0,
        key: 'GITHUB',
      },
      {
        count: 0,
        key: 'BITBUCKET',
      },
      {
        count: 0,
        key: 'ZIP',
      },
    ],
    totalRepositories: 0,
  },
  riskOverview: {
    breakingChanges: 0,
    severities: [
      {
        count: 0,
        key: 'INFO',
      },
      {
        count: 0,
        key: 'LOW',
      },
      {
        count: 0,
        key: 'MEDIUM',
      },
      {
        count: 0,
        key: 'HIGH',
      },
    ],
    totalChanges: 0,
    types: [
      {
        count: 0,
        key: 'ADDED',
      },
      {
        count: 0,
        key: 'REMOVED',
      },
      {
        count: 0,
        key: 'MODIFIED',
      },
      {
        count: 0,
        key: 'DEPRECATED',
      },
    ],
  },
  scanSummary: {
    activeScans: 0,
    completedScans: 0,
    failedScans: 0,
    statuses: [
      {
        count: 0,
        key: 'QUEUED',
      },
      {
        count: 0,
        key: 'RUNNING',
      },
      {
        count: 0,
        key: 'COMPLETED',
      },
      {
        count: 0,
        key: 'FAILED',
      },
      {
        count: 0,
        key: 'CANCELLED',
      },
    ],
    totalScans: 0,
  },
};

describe(DashboardWorkspace.name, () => {
  it('renders an actionable empty state when no product data exists', async () => {
    getOverviewMock.mockResolvedValue(emptyOverview);

    render(<DashboardWorkspace />);

    await waitFor(() => {
      expect(screen.getByText('No engineering intelligence yet')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Add first repository' })).toBeInTheDocument();
  });

  it('renders real dashboard metrics from the backend overview', async () => {
    getOverviewMock.mockResolvedValue({
      ...emptyOverview,
      apiIntelligence: {
        ...emptyOverview.apiIntelligence,
        totalApis: 125,
      },
      repositoryOverview: {
        ...emptyOverview.repositoryOverview,
        totalRepositories: 3,
      },
      riskOverview: {
        ...emptyOverview.riskOverview,
        breakingChanges: 2,
        totalChanges: 8,
      },
      scanSummary: {
        ...emptyOverview.scanSummary,
        totalScans: 4,
      },
    });

    render(<DashboardWorkspace />);

    await waitFor(() => {
      expect(screen.getByText('Repositories')).toBeInTheDocument();
    });
    expect(screen.getByText('125')).toBeInTheDocument();
    expect(screen.getByText('Breaking changes')).toBeInTheDocument();
  });
});
