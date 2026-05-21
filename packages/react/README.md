# @squaredr/paykit-react

React components and hooks for `@squaredr/paykit`. Unstyled, composable, and works with React 18+.

## Install

```bash
npm install @squaredr/paykit-react @squaredr/paykit-js
```

## Quick Start

```tsx
import { PayKitProvider, CheckoutForm } from '@squaredr/paykit-react';

function App() {
  return (
    <PayKitProvider config={{ provider: 'stripe', publicKey: 'pk_test_...' }}>
      <CheckoutForm
        clientSecret="pi_secret_xxx"
        onSuccess={(result) => console.log('Paid!', result.chargeId)}
        onError={(err) => console.error(err.message)}
      />
    </PayKitProvider>
  );
}
```

That's it — a fully functional checkout form with secure card input, 3DS handling, and loading states.

## Components

### `<PayKitProvider>`

Initializes the `PayKitClient` and loads the provider script. Wrap your payment UI with this.

```tsx
<PayKitProvider config={{ provider: 'stripe', publicKey: 'pk_test_...' }}>
  {children}
</PayKitProvider>
```

| Prop | Type | Description |
|------|------|-------------|
| `config` | `PayKitClientConfig` | Provider + public key + optional appearance |

### `<CheckoutForm>`

Drop-in payment form with card input and submit button.

```tsx
<CheckoutForm
  clientSecret="pi_secret_xxx"
  submitLabel="Pay $50"
  appearance={{ variables: { colorPrimary: '#5469d4' } }}
  onSuccess={(result) => { /* payment succeeded */ }}
  onError={(err) => { /* handle error */ }}
>
  <p>Additional content inside the form</p>
</CheckoutForm>
```

| Prop | Type | Description |
|------|------|-------------|
| `clientSecret` | `string` | Payment intent client secret |
| `appearance?` | `AppearanceConfig` | Theme config |
| `returnUrl?` | `string` | URL for 3DS redirect return |
| `submitLabel?` | `string` | Button text (default: `"Pay"`) |
| `className?` | `string` | Form CSS class |
| `style?` | `CSSProperties` | Inline styles |
| `onSuccess?` | `(result) => void` | Called on successful payment |
| `onError?` | `(error) => void` | Called on failure |
| `children?` | `ReactNode` | Extra content rendered inside the form |

### `<CardInput>`

Standalone secure card input. Use with `usePayKit` for custom form layouts.

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

## Hooks

### `usePayKit()`

Access the client and helper methods for headless/custom flows.

```tsx
function CustomCheckout({ clientSecret }: { clientSecret: string }) {
  const { client, isReady, tokenize, confirmPayment, error } = usePayKit();

  const handlePay = async () => {
    const result = await confirmPayment(clientSecret);
    if (result.error) {
      alert(result.error.message);
    }
  };

  return (
    <div>
      <CardInput onReady={() => {}} />
      <button onClick={handlePay} disabled={!isReady}>
        Pay
      </button>
    </div>
  );
}
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
| `statusUrl` | `string` | — | Your backend endpoint returning `{ status }` |
| `interval?` | `number` | `2000` | Polling interval in ms |
| `timeout?` | `number` | `300000` | Max polling duration (5 min) |
| `enabled?` | `boolean` | `true` | Start/stop polling |

Returns: `{ status, error, isPolling, refetch }`

## Theming

Components are **unstyled** — they render plain HTML with `data-paykit-*` attributes for selector targeting.

### CSS Custom Properties

Pass `appearance.variables` to set CSS variables on the form:

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

## Full Example — Custom Layout

```tsx
import { PayKitProvider, CardInput, usePayKit } from '@squaredr/paykit-react';

function PaymentPage({ clientSecret }: { clientSecret: string }) {
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await confirmPayment(clientSecret);
    if (result.error) {
      setError(result.error.message);
    } else {
      window.location.href = '/success';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Payment details</h2>
      <CardInput onReady={() => setCardReady(true)} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button disabled={!isReady || !cardReady}>Complete payment</button>
    </form>
  );
}
```

## Supported Providers

| Provider | Experience |
|----------|-----------|
| Stripe | Inline card input (iframe via Elements) |
| Razorpay | Full-screen checkout modal |

## License

MIT
