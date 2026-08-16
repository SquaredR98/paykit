import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { NavMobile } from './NavMobile';
import './styles.css';

const links = [
  { label: 'How it works', href: '#how' },
  { label: 'Providers', href: '#providers' },
  { label: 'Demos', href: '/demo' },
  { label: 'Docs', href: '/docs' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export function Nav() {
  return (
    <header className="pk-nav">
      <div className="pk-nav__inner">
        <Logo />
        <nav className="pk-nav__links">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="pk-nav__link">
              {link.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
        <a
          href="https://github.com/SquaredR98/paykit"
          className="pk-btn pk-btn--secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Star on GitHub
        </a>
        <Link href="/docs" className="pk-btn pk-btn--primary">
          Get started
        </Link>
        <div className="pk-nav__mobile-actions">
          <ThemeToggle />
          <NavMobile />
        </div>
      </div>
    </header>
  );
}
