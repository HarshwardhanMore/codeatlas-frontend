import Link from 'next/link';

import type { ReactNode } from 'react';

export interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps): ReactNode {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6">
        <header className="flex h-14 items-center justify-between border-b border-border">
          <div>
            <p className="text-sm font-semibold text-foreground">CodeAtlas</p>
            <p className="text-xs text-muted">API intelligence platform</p>
          </div>
          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-4 text-sm font-medium text-muted"
          >
            <Link className="hover:text-foreground" href="/">
              Home
            </Link>
            <Link className="hover:text-foreground" href="/dashboard">
              Dashboard
            </Link>
            <Link className="hover:text-foreground" href="/repositories">
              Repositories
            </Link>
            <Link className="hover:text-foreground" href="/repositories/connect">
              Connect
            </Link>
            <Link className="hover:text-foreground" href="/assistant">
              Assistant
            </Link>
            <Link className="hover:text-foreground" href="/settings">
              Settings
            </Link>
          </nav>
        </header>
        <section className="flex flex-1 py-12">{children}</section>
      </div>
    </main>
  );
}
