'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { LoadingState } from '@/components/feedback/loading-state';

import { useAuth } from '../auth-provider';

import type { ReactNode } from 'react';

export interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps): ReactNode {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace('/login');
    }
  }, [router, status]);

  if (status !== 'authenticated') {
    return <LoadingState label="Checking session" />;
  }

  return children;
}
