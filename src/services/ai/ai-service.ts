import type { AiChatInput, AiChatResponse, AiConversation } from '@/types/ai';

const DEFAULT_API_URL = 'http://localhost:3001';
const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? DEFAULT_API_URL;
const AI_BASE_URL = `${API_BASE_URL}/api/v1/ai`;

export class AiApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiApiError';
  }
}

interface AiRequestOptions extends RequestInit {
  accessToken: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractErrorMessage(payload: unknown): string {
  if (!isRecord(payload)) {
    return 'AI assistant request failed.';
  }

  const message = payload['message'];

  if (typeof message === 'string') {
    return message;
  }

  if (Array.isArray(message) && typeof message[0] === 'string') {
    return message[0];
  }

  return 'AI assistant request failed.';
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
  { accessToken, ...init }: AiRequestOptions,
): Promise<TResponse> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);

  if (init.body) {
    headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json');
  }

  const response = await fetch(url, {
    ...init,
    credentials: 'include',
    headers,
  });
  const payload = await readJson(response);

  if (!response.ok) {
    throw new AiApiError(extractErrorMessage(payload));
  }

  return payload as TResponse;
}

export const aiService = {
  chat(accessToken: string, repositoryId: string, input: AiChatInput): Promise<AiChatResponse> {
    return requestJson<AiChatResponse>(`${AI_BASE_URL}/repositories/${repositoryId}/chat`, {
      accessToken,
      body: JSON.stringify(input),
      method: 'POST',
    });
  },

  async deleteConversation(accessToken: string, conversationId: string): Promise<void> {
    await requestJson<unknown>(`${AI_BASE_URL}/conversations/${conversationId}`, {
      accessToken,
      method: 'DELETE',
    });
  },

  getConversation(accessToken: string, conversationId: string): Promise<AiConversation> {
    return requestJson<AiConversation>(`${AI_BASE_URL}/conversations/${conversationId}`, {
      accessToken,
      method: 'GET',
    });
  },

  listConversations(accessToken: string): Promise<AiConversation[]> {
    return requestJson<AiConversation[]>(`${AI_BASE_URL}/conversations`, {
      accessToken,
      method: 'GET',
    });
  },
};
