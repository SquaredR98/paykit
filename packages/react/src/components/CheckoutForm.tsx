import { useState, useContext, type FormEvent, type ReactNode, type CSSProperties } from 'react';
import type { AppearanceConfig, PaymentConfirmResult } from '@squaredr/paykit-js';
import { PayKitContext } from '../context/PayKitContext.js';
import { CardInput } from './CardInput.js';
import { injectThemeVariables } from '../theme.js';

interface CheckoutFormProps {
  clientSecret: string;
  appearance?: AppearanceConfig;
  returnUrl?: string;
  submitLabel?: string;
  className?: string;
  style?: CSSProperties;
  onSuccess?: (result: PaymentConfirmResult) => void;
  onError?: (error: Error) => void;
  children?: ReactNode;
}

export function CheckoutForm({
  clientSecret,
  appearance,
  returnUrl,
  submitLabel = 'Pay',
  className,
  style,
  onSuccess,
  onError,
  children,
}: CheckoutFormProps) {
  const { client, isReady } = useContext(PayKitContext);
  const [loading, setLoading] = useState(false);
  const [cardReady, setCardReady] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!client || loading) return;

    setLoading(true);
    try {
      const result = await client.confirmPayment(clientSecret, { returnUrl });
      if (result.error) {
        onError?.(new Error(result.error.message));
      } else {
        onSuccess?.(result);
      }
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const themeStyle = injectThemeVariables(appearance?.variables);
  const mergedStyle = { ...themeStyle, ...style };

  return (
    <form onSubmit={handleSubmit} className={className} style={mergedStyle} data-paykit-form>
      <CardInput
        clientSecret={clientSecret}
        appearance={appearance}
        onReady={() => setCardReady(true)}
        onError={onError}
      />
      {children}
      <button
        type="submit"
        disabled={!isReady || !cardReady || loading}
        data-paykit-submit
      >
        {loading ? 'Processing...' : submitLabel}
      </button>
    </form>
  );
}
