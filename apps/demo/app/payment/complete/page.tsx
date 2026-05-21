'use client';

import { useEffect, useState } from 'react';
import { handleRedirectReturn } from '@squaredr/paykit-js';
import type { RedirectResult } from '@squaredr/paykit-js';
import Link from 'next/link';

export default function PaymentCompletePage() {
  const [result, setResult] = useState<RedirectResult | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const redirectResult = handleRedirectReturn();
    setResult(redirectResult);
    setChecked(true);
  }, []);

  if (!checked) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="flex items-center gap-2 text-sm text-sr-text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-sr-accent animate-pulse" />
          Checking payment status...
        </div>
      </main>
    );
  }

  const statusConfig = result
    ? {
        succeeded: { color: 'var(--sr-success)', icon: '✓', title: 'Payment Succeeded', message: 'Your payment was completed after 3D Secure verification.' },
        failed: { color: 'var(--sr-error)', icon: '✕', title: 'Payment Failed', message: '3D Secure verification failed. Please try again.' },
        pending: { color: 'var(--sr-warn)', icon: '⏳', title: 'Payment Pending', message: 'Your payment is still being processed. Please check back shortly.' },
      }[result.status]
    : null;

  return (
    <main className="flex-1 flex items-center justify-center p-6 sr-dotgrid">
      <div className="w-full max-w-md rounded-xl border border-sr-border-strong bg-sr-surface p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          {statusConfig && (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
              style={{
                background: `color-mix(in srgb, ${statusConfig.color}, transparent 88%)`,
                border: `1px solid color-mix(in srgb, ${statusConfig.color}, transparent 70%)`,
              }}
            >
              {statusConfig.icon}
            </div>
          )}
          <h2 className="text-xl font-semibold tracking-[-0.01em]">
            {statusConfig?.title ?? 'Payment Return'}
          </h2>
        </div>

        {/* Message */}
        {statusConfig && (
          <div
            className="rounded-lg px-4 py-3 text-sm"
            style={{
              background: `color-mix(in srgb, ${statusConfig.color}, transparent 92%)`,
              border: `1px solid color-mix(in srgb, ${statusConfig.color}, transparent 85%)`,
            }}
          >
            <p>{statusConfig.message}</p>
          </div>
        )}

        {!result && (
          <div className="rounded-lg px-4 py-3 text-sm border border-sr-border-strong bg-sr-surface-hover">
            <p className="text-sr-text-dim">
              This page handles 3DS redirect returns. It appears you navigated here directly.
            </p>
          </div>
        )}

        {/* Payment ID */}
        {result?.paymentIntentId && (
          <div className="flex justify-between text-sm">
            <span className="text-sr-text-muted font-mono text-xs uppercase tracking-wider">Payment ID</span>
            <code className="font-mono text-xs text-sr-text-dim">{result.paymentIntentId}</code>
          </div>
        )}

        {/* Back */}
        <Link
          href="/"
          className="block w-full h-10 rounded-full bg-sr-accent text-center leading-10 text-sm font-medium text-(--sr-ink-950) transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_24px_-4px_color-mix(in_srgb,var(--sr-accent),transparent_60%)] active:scale-[0.97]"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
