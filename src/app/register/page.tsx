import { AuthPage } from '@/features/auth/components/auth-page';

import type { ReactNode } from 'react';

export default function RegisterPage(): ReactNode {
  return <AuthPage mode="register" />;
}
