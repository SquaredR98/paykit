import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';
import { NavPill } from './NavPill';
import './styles.css';

/**
 * Sticky header: logo left, glass nav pill centre, theme toggle + action right.
 *
 * Layout matches design-system/ui_kits/ — the toggle lives here in the header,
 * not in the footer.
 *
 * The docs variant widens to the docs panel, swaps the homepage section
 * anchors for routes, and replaces the consulting CTA with a version pill. A
 * CTA competing with the page's own navigation is noise on a reference page.
 */

/**
 * Nav targets. These are section anchors on the homepage plus the docs link.
 *
 * There is deliberately no "Pricing" entry: PayKit is MIT-licensed open source
 * with no paid tier, so the design kit's pricing section is not built.
 */
export const navLinks = [
  { label: 'Demo', href: '#demo' },
  { label: 'Providers', href: '#providers' },
  { label: 'Code', href: '#compare' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Docs', href: '/docs' },
];

/** Docs nav — top-level destinations rather than on-page anchors. */
const docsNavLinks = [
  { label: 'Docs', href: '/docs' },
  { label: 'Guides', href: '/docs/guides/stripe' },
  { label: 'API', href: '/docs/reference/api-reference' },
  { label: 'Home', href: '/' },
];

export function Header({
  variant = 'marketing',
}: {
  variant?: 'marketing' | 'docs';
}) {
  const docs = variant === 'docs';

  return (
    <header className="pk-v2-header">
      <div className={docs ? 'pk-v2-wrap pk-v2-wrap--docs' : 'pk-v2-wrap'}>
        <div
          className={
            docs ? 'pk-v2-header__inner' : 'pk-v2-inner pk-v2-header__inner'
          }
        >
          <div className="pk-v2-header__side">
            <Link href="/" className="pk-v2-lockup">
              <Image src="/v2/mark.svg" width={30} height={30} alt="" priority />
              <b>
                Pay<span>Kit</span>
              </b>
            </Link>
          </div>

          <NavPill links={docs ? docsNavLinks : navLinks} spy={!docs} />

          <div className="pk-v2-header__side pk-v2-header__side--end">
            <ThemeToggle />
            {docs ? (
              <span className="pk-v2-version">v0.10</span>
            ) : (
              /*
                PayKit itself is free, so there is no "get API key" action. The
                CTA instead points at consulting on the portfolio site — an
                absolute URL because it leaves this domain.
              */
              <a
                className="pk-v2-cta-chip"
                href="https://ravi-ranjan.in/contact"
                target="_blank"
                rel="noopener noreferrer"
              >
                Need payments built?
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
