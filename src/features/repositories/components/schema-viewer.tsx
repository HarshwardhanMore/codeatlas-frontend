import type { ReactNode } from 'react';

export interface SchemaViewerProps {
  label: string;
  value: unknown;
}

function stringifySchema(value: unknown): string {
  if (value === null || value === undefined) {
    return 'Not detected';
  }

  return JSON.stringify(value, null, 2);
}

export function SchemaViewer({ label, value }: SchemaViewerProps): ReactNode {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-soft">
      <h2 className="text-sm font-semibold text-foreground">{label}</h2>
      <pre className="mt-4 max-h-[28rem] overflow-auto rounded-md border border-border bg-slate-950 p-4 text-xs leading-6 text-slate-100">
        {stringifySchema(value)}
      </pre>
    </section>
  );
}
