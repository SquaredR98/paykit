'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react';
import { StripeClientAdapter } from '@squaredr/paykit/stripe/client';
import { RazorpayClientAdapter } from '@squaredr/paykit/razorpay/client';
import { PayPalClientAdapter } from '@squaredr/paykit/paypal/client';
import { createStripePaymentIntent, createRazorpayOrder, createPayPalOrder } from '@/app/actions/demo-payment';
import { CHECKOUT_APPEARANCE } from '@/lib/checkout-theme';
import './styles.css';

type Provider = 'stripe' | 'razorpay' | 'paypal';
type PaymentMode = 'manual' | 'smart';
type PaymentStatus = 'idle' | 'success' | 'error';

const PROVIDERS = {
  stripe: {
    name: 'Stripe',
    methods: 'Cards · Wallets · 3D Secure',
    currency: 'USD',
    amount: '$49.00',
    badge: 'usd',
  },
  razorpay: {
    name: 'Razorpay',
    methods: 'Cards · UPI · Netbanking',
    currency: 'INR',
    amount: '₹4,100',
    badge: 'inr',
  },
  paypal: {
    name: 'PayPal',
    methods: 'PayPal · Venmo · Cards',
    currency: 'USD',
    amount: '$49.00',
    badge: 'usd',
  },
};

export function LiveDemo() {
  const [mode, setMode] = useState<PaymentMode>('manual');
  const [provider, setProvider] = useState<Provider>('stripe');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');

  const [stripeSecret, setStripeSecret] = useState<string | null>(null);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);

  // Initialize client adapters
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
    return key ? new PayPalClientAdapter(key) : null;
  }, []);

  // Fetch Stripe PaymentIntent on mount
  useEffect(() => {
    createStripePaymentIntent().then((res) => {
      if (res.clientSecret) setStripeSecret(res.clientSecret);
    });
  }, []);

  // Fetch Razorpay Order when provider switches to razorpay
  useEffect(() => {
    if (provider === 'razorpay' && !razorpayOrderId) {
      createRazorpayOrder().then((res) => {
        if (res.clientSecret) {
          setRazorpayOrderId(res.clientSecret);
        } else if (res.error) {
          console.error('Razorpay order creation failed:', res.error);
        }
      });
    }
  }, [provider, razorpayOrderId]);

  // Fetch PayPal Order when provider switches to paypal
  useEffect(() => {
    if (provider === 'paypal' && !paypalOrderId) {
      createPayPalOrder().then((res) => {
        if (res.clientSecret) {
          setPaypalOrderId(res.clientSecret);
        } else if (res.error) {
          console.error('PayPal order creation failed:', res.error);
        }
      });
    }
  }, [provider, paypalOrderId]);

  const handleSuccess = useCallback(() => {
    setPaymentStatus('success');
  }, []);

  const handleError = useCallback(() => {
    setPaymentStatus('error');
    setTimeout(() => setPaymentStatus('idle'), 3000);
  }, []);

  const handleReset = useCallback(() => {
    setPaymentStatus('idle');
    if (provider === 'stripe') {
      createStripePaymentIntent().then((res) => {
        if (res.clientSecret) setStripeSecret(res.clientSecret);
      });
    } else if (provider === 'razorpay') {
      setRazorpayOrderId(null);
      createRazorpayOrder().then((res) => {
        if (res.clientSecret) setRazorpayOrderId(res.clientSecret);
      });
    } else {
      setPaypalOrderId(null);
      createPayPalOrder().then((res) => {
        if (res.clientSecret) setPaypalOrderId(res.clientSecret);
      });
    }
  }, [provider]);

  const renderCheckout = () => {
    if (paymentStatus === 'success') {
      return (
        <div className="pk-demo__result pk-demo__result--success">
          <svg
            width="32"
            height="32"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span className="pk-demo__result-title">Payment Successful!</span>
          <span className="pk-demo__result-sub">Demo charge — no real money was taken.</span>
          <button type="button" className="pk-demo__result-btn" onClick={handleReset}>
            Try again
          </button>
        </div>
      );
    }

    if (paymentStatus === 'error') {
      return (
        <div className="pk-demo__result pk-demo__result--error">
          <svg
            width="32"
            height="32"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span className="pk-demo__result-title">Payment Failed</span>
          <span className="pk-demo__result-sub">Retrying...</span>
        </div>
      );
    }

    if (provider === 'stripe' && stripeAdapter && stripeSecret) {
      return (
        <PayKitProvider clientAdapter={stripeAdapter} key={`stripe-${stripeSecret}`}>
          <CheckoutForm
            clientSecret={stripeSecret}
            submitLabel={`Pay ${PROVIDERS.stripe.amount}`}
            onSuccess={handleSuccess}
            onError={handleError}
            appearance={CHECKOUT_APPEARANCE}
            className="pk-demo__checkout-form"
          />
        </PayKitProvider>
      );
    }

    if (provider === 'razorpay' && razorpayAdapter && razorpayOrderId) {
      return (
        <PayKitProvider clientAdapter={razorpayAdapter} key={`razorpay-${razorpayOrderId}`}>
          <CheckoutForm
            clientSecret={razorpayOrderId}
            submitLabel={`Pay ${PROVIDERS.razorpay.amount}`}
            onSuccess={handleSuccess}
            onError={handleError}
            appearance={CHECKOUT_APPEARANCE}
            className="pk-demo__checkout-form"
          />
        </PayKitProvider>
      );
    }

    if (provider === 'paypal' && paypalAdapter && paypalOrderId) {
      return (
        <PayKitProvider clientAdapter={paypalAdapter} key={`paypal-${paypalOrderId}`}>
          <CheckoutForm
            clientSecret={paypalOrderId}
            submitLabel={`Pay ${PROVIDERS.paypal.amount}`}
            onSuccess={handleSuccess}
            onError={handleError}
            appearance={CHECKOUT_APPEARANCE}
            className="pk-demo__checkout-form"
          />
        </PayKitProvider>
      );
    }

    return (
      <div className="pk-demo__loading">
        <span>Loading checkout...</span>
      </div>
    );
  };

  const currentAmount = PROVIDERS[provider].amount;
  const currentCurrency = PROVIDERS[provider].currency;

  return (
    <section className="">
      <div className="">
        <div className="pk-sechead pk-sechead--center">
          <span className="pk-eyebrow">Live demo</span>
          <h2 className="pk-sec-title">Try it live</h2>
          <p className="pk-lede">
            Real Stripe, Razorpay, and PayPal test payments. Pick a provider manually, or let PaymentRouter
            choose based on currency.
          </p>
        </div>
      </div>
      <div className="pk-blk">
        <div className="pk-demo">
          <div className="pk-demo__left">
            <div className="pk-demo__summary">
              <div className="pk-demo__item">
                <span className="pk-demo__item-details">
                  <span className="pk-demo__item-title">
                    <span className="pk-note">1 ×</span>Pro Plan
                  </span>
                  <span className="pk-demo__item-desc">
                    Example product — test a real checkout flow
                  </span>
                </span>
                <span className="pk-demo__amt">{currentAmount}</span>
              </div>
              <div className="pk-demo__total">
                <div className="pk-demo__subtotal">
                  <span>Subtotal</span>
                  <span className="pk-demo__amt pk-demo__amt--sm">{currentAmount}</span>
                </div>
                <div className="pk-demo__total-row">
                  <span className="pk-demo__total-label">Total</span>
                  <span className="pk-demo__amt pk-demo__amt--lg">
                    {currentAmount}
                    <span className="pk-demo__ccy">{currentCurrency}</span>
                  </span>
                </div>
                <span className="pk-note">Demo mode — no real charges</span>
              </div>
            </div>
          </div>

          <div className="pk-demo__right">
            <div className="pk-demo__tabs" role="tablist">
              <button
                role="tab"
                aria-selected={mode === 'manual'}
                onClick={() => setMode('manual')}
                disabled={paymentStatus !== 'idle'}
              >
                Choose provider
              </button>
              <button
                role="tab"
                aria-selected={mode === 'smart'}
                onClick={() => setMode('smart')}
                disabled={paymentStatus !== 'idle'}
              >
                Smart routing
              </button>
            </div>

            {mode === 'manual' ? (
              <div className="pk-demo__providers">
                {(Object.keys(PROVIDERS) as Provider[]).map((p) => (
                  <button
                    key={p}
                    className="pk-demo__provider"
                    role="radio"
                    aria-checked={provider === p}
                    onClick={() => {
                      setProvider(p);
                      setPaymentStatus('idle');
                    }}
                    disabled={paymentStatus !== 'idle'}
                  >
                    <span className={`pk-demo__provider-slug pk-demo__provider-slug--${p}`}>
                      {p}
                    </span>
                    <span className="pk-demo__provider-main">
                      <span className="pk-demo__provider-name">{PROVIDERS[p].name}</span>
                      <span className="pk-demo__provider-methods">{PROVIDERS[p].methods}</span>
                    </span>
                    <span className="pk-bdg pk-bdg--neutral pk-bdg--plain">{PROVIDERS[p].badge}</span>
                    <span className="pk-demo__radio">{provider === p ? '✓' : ''}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="pk-demo__routing">
                <div className="pk-demo__routing-header">
                  <span className="pk-eyebrow">PaymentRouter</span>
                </div>
                <div className="pk-demo__rule">
                  <span>currency === 'INR'</span>
                  <span className="pk-demo__arrow">→</span>
                  <span className="pk-bdg pk-bdg--accent pk-bdg--plain">razorpay</span>
                </div>
                <div className="pk-demo__rule">
                  <span>currency === 'EUR'</span>
                  <span className="pk-demo__arrow">→</span>
                  <span className="pk-bdg pk-bdg--accent pk-bdg--plain">paypal</span>
                </div>
                <div className="pk-demo__rule">
                  <span>fallback</span>
                  <span className="pk-demo__arrow">→</span>
                  <span className="pk-bdg pk-bdg--accent pk-bdg--plain">stripe</span>
                </div>
              </div>
            )}

            <div className="pk-demo__checkout">{renderCheckout()}</div>

            <span className="pk-demo__trust">
              <svg
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              Powered by real PayKit adapters. Test mode — no actual charges.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
