'use client';

import { Explainer } from '@/components/workbench/Explainer';
import { MermaidDiagram } from '@/components/workbench/MermaidDiagram';
import { ProviderStatus } from '@/components/workbench/sections/ProviderStatus';
import { useWorkbench } from '@/components/workbench/WorkbenchContext';

export default function ProvidersPage() {
  const { providerStatuses } = useWorkbench();

  return (
    <>
      <Explainer eyebrow="Infrastructure" title="Providers">
        <p>
          A <strong>provider adapter</strong> is the bridge between PayKit&rsquo;s
          unified API and a payment provider&rsquo;s native SDK. Each adapter
          implements the <code>PaymentAdapter</code> interface &mdash; charges,
          refunds, customers, subscriptions &mdash; and maps between PayKit&rsquo;s
          normalized types and the provider&rsquo;s native objects.
        </p>
        <MermaidDiagram chart={`flowchart LR
  UP["UnifiedPayments"] --> PA["PaymentAdapter"]
  PA --> S["StripeAdapter"]
  PA --> R["RazorpayAdapter"]
  PA --> P["PayPalAdapter"]
  S --> S1["Stripe API"]
  R --> R1["Razorpay API"]
  P --> P1["PayPal API"]`} />

        <h2>Capabilities</h2>
        <p>
          Every adapter declares a <code>capabilities</code> object with 13 boolean
          flags (<code>charges</code>, <code>refunds</code>, <code>subscriptions</code>,{' '}
          <code>hostedCheckout</code>, etc.). This lets your app check at runtime
          whether a feature is available before calling it. The dashboard below
          shows each provider&rsquo;s capability flags.
        </p>

        <h2>Health checks</h2>
        <p>
          <code>adapter.healthCheck()</code> makes a lightweight API ping and
          measures round-trip latency. The result includes <code>healthy</code>{' '}
          (boolean), <code>latencyMs</code> (number), and an optional{' '}
          <code>message</code> if the check fails. Use it for monitoring or
          pre-flight checks.
        </p>

        <h2>Multi-provider routing</h2>
        <p>
          When you create a <code>UnifiedPayments</code> instance, you pass a
          single adapter. For multi-provider setups, create multiple instances
          and route at the application level based on currency, region, or cost.
          The workbench lets you switch between configured providers to compare
          behavior.
        </p>
      </Explainer>

      <div className="wb-section-interactive">
        <ProviderStatus initialStatuses={providerStatuses} />
      </div>
    </>
  );
}
