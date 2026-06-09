import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AssistantMessage } from './assistant-message';

import type { AiMessage } from '@/types/ai';

const timestamp = '2026-06-08T00:00:00.000Z';

describe(AssistantMessage.name, () => {
  it('renders assistant markdown responses', () => {
    const message: AiMessage = {
      content: '## Auth flow\n- POST /auth/login validates credentials.\n```ts\nJwtGuard\n```',
      createdAt: timestamp,
      id: 'message-id',
      metadata: null,
      role: 'ASSISTANT',
    };

    render(<AssistantMessage message={message} />);

    expect(screen.getByText('CodeAtlas')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Auth flow' })).toBeInTheDocument();
    expect(screen.getByText('POST /auth/login validates credentials.')).toBeInTheDocument();
    expect(screen.getByText('JwtGuard')).toBeInTheDocument();
  });

  it('renders user messages with the user label', () => {
    const message: AiMessage = {
      content: 'Explain this repository',
      createdAt: timestamp,
      id: 'message-id',
      metadata: null,
      role: 'USER',
    };

    render(<AssistantMessage message={message} />);

    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('Explain this repository')).toBeInTheDocument();
  });
});
