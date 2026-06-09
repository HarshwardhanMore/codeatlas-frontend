import type { AuthenticatedUser, AuthSession, LoginInput, RegisterInput } from '@/types/auth';

const DEFAULT_API_URL = 'http://localhost:3001';
const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? DEFAULT_API_URL;
const AUTH_BASE_URL = `${API_BASE_URL}/api/v1/auth`;

export class AuthApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthApiError';
  }
}

interface UserResponse {
  user: AuthenticatedUser;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractErrorMessage(payload: unknown): string {
  if (!isRecord(payload)) {
    return 'Authentication request failed.';
  }

  const message = payload['message'];

  if (typeof message === 'string') {
    return message;
  }

  if (Array.isArray(message) && typeof message[0] === 'string') {
    return message[0];
  }

  return 'Authentication request failed.';
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function requestJson<TResponse>(path: string, init: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json');

  const response = await fetch(`${AUTH_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new AuthApiError(extractErrorMessage(payload));
  }

  return payload as TResponse;
}

export const authService = {
  getGoogleOAuthUrl(): string {
    return `${AUTH_BASE_URL}/google`;
  },

  getCurrentUser(accessToken: string): Promise<UserResponse> {
    return requestJson<UserResponse>('/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: 'GET',
    });
  },

  login(input: LoginInput): Promise<AuthSession> {
    return requestJson<AuthSession>('/login', {
      body: JSON.stringify(input),
      method: 'POST',
    });
  },

  logout(): Promise<{ success: true }> {
    return requestJson<{ success: true }>('/logout', {
      method: 'POST',
    });
  },

  refresh(): Promise<AuthSession> {
    return requestJson<AuthSession>('/refresh', {
      method: 'POST',
    });
  },

  register(input: RegisterInput): Promise<AuthSession> {
    return requestJson<AuthSession>('/register', {
      body: JSON.stringify(input),
      method: 'POST',
    });
  },
};
