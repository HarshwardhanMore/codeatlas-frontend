'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { ErrorState } from '@/components/feedback/error-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService, AuthApiError } from '@/services/auth/auth-service';

import { useAuth } from '../auth-provider';

import type { LoginInput, RegisterInput } from '@/types/auth';
import type { ReactNode, SyntheticEvent } from 'react';

type AuthMode = 'login' | 'register';

const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(128),
});

const registerSchema = loginSchema.extend({
  name: z.string().trim().min(1).max(160).optional(),
  password: z.string().min(12).max(128),
});

export interface AuthFormProps {
  mode: AuthMode;
}

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthApiError) {
    return error.message;
  }

  return 'Authentication failed.';
}

export function AuthForm({ mode }: AuthFormProps): ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const isRegister = mode === 'register';
  const oauthStatus = searchParams.get('oauth');

  useEffect(() => {
    if (auth.status === 'authenticated') {
      router.replace('/repositories');
    }
  }, [auth.status, router]);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (isRegister) {
        const parsed = registerSchema.safeParse({ email, name: name || undefined, password });

        if (!parsed.success) {
          setFormError(parsed.error.issues[0]?.message ?? 'Registration details are invalid.');
          return;
        }

        await auth.register(parsed.data satisfies RegisterInput);
      } else {
        const parsed = loginSchema.safeParse({ email, password });

        if (!parsed.success) {
          setFormError(parsed.error.issues[0]?.message ?? 'Login details are invalid.');
          return;
        }

        await auth.login(parsed.data satisfies LoginInput);
      }

      router.push('/repositories');
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-soft">
      <div className="mb-8">
        <p className="text-sm font-semibold text-accent">CodeAtlas</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">
          {isRegister ? 'Create account' : 'Sign in'}
        </h1>
      </div>

      <form
        className="space-y-5"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        {isRegister ? (
          <Input
            autoComplete="name"
            label="Name"
            name="name"
            onChange={(event) => {
              setName(event.target.value);
            }}
            value={name}
          />
        ) : null}
        <Input
          autoComplete="email"
          label="Email"
          name="email"
          onChange={(event) => {
            setEmail(event.target.value);
          }}
          type="email"
          value={email}
        />
        <Input
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          label="Password"
          name="password"
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          type="password"
          value={password}
        />

        {oauthStatus === 'success' && auth.status === 'loading' ? (
          <div className="rounded-md border border-success/30 bg-success/5 p-4 text-sm font-medium text-success">
            Google sign-in completed. Loading your workspace session.
          </div>
        ) : null}

        {formError ? (
          <ErrorState
            message={formError}
            recovery="Check the credentials you entered, then try again. If you used Google, start the Google sign-in flow again from this page."
            title="Authentication error"
          />
        ) : null}

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Processing' : isRegister ? 'Create account' : 'Sign in'}
        </Button>
      </form>

      <div className="my-6 h-px bg-border" />

      <Button
        className="w-full"
        onClick={() => {
          window.location.assign(authService.getGoogleOAuthUrl());
        }}
        variant="secondary"
      >
        Continue with Google
      </Button>

      <p className="mt-6 text-sm text-muted">
        {isRegister ? 'Already have an account?' : 'Need an account?'}{' '}
        <Link
          className="font-medium text-accent hover:text-accent/80"
          href={isRegister ? '/login' : '/register'}
        >
          {isRegister ? 'Sign in' : 'Create one'}
        </Link>
      </p>
    </div>
  );
}
