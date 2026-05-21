# @squaredr/paykit-razorpay

Razorpay adapter for `@squaredr/paykit`.

## Install

```bash
npm install @squaredr/paykit @squaredr/paykit-razorpay razorpay
```

## Usage

```ts
import { UnifiedPayments } from '@squaredr/paykit';
import '@squaredr/paykit-razorpay';

const payments = new UnifiedPayments({
  provider: 'razorpay',
  credentials: {
    keyId: process.env.RZP_KEY_ID,
    keySecret: process.env.RZP_KEY_SECRET,
  },
});
```

## How Razorpay maps to the unified API

Razorpay uses an order-based flow, which differs from Stripe's intent-based approach:

1. `charges.create()` creates a Razorpay **Order**
2. Your frontend opens Razorpay Checkout with the order ID
3. Customer pays in the Checkout modal
4. `charges.retrieve('pay_xxx')` fetches the resulting **Payment**

## Supported operations

### Charges

Maps to Razorpay Orders (create) and Payments (retrieve/capture).

```ts
// Create an order (returns status: 'pending')
const charge = await payments.charges.create({
  amount: 50000, // INR 500.00 in paise
  currency: 'INR',
  description: 'Order #42',
});
// charge.id → 'order_xxx'

// After frontend checkout, retrieve the payment
const payment = await payments.charges.retrieve('pay_xxx');
// payment.status → 'succeeded'

// Capture an authorized payment
await payments.charges.capture('pay_xxx', { amount: 50000 });

// List orders
const { data, hasMore } = await payments.charges.list({ limit: 10 });
```

### Refunds

```ts
const refund = await payments.refunds.create({
  chargeId: 'pay_xxx', // payment ID, not order ID
  amount: 20000, // partial refund
});
```

### Customers

```ts
const customer = await payments.customers.create({
  email: 'user@example.com',
  name: 'Rahul',
  phone: '+919876543210',
});

await payments.customers.update('cust_xxx', { name: 'Rahul S' });
```

> Note: Razorpay does not support deleting customers. Calling `customers.delete()` throws an error.

### Payment methods

Razorpay handles payment methods through its Checkout frontend, not via API. All `paymentMethods.*` operations throw `NotSupportedError`.

```ts
import { NotSupportedError } from '@squaredr/paykit';

try {
  await payments.paymentMethods.create({ type: 'card' });
} catch (err) {
  if (err instanceof NotSupportedError) {
    // Expected — use Razorpay Checkout instead
  }
}
```

### Subscriptions

Creates a Razorpay Plan + Subscription in one call.

```ts
const sub = await payments.subscriptions.create({
  customer: 'cust_xxx',
  amount: 99900, // INR 999.00
  currency: 'INR',
  interval: 'month', // day | week | month | year
});

await payments.subscriptions.cancel('sub_xxx');
await payments.subscriptions.cancel('sub_xxx', { cancelAtPeriodEnd: true });
```

### Webhooks

```ts
// Verify signature (HMAC-SHA256)
const valid = payments.webhooks.verify(rawBody, headers, webhookSecret);

// Parse event
const event = payments.webhooks.parse(rawBody, headers, webhookSecret);
// event.type → 'charge.succeeded' | 'charge.failed' | 'refund.created' | ...
```

Required header: `x-razorpay-signature`

## Credentials

| Key | Description |
|-----|-------------|
| `keyId` | Razorpay Key ID (`rzp_live_...` or `rzp_test_...`) |
| `keySecret` | Razorpay Key Secret |

## Capabilities

| Capability | Supported |
|-----------|-----------|
| charges | Yes |
| authAndCapture | Yes |
| refunds | Yes |
| partialRefunds | Yes |
| subscriptions | Yes |
| savedPaymentMethods | No |
| hostedCheckout | Yes |
| webhooks | Yes |
| multiCurrency | Yes |
| threeDS | Yes |

## License

MIT
