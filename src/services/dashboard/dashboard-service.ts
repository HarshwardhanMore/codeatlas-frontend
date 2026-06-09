import type { DashboardOverview } from '@/types/dashboard';

const DEFAULT_API_URL = 'http://localhost:3001';
const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? DEFAULT_API_URL;
const DASHBOARD_BASE_URL = `${API_BASE_URL}/api/v1/dashboard`;

export class DashboardApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DashboardApiError';
  }
}

interface DashboardRequestOptions extends RequestInit {
  accessToken: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractErrorMessage(payload: unknown): string {
  if (!isRecord(payload)) {
    return 'Dashboard request failed.';
  }

  const message = payload['message'];

  if (typeof message === 'string') {
    return message;
  }

  if (Array.isArray(message) && typeof message[0] === 'string') {
    return message[0];
  }

  return 'Dashboard request failed.';
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

async function requestJson<TResponse>(
  url: string,
  { accessToken, ...init }: DashboardRequestOptions,
): Promise<TResponse> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(url, {
    ...init,
    credentials: 'include',
    headers,
  });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new DashboardApiError(extractErrorMessage(payload));
  }

  return payload as TResponse;
}

export const dashboardService = {
  getOverview(accessToken: string): Promise<DashboardOverview> {
    return requestJson<DashboardOverview>(`${DASHBOARD_BASE_URL}/overview`, {
      accessToken,
      method: 'GET',
    });
  },
};
