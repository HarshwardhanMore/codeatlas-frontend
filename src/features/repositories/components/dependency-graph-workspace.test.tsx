import '@testing-library/jest-dom/vitest';

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DependencyGraphWorkspace } from './dependency-graph-workspace';

import type { DependencyGraphResponse } from '@/types/repository';
import type { ReactNode } from 'react';

const getDependencyGraphMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('id=repository-id'),
}));

vi.mock('reactflow', () => ({
  Background: () => <div data-testid="graph-background" />,
  Controls: () => <div data-testid="graph-controls" />,
  MiniMap: () => <div data-testid="graph-minimap" />,
  default: ({ edges, nodes }: { edges: unknown[]; nodes: unknown[] }) => (
    <div data-testid="react-flow">
      {nodes.length.toString()} nodes / {edges.length.toString()} edges
    </div>
  ),
}));

vi.mock('@/features/auth/auth-provider', () => ({
  useAuth: () => ({
    accessToken: 'access-token',
    status: 'authenticated',
  }),
}));

vi.mock('@/features/auth/components/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@/services/repositories/repository-service', () => ({
  RepositoryApiError: class RepositoryApiError extends Error {},
  repositoryService: {
    getDependencyGraph: getDependencyGraphMock,
  },
}));

const graph: DependencyGraphResponse = {
  edges: [
    {
      id: 'dependency-id',
      kind: 'IMPORT',
      source: 'source-file-id',
      specifier: './token.service',
      target: 'target-file-id',
    },
  ],
  nodes: [
    {
      id: 'source-file-id',
      label: 'src/auth/auth.service.ts',
      language: 'TYPESCRIPT',
      path: 'src/auth/auth.service.ts',
      type: 'FILE',
    },
    {
      id: 'target-file-id',
      label: 'src/auth/token.service.ts',
      language: 'TYPESCRIPT',
      path: 'src/auth/token.service.ts',
      type: 'FILE',
    },
  ],
  repositoryId: 'repository-id',
  scanId: 'scan-id',
};

describe(DependencyGraphWorkspace.name, () => {
  it('renders repository dependency graph counts from API data', async () => {
    getDependencyGraphMock.mockResolvedValue(graph);

    render(<DependencyGraphWorkspace />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Repository relationships' })).toBeInTheDocument();
    });

    expect(getDependencyGraphMock).toHaveBeenCalledWith('access-token', 'repository-id');
    expect(screen.getAllByText('2 nodes / 1 edges')).toHaveLength(2);
    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
  });
});
