# @squaredr/paykit-js

Vanilla JavaScript/TypeScript frontend SDK for `@squaredr/paykit`. Works in any framework or no framework at all.

## Install

```bash
npm install @squaredr/paykit-js
```

## Provider Usage

### Stripe — Inline Card Input

Stripe renders a secure iframe-based card input that you mount into your page. After the user fills in card details, you confirm the payment with the `clientSecret` from your backend.

```ts
import { PayKitClient } from '@squaredr/paykit-js';
import '@squaredr/paykit-js/providers/stripe'; // registers the Stripe bridge

const client = new PayKitClient({
  provider: 'stripe',
  publicKey: 'pk_test_...',
});

// 1. Load Stripe.js from CDN
await client.loadProvider();

// 2. Mount the secure card input into a DOM element
await client.mountCardInput('#card-element');

// 3. Listen for validation changes
client.on('change', (e) => {
  const submitBtn = document.getElementById('pay-btn') as HTMLButtonElement;
  submitBtn.disabled = !e.data?.complete;
});

// 4. On form submit — confirm the payment
document.getElementById('pay-form')!.addEventListener('submit', async (e) => {
  e.preventDefault();

  const result = await client.confirmPayment('pi_secret_xxx', {
    returnUrl: 'https://example.com/payment/complete', // for 3DS redirects
  });

  if (result.error) {
    console.error(result.error.message);
  } else if (result.redirectUrl) {
    // 3D Secure — browser will redirect
    window.location.href = result.redirectUrl;
  } else {
    console.log('Payment succeeded:', result.chargeId);
  }
});
```

**HTML:**
```html
<form id="pay-form">
  <div id="card-element"></div>
  <button id="pay-btn" type="submit" disabled>Pay $50.00</button>
</form>
```

### Stripe — Tokenize a Card (Save for Later)

```ts
// After mounting the card input...
const token = await client.tokenize();
console.log(token.token);  // "tok_..."
console.log(token.last4);  // "4242"
console.log(token.brand);  // "visa"

// Send token.token to your backend to attach to a customer
```

### Stripe — 3DS Redirect Return

On your return URL page, handle the redirect result:

```ts
import { handleRedirectReturn } from '@squaredr/paykit-js';

const result = handleRedirectReturn();
if (result) {
  console.log(result.status);          // 'succeeded' | 'failed' | 'pending'
  console.log(result.paymentIntentId); // 'pi_...'
}
```

---

### Razorpay — Checkout Modal

Razorpay uses a full-screen modal instead of an inline card input. The user selects their payment method (cards, UPI, netbanking, wallets) inside the Razorpay modal.

```ts
import { PayKitClient } from '@squaredr/paykit-js';
import '@squaredr/paykit-js/providers/razorpay'; // registers the Razorpay bridge

const client = new PayKitClient({
  provider: 'razorpay',
  publicKey: 'rzp_test_...',
});

// 1. Load Razorpay checkout.js from CDN
await client.loadProvider();

// 2. Mount a placeholder (Razorpay doesn't use inline inputs)
await client.mountCardInput('#razorpay-container');
// Renders: "Razorpay Checkout will open on submit"

// 3. On form submit — opens the Razorpay modal
document.getElementById('pay-form')!.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Pass the order_id from your backend as the clientSecret
  const result = await client.confirmPayment('order_xxxxxxxxxxxxx');

  if (result.status === 'succeeded') {
    console.log('Payment succeeded:', result.chargeId); // "pay_..."
  } else if (result.status === 'canceled') {
    console.log('User closed the modal');
  }
});
```

### Razorpay — Headless (No Mount)

If you don't need a placeholder element, skip mounting entirely:

```ts
const client = new PayKitClient({
  provider: 'razorpay',
  publicKey: 'rzp_test_...',
});

await client.loadProvider();

// Directly open the modal — no mount needed
const result = await client.confirmPayment('order_xxxxxxxxxxxxx');
```

---

## Provider Differences at a Glance

| | Stripe | Razorpay |
|---|--------|----------|
| **Card Input** | Inline iframe (Stripe Elements) | Full-screen modal |
| **mount()** | Renders a card input field | Renders a placeholder |
| **confirmPayment()** | Submits inline card data | Opens Razorpay modal |
| **tokenize()** | Returns `tok_...` with card details | Returns `pay_...` payment ID |
| **3DS** | Redirect or inline popup | Handled inside modal |
| **clientSecret param** | Stripe PaymentIntent secret (`pi_secret_...`) | Razorpay order ID (`order_...`) |
| **UPI / Netbanking** | Not applicable | Supported inside modal |

---

## API Reference

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
client.on('ready', () => { /* input mounted and ready */ });
client.on('change', (e) => { /* e.data.complete, e.data.error */ });
client.on('error', (e) => { /* validation error */ });
client.on('focus', () => { /* input focused */ });
client.on('blur', () => { /* input blurred */ });
client.on('loading_start', () => { /* payment processing started */ });
client.on('loading_end', () => { /* payment processing finished */ });
```

### Return Types

```ts
interface TokenizeResult {
  token: string;                    // "tok_..." (Stripe) or "pay_..." (Razorpay)
  paymentMethodType: 'card';
  last4?: string;                   // "4242" (Stripe only)
  brand?: string;                   // "visa" (Stripe only)
}

interface PaymentConfirmResult {
  status: 'succeeded' | 'processing' | 'requires_action' | 'canceled' | 'pending' | 'failed';
  chargeId?: string;                // "pi_..." (Stripe) or "pay_..." (Razorpay)
  redirectUrl?: string;             // 3DS redirect URL (Stripe only)
  error?: {
    code: string;
    message: string;
    isRetryable: boolean;
  };
}
```

---

## Theming

### Stripe

```ts
const client = new PayKitClient({
  provider: 'stripe',
  publicKey: 'pk_test_...',
  appearance: {
    theme: 'night',             // 'stripe' | 'night' | 'flat'
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

### Razorpay

```ts
const client = new PayKitClient({
  provider: 'razorpay',
  publicKey: 'rzp_test_...',
  appearance: {
    variables: {
      colorPrimary: '#528ff0',      // Modal accent color
      colorBackground: '#ffffff',    // Modal backdrop color
    },
  },
});
```

Update theme at runtime:

```ts
client.updateAppearance({ variables: { colorPrimary: '#10b981' } });
```

---

## Script Loading

Provider scripts are lazily loaded from CDN on first use:

- **Stripe**: `https://js.stripe.com/v3/`
- **Razorpay**: `https://checkout.razorpay.com/v1/checkout.js`

Low-level loader:

```ts
import { loadScript } from '@squaredr/paykit-js';
await loadScript({ src: 'https://js.stripe.com/v3/', globalName: 'Stripe' });
```

## Tree-Shakable Imports

Only import the provider you need:

```ts
import '@squaredr/paykit-js/providers/stripe';
// or
import '@squaredr/paykit-js/providers/razorpay';
```

## License

MIT
