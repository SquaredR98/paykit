import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';
import { NavPill } from './NavPill';
import './styles.css';

/**
 * Sticky header: logo left, glass nav pill centre, theme toggle + CTA right.
 *
 * Layout matches design-system/ui_kits/marketing/index.html — the toggle lives
 * here in the header, not in the footer.
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

export function Header() {
  return (
    <header className="pk-v2-header">
      <div className="pk-v2-wrap">
        <div className="pk-v2-inner pk-v2-header__inner">
          <div className="pk-v2-header__side">
            <Link href="/" className="pk-v2-lockup">
              <Image src="/v2/mark.svg" width={30} height={30} alt="" priority />
              <b>
                Pay<span>Kit</span>
              </b>
            </Link>
          </div>

          <NavPill links={navLinks} />

          <div className="pk-v2-header__side pk-v2-header__side--end">
            <ThemeToggle />
            {/*
              PayKit itself is free, so there is no "get API key" action. The CTA
              instead points at consulting on the portfolio site — an absolute
              URL because it leaves this domain.
            */}
            <a
              className="pk-v2-cta-chip"
              href="https://ravi-ranjan.in/contact"
              target="_blank"
              rel="noopener noreferrer"
            >
              Need payments built?
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
