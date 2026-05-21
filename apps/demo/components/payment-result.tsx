'use client';

import type { PaymentConfirmResult } from '@squaredr/paykit';
import Link from 'next/link';

interface PaymentResultProps {
  result: PaymentConfirmResult;
  chargeId: string | null;
  provider: string;
}

export function PaymentResult({ result, chargeId, provider }: PaymentResultProps) {
  const isSuccess = result.status === 'succeeded';
  const isFailed = result.status === 'failed' || !!result.error;

  const accentColor = isSuccess ? 'var(--sr-success)' : isFailed ? 'var(--sr-error)' : 'var(--sr-warn)';

  return (
    <div className="w-full max-w-md rounded-xl border border-sr-border-strong bg-sr-surface p-8 space-y-6">
      {/* Status icon */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
          style={{
            background: `color-mix(in srgb, ${accentColor}, transparent 88%)`,
            border: `1px solid color-mix(in srgb, ${accentColor}, transparent 70%)`,
          }}
        >
          {isSuccess ? '✓' : isFailed ? '✕' : '⏳'}
        </div>
        <h2 className="text-xl font-semibold tracking-[-0.01em]">
          {isSuccess ? 'Payment Successful' : isFailed ? 'Payment Failed' : 'Payment Pending'}
        </h2>
      </div>

      {/* Message */}
      <div
        className="rounded-lg px-4 py-3 text-sm"
        style={{
          background: `color-mix(in srgb, ${accentColor}, transparent 92%)`,
          border: `1px solid color-mix(in srgb, ${accentColor}, transparent 85%)`,
        }}
      >
        {isSuccess && (
          <p>Your demo payment of $25.00 was processed via {provider}.</p>
        )}
        {isFailed && (
          <p className="text-destructive">
            {result.error?.message ?? 'Payment could not be completed.'}
          </p>
        )}
        {!isSuccess && !isFailed && (
          <p>Payment is still processing. Status: {result.status}</p>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-sr-text-muted font-mono text-xs uppercase tracking-wider">Status</span>
          <span className="font-mono text-xs" style={{ color: accentColor }}>{result.status}</span>
        </div>
        {chargeId && (
          <div className="flex justify-between">
            <span className="text-sr-text-muted font-mono text-xs uppercase tracking-wider">Charge ID</span>
            <code className="font-mono text-xs text-sr-text-dim">{chargeId}</code>
          </div>
        )}
        {result.chargeId && result.chargeId !== chargeId && (
          <div className="flex justify-between">
            <span className="text-sr-text-muted font-mono text-xs uppercase tracking-wider">Provider ID</span>
            <code className="font-mono text-xs text-sr-text-dim">{result.chargeId}</code>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-sr-text-muted font-mono text-xs uppercase tracking-wider">Provider</span>
          <span className="font-mono text-xs text-sr-text-dim">{provider}</span>
        </div>
      </div>

      {/* Back button */}
      <Link
        href="/"
        className="block w-full h-10 rounded-full bg-sr-accent text-center leading-10 text-sm font-medium text-(--sr-ink-950) transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_24px_-4px_color-mix(in_srgb,var(--sr-accent),transparent_60%)] active:scale-[0.97]"
      >
        Back to Home
      </Link>
    </div>
  );
}
