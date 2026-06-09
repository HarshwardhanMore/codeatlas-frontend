export type AiMessageRole = 'ASSISTANT' | 'USER';

export interface AiMessage {
  id: string;
  role: AiMessageRole;
  content: string;
  metadata: unknown;
  createdAt: string;
}

export interface AiConversation {
  id: string;
  repositoryId: string;
  repositoryFullName: string;
  title: string;
  model: string;
  messages: AiMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AiContextStats {
  apiCount: number;
  changeCount: number;
  dependencyCount: number;
  fileCount: number;
  symbolCount: number;
}

export interface AiChatInput {
  conversationId?: string;
  question: string;
}

export interface AiChatResponse {
  answer: AiMessage;
  contextStats: AiContextStats;
  conversation: AiConversation;
}
