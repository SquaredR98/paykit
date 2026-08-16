'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const demoLinks = [
  { href: '/demo/checkout', label: 'Checkout' },
  { href: '/demo/errors', label: 'Errors' },
  { href: '/demo/webhooks', label: 'Webhooks' },
  { href: '/demo/routing', label: 'Routing' },
];

export function DemoNav() {
  const pathname = usePathname();

  return (
    <nav className="pk-demo-nav">
      {demoLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`pk-demo-nav__link${pathname === link.href ? ' pk-demo-nav__link--active' : ''}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
