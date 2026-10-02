import Link from 'next/link';
import './styles.css';

/**
 * Links + copyright. No theme toggle here — the design kit puts the toggle in
 * the header, and the footer holds only navigation and the copyright line.
 */
const footerLinks = [
  { label: 'Docs', href: '/docs' },
  { label: 'Providers', href: '/#providers' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'GitHub', href: 'https://github.com/SquaredR98/paykit', external: true },
];

export function Footer() {
  return (
    <footer className="pk-v2-footer">
      <div className="pk-v2-wrap">
        <div className="pk-v2-inner pk-v2-footer__inner">
          <nav className="pk-v2-footer__links">
            {footerLinks.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ),
            )}
          </nav>
          <span className="pk-v2-footer__copy">
            &copy; {new Date().getFullYear()} SquaredR. MIT licensed.
          </span>
        </div>
      </div>
    </footer>
  );
}
