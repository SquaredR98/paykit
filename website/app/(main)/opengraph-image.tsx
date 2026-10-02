import { generateOgImage, OG_SIZE } from '@/lib/og-image';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'PayKit — Unified payment SDK for Node.js';

export default async function OgImage() {
  return generateOgImage({
    eyebrow: 'Open Source',
    title: 'Unified payment SDK for Node.js.',
    description:
      'One API for Stripe, Razorpay, PayPal and more. TypeScript-first with React components — charges, refunds, subscriptions, webhooks.',
  });
}
