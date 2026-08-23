import { highlightDiff } from '@/lib/shiki';
import { Counter } from './Counter';
import './styles.css';

const diffCode = `if (provider === 'stripe') { // [!code --]
  const intent = await stripe.paymentIntents.create({ // [!code --]
    amount, currency: 'usd', payment_method_types: ['card'], // [!code --]
  }); // [!code --]
  return { id: intent.id, status: intent.status }; // [!code --]
} else if (provider === 'razorpay') { // [!code --]
  const order = await razorpay.orders.create({ // [!code --]
    amount: amount * 100, currency: 'INR', // [!code --]
  }); // [!code --]
  return { id: order.id, status: order.status }; // [!code --]
} // [!code --]
// … more providers, more branches // [!code --]
const charge = await paykit.charges.create({ // [!code ++]
  amount, // [!code ++]
  currency, // [!code ++]
  metadata: { orderId }, // [!code ++]
}); // [!code ++]
// [!code ++]
// Same shape from every provider. Swap the adapter, // [!code ++]
// zero changes to your business logic. // [!code ++]`;

export async function BeforeAfter() {
  const codeHtml = await highlightDiff(diffCode);

  return (
    <section className="pk-blk">
      <div className="pk-sechead pk-sechead--center">
        <span className="pk-eyebrow">Before &amp; after</span>
        <h2 className="pk-sec-title">Kill the spaghetti code</h2>
        <p className="pk-lede">
          Replace provider-specific branches with a single, clean interface.
        </p>
      </div>
      <div className="pk-diff__body">
        <div className="pk-term">
          <div className="pk-term__bar">
            <span className="pk-term__file">payments.ts</span>
            <span className="pk-term__meta">
              <span className="pk-term__note">&minus;13 +8</span>
            </span>
          </div>
          <div dangerouslySetInnerHTML={{ __html: codeHtml }} />
        </div>
      </div>
      <Counter target={13} />
    </section>
  );
}
