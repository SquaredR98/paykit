import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react';
import type { ClientAdapter } from '@squaredr/paykit';
import { CHECKOUT_APPEARANCE } from '@/lib/checkout-theme';

interface HeroCheckoutCardProps {
  adapter: ClientAdapter;
  clientSecret: string;
  submitLabel: string;
  onSuccess: () => void;
  onError: () => void;
}

export function HeroCheckoutCard({
  adapter,
  clientSecret,
  submitLabel,
  onSuccess,
  onError,
}: HeroCheckoutCardProps) {
  return (
    <PayKitProvider clientAdapter={adapter}>
      <CheckoutForm
        clientSecret={clientSecret}
        submitLabel={submitLabel}
        onSuccess={onSuccess}
        onError={onError}
        appearance={CHECKOUT_APPEARANCE}
        className="pk-deck__checkout-form"
      />
    </PayKitProvider>
  );
}
