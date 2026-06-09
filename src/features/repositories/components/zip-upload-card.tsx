'use client';

import { Upload } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import type { ChangeEvent, ReactNode } from 'react';

export interface ZipUploadCardProps {
  isUploading: boolean;
  onUpload: (file: File) => void;
}

export function ZipUploadCard({ isUploading, onUpload }: ZipUploadCardProps): ReactNode {
  const [file, setFile] = useState<File | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    setFile(event.target.files?.[0] ?? null);
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-soft">
      <div className="flex gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-slate-50 text-accent">
          <Upload aria-hidden="true" className="size-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">Upload ZIP</h2>
          <p className="mt-1 text-sm leading-6 text-muted">Add a local project archive.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-foreground">
            ZIP project archive
          </span>
          <input
            accept=".zip,application/zip,application/x-zip-compressed"
            className="block w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
            onChange={handleFileChange}
            type="file"
          />
        </label>
        <Button
          className="self-end"
          disabled={!file || isUploading}
          onClick={() => {
            if (file) {
              onUpload(file);
            }
          }}
        >
          {isUploading ? 'Uploading' : 'Upload ZIP'}
        </Button>
      </div>
    </section>
  );
}
