import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import './styles.css';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const columns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Docs', href: '/docs' },
      { label: 'Blog', href: '/blog' },
      { label: 'Providers', href: '/#providers' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Adapters',
    links: [
      { label: 'Stripe', href: '/docs/guides/stripe' },
      { label: 'Razorpay', href: '/docs/guides/razorpay' },
      { label: 'PayPal', href: '/docs/guides/paypal' },
      { label: 'All adapters', href: '/#providers' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'GitHub', href: 'https://github.com/SquaredR98/paykit', external: true },
      { label: 'Discussions', href: 'https://github.com/SquaredR98/paykit/discussions', external: true },
      { label: 'Contact', href: '/contact' },
      { label: 'MIT license', href: 'https://github.com/SquaredR98/paykit/blob/main/LICENSE', external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer className="pk-footer">
      <div className="pk-footer__grid">
        <div className="pk-fcol">
          <Logo />
          <p className="pk-footer__tagline">Open tools. Real code.</p>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="pk-fcol">
            <h4 className="pk-footer__heading">{col.title}</h4>
            <ul className="pk-footer__links">
              {col.links.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
                  ) : (
                    <Link href={link.href}>{link.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="pk-fcol">
          <h4 className="pk-footer__heading">Stay updated</h4>
          <p className="pk-footer__newsletter-desc">
            Product updates and dev insights. No spam.
          </p>
          <div className="pk-footer__sub">
            <input placeholder="you@company.com" type="email" />
            <button className="pk-btn pk-btn--primary" type="button">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="pk-footer__bottom">
        <span>&copy; 2026 SquaredR</span>
        <span>MIT licensed &middot; 400+ tests</span>
      </div>
    </footer>
  );
}
