import { cn } from '@/utils/cn';

import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ className, id, label, ...props }: InputProps): ReactNode {
  const inputId = id ?? props.name;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        className={cn(
          'mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-slate-50',
          className,
        )}
        id={inputId}
        {...props}
      />
    </label>
  );
}
