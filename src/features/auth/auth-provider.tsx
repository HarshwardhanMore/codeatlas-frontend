'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { authService } from '@/services/auth/auth-service';
import { tokenStorage } from '@/services/auth/token-storage';

import type { AuthenticatedUser, AuthSession, LoginInput, RegisterInput } from '@/types/auth';
import type { ReactNode } from 'react';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  accessToken: string | null;
  login(input: LoginInput): Promise<AuthSession>;
  logout(): Promise<void>;
  refresh(): Promise<AuthSession | null>;
  register(input: RegisterInput): Promise<AuthSession>;
  status: AuthStatus;
  user: AuthenticatedUser | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): ReactNode {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  const applySession = useCallback((session: AuthSession): AuthSession => {
    tokenStorage.set(session.accessToken);
    setAccessToken(session.accessToken);
    setUser(session.user);
    setStatus('authenticated');

    return session;
  }, []);

  const clearSession = useCallback((): void => {
    tokenStorage.clear();
    setAccessToken(null);
    setUser(null);
    setStatus('anonymous');
  }, []);

  const refresh = useCallback(async (): Promise<AuthSession | null> => {
    try {
      return applySession(await authService.refresh());
    } catch {
      clearSession();
      return null;
    }
  }, [applySession, clearSession]);

  useEffect(() => {
    let isMounted = true;

    async function hydrateSession(): Promise<void> {
      try {
        const session = await authService.refresh();

        if (!isMounted) {
          return;
        }

        applySession(session);
      } catch {
        if (isMounted) {
          clearSession();
        }
      }
    }

    void hydrateSession();

    return (): void => {
      isMounted = false;
    };
  }, [applySession, clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      login: async (input: LoginInput): Promise<AuthSession> =>
        applySession(await authService.login(input)),
      logout: async (): Promise<void> => {
        try {
          await authService.logout();
        } finally {
          clearSession();
        }
      },
      refresh,
      register: async (input: RegisterInput): Promise<AuthSession> =>
        applySession(await authService.register(input)),
      status,
      user,
    }),
    [accessToken, applySession, clearSession, refresh, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
