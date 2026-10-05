import { HeaderFrame } from '@/components/shell/Header/HeaderFrame';
import type { NavLink } from '@/components/shell/Header/NavPill';

/**
 * Header for the (marketing) route group.
 *
 * Nav is on-page section anchors, so scroll-spy is on. The action is the
 * consulting CTA — PayKit itself is free, so there is no "get API key".
 *
 * There is deliberately no "Pricing" entry: PayKit is MIT-licensed open source
 * with no paid tier, so the design kit's pricing section is not built.
 */
const links: NavLink[] = [
  { label: 'Demo', href: '#demo' },
  { label: 'Providers', href: '#providers' },
  { label: 'Code', href: '#compare' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Docs', href: '/docs' },
];

export function MarketingHeader() {
  return (
    <HeaderFrame
      links={links}
      spy
      action={
        <a
          className="pk-v2-cta-chip"
          href="https://ravi-ranjan.in/contact"
          target="_blank"
          rel="noopener noreferrer"
        >
          Need payments built?
        </a>
      }
    />
  );
}
