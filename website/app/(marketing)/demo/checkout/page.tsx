import { highlight } from '@/lib/shiki';
import { CHECKOUT_STEPS } from '@/lib/demo-data/checkout-steps';
import { DemoPageHeader } from '@/components/demo/shared/DemoPageHeader';
import { DemoCheckout } from '@/components/demo/DemoCheckout';

export const metadata = {
  title: 'Checkout Demo — PayKit',
  description: 'Walk through a real payment flow — from product selection to payment confirmation — with live Stripe, Razorpay, and PayPal checkouts.',
};

export default async function CheckoutDemoPage() {
  // Pre-highlight all code snippets on the server
  const entries = await Promise.all(
    CHECKOUT_STEPS.map(async (step) => {
      const html = await highlight(step.code);
      return [step.key, html] as const;
    }),
  );
  const codeHtmls = Object.fromEntries(entries);

  return (
    <>
      <DemoPageHeader
        eyebrow="Interactive demo"
        title="Full checkout journey"
        description="Walk through a real payment flow — pick a product, choose a provider, complete checkout, and see the unified response."
      />
      <DemoCheckout codeHtmls={codeHtmls} />
    </>
  );
}
