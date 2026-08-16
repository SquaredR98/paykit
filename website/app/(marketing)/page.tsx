import { HomepageView } from '@/components/homepage/HomepageView';
import type { Metadata } from 'next';

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
    'A unified TypeScript SDK for accepting payments across Stripe, Razorpay, PayPal and more. One API, every provider.',
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
