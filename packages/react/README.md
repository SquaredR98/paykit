# @squaredr/paykit-react

> Production-ready React components for accepting payments with Stripe, Razorpay, and PayPal.

[![npm version](https://img.shields.io/npm/v/@squaredr/paykit-react.svg)](https://www.npmjs.com/package/@squaredr/paykit-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Features:**
- 🎨 **Unstyled** — Full control over design with CSS/Tailwind
- 🔄 **Provider-agnostic** — Switch between Stripe/Razorpay/PayPal without code changes
- 🪝 **Headless hooks** — Build custom checkout flows with `usePayKit()`
- 🔒 **Type-safe** — Full TypeScript support
- ⚡ **React 18+** — Server Components compatible

## Installation

```bash
npm install @squaredr/paykit-react @squaredr/paykit-js
```

**Note:** `@squaredr/paykit-js` provides the browser SDK that powers the React components.

## Provider Usage

### Stripe — Drop-in Checkout Form

Stripe renders a secure inline card input. Wrap your checkout UI with `<PayKitProvider>` and use `<CheckoutForm>` for a complete payment form.

```tsx
import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react';
import '@squaredr/paykit-js/providers/stripe';

function StripeCheckout({ clientSecret }: { clientSecret: string }) {
  return (
    <PayKitProvider config={{ provider: 'stripe', publicKey: 'pk_test_...' }}>
      <CheckoutForm
        clientSecret={clientSecret}
        submitLabel="Pay $50.00"
        returnUrl="https://example.com/payment/complete"
        onSuccess={(result) => {
          console.log('Payment succeeded:', result.chargeId);
        }}
        onError={(error) => {
          console.error('Payment failed:', error.message);
        }}
      />
    </PayKitProvider>
  );
}
```

### Stripe — Custom Layout with CardInput

For full control over the form layout, use `<CardInput>` directly with the `usePayKit` hook:

```tsx
import { PayKitProvider, CardInput, usePayKit } from '@squaredr/paykit-react';
import '@squaredr/paykit-js/providers/stripe';
import { useState, FormEvent } from 'react';

function StripeCustomCheckout({ clientSecret }: { clientSecret: string }) {
  return (
    <PayKitProvider config={{ provider: 'stripe', publicKey: 'pk_test_...' }}>
      <PaymentForm clientSecret={clientSecret} />
    </PayKitProvider>
  );
}

function PaymentForm({ clientSecret }: { clientSecret: string }) {
  const { isReady, confirmPayment } = usePayKit();
  const [cardReady, setCardReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await confirmPayment(clientSecret, {
      returnUrl: 'https://example.com/payment/complete',
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
    } else if (result.redirectUrl) {
      window.location.href = result.redirectUrl; // 3DS redirect
    } else {
      window.location.href = '/success';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Card details</label>
      <CardInput
        onReady={() => setCardReady(true)}
        onChange={({ complete, error }) => {
          if (error) setError(error);
          else setError(null);
        }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button disabled={!isReady || !cardReady || loading}>
        {loading ? 'Processing...' : 'Pay'}
      </button>
    </form>
  );
}
```

### Stripe — Tokenize and Save Card

```tsx
function SaveCardForm() {
  const { isReady, tokenize } = usePayKit();
  const [cardReady, setCardReady] = useState(false);

  const handleSave = async () => {
    const token = await tokenize();
    console.log(token.token);  // "tok_..."
    console.log(token.last4);  // "4242"
    console.log(token.brand);  // "visa"

    // Send token to your backend to save as a payment method
    await fetch('/api/save-card', {
      method: 'POST',
      body: JSON.stringify({ token: token.token }),
    });
  };

  return (
    <div>
      <CardInput onReady={() => setCardReady(true)} />
      <button onClick={handleSave} disabled={!isReady || !cardReady}>
        Save Card
      </button>
    </div>
  );
}
```

---

### Razorpay — Checkout Modal

Razorpay opens a full-screen modal for payment. The `<CardInput>` renders a placeholder, and `confirmPayment()` opens the Razorpay modal.

```tsx
import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react';
import '@squaredr/paykit-js/providers/razorpay';

function RazorpayCheckout({ orderId }: { orderId: string }) {
  return (
    <PayKitProvider config={{ provider: 'razorpay', publicKey: 'rzp_test_...' }}>
      <CheckoutForm
        clientSecret={orderId}  // Razorpay order_id
        submitLabel="Pay with Razorpay"
        onSuccess={(result) => {
          console.log('Payment succeeded:', result.chargeId); // "pay_..."
        }}
        onError={(error) => {
          if (error.code === 'user_cancelled') {
            console.log('User closed the modal');
          } else {
            console.error('Payment failed:', error.message);
          }
        }}
      />
    </PayKitProvider>
  );
}
```

### Razorpay — Custom Layout

```tsx
import { PayKitProvider, usePayKit } from '@squaredr/paykit-react';
import '@squaredr/paykit-js/providers/razorpay';

function RazorpayCustomCheckout({ orderId }: { orderId: string }) {
  return (
    <PayKitProvider config={{ provider: 'razorpay', publicKey: 'rzp_test_...' }}>
      <RazorpayPayButton orderId={orderId} />
    </PayKitProvider>
  );
}

function RazorpayPayButton({ orderId }: { orderId: string }) {
  const { isReady, confirmPayment } = usePayKit();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    const result = await confirmPayment(orderId);
    setLoading(false);

    if (result.status === 'succeeded') {
      window.location.href = '/success';
    }
  };

  return (
    <button onClick={handlePay} disabled={!isReady || loading}>
      {loading ? 'Opening Razorpay...' : 'Pay with Razorpay'}
    </button>
  );
}
```

---

### PayPal — Checkout Buttons

PayPal provides hosted button UI. Use the `<CheckoutForm>` with PayPal's client secret (order ID):

```tsx
import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react';
import '@squaredr/paykit-js/providers/paypal';

function PayPalCheckout({ orderId }: { orderId: string }) {
  return (
    <PayKitProvider config={{ provider: 'paypal', publicKey: 'client-id-here' }}>
      <CheckoutForm
        clientSecret={orderId}  // PayPal order ID
        submitLabel="Pay with PayPal"
        onSuccess={(result) => {
          console.log('Payment succeeded:', result.chargeId);
        }}
        onError={(error) => {
          console.error('Payment failed:', error.message);
        }}
      />
    </PayKitProvider>
  );
}
```

**Note:** PayPal renders its own button UI. The `<CheckoutForm>` acts as a container that triggers the PayPal SDK when clicked.

---

## Provider Comparison

| Feature | Stripe | Razorpay | PayPal |
|---------|--------|----------|--------|
| **`<CheckoutForm>`** | Inline card input + submit | Placeholder + modal trigger | PayPal button UI |
| **`<CardInput>`** | Secure iframe | Placeholder | N/A (hosted) |
| **`confirmPayment()`** | Submits card data | Opens modal | Opens PayPal window |
| **`tokenize()`** | Card token | Payment ID | Setup token |
| **clientSecret** | `pi_secret_...` | `order_...` | PayPal order ID |
| **3DS** | Redirect/popup | Inside modal | Handled by PayPal |

---

## Components

### `<PayKitProvider>`

Initializes the client and loads the provider script. Wrap your payment UI with this.

```tsx
<PayKitProvider config={{ provider: 'stripe', publicKey: 'pk_test_...' }}>
  {children}
</PayKitProvider>
```

| Prop | Type | Description |
|------|------|-------------|
| `config` | `PayKitClientConfig` | Provider name + public key + optional appearance |
| `clientAdapter?` | `ClientAdapter` | Pass a pre-built adapter from `@squaredr/paykit/stripe/client` |

### `<CheckoutForm>`

Drop-in payment form with card input and submit button.

```tsx
<CheckoutForm
  clientSecret="pi_secret_xxx"
  submitLabel="Pay $50"
  appearance={{ variables: { colorPrimary: '#5469d4' } }}
  returnUrl="https://example.com/complete"
  onSuccess={(result) => { /* payment succeeded */ }}
  onError={(err) => { /* handle error */ }}
>
  <p>Additional content inside the form</p>
</CheckoutForm>
```

| Prop | Type | Description |
|------|------|-------------|
| `clientSecret` | `string` | PaymentIntent secret (Stripe) or order ID (Razorpay) |
| `appearance?` | `AppearanceConfig` | Theme config |
| `returnUrl?` | `string` | URL for 3DS redirect return (Stripe only) |
| `submitLabel?` | `string` | Button text (default: `"Pay"`) |
| `className?` | `string` | Form CSS class |
| `style?` | `CSSProperties` | Inline styles |
| `onSuccess?` | `(result) => void` | Called on successful payment |
| `onError?` | `(error) => void` | Called on failure |
| `children?` | `ReactNode` | Extra content rendered inside the form |

### `<CardInput>`

Standalone secure card input. Use with `usePayKit()` for custom form layouts.

```tsx
<CardInput
  appearance={{ variables: { colorPrimary: '#5469d4' } }}
  onReady={() => setCardReady(true)}
  onChange={({ complete, error }) => { /* validation state */ }}
  onError={(err) => console.error(err)}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `appearance?` | `AppearanceConfig` | Theme config |
| `className?` | `string` | Container CSS class |
| `style?` | `CSSProperties` | Inline styles |
| `onReady?` | `() => void` | Fired when input is mounted and ready |
| `onChange?` | `(event) => void` | Fires on input change with `{ complete, error? }` |
| `onError?` | `(error) => void` | Fires on mount/validation errors |

---

## Hooks

### `usePayKit()`

Access the client and helper methods for headless/custom flows.

```tsx
const { client, isReady, tokenize, confirmPayment, error } = usePayKit();
```

| Return | Type | Description |
|--------|------|-------------|
| `client` | `PayKitClient` | The underlying client instance |
| `isReady` | `boolean` | Whether the provider script is loaded |
| `error` | `Error \| null` | Provider load error, if any |
| `tokenize` | `() => Promise<TokenizeResult>` | Tokenize mounted card input |
| `confirmPayment` | `(secret, opts?) => Promise<PaymentConfirmResult>` | Confirm a payment |

### `usePaymentStatus(options)`

Poll your backend for payment status updates.

```tsx
function PaymentStatus({ chargeId }: { chargeId: string }) {
  const { status, isPolling, error } = usePaymentStatus({
    statusUrl: `/api/payments/${chargeId}/status`,
    interval: 2000,
    enabled: true,
  });

  if (isPolling) return <p>Checking payment status...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return <p>Payment status: {status}</p>;
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `statusUrl` | `string` | -- | Your backend endpoint returning `{ status }` |
| `interval?` | `number` | `2000` | Polling interval in ms |
| `timeout?` | `number` | `300000` | Max polling duration (5 min) |
| `enabled?` | `boolean` | `true` | Start/stop polling |

Returns: `{ status, error, isPolling, refetch }`

---

## Theming

Components are **unstyled** -- they render plain HTML with `data-paykit-*` attributes for CSS targeting.

### CSS Custom Properties

```tsx
<CheckoutForm
  clientSecret="..."
  appearance={{
    variables: {
      colorPrimary: '#5469d4',
      colorBackground: '#ffffff',
      colorText: '#1a1a1a',
      borderRadius: '8px',
      fontFamily: 'Inter, sans-serif',
    },
  }}
/>
```

These become `--paykit-color-primary`, `--paykit-color-background`, etc. on the form element.

### Styling with CSS

```css
[data-paykit-form] {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

[data-paykit-submit] {
  background: var(--paykit-color-primary, #5469d4);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--paykit-border-radius, 6px);
  cursor: pointer;
}

[data-paykit-submit]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

[data-paykit-card-input] {
  min-height: 44px;
}
```

### Tailwind CSS

```tsx
<CheckoutForm
  clientSecret="..."
  className="flex flex-col gap-4 p-6 rounded-lg bg-white shadow"
/>
```

---

## Supported Providers

| Provider | Experience | Card Input | 3DS | Modal |
|----------|-----------|-----------|-----|-------|
| Stripe | Inline iframe (Elements) | ✅ | ✅ (redirect) | ❌ |
| Razorpay | Full-screen checkout modal | ❌ (modal only) | ✅ (internal) | ✅ |
| PayPal | Hosted button UI | ❌ (hosted) | ✅ (internal) | ✅ |

## Backend Integration

PayKit React components work with the backend SDK (`@squaredr/paykit`). Here's the full flow:

### 1. Create Payment Intent (Backend)

```ts
// app/api/create-payment/route.ts
import { PayKit } from '@squaredr/paykit';
import { StripeAdapter } from '@squaredr/paykit/stripe';

const paykit = new PayKit({
  adapter: new StripeAdapter({ secretKey: process.env.STRIPE_SECRET_KEY! }),
});

export async function POST(req: Request) {
  const { amount, currency } = await req.json();

  const charge = await paykit.charges.create({
    amount,
    currency,
    metadata: { orderId: 'order_123' },
  });

  return Response.json({ clientSecret: charge.clientSecret });
}
```

### 2. Render Checkout Form (Frontend)

```tsx
'use client';

import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react';
import '@squaredr/paykit-js/providers/stripe';
import { useState, useEffect } from 'react';

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/create-payment', {
      method: 'POST',
      body: JSON.stringify({ amount: 5000, currency: 'usd' }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  if (!clientSecret) return <p>Loading...</p>;

  return (
    <PayKitProvider config={{ provider: 'stripe', publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY! }}>
      <CheckoutForm
        clientSecret={clientSecret}
        submitLabel="Pay $50.00"
        returnUrl={`${window.location.origin}/payment-complete`}
        onSuccess={(result) => {
          console.log('Payment succeeded:', result.chargeId);
          window.location.href = '/success';
        }}
        onError={(error) => {
          console.error('Payment failed:', error.message);
        }}
      />
    </PayKitProvider>
  );
}
```

### 3. Handle Webhooks (Backend)

```ts
// app/api/webhooks/route.ts
import { PayKit } from '@squaredr/paykit';
import { StripeAdapter } from '@squaredr/paykit/stripe';

const paykit = new PayKit({
  adapter: new StripeAdapter({ secretKey: process.env.STRIPE_SECRET_KEY! }),
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  const event = paykit.webhooks.construct({
    payload: body,
    signature,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });

  if (event.type === 'charge.succeeded') {
    console.log('Charge succeeded:', event.data.id);
    // Update your database, send confirmation email, etc.
  }

  return Response.json({ received: true });
}
```

## Development

This package is part of the PayKit monorepo:

```
packages/react/
├── src/
│   ├── components/
│   │   ├── PayKitProvider.tsx   ← Context provider
│   │   ├── CheckoutForm.tsx     ← Drop-in form
│   │   └── CardInput.tsx        ← Card input wrapper
│   ├── hooks/
│   │   ├── usePayKit.ts         ← Main hook
│   │   └── usePaymentStatus.ts  ← Polling hook
│   └── index.ts
└── package.json
```

### Building

```bash
# From monorepo root
pnpm install
pnpm build

# Just React package
pnpm --filter @squaredr/paykit-react build
```

## Examples

Full example apps are available in the [website/app/examples](../../website/app/examples/) directory:

- **Stripe Checkout** — [website/app/examples/stripe](../../website/app/examples/stripe/)
- **Razorpay Checkout** — [website/app/examples/razorpay](../../website/app/examples/razorpay/)
- **PayPal Checkout** — [website/app/examples/paypal](../../website/app/examples/paypal/)
- **Multi-Provider Router** — [website/app/examples/router](../../website/app/examples/router/)

## Related Packages

- [@squaredr/paykit](../core/) — Backend SDK for Node.js
- [@squaredr/paykit-sdk-js](../sdk-js/) — Browser SDK (used by React components)

## License

MIT — See [LICENSE](../../LICENSE) for details.
