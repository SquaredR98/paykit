'use client';

import { useEffect, useRef } from 'react';
import { PayKitProvider, CardInput } from '@squaredr/paykit-react';
import type { ClientAdapter } from '@squaredr/paykit';
import { CHECKOUT_APPEARANCE } from '@/lib/checkout-theme';

interface HeroPayPalCardProps {
  adapter: ClientAdapter;
  clientSecret: string;
  onSuccess: () => void;
  onError: () => void;
}

/**
 * PayPal-specific hero card.
 *
 * Unlike Stripe/Razorpay, PayPal Buttons render their own clickable UI —
 * there is no separate CTA needed. The adapter's `mount()` renders the
 * PayPal button, and `onApprove` fires when the user completes approval.
 *
 * We listen for the adapter's `change` event with `complete: true` to
 * detect successful approval, and the `error` event for failures.
 */
export function HeroPayPalCard({
  adapter,
  clientSecret,
  onSuccess,
  onError,
}: HeroPayPalCardProps) {
  const calledRef = useRef(false);

  useEffect(() => {
    calledRef.current = false;

    const handleChange = (event: any) => {
      if (event.data?.complete && !calledRef.current) {
        calledRef.current = true;
        onSuccess();
      }
    };

    const handleError = () => {
      if (!calledRef.current) {
        calledRef.current = true;
        onError();
      }
    };

    adapter.on('change', handleChange);
    adapter.on('error', handleError);

    return () => {
      adapter.off('change', handleChange);
      adapter.off('error', handleError);
    };
  }, [adapter, onSuccess, onError]);

  return (
    <PayKitProvider clientAdapter={adapter}>
      <div className="pk-deck__paypal-wrap" style={{ colorScheme: 'none' }}>
        <CardInput
          clientSecret={clientSecret}
          appearance={CHECKOUT_APPEARANCE}
        />
      </div>
    </PayKitProvider>
  );
}
