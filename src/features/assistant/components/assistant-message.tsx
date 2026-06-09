import { Bot, UserRound } from 'lucide-react';

import type { AiMessage } from '@/types/ai';
import type { ReactNode } from 'react';

export interface AssistantMessageProps {
  message: AiMessage;
}

function renderMarkdown(content: string): ReactNode[] {
  const lines = content.split(/\r?\n/);
  const nodes: ReactNode[] = [];
  let codeLines: string[] = [];
  let isCodeBlock = false;

  lines.forEach((line, index) => {
    if (line.startsWith('```')) {
      if (isCodeBlock) {
        nodes.push(
          <pre
            className="my-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50"
            key={`code-${index.toString()}`}
          >
            <code>{codeLines.join('\n')}</code>
          </pre>,
        );
        codeLines = [];
        isCodeBlock = false;
        return;
      }

      isCodeBlock = true;
      codeLines = [];
      return;
    }

    if (isCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (line.startsWith('### ')) {
      nodes.push(
        <h3 className="mt-4 text-sm font-semibold text-foreground" key={`h3-${index.toString()}`}>
          {line.slice(4)}
        </h3>,
      );
      return;
    }

    if (line.startsWith('## ')) {
      nodes.push(
        <h2 className="mt-4 text-base font-semibold text-foreground" key={`h2-${index.toString()}`}>
          {line.slice(3)}
        </h2>,
      );
      return;
    }

    if (line.startsWith('- ')) {
      nodes.push(
        <p className="pl-4 text-sm leading-6 text-foreground" key={`li-${index.toString()}`}>
          <span className="mr-2 text-muted">-</span>
          {line.slice(2)}
        </p>,
      );
      return;
    }

    if (line.trim().length === 0) {
      nodes.push(<div className="h-2" key={`space-${index.toString()}`} />);
      return;
    }

    nodes.push(
      <p className="text-sm leading-6 text-foreground" key={`p-${index.toString()}`}>
        {line}
      </p>,
    );
  });

  if (codeLines.length > 0) {
    nodes.push(
      <pre
        className="my-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50"
        key="code-open"
      >
        <code>{codeLines.join('\n')}</code>
      </pre>,
    );
  }

  return nodes;
}

export function AssistantMessage({ message }: AssistantMessageProps): ReactNode {
  const isAssistant = message.role === 'ASSISTANT';

  return (
    <article className="grid grid-cols-[2.5rem_1fr] gap-3">
      <div
        className={
          isAssistant
            ? 'flex size-10 items-center justify-center rounded-md border border-border bg-slate-50 text-accent'
            : 'flex size-10 items-center justify-center rounded-md border border-border bg-white text-foreground'
        }
      >
        {isAssistant ? (
          <Bot aria-hidden="true" className="size-5" />
        ) : (
          <UserRound aria-hidden="true" className="size-5" />
        )}
      </div>
      <div className="rounded-lg border border-border bg-surface p-4 shadow-soft">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">
            {isAssistant ? 'CodeAtlas' : 'You'}
          </p>
          <p className="text-xs text-muted">{message.createdAt}</p>
        </div>
        <div className="grid gap-1">{renderMarkdown(message.content)}</div>
      </div>
    </article>
  );
}
