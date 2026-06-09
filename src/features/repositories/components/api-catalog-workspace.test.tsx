import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ApiCatalogWorkspace } from './api-catalog-workspace';

import type { DetectedApi, RepositorySource } from '@/types/repository';
import type { ReactNode } from 'react';

const listRepositoriesMock = vi.hoisted(() => vi.fn());
const listRepositoryApisMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('id=repository-id'),
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
    getRepositoryOpenApi: vi.fn(),
    listRepositories: listRepositoriesMock,
    listRepositoryApis: listRepositoryApisMock,
  },
}));

const repository: RepositorySource = {
  createdAt: '2026-06-09T00:00:00.000Z',
  defaultBranch: 'main',
  externalId: 'external-id',
  fullName: 'owner/api',
  id: 'repository-id',
  language: 'TypeScript',
  name: 'api',
  provider: 'GITHUB',
  updatedAt: '2026-06-09T00:00:00.000Z',
  url: 'https://github.com/owner/api',
  visibility: 'private',
};

const api: DetectedApi = {
  authMetadata: null,
  controllerName: 'UsersController',
  createdAt: '2026-06-09T00:00:00.000Z',
  filePath: 'src/users.controller.ts',
  framework: 'NESTJS',
  handlerName: 'listUsers',
  id: 'api-id',
  lineNumber: 12,
  method: 'GET',
  path: '/users',
  repositoryId: repository.id,
  requestSchema: null,
  responseSchema: null,
  scanId: 'scan-id',
  updatedAt: '2026-06-09T00:00:00.000Z',
};

describe(ApiCatalogWorkspace.name, () => {
  it('renders paginated large API lists and requests the next page', async () => {
    listRepositoriesMock.mockResolvedValue([repository]);
    listRepositoryApisMock.mockResolvedValue({
      items: [api],
      pagination: {
        hasNext: true,
        hasPrevious: false,
        limit: 25,
        offset: 0,
        total: 101,
      },
    });

    render(<ApiCatalogWorkspace />);

    await waitFor(() => {
      expect(screen.getByText('101 endpoints')).toBeInTheDocument();
    });
    expect(listRepositoryApisMock).toHaveBeenCalledWith(
      'access-token',
      repository.id,
      expect.objectContaining({
        limit: 25,
        offset: 0,
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(listRepositoryApisMock).toHaveBeenLastCalledWith(
        'access-token',
        repository.id,
        expect.objectContaining({
          limit: 25,
          offset: 25,
        }),
      );
    });
  });
});
