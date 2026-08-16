# @squaredr/paykit-sdk-js

> Browser SDK for accepting payments with Stripe, Razorpay, and PayPal. Works with any framework or vanilla JavaScript.

[![npm version](https://img.shields.io/npm/v/@squaredr/paykit-sdk-js.svg)](https://www.npmjs.com/package/@squaredr/paykit-sdk-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Features:**
- 🎯 **Framework-agnostic** — React, Vue, Svelte, Angular, or vanilla JS
- 🔄 **Provider-agnostic** — One API for Stripe, Razorpay, PayPal
- 🌳 **Tree-shakable** — Import only the providers you use
- 🔒 **Type-safe** — Full TypeScript support
- 📦 **Tiny** — ~5KB gzipped (core + one provider)

## Installation

```bash
npm install @squaredr/paykit-sdk-js
```

**Note:** This is the browser SDK. For backend operations, use [@squaredr/paykit](../core/).

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

### PayPal — Hosted Buttons

PayPal provides hosted button UI for payments:

```ts
import { PayKitClient } from '@squaredr/paykit-sdk-js';
import '@squaredr/paykit-sdk-js/providers/paypal';

const client = new PayKitClient({
  provider: 'paypal',
  publicKey: 'client-id-here', // PayPal client ID
});

// 1. Load PayPal SDK from CDN
await client.loadProvider();

// 2. Mount PayPal buttons into a DOM element
await client.mountCardInput('#paypal-button-container');

// 3. Confirm payment when user clicks the PayPal button
// PayPal handles the entire flow internally
const result = await client.confirmPayment('ORDER-ID-FROM-BACKEND');

if (result.status === 'succeeded') {
  console.log('Payment succeeded:', result.chargeId);
}
```

**Note:** PayPal renders its own button UI. The SDK mounts the buttons and handles the payment flow automatically when the user clicks.

---

## Provider Comparison

| Feature | Stripe | Razorpay | PayPal |
|---------|--------|----------|--------|
| **Card Input** | Inline iframe (Elements) | Full-screen modal | Hosted buttons |
| **mount()** | Renders card input | Renders placeholder | Renders PayPal buttons |
| **confirmPayment()** | Submits card data | Opens modal | Opens PayPal window |
| **tokenize()** | `tok_...` + card details | `pay_...` payment ID | Setup token |
| **3DS** | Redirect/popup | Inside modal | Handled by PayPal |
| **clientSecret** | `pi_secret_...` | `order_...` | PayPal order ID |
| **Local Methods** | Cards only | Cards, UPI, netbanking, wallets | PayPal balance, cards |

---

## API Reference

### `new PayKitClient(config)`

| Option | Type | Description |
|--------|------|-------------|
| `provider` | `'stripe' \| 'razorpay' \| 'paypal'` | Payment provider |
| `publicKey` | `string` | Provider publishable/public key or client ID |
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
- **PayPal**: `https://www.paypal.com/sdk/js` (with client ID)

Low-level loader:

```ts
import { loadScript } from '@squaredr/paykit-sdk-js';
await loadScript({ src: 'https://js.stripe.com/v3/', globalName: 'Stripe' });
```

## Tree-Shakable Imports

Only import the providers you need to keep your bundle size minimal:

```ts
// Import only Stripe
import '@squaredr/paykit-sdk-js/providers/stripe';

// Or only Razorpay
import '@squaredr/paykit-sdk-js/providers/razorpay';

// Or only PayPal
import '@squaredr/paykit-sdk-js/providers/paypal';

// Or multiple providers
import '@squaredr/paykit-sdk-js/providers/stripe';
import '@squaredr/paykit-sdk-js/providers/paypal';
```

Each provider adds ~2-3KB to your bundle. The core SDK is ~3KB gzipped.

## Framework Examples

### React

Use [@squaredr/paykit-react](../react/) for a better experience with pre-built components and hooks.

### Vue 3

```vue
<template>
  <div>
    <div ref="cardElement"></div>
    <button @click="handlePay" :disabled="!isReady">Pay</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { PayKitClient } from '@squaredr/paykit-sdk-js';
import '@squaredr/paykit-sdk-js/providers/stripe';

const cardElement = ref<HTMLElement | null>(null);
const isReady = ref(false);

let client: PayKitClient;

onMounted(async () => {
  client = new PayKitClient({
    provider: 'stripe',
    publicKey: 'pk_test_...',
  });

  await client.loadProvider();
  await client.mountCardInput(cardElement.value!);
  isReady.value = true;
});

const handlePay = async () => {
  const result = await client.confirmPayment('pi_secret_xxx', {
    returnUrl: window.location.origin + '/complete',
  });

  if (result.status === 'succeeded') {
    console.log('Payment succeeded');
  }
};
</script>
```

### Svelte

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { PayKitClient } from '@squaredr/paykit-sdk-js';
  import '@squaredr/paykit-sdk-js/providers/stripe';

  let cardElement: HTMLElement;
  let isReady = false;
  let client: PayKitClient;

  onMount(async () => {
    client = new PayKitClient({
      provider: 'stripe',
      publicKey: 'pk_test_...',
    });

    await client.loadProvider();
    await client.mountCardInput(cardElement);
    isReady = true;
  });

  async function handlePay() {
    const result = await client.confirmPayment('pi_secret_xxx', {
      returnUrl: window.location.origin + '/complete',
    });

    if (result.status === 'succeeded') {
      console.log('Payment succeeded');
    }
  }
</script>

<div bind:this={cardElement}></div>
<button on:click={handlePay} disabled={!isReady}>Pay</button>
```

### Angular

```typescript
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { PayKitClient } from '@squaredr/paykit-sdk-js';
import '@squaredr/paykit-sdk-js/providers/stripe';

@Component({
  selector: 'app-checkout',
  template: `
    <div #cardElement></div>
    <button (click)="handlePay()" [disabled]="!isReady">Pay</button>
  `,
})
export class CheckoutComponent implements AfterViewInit {
  @ViewChild('cardElement') cardElement!: ElementRef;
  isReady = false;
  private client!: PayKitClient;

  async ngAfterViewInit() {
    this.client = new PayKitClient({
      provider: 'stripe',
      publicKey: 'pk_test_...',
    });

    await this.client.loadProvider();
    await this.client.mountCardInput(this.cardElement.nativeElement);
    this.isReady = true;
  }

  async handlePay() {
    const result = await this.client.confirmPayment('pi_secret_xxx', {
      returnUrl: window.location.origin + '/complete',
    });

    if (result.status === 'succeeded') {
      console.log('Payment succeeded');
    }
  }
}
```

## Development

This package is part of the PayKit monorepo:

```
packages/sdk-js/
├── src/
│   ├── client/
│   │   └── PayKitClient.ts      ← Main client class
│   ├── providers/
│   │   ├── stripe.ts            ← Stripe provider bridge
│   │   ├── razorpay.ts          ← Razorpay provider bridge
│   │   └── paypal.ts            ← PayPal provider bridge
│   ├── utils/
│   │   └── loadScript.ts        ← CDN script loader
│   └── index.ts
└── package.json
```

### Building

```bash
# From monorepo root
pnpm install
pnpm build

# Just SDK-JS package
pnpm --filter @squaredr/paykit-sdk-js build
```

## Related Packages

- [@squaredr/paykit](../core/) — Backend SDK for Node.js
- [@squaredr/paykit-react](../react/) — React components built on this SDK

## License

MIT — See [LICENSE](../../LICENSE) for details.
