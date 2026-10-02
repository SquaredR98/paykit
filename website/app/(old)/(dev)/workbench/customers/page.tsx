'use client';

import { Explainer } from '@/components/workbench/Explainer';
import { CustomersSection } from '@/components/workbench/sections/CustomersSection';
import { useWorkbench } from '@/components/workbench/WorkbenchContext';

export default function CustomersPage() {
  const { configuredProviders } = useWorkbench();

  return (
    <>
      <Explainer eyebrow="Operations" title="Customers">
        <p>
          A <strong>customer</strong> object represents a reusable identity for
          saving payment methods, tracking purchase history, and managing
          subscriptions. All three providers support customers, but the underlying
          models differ &mdash; PayKit normalizes them into <code>UnifiedCustomer</code>.
        </p>

        <h2>CRUD operations</h2>
        <p>
          PayKit exposes five operations on customers:{' '}
          <code>create</code>, <code>retrieve</code>, <code>update</code>,{' '}
          <code>delete</code>, and <code>list</code>. Each maps to the
          provider&rsquo;s equivalent endpoint. For Stripe that&rsquo;s the{' '}
          <code>/v1/customers</code> API; for Razorpay it&rsquo;s{' '}
          <code>/v1/customers</code>; for PayPal it&rsquo;s the Customer resource
          within the Vault API.
        </p>

        <h2>Metadata</h2>
        <p>
          You can attach arbitrary key-value pairs via the <code>metadata</code>{' '}
          parameter. These are stored on the provider side and returned in
          responses. Use metadata to link customers to your internal user IDs,
          tag records for reporting, or pass context through the payment flow.
        </p>
        <p>
          The workbench automatically tags every operation with{' '}
          <code>{`{ source: "dev-workbench" }`}</code> so you can distinguish
          test data from production records.
        </p>
      </Explainer>

      <div className="wb-section-interactive">
        <CustomersSection configuredProviders={configuredProviders} />
      </div>
    </>
  );
}
