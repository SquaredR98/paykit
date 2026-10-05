import type { Metadata } from 'next';
import { HomepageView } from '@/components/homepage/HomepageView';

/**
 * The homepage.
 *
 * Layer 3 per Rule W1 — a thin route that renders exactly one view. The shell
 * and header come from (marketing)/layout.tsx. Metadata and JSON-LD carried
 * over from the v1 route so the swap did not lose structured data.
 */

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PayKit',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Node.js',
  description:
    'A unified TypeScript SDK for accepting payments across Stripe, Razorpay and PayPal. One API, every provider.',
  url: 'https://paykit.squaredr.tech',
  author: { '@type': 'Organization', name: 'SquaredR', url: 'https://squaredr.tech' },
  license: 'https://opensource.org/licenses/MIT',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  programmingLanguage: 'TypeScript',
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomepageView />
    </>
  );
}
