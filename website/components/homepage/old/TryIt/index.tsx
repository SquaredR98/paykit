import { highlight } from '@/lib/shiki';
import { TryItTabs } from './TryItTabs';
import './styles.css';

const chargesCode = `const paykit = new PayKit({ adapter: stripe });

// 1. Authorize (hold funds)
const charge = await paykit.charges.create({
  amount: 5000,
  currency: 'usd',
  capture: false,           // auth-only
  metadata: { orderId: 'order_789' },
});

// 2. Capture when ready
const captured = await paykit.charges.capture(charge.id);

// 3. Partial refund
const refund = await paykit.refunds.create({
  chargeId: charge.id,
  amount: 2500,             // half back
});`;

const webhooksCode = `import { WEBHOOK_EVENTS } from '@squaredr/paykit';

const event = paykit.webhooks.construct({
  payload: rawBody,
  signature: req.headers['stripe-signature'],
  secret: process.env.STRIPE_WEBHOOK_SECRET!,
});

switch (event.type) {
  case WEBHOOK_EVENTS.CHARGE_SUCCEEDED:
    await fulfillOrder(event.data);
    break;
  case WEBHOOK_EVENTS.REFUND_COMPLETED:
    await notifyCustomer(event.data);
    break;
  case WEBHOOK_EVENTS.SUBSCRIPTION_RENEWED:
    await extendAccess(event.data);
    break;
}`;

const routingCode = `import { PaymentRouter } from '@squaredr/paykit';

const router = new PaymentRouter({
  routes: [
    { currency: 'INR', adapter: razorpay },
    { currency: 'EUR', adapter: paypal },
    { region: 'SEA',   adapter: razorpay },
  ],
  default: stripe,
});

// Automatically picks Razorpay for INR
const charge = await router.createCharge({
  amount: 50000,
  currency: 'INR',
});
console.log(charge.provider); // 'razorpay'`;

const errorsCode = `import { PaymentError } from '@squaredr/paykit';

try {
  await paykit.charges.create({ amount: 100, currency: 'usd' });
} catch (err) {
  if (err instanceof PaymentError) {
    console.log(err.code);        // 'card_declined'
    console.log(err.suggestion);  // 'Try a different card…'
    console.log(err.isRetryable); // true
    console.log(err.provider);    // 'stripe'
    console.log(err.providerCode); // 'card_declined'
  }
}`;

const CODE_TABS = [
  { label: 'Charges', code: chargesCode },
  { label: 'Webhooks', code: webhooksCode },
  { label: 'Routing', code: routingCode },
  { label: 'Errors', code: errorsCode },
];

export async function TryIt() {
  const tabs = await Promise.all(
    CODE_TABS.map(async (tab) => ({
      label: tab.label,
      html: await highlight(tab.code),
    })),
  );

  return (
    <section className="pk-blk pk-tryit">
      <div className="pk-sechead pk-sechead--center">
        <span className="pk-eyebrow">See the code</span>
        <h2 className="pk-sec-title">Built for real payment flows</h2>
        <p className="pk-lede">
          Auth-capture, webhooks, multi-provider routing, and unified errors — all with the same API.
        </p>
      </div>
      <div className="pk-tryit__body">
        <TryItTabs tabs={tabs} />
      </div>
    </section>
  );
}
