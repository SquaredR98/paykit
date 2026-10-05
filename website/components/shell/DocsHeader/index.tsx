import { HeaderFrame } from '@/components/shell/Header/HeaderFrame';
import type { NavLink } from '@/components/shell/Header/NavPill';

/**
 * Header for the docs route group.
 *
 * The doc sections live in the nav pill rather than a left sidebar or a second
 * bar, with dropdowns for the sections that have several pages. The action is a
 * version pill — a CTA competing with the page's own navigation is noise on a
 * reference page.
 */
const links: NavLink[] = [
  { label: 'Introduction', href: '/docs' },
  {
    label: 'Getting started',
    href: '/docs/getting-started/installation',
    children: [
      { label: 'Installation', href: '/docs/getting-started/installation' },
      { label: 'Quick start', href: '/docs/getting-started/quick-start' },
      { label: 'Architecture', href: '/docs/core-concepts/architecture' },
    ],
  },
  {
    label: 'Guides',
    href: '/docs/guides/stripe',
    children: [
      { label: 'Stripe', href: '/docs/guides/stripe' },
      { label: 'Razorpay', href: '/docs/guides/razorpay' },
      { label: 'PayPal', href: '/docs/guides/paypal' },
      { label: 'Webhooks', href: '/docs/guides/webhooks' },
      { label: 'Multi-provider', href: '/docs/guides/multi-provider' },
      { label: 'Testing', href: '/docs/guides/testing' },
      { label: 'Custom adapters', href: '/docs/guides/custom-adapter' },
      { label: 'Migration', href: '/docs/guides/migration' },
    ],
  },
  {
    label: 'Reference',
    href: '/docs/reference/api-reference',
    children: [
      { label: 'API reference', href: '/docs/reference/api-reference' },
      { label: 'FAQ', href: '/docs/reference/faq' },
      { label: 'Capabilities', href: '/docs/capabilities' },
      { label: 'API explorer', href: '/docs/api-explorer' },
    ],
  },
  { label: 'Home', href: '/' },
];

export function DocsHeader() {
  return (
    <HeaderFrame
      links={links}
      action={<span className="pk-v2-version">v0.10</span>}
    />
  );
}
