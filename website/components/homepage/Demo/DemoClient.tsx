'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react';
import { StripeClientAdapter } from '@squaredr/paykit/stripe/client';
import { RazorpayClientAdapter } from '@squaredr/paykit/razorpay/client';
import { PayPalClientAdapter } from '@squaredr/paykit/paypal/client';
import {
  createStripeCardIntent,
  createRazorpayOrder,
  createPayPalOrder,
} from '@/app/actions/demo-payment';
import { CHECKOUT_APPEARANCE_V2 } from '@/lib/checkout-theme-v2';
import { CodeCard } from '@/components/ui';
import {
  DEMO_PROVIDERS,
  DEMO_PROVIDER_ORDER,
  type DemoProvider,
} from './providers';

type Status = 'idle' | 'success' | 'error';

/**
 * The interactive half of the demo.
 *
 * Adapted from the v1 LiveDemo, which already had a working integration — the
 * adapter wiring, server actions and reset flow are carried over rather than
 * rewritten. What is new is the Glass styling and the code panel beside it.
 *
 * Each provider's intent/order is created lazily, the first time that provider
 * is selected, so loading the page costs one Stripe call rather than three.
 */
export function DemoClient({
  snippets,
}: {
  snippets: Record<DemoProvider, string>;
}) {
  const [provider, setProvider] = useState<DemoProvider>('stripe');
  const [status, setStatus] = useState<Status>('idle');

  const [stripeSecret, setStripeSecret] = useState<string | null>(null);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);

  /*
   * Adapters are built once. A missing publishable key leaves the adapter null,
   * which renders the "not configured" state instead of throwing.
   */
  const stripeAdapter = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    return key
      ? new StripeClientAdapter(key, {
          disableLink: true,
          disableWallets: true,
          minimal: true,
        })
      : null;
  }, []);

  const razorpayAdapter = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    return key ? new RazorpayClientAdapter(key) : null;
  }, []);

  const paypalAdapter = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    /*
     * PayPal renders its own branded button and only allows the styling its SDK
     * exposes. Pill shape and 46px match our other CTAs, and `black` sits far
     * better on a dark glass panel than the default gold. The tagline is off
     * because it adds a line of PayPal marketing copy under the button.
     */
    return key
      ? new PayPalClientAdapter(key, {
          buttonStyle: {
            layout: 'horizontal',
            color: 'black',
            shape: 'pill',
            label: 'pay',
            height: 46,
            tagline: false,
          },
        })
      : null;
  }, []);

  // Stripe is the default tab, so its intent is created on mount.
  useEffect(() => {
    createStripeCardIntent().then((res) => {
      if (res.clientSecret) setStripeSecret(res.clientSecret);
    });
  }, []);

  useEffect(() => {
    if (provider === 'razorpay' && !razorpayOrderId) {
      createRazorpayOrder().then((res) => {
        if (res.clientSecret) setRazorpayOrderId(res.clientSecret);
      });
    }
    if (provider === 'paypal' && !paypalOrderId) {
      createPayPalOrder().then((res) => {
        if (res.clientSecret) setPaypalOrderId(res.clientSecret);
      });
    }
  }, [provider, razorpayOrderId, paypalOrderId]);

  const handleError = useCallback(() => {
    setStatus('error');
    setTimeout(() => setStatus('idle'), 3000);
  }, []);

  /* A used intent cannot be paid twice, so retrying mints a fresh one. */
  const handleReset = useCallback(() => {
    setStatus('idle');
    if (provider === 'stripe') {
      createStripeCardIntent().then((res) => {
        if (res.clientSecret) setStripeSecret(res.clientSecret);
      });
    } else if (provider === 'razorpay') {
      setRazorpayOrderId(null);
    } else {
      setPaypalOrderId(null);
    }
  }, [provider]);

  const config = DEMO_PROVIDERS[provider];

  const adapter =
    provider === 'stripe'
      ? stripeAdapter
      : provider === 'razorpay'
        ? razorpayAdapter
        : paypalAdapter;

  const clientSecret =
    provider === 'stripe'
      ? stripeSecret
      : provider === 'razorpay'
        ? razorpayOrderId
        : paypalOrderId;

  return (
    /*
     * One panel split 5fr / 7fr, per the design kit: the checkout is the left
     * cell with a hairline divider, the code side is the right cell on a sunken
     * surface. They are cells of the same container, not two floating cards.
     */
    <div className="pk-v2-demo">
      <span className="pk-v2-demo__shine" aria-hidden="true" />

      {/* ---------- checkout ---------- */}
      <div className="pk-v2-demo__checkout">
        <div className="pk-v2-seg" role="tablist" aria-label="Payment provider">
          {DEMO_PROVIDER_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={key === provider}
              className="pk-v2-seg__btn"
              disabled={status !== 'idle'}
              onClick={() => {
                setProvider(key);
                setStatus('idle');
              }}
            >
              {DEMO_PROVIDERS[key].name}
            </button>
          ))}
        </div>

        <div className="pk-v2-demo__order">
          <span className="pk-v2-demo__order-label">
            Pro plan · monthly
            <span className="pk-v2-demo__order-meta">{config.methods}</span>
          </span>
          <span className="pk-v2-demo__amount">{config.amount}</span>
        </div>

        {status === 'success' ? (
          <div className="pk-v2-demo__result">
            <CheckIcon />
            <span className="pk-v2-demo__result-title">Charge succeeded</span>
            <span className="pk-v2-demo__result-sub">
              Processed by {config.name}. Test mode — nothing was charged.
            </span>
            <button
              type="button"
              className="pk-v2-demo__retry"
              onClick={handleReset}
            >
              Run it again
            </button>
          </div>
        ) : adapter && clientSecret ? (
          <PayKitProvider
            clientAdapter={adapter}
            key={`${provider}-${clientSecret}`}
          >
            <CheckoutForm
              clientSecret={clientSecret}
              submitLabel={`Pay ${config.amount}`}
              onSuccess={() => setStatus('success')}
              onError={handleError}
              appearance={CHECKOUT_APPEARANCE_V2}
              /*
               * PayPal's adapter renders PayPal's own branded Buttons, and
               * those are what trigger the payment (via onApprove). Our submit
               * button would be a second, non-functional CTA for the same
               * action, so it is hidden for that provider only.
               *
               * Stripe renders card fields and Razorpay renders a placeholder —
               * both of those DO need our button, Razorpay's to open its modal.
               */
              className={
                provider === 'paypal'
                  ? 'pk-v2-demo__form pk-v2-demo__form--self-submit'
                  : 'pk-v2-demo__form'
              }
            />
          </PayKitProvider>
        ) : (
          <div className="pk-v2-demo__loading">
            {adapter ? 'Preparing checkout…' : `${config.name} is not configured`}
          </div>
        )}

        {status === 'error' && (
          <p className="pk-v2-demo__error">
            That payment did not go through. Try again.
          </p>
        )}

        {/* The test instructions differ per provider — a card number is no use
            on PayPal, which takes over with its own sandbox login. */}
        <p className="pk-v2-demo__fine">
          {provider === 'paypal' ? (
            <>Test mode. PayPal opens its sandbox — no real money moves.</>
          ) : provider === 'razorpay' ? (
            <>
              Test mode. Checkout opens on submit; use card{' '}
              <code>4111 1111 1111 1111</code>.
            </>
          ) : (
            <>
              Test mode. Use card <code>4242 4242 4242 4242</code>, any future
              expiry and any CVC.
            </>
          )}
        </p>
      </div>

      {/* ---------- code + response ---------- */}
      <div className="pk-v2-demo__code">
        <CodeCard html={snippets[provider]} filename="checkout.ts" />

        {/*
          Response panel, per the kit. The badge tracks the real request state,
          and the body shows the unified shape PayKit returns — which is the
          same for every provider, so it doubles as proof of the section's claim.
        */}
        <div className="pk-v2-codecard pk-v2-demo__response">
          <div className="pk-v2-codecard__bar">
            <span className="pk-v2-codecard__name">response</span>
            <span
              className={
                status === 'success'
                  ? 'pk-v2-badge pk-v2-badge--ok'
                  : status === 'error'
                    ? 'pk-v2-badge pk-v2-badge--err'
                    : 'pk-v2-badge pk-v2-badge--accent'
              }
            >
              {status === 'success' ? '200 OK' : status === 'error' ? 'failed' : 'idle'}
            </span>
          </div>
          <pre className="pk-v2-demo__response-body">
            {status === 'success'
              ? `{
  id: 'ch_...',
  provider: '${provider}',
  amount: ${provider === 'razorpay' ? 410000 : 4900},
  currency: '${config.currency}',
  status: 'succeeded',
}`
              : status === 'error'
                ? '// the charge did not go through'
                : '// pay above to run charges.create()'}
          </pre>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
