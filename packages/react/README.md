# @squaredr/paykit-react

React components and hooks for `@squaredr/paykit`. Unstyled, composable, and works with React 18+.

## Install

```bash
npm install @squaredr/paykit-react @squaredr/paykit-js
```

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

## Provider Differences in React

| | Stripe | Razorpay |
|---|--------|----------|
| **`<CheckoutForm>`** | Renders inline card input + submit button | Renders placeholder + submit button that opens modal |
| **`<CardInput>`** | Secure iframe card field | Placeholder text |
| **`confirmPayment()`** | Submits card data from inline input | Opens Razorpay checkout modal |
| **`tokenize()`** | Returns card token with last4/brand | Returns payment ID |
| **clientSecret** | PaymentIntent secret (`pi_secret_...`) | Order ID (`order_...`) |
| **3DS** | May redirect or show popup | Handled inside modal |

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
| Stripe | Inline iframe (Elements) | Yes | Yes (redirect) | No |
| Razorpay | Full-screen checkout modal | No (modal only) | Yes (internal) | Yes |

## License

MIT
