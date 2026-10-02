/**
 * Homepage FAQ.
 *
 * Answers are drawn from content/docs/reference/faq.md, with three corrections
 * — the docs version contains claims the audit in .plan/website-claims-audit.md
 * flagged as false, and those must not be republished here:
 *
 *   1. "Every adapter verifies webhook signatures" — PayPal's sync verify() is
 *      structural only (it checks headers are present). Audit finding C1.
 *   2. "It throws a NotSupportedError" — only true when the adapter implements
 *      the operation group. When the group is absent entirely the property is
 *      undefined. Audit finding M3.
 *   3. Bundle sizes — the docs quote figures that do not match the built
 *      output, so no size is claimed here at all. Audit finding H3.
 *
 * `answer` is a React node so a few answers can carry inline code.
 */
import type { ReactNode } from 'react';

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

export const faqItems: FaqItem[] = [
  {
    question: 'Does PayKit touch my money or card data?',
    answer:
      'No. PayKit is a library that runs in your own process — requests go straight from your server to the provider, and PayKit never proxies a payment or adds a fee. Card data is tokenised by the provider\'s own hosted fields, so your PCI scope is the same as using their SDK directly.',
  },
  {
    question: 'Can I still use provider-specific features?',
    answer: (
      <>
        Yes. Every unified object keeps the untouched provider response on{' '}
        <code>_raw</code>, so anything PayKit does not model is still reachable.
        You can also drop to the provider SDK for one call and keep using PayKit
        for the rest — it does not take ownership of your integration.
      </>
    ),
  },
  {
    question: 'Are webhook signatures verified?',
    answer: (
      <>
        Stripe and Razorpay signatures are verified cryptographically using each
        provider&rsquo;s own method. PayPal is the exception: its synchronous{' '}
        <code>verify()</code> checks that the required headers are present but
        does <strong>not</strong> validate the signature, because PayPal requires
        an API round-trip to do so. Call{' '}
        <code>verifyWebhookAsync()</code> on the PayPal adapter for real
        verification.
      </>
    ),
  },
  {
    question: 'What happens if a provider does not support an operation?',
    answer: (
      <>
        Check <code>paykit.capabilities</code> first — there are 13 flags
        covering charges, refunds, subscriptions, payouts and more. Operation
        groups a provider does not support are <code>undefined</code> rather
        than present-and-throwing, so guard with{' '}
        <code>if (paykit.subscriptions)</code> before calling one.
      </>
    ),
  },
  {
    question: 'Is PayKit really free?',
    answer:
      'Yes — MIT licensed, the whole thing. Core, every adapter, the React components and the JS SDK. There is no paid tier, no dashboard upsell, no license key, and no telemetry phoning home.',
  },
  {
    question: 'Which runtimes and frameworks work?',
    answer: (
      <>
        Node.js 20+ on the server, with any framework — Express, Fastify, Hono,
        Koa, Next.js. The core uses standard Node APIs, so Bun and Deno should
        work, though only Node is covered by the test suite today. On the
        frontend there are React components and a headless JS SDK.
      </>
    ),
  },
];
