# @squaredr/paykit-js

Vanilla JavaScript/TypeScript frontend SDK for `@squaredr/paykit`. Works in any framework or no framework at all.

## Install

```bash
npm install @squaredr/paykit-js
```

## Quick Start

```ts
import { PayKitClient } from '@squaredr/paykit-js';

const client = new PayKitClient({
  provider: 'stripe',
  publicKey: 'pk_test_...',
});

// Load the provider script (Stripe.js / Razorpay checkout.js)
await client.loadProvider();

// Mount a secure card input
await client.mountCardInput('#card-element');

// On form submit — confirm payment
const result = await client.confirmPayment('pi_secret_xxx', {
  returnUrl: 'https://example.com/payment/complete',
});

if (result.error) {
  console.error(result.error.message);
} else {
  console.log('Payment succeeded:', result.chargeId);
}
```

## Headless Mode

If you don't need a mounted card input (e.g. Razorpay modal, saved payment methods):

```ts
const client = new PayKitClient({
  provider: 'razorpay',
  publicKey: 'rzp_test_...',
});

await client.loadProvider();

// Razorpay opens its own modal
const result = await client.confirmPayment('order_xxx');
```

## API

### `new PayKitClient(config)`

| Option | Type | Description |
|--------|------|-------------|
| `provider` | `'stripe' \| 'razorpay'` | Payment provider |
| `publicKey` | `string` | Provider publishable/public key |
| `locale?` | `string` | Locale code (e.g. `'en'`) |
| `appearance?` | `AppearanceConfig` | Theme configuration |

### Methods

| Method | Description |
|--------|-------------|
| `loadProvider()` | Load the provider's CDN script |
| `isReady` | Whether the provider script has loaded |
| `mountCardInput(target, options?)` | Mount secure card input into a DOM element or selector |
| `tokenize()` | Tokenize payment info from mounted input |
| `confirmPayment(clientSecret, options?)` | Confirm payment, handling 3DS/modals/redirects |
| `updateAppearance(appearance)` | Update theme at runtime |
| `on(event, listener)` | Register an event listener |
| `off(event, listener)` | Remove an event listener |
| `destroy()` | Clean up all resources |

### Events

```ts
client.on('ready', () => { /* input mounted */ });
client.on('change', (e) => { /* input value changed */ });
client.on('error', (e) => { /* validation error */ });
client.on('focus', () => { /* input focused */ });
client.on('blur', () => { /* input blurred */ });
client.on('loading_start', () => { /* payment processing */ });
client.on('loading_end', () => { /* processing complete */ });
```

### `TokenizeResult`

```ts
interface TokenizeResult {
  token: string;
  paymentMethodType: PaymentMethodType;
  last4?: string;
  brand?: string;
}
```

### `PaymentConfirmResult`

```ts
interface PaymentConfirmResult {
  status: ChargeStatus;
  chargeId?: string;
  redirectUrl?: string;
  error?: { code: string; message: string; isRetryable: boolean };
}
```

## Theming

Pass an `appearance` config to style the card input:

```ts
const client = new PayKitClient({
  provider: 'stripe',
  publicKey: 'pk_test_...',
  appearance: {
    theme: 'night',
    variables: {
      colorPrimary: '#5469d4',
      colorBackground: '#1a1a2e',
      colorText: '#ffffff',
      colorDanger: '#df1b41',
      borderRadius: '8px',
      fontFamily: 'Inter, sans-serif',
    },
  },
});
```

Theme variables map to CSS custom properties (`--paykit-color-primary`, etc.) and can be used in your own styles.

## 3DS Redirect Handling

After a 3DS redirect, call `handleRedirectReturn()` on the return URL page:

```ts
import { handleRedirectReturn } from '@squaredr/paykit-js';

const result = handleRedirectReturn();
if (result) {
  // Payment returned from 3DS
  console.log(result.status); // 'succeeded' | 'failed' | 'pending'
  console.log(result.paymentIntentId);
}
```

## Script Loading

Provider scripts are lazily loaded from CDN on first use and cached for the page lifetime. The SDK loads:

- **Stripe**: `https://js.stripe.com/v3/`
- **Razorpay**: `https://checkout.razorpay.com/v1/checkout.js`

You can also use the low-level `loadScript()` utility directly:

```ts
import { loadScript } from '@squaredr/paykit-js';

await loadScript('https://js.stripe.com/v3/', { timeout: 10000 });
```

## Tree-Shakable Provider Imports

To keep bundle size minimal, import only the provider you use:

```ts
import '@squaredr/paykit-js/providers/stripe';
// or
import '@squaredr/paykit-js/providers/razorpay';
```

## Supported Providers

| Provider | Card Input | 3DS | Modal | Redirect |
|----------|-----------|-----|-------|----------|
| Stripe | Iframe (Elements) | Yes | No | Yes |
| Razorpay | Modal (Checkout) | Yes (internal) | Yes | No |

## License

MIT
