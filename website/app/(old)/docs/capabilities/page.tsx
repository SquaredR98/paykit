import type { Metadata } from 'next';
import { CapabilityMatrix } from '@/components/docs/CapabilityMatrix';

export const metadata: Metadata = {
  title: 'Provider Capabilities — PayKit Docs',
  description:
    'Compare what each payment provider supports. Interactive capability matrix for Stripe, Razorpay, and PayPal.',
  alternates: { canonical: '/docs/capabilities' },
};

export default function CapabilitiesPage() {
  return <CapabilityMatrix />;
}
