import { AuthPage } from '@/features/auth/components/auth-page';

import type { ReactNode } from 'react';

export default function LoginPage(): ReactNode {
  return <AuthPage mode="login" />;
}
