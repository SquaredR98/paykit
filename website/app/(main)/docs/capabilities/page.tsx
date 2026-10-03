import type { Metadata } from 'next';
import { CapabilityMatrix } from '@/components/docs/CapabilityMatrix';
import {
  getProviderCapabilities,
  PROVIDER_ORDER,
  PROVIDER_LABELS,
} from '@/lib/provider-capabilities';

export const metadata: Metadata = {
  title: 'Provider Capabilities — PayKit Docs',
  description:
    'Compare what each payment provider supports. Interactive capability matrix for Stripe, Razorpay, and PayPal.',
  alternates: { canonical: '/docs/capabilities' },
};

/**
 * Capability matrix.
 *
 * A server component so the flags can be read from the adapters at build time
 * rather than hardcoded in the client component (Rule M3). The matrix itself
 * stays a client component because selecting a cell reveals a code snippet.
 */
export default function CapabilitiesPage() {
  return (
    <CapabilityMatrix
      capabilities={getProviderCapabilities()}
      providers={PROVIDER_ORDER}
      providerLabels={PROVIDER_LABELS}
    />
  );
}
