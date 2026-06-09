import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProviderCard } from './provider-card';

import type { RepositoryConnection } from '@/types/repository';

const connection: RepositoryConnection = {
  createdAt: '2026-06-08T00:00:00.000Z',
  displayName: 'Engineer',
  expiresAt: null,
  id: 'connection-id',
  lastValidatedAt: null,
  provider: 'GITHUB',
  providerUserId: 'provider-user-id',
  scopes: ['repo'],
  status: 'ACTIVE',
  updatedAt: '2026-06-08T00:00:00.000Z',
  username: 'engineer',
};

describe(ProviderCard.name, () => {
  it('renders a connected provider state', () => {
    render(
      <ProviderCard
        connection={connection}
        description="Connect repository access for GitHub projects."
        isBusy={false}
        onConnect={vi.fn()}
        onDisconnect={vi.fn()}
        onLoadRepositories={vi.fn()}
        provider="GITHUB"
        title="GitHub"
      />,
    );

    expect(screen.getByText('Connected as engineer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Load repositories' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Disconnect' })).toBeEnabled();
  });

  it('renders a disconnected provider state', () => {
    render(
      <ProviderCard
        connection={null}
        description="Connect repository access for Bitbucket projects."
        isBusy={false}
        onConnect={vi.fn()}
        onDisconnect={vi.fn()}
        onLoadRepositories={vi.fn()}
        provider="BITBUCKET"
        title="Bitbucket"
      />,
    );

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect Bitbucket' })).toBeEnabled();
  });
});
