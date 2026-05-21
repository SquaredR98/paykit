'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <main className="flex-1 flex items-center justify-center p-6 sr-dotgrid relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-[color-mix(in_srgb,var(--sr-error),transparent_96%)] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Error icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-sr-error/30 bg-sr-error/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-sr-error" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        </div>

        {/* Error message */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-sr-text-dim leading-relaxed">
            An unexpected error occurred while processing your request. This has been logged and we'll look into it.
          </p>
          {error.digest && (
            <p className="text-xs text-sr-text-muted font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full h-11 rounded-full bg-sr-accent text-sr-ink-950 font-medium text-sm hover:brightness-110 transition-all hover:shadow-[0_0_24px_-4px_color-mix(in_srgb,var(--sr-accent),transparent_60%)] active:scale-[0.97]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="w-full h-11 rounded-full border border-sr-border-strong text-foreground font-medium text-sm hover:bg-sr-surface-hover transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Go home
          </Link>
        </div>

        {/* Debug info (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6">
            <summary className="cursor-pointer text-xs text-sr-text-muted font-mono hover:text-sr-text-dim transition-colors">
              Show error details
            </summary>
            <div className="mt-3 p-4 rounded-lg bg-sr-ink-900 border border-sr-ink-800">
              <pre className="text-[11px] text-sr-error font-mono overflow-x-auto whitespace-pre-wrap break-words">
                {error.message}
                {'\n\n'}
                {error.stack}
              </pre>
            </div>
          </details>
        )}
      </div>
    </main>
  );
}
