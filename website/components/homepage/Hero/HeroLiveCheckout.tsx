'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { StripeClientAdapter } from '@squaredr/paykit/stripe/client';
import { RazorpayClientAdapter } from '@squaredr/paykit/razorpay/client';
import { PayPalClientAdapter } from '@squaredr/paykit/paypal/client';
import {
  createStripePaymentIntent,
  createRazorpayOrder,
  createPayPalOrder,
} from '@/app/actions/demo-payment';
import { HeroCheckoutCard } from './HeroCheckoutCard';
import { HeroPayPalCard } from './HeroPayPalCard';
import { HeroCodeCard } from './HeroCodeCard';

type CardId = 'stripe' | 'razorpay' | 'paypal' | 'code';

const CARDS: { id: CardId; label: string }[] = [
  { id: 'stripe', label: 'Stripe' },
  { id: 'razorpay', label: 'Razorpay' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'code', label: 'Code' },
];

export function HeroLiveCheckout({ codeHtml }: { codeHtml: string }) {
  const [active, setActive] = useState<CardId>('stripe');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [stripeSecret, setStripeSecret] = useState<string | null>(null);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);

  const [initialized, setInitialized] = useState<Set<CardId>>(new Set(['stripe']));
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

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
    return key
      ? new PayPalClientAdapter(key, {
          disableCardFields: true,
          buttonStyle: {
            layout: 'vertical',
            color: 'black',
            shape: 'sharp',
            label: 'paypal',
            height: 45,
            borderRadius: 0,
            tagline: false,
          },
        })
      : null;
  }, []);

  // Fetch Stripe PaymentIntent on mount
  useEffect(() => {
    let cancelled = false;
    createStripePaymentIntent().then((res) => {
      if (!cancelled && res.clientSecret) setStripeSecret(res.clientSecret);
    });
    return () => { cancelled = true; };
  }, []);

  // Lazy-init Razorpay
  useEffect(() => {
    if (!initialized.has('razorpay') || razorpayOrderId) return;
    let cancelled = false;
    createRazorpayOrder().then((res) => {
      if (!cancelled && res.clientSecret) setRazorpayOrderId(res.clientSecret);
    });
    return () => { cancelled = true; };
  }, [initialized, razorpayOrderId]);

  // Lazy-init PayPal
  useEffect(() => {
    if (!initialized.has('paypal') || paypalOrderId) return;
    let cancelled = false;
    createPayPalOrder().then((res) => {
      if (!cancelled && res.clientSecret) setPaypalOrderId(res.clientSecret);
    });
    return () => { cancelled = true; };
  }, [initialized, paypalOrderId]);

  const handleTabClick = useCallback(
    (id: CardId) => {
      if (paymentStatus !== 'idle') return;
      setActive(id);
      if (!initialized.has(id)) {
        setInitialized((prev) => new Set(prev).add(id));
      }
    },
    [paymentStatus, initialized],
  );

  const handleSuccess = useCallback(() => {
    setPaymentStatus('success');
    setTimeout(() => {
      if (!mountedRef.current) return;
      setPaymentStatus('idle');
      if (active === 'stripe') {
        createStripePaymentIntent().then((res) => {
          if (mountedRef.current && res.clientSecret) setStripeSecret(res.clientSecret);
        });
      } else if (active === 'razorpay') {
        setRazorpayOrderId(null);
      } else if (active === 'paypal') {
        setPaypalOrderId(null);
      }
    }, 2000);
  }, [active]);

  const handleError = useCallback(() => {
    setPaymentStatus('error');
    setTimeout(() => {
      if (mountedRef.current) setPaymentStatus('idle');
    }, 2000);
  }, []);

  const renderContent = () => {
    if (active === 'code') {
      return <HeroCodeCard key="code" html={codeHtml} />;
    }

    if (paymentStatus === 'success') {
      return (
        <div className="pk-deck__overlay pk-deck__overlay--success">
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>Payment successful</span>
        </div>
      );
    }
    if (paymentStatus === 'error') {
      return (
        <div className="pk-deck__overlay pk-deck__overlay--error">
          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="16" cy="16" r="10" />
            <line x1="19" y1="13" x2="13" y2="19" />
            <line x1="13" y1="13" x2="19" y2="19" />
          </svg>
          <span>Payment failed</span>
        </div>
      );
    }

    if (active === 'stripe' && stripeAdapter && stripeSecret) {
      return (
        <HeroCheckoutCard
          key={`stripe-${stripeSecret}`}
          adapter={stripeAdapter}
          clientSecret={stripeSecret}
          submitLabel="Pay $49.00"
          onSuccess={handleSuccess}
          onError={handleError}
        />
      );
    }

    if (active === 'razorpay' && razorpayAdapter && razorpayOrderId) {
      return (
        <HeroCheckoutCard
          key={`razorpay-${razorpayOrderId}`}
          adapter={razorpayAdapter}
          clientSecret={razorpayOrderId}
          submitLabel="Pay ₹4,100"
          onSuccess={handleSuccess}
          onError={handleError}
        />
      );
    }

    if (active === 'paypal' && paypalAdapter && paypalOrderId) {
      return (
        <HeroPayPalCard
          key={`paypal-${paypalOrderId}`}
          adapter={paypalAdapter}
          clientSecret={paypalOrderId}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      );
    }

    return (
      <div className="pk-deck__loading">
        <span>Loading checkout...</span>
      </div>
    );
  };

  return (
    <div className="pk-deck pk-deck--fade-in">
      <div className="pk-deck__tabs" role="tablist">
        {CARDS.map((card) => (
          <button
            key={card.id}
            role="tab"
            aria-selected={active === card.id}
            className={`pk-deck__tab pk-deck__tab--${card.id}`}
            onClick={() => handleTabClick(card.id)}
          >
            {card.label}
          </button>
        ))}
      </div>
      <div className="pk-deck__panel" key={active}>
        {renderContent()}
      </div>
    </div>
  );
}
