import type { DocNavSection } from './docs-types';

export const docsNav: DocNavSection[] = [
  {
    label: 'Getting started',
    items: [
      { title: 'Introduction', href: '/docs' },
      { title: 'Installation', href: '/docs/getting-started/installation' },
      { title: 'Quick start', href: '/docs/getting-started/quick-start' },
    ],
  },
  {
    label: 'Core concepts',
    items: [
      { title: 'Architecture', href: '/docs/core-concepts/architecture' },
    ],
  },
  {
    label: 'Guides',
    items: [
      { title: 'Stripe', href: '/docs/guides/stripe' },
      { title: 'Razorpay', href: '/docs/guides/razorpay' },
      { title: 'PayPal', href: '/docs/guides/paypal' },
      { title: 'Webhooks', href: '/docs/guides/webhooks' },
      { title: 'Multi-provider', href: '/docs/guides/multi-provider' },
      { title: 'Testing', href: '/docs/guides/testing' },
      { title: 'Custom adapters', href: '/docs/guides/custom-adapter' },
      { title: 'Migration', href: '/docs/guides/migration' },
    ],
  },
  {
    label: 'Reference',
    items: [
      { title: 'API reference', href: '/docs/reference/api-reference' },
      { title: 'FAQ', href: '/docs/reference/faq' },
    ],
  },
];

export const allDocPages = docsNav.flatMap((s) => s.items);

export function getDocPagination(currentPath: string) {
  const idx = allDocPages.findIndex((p) => p.href === currentPath);
  return {
    prev: idx > 0 ? allDocPages[idx - 1] : null,
    next: idx < allDocPages.length - 1 ? allDocPages[idx + 1] : null,
  };
}
