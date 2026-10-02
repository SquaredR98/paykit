/**
 * Code samples for the Compare section.
 *
 * The "after" snippets are real PayKit API — `charges.create({ amount, currency })`
 * and `webhooks.parse(payload, headers, secret)` both match the signatures in
 * packages/core/src/adapter.ts. The "before" snippets are the provider SDK calls
 * they replace.
 *
 * Line counts in the labels are counted from these strings, not guessed — see
 * `countLines` below.
 */

export interface ComparePair {
  id: string;
  tabLabel: string;
  filename: string;
  before: string;
  after: string;
}

const chargeBefore = `if (region === 'IN') {
  const rzp = new Razorpay({ key_id, key_secret });
  const order = await rzp.orders.create({
    amount: 4900,
    currency: 'INR',
  });
  return { id: order.id, status: order.status };
} else {
  const stripe = new Stripe(secretKey);
  const pi = await stripe.paymentIntents.create({
    amount: 4900,
    currency: 'usd',
  });
  return { id: pi.id, status: mapStatus(pi.status) };
}`;

const chargeAfter = `const charge = await paykit.charges.create({
  amount: 4900,
  currency: region === 'IN' ? 'INR' : 'USD',
});

return charge; // { id, status, amount, provider, _raw }`;

const webhookBefore = `if (headers['stripe-signature']) {
  const evt = stripe.webhooks.constructEvent(body, sig, secret);
  if (evt.type === 'payment_intent.succeeded') fulfill(evt);
} else if (headers['x-razorpay-signature']) {
  validateWebhookSignature(body, sig, secret);
  const evt = JSON.parse(body);
  if (evt.event === 'payment.captured') fulfill(evt);
} else if (headers['paypal-transmission-id']) {
  await verifyPayPal(headers, body);
  const evt = JSON.parse(body);
  if (evt.event_type === 'PAYMENT.CAPTURE.COMPLETED') fulfill(evt);
}`;

const webhookAfter = `const event = paykit.webhooks.parse(body, headers, secret);

if (event.type === 'charge.succeeded') {
  await fulfill(event.data);
}`;

export const comparePairs: ComparePair[] = [
  {
    id: 'charge',
    tabLabel: 'Create a charge',
    filename: 'charge.ts',
    before: chargeBefore,
    after: chargeAfter,
  },
  {
    id: 'webhook',
    tabLabel: 'Handle a webhook',
    filename: 'webhook.ts',
    before: webhookBefore,
    after: webhookAfter,
  },
];

/** Non-blank lines, so the labels never overstate the saving. */
export function countLines(code: string): number {
  return code.split('\n').filter((line) => line.trim() !== '').length;
}
