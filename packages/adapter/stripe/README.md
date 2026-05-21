# @squaredr/paykit-stripe

Stripe adapter for `@squaredr/paykit`.

## Install

```bash
npm install @squaredr/paykit @squaredr/paykit-stripe stripe
```

## Usage

```ts
import { UnifiedPayments } from '@squaredr/paykit';
import '@squaredr/paykit-stripe';

const payments = new UnifiedPayments({
  provider: 'stripe',
  credentials: { secretKey: process.env.STRIPE_SECRET_KEY },
});
```

## Supported operations

### Charges

Maps to Stripe PaymentIntents.

```ts
// Create
const charge = await payments.charges.create({
  amount: 5000, // $50.00
  currency: 'USD',
  source: 'pm_card_visa', // optional payment method
  capture: false, // auth only, capture later
  idempotencyKey: 'unique_key',
});

// Retrieve
const fetched = await payments.charges.retrieve('pi_xxx');

// Capture (after auth)
await payments.charges.capture('pi_xxx', { amount: 3000 });

// Cancel
await payments.charges.cancel('pi_xxx');

// List
const { data, hasMore } = await payments.charges.list({ limit: 10 });
```

### Refunds

```ts
const refund = await payments.refunds.create({
  chargeId: 'pi_xxx',
  amount: 2000, // partial refund
});
```

### Customers

```ts
const customer = await payments.customers.create({
  email: 'user@example.com',
  name: 'Jane Doe',
});

await payments.customers.update('cus_xxx', { name: 'Jane Smith' });
await payments.customers.delete('cus_xxx');
```

### Payment methods

```ts
const pm = await payments.paymentMethods.create({ type: 'card' });
await payments.paymentMethods.attach('pm_xxx', 'cus_xxx');
await payments.paymentMethods.detach('pm_xxx');
const methods = await payments.paymentMethods.list('cus_xxx');
```

### Subscriptions

Creates a Stripe Product + Price + Subscription in one call.

```ts
const sub = await payments.subscriptions.create({
  customer: 'cus_xxx',
  amount: 999,
  currency: 'USD',
  interval: 'month',
});

await payments.subscriptions.cancel('sub_xxx');
await payments.subscriptions.cancel('sub_xxx', { cancelAtPeriodEnd: true });
```

### Webhooks

```ts
// Verify signature
const valid = payments.webhooks.verify(rawBody, headers, webhookSecret);

// Parse event
const event = payments.webhooks.parse(rawBody, headers, webhookSecret);
// event.type → 'charge.succeeded' | 'charge.failed' | 'refund.created' | ...
```

## Credentials

| Key | Description |
|-----|-------------|
| `secretKey` | Stripe secret key (`sk_live_...` or `sk_test_...`) |

## Capabilities

| Capability | Supported |
|-----------|-----------|
| charges | Yes |
| authAndCapture | Yes |
| refunds | Yes |
| partialRefunds | Yes |
| subscriptions | Yes |
| savedPaymentMethods | Yes |
| webhooks | Yes |
| multiCurrency | Yes |
| threeDS | Yes |

## License

MIT
