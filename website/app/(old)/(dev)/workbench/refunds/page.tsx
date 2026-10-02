'use client';

import { Explainer } from '@/components/workbench/Explainer';
import { CodeBlock } from '@/components/workbench/CodeBlock';
import { RefundsSection } from '@/components/workbench/sections/RefundsSection';
import { useWorkbench } from '@/components/workbench/WorkbenchContext';

export default function RefundsPage() {
  const { configuredProviders } = useWorkbench();

  return (
    <>
      <Explainer eyebrow="Operations" title="Refunds">
        <p>
          A <strong>refund</strong> reverses a previously captured charge, moving
          money back to the customer. PayKit supports both full and partial refunds
          through a single <code>refunds.create()</code> call.
        </p>

        <h2>Full vs partial refunds</h2>
        <p>
          Omit the <code>amount</code> parameter for a full refund &mdash; PayKit will
          refund the entire charge amount. To refund a portion, pass{' '}
          <code>amount</code> in smallest-unit integers (e.g. <code>500</code> to
          refund $5.00 on a $10.00 charge). You can issue multiple partial refunds
          until the original charge amount is fully refunded.
        </p>

        <h2>How UnifiedRefund maps across providers</h2>
        <p>
          Stripe has a native <code>Refund</code> object. Razorpay uses the{' '}
          <code>refunds</code> endpoint on a Payment. PayPal uses a{' '}
          <code>Capture Refund</code> resource. PayKit normalizes all of them into:
        </p>
        <CodeBlock filename="UnifiedRefund">{`{
  id: "re_...",
  chargeId: "ch_...",    // links back to the original charge
  amount: 500,
  currency: "USD",
  status: "succeeded",
  reason: "customer_request",
  provider: "stripe"
}`}</CodeBlock>

        <h2>The chargeId linkage</h2>
        <p>
          Every refund references its parent charge via <code>chargeId</code>.
          This is the PayKit-normalized charge ID, not the provider&rsquo;s native
          ID. Use it to correlate refunds with charges in your application logic.
        </p>
      </Explainer>

      <div className="wb-section-interactive">
        <RefundsSection configuredProviders={configuredProviders} />
      </div>
    </>
  );
}
