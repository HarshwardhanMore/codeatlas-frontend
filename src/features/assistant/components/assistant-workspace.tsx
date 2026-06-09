'use client';

import { MessageSquare, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { LoadingState } from '@/components/feedback/loading-state';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/auth-provider';
import { ProtectedRoute } from '@/features/auth/components/protected-route';
import { aiService, AiApiError } from '@/services/ai/ai-service';
import { repositoryService, RepositoryApiError } from '@/services/repositories/repository-service';

import { AssistantMessage } from './assistant-message';

import type { AiConversation } from '@/types/ai';
import type { RepositorySource } from '@/types/repository';
import type { ReactNode } from 'react';

function getAssistantErrorMessage(error: unknown): string {
  if (error instanceof AiApiError || error instanceof RepositoryApiError) {
    return error.message;
  }

  return 'AI assistant request failed.';
}

function getAssistantRecoveryMessage(errorMessage: string): string {
  if (errorMessage.includes('OpenRouter is not configured')) {
    return 'Set OPENROUTER_API_KEY in the backend environment and restart the API. Repository scanning, API catalog, and change history remain available without an AI provider key.';
  }

  return 'The assistant depends on repository ownership, stored scanner context, and OpenRouter availability. Verify the repository exists, run a scan if context is missing, then retry.';
}

export function AssistantWorkspace(): ReactNode {
  const { accessToken, status } = useAuth();
  const [activeConversation, setActiveConversation] = useState<AiConversation | null>(null);
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [question, setQuestion] = useState('');
  const [repositories, setRepositories] = useState<RepositorySource[]>([]);
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string>('');

  const selectedRepository = useMemo(
    () => repositories.find((repository) => repository.id === selectedRepositoryId) ?? null,
    [repositories, selectedRepositoryId],
  );

  useEffect(() => {
    if (status !== 'authenticated' || !accessToken) {
      return undefined;
    }

    const token = accessToken;
    let isMounted = true;

    async function loadAssistant(): Promise<void> {
      try {
        const [nextRepositories, nextConversations] = await Promise.all([
          repositoryService.listRepositories(token),
          aiService.listConversations(token),
        ]);

        if (!isMounted) {
          return;
        }

        setConversations(nextConversations);
        setError(null);
        setRepositories(nextRepositories);
        setSelectedRepositoryId((current) =>
          current.length > 0 ? current : (nextRepositories[0]?.id ?? ''),
        );
      } catch (requestError) {
        if (isMounted) {
          setError(getAssistantErrorMessage(requestError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAssistant();

    return (): void => {
      isMounted = false;
    };
  }, [accessToken, status]);

  async function handleSelectConversation(conversationId: string): Promise<void> {
    if (!accessToken) {
      return;
    }

    setError(null);

    try {
      const conversation = await aiService.getConversation(accessToken, conversationId);

      setActiveConversation(conversation);
      setSelectedRepositoryId(conversation.repositoryId);
    } catch (requestError) {
      setError(getAssistantErrorMessage(requestError));
    }
  }

  async function handleDeleteConversation(conversationId: string): Promise<void> {
    if (!accessToken || !window.confirm('Delete this AI conversation?')) {
      return;
    }

    setError(null);

    try {
      await aiService.deleteConversation(accessToken, conversationId);
      setConversations((current) =>
        current.filter((conversation) => conversation.id !== conversationId),
      );

      if (activeConversation?.id === conversationId) {
        setActiveConversation(null);
      }
    } catch (requestError) {
      setError(getAssistantErrorMessage(requestError));
    }
  }

  async function handleSubmit(): Promise<void> {
    const trimmedQuestion = question.trim();

    if (!accessToken || !selectedRepositoryId || trimmedQuestion.length === 0) {
      return;
    }

    setError(null);
    setIsSending(true);

    try {
      const response = await aiService.chat(accessToken, selectedRepositoryId, {
        conversationId:
          activeConversation?.repositoryId === selectedRepositoryId
            ? activeConversation.id
            : undefined,
        question: trimmedQuestion,
      });

      setActiveConversation(response.conversation);
      setConversations((current) => [
        response.conversation,
        ...current.filter((conversation) => conversation.id !== response.conversation.id),
      ]);
      setQuestion('');
    } catch (requestError) {
      setError(getAssistantErrorMessage(requestError));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="w-full">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">AI assistant</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">
              Repository intelligence chat
            </h1>
          </div>
          <select
            className="h-10 rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            disabled={isLoading || repositories.length === 0}
            onChange={(event) => {
              setSelectedRepositoryId(event.target.value);
              setActiveConversation(null);
            }}
            value={selectedRepositoryId}
          >
            {repositories.map((repository) => (
              <option key={repository.id} value={repository.id}>
                {repository.fullName}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <div className="mb-6">
            <ErrorState
              message={error}
              recovery={getAssistantRecoveryMessage(error)}
              title="Assistant error"
            />
          </div>
        ) : null}

        {isLoading ? <LoadingState label="Loading assistant" /> : null}

        {!isLoading && repositories.length === 0 ? (
          <EmptyState
            action={
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent/90"
                href="/repositories/connect"
              >
                Add repository
              </Link>
            }
            description="Connect or upload a repository and run analysis before using the AI assistant."
            title="No repositories available"
          />
        ) : null}

        {!isLoading && repositories.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
            <aside className="rounded-lg border border-border bg-surface p-5 shadow-soft">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <MessageSquare aria-hidden="true" className="size-4 text-accent" />
                Conversations
              </div>
              {conversations.length > 0 ? (
                <div className="grid gap-2">
                  {conversations.map((conversation) => (
                    <div
                      className={
                        activeConversation?.id === conversation.id
                          ? 'grid gap-2 rounded-md border border-accent bg-slate-50 p-3'
                          : 'grid gap-2 rounded-md border border-border bg-white p-3'
                      }
                      key={conversation.id}
                    >
                      <button
                        className="min-w-0 text-left"
                        onClick={() => {
                          void handleSelectConversation(conversation.id);
                        }}
                        type="button"
                      >
                        <p className="truncate text-sm font-semibold text-foreground">
                          {conversation.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted">
                          {conversation.repositoryFullName}
                        </p>
                      </button>
                      <button
                        className="inline-flex h-8 items-center justify-center rounded-md border border-border text-xs font-medium text-muted hover:bg-slate-50"
                        onClick={() => {
                          void handleDeleteConversation(conversation.id);
                        }}
                        type="button"
                      >
                        <Trash2 aria-hidden="true" className="mr-2 size-3" />
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-muted">
                  No conversations yet. Select a repository, ask a question, and the assistant will
                  answer from stored scanner intelligence.
                </p>
              )}
            </aside>

            <section className="grid min-h-[36rem] grid-rows-[auto_1fr_auto] rounded-lg border border-border bg-surface shadow-soft">
              <div className="border-b border-border p-5">
                <p className="text-sm font-semibold text-foreground">
                  {selectedRepository?.fullName ?? 'Repository'}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {activeConversation?.model ?? 'OpenRouter'} / scanner-backed context
                </p>
              </div>

              <div className="grid content-start gap-5 overflow-y-auto p-5">
                {activeConversation?.messages.length ? (
                  activeConversation.messages.map((message) => (
                    <AssistantMessage key={message.id} message={message} />
                  ))
                ) : (
                  <EmptyState
                    action={
                      <Button
                        onClick={() => {
                          document.getElementById('assistant-question')?.focus();
                        }}
                        variant="secondary"
                      >
                        Ask first question
                      </Button>
                    }
                    description="Select a repository and send a question to start a scanner-backed conversation. The assistant will say when stored context is missing."
                    title="No active conversation"
                  />
                )}
              </div>

              <form
                className="border-t border-border p-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSubmit();
                }}
              >
                <label className="block" htmlFor="assistant-question">
                  <span className="text-sm font-medium text-foreground">Question</span>
                  <textarea
                    className="mt-2 min-h-28 w-full resize-y rounded-md border border-border bg-white px-3 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                    disabled={isSending || !selectedRepositoryId}
                    id="assistant-question"
                    onChange={(event) => {
                      setQuestion(event.target.value);
                    }}
                    placeholder="Explain this repository"
                    value={question}
                  />
                </label>
                <div className="mt-4 flex justify-end">
                  <Button
                    disabled={isSending || question.trim().length === 0 || !selectedRepositoryId}
                    type="submit"
                  >
                    <Send aria-hidden="true" className="mr-2 size-4" />
                    {isSending ? 'Sending' : 'Send'}
                  </Button>
                </div>
              </form>
            </section>
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
