import { Geist, Geist_Mono } from 'next/font/google';
import 'reactflow/dist/style.css';

import { AuthProvider } from '@/features/auth/auth-provider';
import '@/styles/globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CodeAtlas',
  description: 'AI-powered engineering intelligence platform',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>): ReactNode {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
