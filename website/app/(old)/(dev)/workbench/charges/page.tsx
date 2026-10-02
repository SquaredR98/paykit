'use client';

import { Explainer } from '@/components/workbench/Explainer';
import { MermaidDiagram } from '@/components/workbench/MermaidDiagram';
import { CodeBlock } from '@/components/workbench/CodeBlock';
import { ChargesSection } from '@/components/workbench/sections/ChargesSection';
import { useWorkbench } from '@/components/workbench/WorkbenchContext';

export default function ChargesPage() {
  const { configuredProviders } = useWorkbench();

  return (
    <>
      <Explainer eyebrow="Operations" title="Charges">
        <p>
          A <strong>charge</strong> is the core payment operation &mdash; it
          represents a request to move money from a customer to your account.
          In PayKit, every charge follows the same lifecycle regardless of provider:
        </p>
        <MermaidDiagram chart={`stateDiagram-v2
  [*] --> create
  create --> pending
  pending --> succeeded
  pending --> failed`} />

        <h2>How UnifiedCharge works</h2>
        <p>
          Each provider models charges differently. Stripe uses{' '}
          <code>PaymentIntent</code>, Razorpay uses <code>Order</code>, and PayPal
          uses <code>Order</code> with a <code>Capture</code>. PayKit normalizes all
          of them into a single <code>UnifiedCharge</code> shape:
        </p>
        <CodeBlock filename="UnifiedCharge">{`{
  id: "ch_...",            // PayKit-normalized ID
  amount: 1000,            // smallest unit (cents)
  currency: "USD",
  status: "succeeded",
  provider: "stripe",
  clientSecret: "pi_...",  // for client-side confirmation
  _meta: { requestId, durationMs, attempt },
  _raw: { ... }            // exact provider response
}`}</CodeBlock>

        <h2>Key fields</h2>
        <p>
          <code>clientSecret</code> is returned by providers that require client-side
          confirmation (Stripe&rsquo;s <code>PaymentIntent.client_secret</code>,
          Razorpay&rsquo;s order for checkout.js). Your frontend uses it to complete
          the payment flow.
        </p>
        <p>
          <code>_meta</code> contains request metadata: the <code>requestId</code>{' '}
          (UUID), <code>durationMs</code> (wall-clock time), and <code>attempt</code>{' '}
          (which retry succeeded, starting at 1).
        </p>
        <p>
          <code>_raw</code> contains the exact response from the provider API, useful
          for debugging or accessing provider-specific fields PayKit doesn&rsquo;t normalize.
        </p>
      </Explainer>

      <div className="wb-section-interactive">
        <ChargesSection configuredProviders={configuredProviders} />
      </div>
    </>
  );
}
