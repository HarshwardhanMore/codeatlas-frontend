import '@testing-library/jest-dom/vitest';

import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsWorkspace } from './settings-workspace';

import type { RepositoryConnection, RepositorySource } from '@/types/repository';

const authState = {
  accessToken: 'access-token',
  logout: vi.fn(),
  status: 'authenticated',
  user: {
    avatar: null,
    email: 'engineer@example.com',
    id: 'user-id',
    name: 'Engineer',
    permissions: [],
    roles: ['USER'],
    status: 'ACTIVE',
  },
};

const connection: RepositoryConnection = {
  createdAt: '2026-06-08T00:00:00.000Z',
  displayName: 'Engineer',
  expiresAt: null,
  id: 'connection-id',
  lastValidatedAt: '2026-06-08T00:00:00.000Z',
  provider: 'GITHUB',
  providerUserId: 'provider-user-id',
  scopes: ['repo'],
  status: 'ACTIVE',
  updatedAt: '2026-06-08T00:00:00.000Z',
  username: 'engineer',
};

const repository: RepositorySource = {
  createdAt: '2026-06-08T00:00:00.000Z',
  defaultBranch: 'main',
  externalId: 'external-id',
  fullName: 'acme/api',
  id: 'repository-id',
  language: 'TypeScript',
  name: 'api',
  provider: 'GITHUB',
  updatedAt: '2026-06-08T00:00:00.000Z',
  url: 'https://github.com/acme/api',
  visibility: 'private',
};

const serviceMocks = vi.hoisted(() => ({
  listConnections: vi.fn<() => Promise<RepositoryConnection[]>>(),
  listRepositories: vi.fn<() => Promise<RepositorySource[]>>(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
}));

vi.mock('@/features/auth/auth-provider', () => ({
  useAuth: () => authState,
}));

vi.mock('@/services/repositories/repository-service', () => ({
  RepositoryApiError: class RepositoryApiError extends Error {},
  repositoryService: {
    listConnections: serviceMocks.listConnections,
    listRepositories: serviceMocks.listRepositories,
  },
}));

describe(SettingsWorkspace.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMocks.listConnections.mockResolvedValue([connection]);
    serviceMocks.listRepositories.mockResolvedValue([repository]);
  });

  it('renders profile, security, providers, and repository management', async () => {
    render(<SettingsWorkspace />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Profile, security, and sources' }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('engineer@example.com')).toBeInTheDocument();
    expect(
      screen.getByText(/GitHub and Bitbucket are repository providers only/u),
    ).toBeInTheDocument();
    expect(screen.getByText('GITHUB')).toBeInTheDocument();
    expect(
      screen.getByText(/1 repository sources are available for scanning/u),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Manage providers' })).toHaveAttribute(
      'href',
      '/repositories/connect',
    );
  });

  it('shows provider empty state with a next action', async () => {
    serviceMocks.listConnections.mockResolvedValue([]);

    render(<SettingsWorkspace />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'No connected providers' })).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: 'Connect provider' })).toHaveAttribute(
      'href',
      '/repositories/connect',
    );
  });
});
