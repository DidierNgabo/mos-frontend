'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronsUpDown, Loader2, Search } from 'lucide-react';
import { ObservationsSource } from '@/app/source';
import { Button } from '@/app/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DiagnosisOption {
  code: string;
  title: string;
}

interface DiagnosisComboboxProps {
  code: string | null;
  title: string;
  onChange: (diagnosis: DiagnosisOption | null) => void;
  hasError?: boolean;
}

export function DiagnosisCombobox({
  code,
  title,
  onChange,
  hasError = false,
}: DiagnosisComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<DiagnosisOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    const query = search.trim();
    if (query.length < 2) {
      setResults([]);
      setError('');
      setIsLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await ObservationsSource.searchDiagnosesRequest(
          query,
          30,
        );
        if (currentRequest === requestId.current) {
          setResults(response?.items ?? []);
        }
      } catch {
        if (currentRequest === requestId.current) {
          setResults([]);
          setError('Unable to load diagnoses. Please try again.');
        }
      } finally {
        if (currentRequest === requestId.current) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const close = () => {
    requestId.current += 1;
    setOpen(false);
    setSearch('');
    setResults([]);
    setError('');
    setIsLoading(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) close();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full min-h-12 h-auto justify-between rounded-xl bg-white/50 dark:bg-black/50 px-3 py-2 font-normal',
            hasError && 'border-destructive',
          )}
        >
          <span
            className={cn(
              'min-w-0 truncate text-left',
              !code && code !== null && 'text-muted-foreground',
            )}
          >
            {code
              ? `${code} — ${title}`
              : code === null
                ? 'Other diagnosis'
                : 'Search ICD-11 diagnosis...'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl"
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by ICD code or title..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            onChange(null);
            close();
          }}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm border-b border-border hover:bg-muted/60"
        >
          <Check
            className={cn(
              'h-4 w-4 text-primary',
              code === null ? 'opacity-100' : 'opacity-0',
            )}
          />
          <span>
            <span className="font-medium">Other diagnosis</span>
            <span className="block text-xs text-muted-foreground">
              Enter a diagnosis that is not in ICD-11
            </span>
          </span>
        </button>

        <div className="max-h-64 overflow-y-auto py-1">
          {search.trim().length < 2 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search.
            </p>
          ) : error ? (
            <p className="px-3 py-4 text-center text-sm text-destructive">
              {error}
            </p>
          ) : !isLoading && results.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              No ICD-11 diagnoses found.
            </p>
          ) : (
            results.map((diagnosis) => (
              <button
                key={diagnosis.code}
                type="button"
                onClick={() => {
                  onChange(diagnosis);
                  close();
                }}
                className="w-full flex items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted/60"
              >
                <Check
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0 text-primary',
                    code === diagnosis.code ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <span className="min-w-0">
                  <span className="font-semibold">{diagnosis.code}</span>
                  <span className="text-muted-foreground">
                    {' '}
                    — {diagnosis.title}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
