export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  status: UserStatus;
  roles: string[];
  permissions: string[];
}

export interface AuthSession {
  accessToken: string;
  user: AuthenticatedUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name?: string;
}
