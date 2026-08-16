import Link from 'next/link';
import { DemoPageHeader } from '@/components/demo/shared/DemoPageHeader';

export const metadata = {
  title: 'Interactive Demos — PayKit',
  description: 'Hands-on demos for checkout flows, error normalization, webhook inspection, and multi-provider routing.',
};

const demos = [
  {
    href: '/demo/checkout',
    title: 'Checkout journey',
    description: 'Walk through a real payment flow — pick a product, choose a provider, complete checkout, and see the unified response.',
  },
  {
    href: '/demo/errors',
    title: 'Error normalization',
    description: 'See how PayKit maps provider-specific errors into a unified PaymentError with actionable suggestions.',
  },
  {
    href: '/demo/webhooks',
    title: 'Webhook inspector',
    description: 'Compare raw webhook payloads from Stripe, Razorpay, and PayPal with the normalized UnifiedWebhookEvent.',
  },
  {
    href: '/demo/routing',
    title: 'Routing playground',
    description: 'Build routing rules and test how PaymentRouter resolves the right provider for each currency.',
  },
];

export default function DemoIndexPage() {
  return (
    <>
      <DemoPageHeader
        eyebrow="Interactive demos"
        title="See PayKit in action"
        description="Explore live checkouts, error normalization, webhook handling, and multi-provider routing — all powered by real PayKit code."
      />
      <div className="pk-demo-index">
        {demos.map((demo) => (
          <Link key={demo.href} href={demo.href} className="pk-demo-index__card">
            <h2 className="pk-demo-index__card-title">{demo.title}</h2>
            <p className="pk-demo-index__card-desc">{demo.description}</p>
            <span className="pk-demo-index__card-link">
              Try it
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
