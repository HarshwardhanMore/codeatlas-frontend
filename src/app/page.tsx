import Link from 'next/link';

import { AppShell } from '@/components/layout/app-shell';

import type { ReactNode } from 'react';

const productSteps = [
  {
    description: 'Sign in with email or Google, then keep repository access separate from login.',
    title: 'Secure access',
  },
  {
    description:
      'Connect GitHub, Bitbucket, or upload a ZIP source without exposing provider tokens.',
    title: 'Add code sources',
  },
  {
    description:
      'Queue repository scans, review progress, and inspect discovered APIs and changes.',
    title: 'Analyze and govern',
  },
  {
    description: 'Ask the assistant questions grounded in stored scanner intelligence only.',
    title: 'Explain with AI',
  },
];

export default function HomePage(): ReactNode {
  return (
    <AppShell>
      <div className="grid w-full gap-8">
        <section className="grid gap-8 rounded-lg border border-border bg-surface p-8 shadow-soft lg:grid-cols-[1fr_24rem] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-accent">Enterprise API intelligence</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-foreground">
              Connect repositories, scan source code, and understand API change risk.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
              CodeAtlas turns repository metadata, scanner output, API discovery, version history,
              and change reports into one protected engineering workspace.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90"
                href="/dashboard"
              >
                Open workspace
              </Link>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
                href="/repositories/connect"
              >
                Connect source
              </Link>
            </div>
          </div>
          <div className="grid gap-3 rounded-md border border-border bg-slate-50 p-5">
            <p className="text-sm font-semibold text-foreground">First successful run</p>
            <ol className="grid gap-3 text-sm leading-6 text-muted">
              <li>1. Sign in or create an account.</li>
              <li>2. Connect a provider or upload a ZIP.</li>
              <li>3. Import a repository and start analysis.</li>
              <li>4. Review APIs, history, changes, and assistant answers.</li>
            </ol>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {productSteps.map((step) => (
            <article
              className="rounded-lg border border-border bg-surface p-5 shadow-soft"
              key={step.title}
            >
              <h2 className="text-base font-semibold text-foreground">{step.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{step.description}</p>
            </article>
          ))}
        </section>

        <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-6 shadow-soft md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Need to configure access?</h2>
            <p className="mt-2 text-sm text-muted">
              Settings shows the current profile, security status, connected providers, and
              repository management actions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
              href="/settings"
            >
              Open settings
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
              href="/assistant"
            >
              Open assistant
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
