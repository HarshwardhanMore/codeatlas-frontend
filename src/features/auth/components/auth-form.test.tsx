import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthForm } from './auth-form';

const router = {
  push: vi.fn(),
  replace: vi.fn(),
};
let oauthStatus: string | null = null;
let authStatus = 'anonymous';

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  useSearchParams: () => ({
    get: () => oauthStatus,
  }),
}));

vi.mock('../auth-provider', () => ({
  useAuth: () => ({
    login: vi.fn(),
    register: vi.fn(),
    status: authStatus,
  }),
}));

describe(AuthForm.name, () => {
  beforeEach(() => {
    authStatus = 'anonymous';
    oauthStatus = null;
    router.push.mockClear();
    router.replace.mockClear();
  });

  it('renders email login and Google continuation', () => {
    render(<AuthForm mode="login" />);

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
  });

  it('renders registration name input', () => {
    render(<AuthForm mode="register" />);

    expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('shows Google OAuth completion state while session hydration finishes', () => {
    authStatus = 'loading';
    oauthStatus = 'success';

    render(<AuthForm mode="login" />);

    expect(
      screen.getByText('Google sign-in completed. Loading your workspace session.'),
    ).toBeInTheDocument();
  });

  it('redirects authenticated users to the repository workspace', () => {
    authStatus = 'authenticated';

    render(<AuthForm mode="login" />);

    expect(router.replace).toHaveBeenCalledWith('/repositories');
  });
});
