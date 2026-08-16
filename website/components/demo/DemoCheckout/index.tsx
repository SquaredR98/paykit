'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react';
import { StripeClientAdapter } from '@squaredr/paykit/stripe/client';
import { RazorpayClientAdapter } from '@squaredr/paykit/razorpay/client';
import { PayPalClientAdapter } from '@squaredr/paykit/paypal/client';
import { createStripePaymentIntent, createRazorpayOrder, createPayPalOrder } from '@/app/actions/demo-payment';
import { CHECKOUT_APPEARANCE } from '@/lib/checkout-theme';
import { SplitView } from '@/components/demo/shared/SplitView';
import { CodePanel } from '@/components/demo/shared/CodePanel';
import './styles.css';

type Provider = 'stripe' | 'razorpay' | 'paypal';
type Step = 'product' | 'provider' | 'pay' | 'success';

const STEPS: { key: Step; label: string }[] = [
  { key: 'product', label: 'Product' },
  { key: 'provider', label: 'Provider' },
  { key: 'pay', label: 'Pay' },
  { key: 'success', label: 'Result' },
];

const PROVIDERS = {
  stripe: { name: 'Stripe', methods: 'Cards · Wallets · 3D Secure', amount: '$49.00', currency: 'USD' },
  razorpay: { name: 'Razorpay', methods: 'Cards · UPI · Netbanking', amount: '₹4,100', currency: 'INR' },
  paypal: { name: 'PayPal', methods: 'PayPal · Venmo · Cards', amount: '$49.00', currency: 'USD' },
};

interface DemoCheckoutProps {
  codeHtmls: Record<string, string>;
}

export function DemoCheckout({ codeHtmls }: DemoCheckoutProps) {
  const [step, setStep] = useState<Step>('product');
  const [provider, setProvider] = useState<Provider>('stripe');
  const [stripeSecret, setStripeSecret] = useState<string | null>(null);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  // Client adapters
  const stripeAdapter = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    return key ? new StripeClientAdapter(key, { disableLink: true, disableWallets: true, minimal: true }) : null;
  }, []);

  const razorpayAdapter = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    return key ? new RazorpayClientAdapter(key) : null;
  }, []);

  const paypalAdapter = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    return key ? new PayPalClientAdapter(key) : null;
  }, []);

  // Create payment intent/order when entering pay step
  useEffect(() => {
    if (step !== 'pay') return;
    if (provider === 'stripe' && !stripeSecret) {
      createStripePaymentIntent().then((res) => {
        if (res.clientSecret) setStripeSecret(res.clientSecret);
      });
    }
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
  }, [step, provider, stripeSecret, razorpayOrderId, paypalOrderId]);

  const handleSuccess = useCallback(() => setStep('success'), []);
  const handleError = useCallback(() => {}, []);

  const handleReset = useCallback(() => {
    setStep('product');
    setProvider('stripe');
    setStripeSecret(null);
    setRazorpayOrderId(null);
    setPaypalOrderId(null);
  }, []);

  const renderLeft = () => {
    switch (step) {
      case 'product':
        return (
          <div className="pk-checkout-demo__product">
            <div className="pk-checkout-demo__product-info">
              <div>
                <div className="pk-checkout-demo__product-title">Pro Plan — Monthly</div>
                <p className="pk-checkout-demo__product-desc">
                  Full access to all features. Cancel anytime. Demo product — no real charges.
                </p>
              </div>
              <span className="pk-checkout-demo__product-price">$49</span>
            </div>
            <button className="pk-checkout-demo__btn" onClick={() => setStep('provider')}>
              Continue to checkout
            </button>
          </div>
        );

      case 'provider':
        return (
          <div>
            <div className="pk-checkout-demo__providers">
              {(Object.keys(PROVIDERS) as Provider[]).map((p) => (
                <button
                  key={p}
                  className="pk-checkout-demo__provider"
                  role="radio"
                  aria-checked={provider === p}
                  onClick={() => setProvider(p)}
                >
                  <span className={`pk-checkout-demo__provider-slug pk-checkout-demo__provider-slug--${p}`}>
                    {p}
                  </span>
                  <span className="pk-checkout-demo__provider-main">
                    <span className="pk-checkout-demo__provider-name">{PROVIDERS[p].name}</span>
                    <span className="pk-checkout-demo__provider-methods">{PROVIDERS[p].methods}</span>
                  </span>
                  <span className="pk-checkout-demo__radio">{provider === p ? '✓' : ''}</span>
                </button>
              ))}
            </div>
            <div className="pk-checkout-demo__actions">
              <button className="pk-checkout-demo__btn" onClick={() => setStep('pay')}>
                Pay with {PROVIDERS[provider].name}
              </button>
              <button className="pk-checkout-demo__btn pk-checkout-demo__btn--secondary" onClick={() => setStep('product')}>
                Back
              </button>
            </div>
          </div>
        );

      case 'pay':
        return (
          <div className="pk-checkout-demo__form-area">
            {renderCheckout()}
            <div className="pk-checkout-demo__trust">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              Test mode — no actual charges
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="pk-checkout-demo__success">
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="pk-checkout-demo__success-title">Payment Successful</span>
            <span className="pk-checkout-demo__success-sub">
              Demo charge via {PROVIDERS[provider].name} — no real money was taken.
            </span>
            <button className="pk-checkout-demo__btn pk-checkout-demo__btn--secondary" onClick={handleReset} style={{ marginTop: 'var(--space-3)' }}>
              Start over
            </button>
          </div>
        );
    }
  };

  const renderCheckout = () => {
    if (provider === 'stripe' && stripeAdapter && stripeSecret) {
      return (
        <PayKitProvider clientAdapter={stripeAdapter} key={`stripe-${stripeSecret}`}>
          <CheckoutForm
            clientSecret={stripeSecret}
            submitLabel={`Pay ${PROVIDERS.stripe.amount}`}
            onSuccess={handleSuccess}
            onError={handleError}
            appearance={CHECKOUT_APPEARANCE}
            className="pk-checkout-demo__checkout-form"
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
            className="pk-checkout-demo__checkout-form"
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
            className="pk-checkout-demo__checkout-form"
          />
        </PayKitProvider>
      );
    }
    return (
      <div className="pk-checkout-demo__loading">
        <span>Loading checkout...</span>
      </div>
    );
  };

  // Map current step to code snippet key
  const codeKey = step === 'success' ? 'result' : step === 'pay' ? 'charge' : step;

  return (
    <div className="pk-checkout-demo">
      <div className="pk-checkout-demo__steps">
        {STEPS.map((s, i) => (
          <span
            key={s.key}
            className={`pk-checkout-demo__step${
              i === stepIndex ? ' pk-checkout-demo__step--active' : ''
            }${i < stepIndex ? ' pk-checkout-demo__step--done' : ''}`}
          >
            <span className="pk-checkout-demo__step-num">
              {i < stepIndex ? '✓' : i + 1}
            </span>
            {s.label}
          </span>
        ))}
      </div>
      <SplitView
        leftLabel="Buyer experience"
        rightLabel="Your code"
        left={renderLeft()}
        right={<CodePanel filename="checkout.ts" html={codeHtmls[codeKey] ?? ''} />}
      />
    </div>
  );
}
