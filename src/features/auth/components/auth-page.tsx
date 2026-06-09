import { Suspense } from 'react';

import { LoadingState } from '@/components/feedback/loading-state';

import { AuthForm } from './auth-form';

import type { ReactNode } from 'react';

export interface AuthPageProps {
  mode: 'login' | 'register';
}

export function AuthPage({ mode }: AuthPageProps): ReactNode {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-12 px-6 py-10 lg:grid-cols-[1fr_440px]">
        <section className="max-w-2xl">
          <p className="text-sm font-semibold text-accent">Enterprise identity</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal text-foreground">
            Secure access for API intelligence teams.
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted">
            Sign in to manage the protected CodeAtlas workspace.
          </p>
        </section>
        <Suspense fallback={<LoadingState label="Loading identity form" />}>
          <AuthForm mode={mode} />
        </Suspense>
      </div>
    </main>
  );
}
