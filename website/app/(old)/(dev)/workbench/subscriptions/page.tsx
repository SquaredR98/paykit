'use client';

import { Explainer } from '@/components/workbench/Explainer';
import { MermaidDiagram } from '@/components/workbench/MermaidDiagram';
import { SubscriptionsSection } from '@/components/workbench/sections/SubscriptionsSection';
import { useWorkbench } from '@/components/workbench/WorkbenchContext';

export default function SubscriptionsPage() {
  const { configuredProviders } = useWorkbench();

  return (
    <>
      <Explainer eyebrow="Operations" title="Subscriptions">
        <p>
          A <strong>subscription</strong> represents recurring billing &mdash; an
          agreement to charge a customer a fixed amount at a regular interval.
          PayKit normalizes the drastically different subscription models across
          providers into a single <code>UnifiedSubscription</code> type.
        </p>

        <h2>Provider mapping</h2>
        <p>
          Each provider models subscriptions differently:
        </p>
        <ul>
          <li>
            <strong>Stripe</strong>: Creates a <code>Price</code> (amount + interval)
            and attaches it to a <code>Subscription</code> on the customer.
          </li>
          <li>
            <strong>Razorpay</strong>: Creates a <code>Plan</code> and then a{' '}
            <code>Subscription</code> linked to the plan and customer.
          </li>
          <li>
            <strong>PayPal</strong>: Creates a <code>BillingPlan</code> with{' '}
            <code>PaymentDefinitions</code>, then a <code>BillingAgreement</code>.
          </li>
        </ul>
        <p>
          PayKit handles all of this behind <code>subscriptions.create()</code>.
          You pass <code>customer</code>, <code>amount</code>, <code>currency</code>,{' '}
          <code>interval</code>, and <code>intervalCount</code> &mdash; the adapter
          creates whatever intermediate objects the provider requires.
        </p>

        <h2>Status lifecycle</h2>
        <MermaidDiagram chart={`stateDiagram-v2
  [*] --> incomplete
  incomplete --> active
  active --> paused
  active --> canceled
  active --> expired
  paused --> active
  paused --> canceled`} />
        <p>
          <code>incomplete</code> means the first payment hasn&rsquo;t succeeded yet.
          Once active, a subscription stays active until paused, canceled by the
          merchant, or expired at the end of its term. PayKit normalizes these
          statuses across providers so you get consistent lifecycle events.
        </p>
      </Explainer>

      <div className="wb-section-interactive">
        <SubscriptionsSection configuredProviders={configuredProviders} />
      </div>
    </>
  );
}
