import type { Metadata } from 'next';
import { Explainer } from '@/components/workbench/Explainer';
import { MermaidDiagram } from '@/components/workbench/MermaidDiagram';
import { CodeBlock } from '@/components/workbench/CodeBlock';

export const metadata: Metadata = {
  title: 'Dev Workbench',
  robots: { index: false, follow: false },
};

export default function WorkbenchOverview() {
  return (
    <Explainer eyebrow="Dev Workbench" title="PayKit Interactive Workbench">
      <p>
        PayKit is a unified payment SDK that normalizes Stripe, Razorpay, and PayPal
        behind a single API. This workbench lets you interact with every feature
        in real time &mdash; create charges, inspect errors, test retry logic &mdash;
        while seeing exactly what happens under the hood.
      </p>

      <h2>Architecture</h2>
      <p>
        Every operation flows through the same pipeline:
      </p>
      <MermaidDiagram chart={`graph TD
  A["Your App"] --> B["UnifiedPayments"]
  B --> C["PaymentAdapter"]
  C --> D["Provider API"]
  B -.- B1(["retry, hooks, logging"])
  C -.- C1(["Stripe / Razorpay / PayPal"])
  D -.- D1(["provider-native HTTP call"])`} />
      <p>
        <code>UnifiedPayments</code> wraps a <code>PaymentAdapter</code> and adds
        retry with exponential backoff, lifecycle hooks (<code>onRequest</code>,{' '}
        <code>onResponse</code>, <code>onError</code>), and structured logging.
        Every response includes <code>_meta</code> (timing, request ID, attempt count)
        and <code>_raw</code> (the exact provider response).
      </p>

      <h2>What each page covers</h2>
      <table>
        <thead>
          <tr><th>Page</th><th>What you learn</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>Charges</strong></td><td>Create, retrieve, and list charges. See how <code>UnifiedCharge</code> normalizes PaymentIntents, Orders, and Captures.</td></tr>
          <tr><td><strong>Refunds</strong></td><td>Full and partial refunds. Understand the <code>chargeId</code> linkage and <code>UnifiedRefund</code> mapping.</td></tr>
          <tr><td><strong>Customers</strong></td><td>Full CRUD operations. See how customer objects and metadata work across providers.</td></tr>
          <tr><td><strong>Subscriptions</strong></td><td>Recurring billing. Learn how intervals map across Stripe Prices, Razorpay Plans, and PayPal Billing Plans.</td></tr>
          <tr><td><strong>Currency Tools</strong></td><td>Convert between human amounts and smallest-unit integers. Understand zero-decimal and three-decimal currencies.</td></tr>
          <tr><td><strong>Error Catalog</strong></td><td>All 18 unified error codes with suggestions. See how provider errors map to <code>PaymentErrorCode</code>.</td></tr>
          <tr><td><strong>Providers</strong></td><td>Health checks, latency, and capability flags for each configured adapter.</td></tr>
          <tr><td><strong>Retry &amp; Hooks</strong></td><td>Test retry with exponential backoff. Watch lifecycle hooks fire in real time via the event timeline.</td></tr>
        </tbody>
      </table>

      <h2>Quick start</h2>
      <p>
        Set your provider keys in <code>.env.local</code> to enable each adapter:
      </p>
      <CodeBlock filename=".env.local">{`# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_SANDBOX=true`}</CodeBlock>
      <p>
        You don&rsquo;t need all three &mdash; configure whichever providers you want
        to test. Unconfigured providers will show as &ldquo;Not Configured&rdquo; in
        the Providers page. Use the sidebar to navigate to any section.
      </p>
    </Explainer>
  );
}
