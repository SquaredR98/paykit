import { DemoPageHeader } from '@/components/demo/shared/DemoPageHeader';
import { DemoWebhooks } from '@/components/demo/DemoWebhooks';

export const metadata = {
  title: 'Webhook Inspector — PayKit',
  description: 'Compare raw webhook payloads from Stripe, Razorpay, and PayPal with PayKit\'s normalized UnifiedWebhookEvent.',
};

export default function WebhooksDemoPage() {
  return (
    <>
      <DemoPageHeader
        eyebrow="Interactive demo"
        title="Webhook inspector"
        description="Every provider sends webhooks in a different format. PayKit normalizes them into a single UnifiedWebhookEvent — same shape, same event types, regardless of provider."
      />
      <DemoWebhooks />
    </>
  );
}
