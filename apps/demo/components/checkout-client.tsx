'use client';

import { useState, useEffect, useMemo } from 'react';
import { StripeClientAdapter } from '@squaredr/paykit-stripe/client';
import { RazorpayClientAdapter } from '@squaredr/paykit-razorpay/client';
import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react';
import type { PaymentConfirmResult } from '@squaredr/paykit';
import { PaymentResult } from './payment-result';

interface CheckoutClientProps {
  provider: 'stripe' | 'razorpay';
}

export function CheckoutClient({ provider }: CheckoutClientProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentConfirmResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const publicKey =
    provider === 'stripe'
      ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? 'pk_test_mock'
      : process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? 'rzp_test_mock';

  const clientAdapter = useMemo(() => {
    if (provider === 'stripe') {
      return new StripeClientAdapter(publicKey);
    }
    return new RazorpayClientAdapter(publicKey);
  }, [provider, publicKey]);

  useEffect(() => {
    async function createIntent() {
      try {
        const res = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: 2500,
            currency: 'usd',
            provider,
            description: 'Boost Weekly — $25.00',
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to create payment intent');
        }

        const data = await res.json();
        setClientSecret(data.clientSecret);
        setChargeId(data.chargeId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    }

    createIntent();
  }, [provider]);

  if (result) {
    return <PaymentResult result={result} chargeId={chargeId} provider={provider} />;
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-sr-border-strong bg-sr-surface p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Checkout</h2>
          <span className="font-mono text-xs uppercase tracking-wider text-sr-accent px-2 py-0.5 rounded-full border border-sr-accent/15 bg-sr-accent/8">
            {provider}
          </span>
        </div>
        <p className="text-sm text-sr-text-dim">Demo payment of $25.00 USD</p>
      </div>

      <div className="h-px bg-border" />

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-sr-text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-sr-accent animate-pulse" />
          Creating payment...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="space-y-3">
          <div className="rounded-lg border border-[color-mix(in_srgb,var(--sr-error),transparent_85%)] bg-[color-mix(in_srgb,var(--sr-error),transparent_92%)] px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full h-9 rounded-full border border-sr-border-strong text-sm font-medium text-foreground transition-all duration-200 hover:bg-sr-surface-hover hover:border-sr-accent/30"
          >
            Retry
          </button>
        </div>
      )}

      {/* Checkout form */}
      {clientSecret && (
        <PayKitProvider clientAdapter={clientAdapter}>
          <CheckoutForm
            clientSecret={clientSecret}
            submitLabel="Pay $25.00"
            returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/payment/complete`}
            onSuccess={(r) => setResult(r)}
            onError={(err) => setError(err.message)}
            className="space-y-4"
          />
        </PayKitProvider>
      )}

      {/* Amount summary */}
      <div className="flex items-center justify-between pt-2 border-t border-border text-sm">
        <span className="text-sr-text-muted font-mono text-xs">Total</span>
        <span className="font-semibold">$25.00</span>
      </div>
    </div>
  );
}
