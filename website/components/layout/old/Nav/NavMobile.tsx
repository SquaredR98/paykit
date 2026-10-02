'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

const links = [
  { label: 'Live demo', href: '#demo' },
  { label: 'How it works', href: '#how' },
  { label: 'Providers', href: '#providers' },
  { label: 'Demos', href: '/demo' },
  { label: 'Docs', href: '/docs' },
  { label: 'Blog', href: '/blog' },
  { label: 'Star on GitHub', href: 'https://github.com/SquaredR98/paykit', external: true },
];

export function NavMobile() {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        className="pk-nav__hamburger"
        onClick={toggle}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
        >
          {open ? (
            <>
              <path d="M18 6 6 18" />
              <path d="M6 6l12 12" />
            </>
          ) : (
            <>
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div className="pk-nav__drawer">
          {links.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                className="pk-nav__drawer-link"
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="pk-nav__drawer-link"
                onClick={close}
              >
                {link.label}
              </Link>
            )
          )}
          <Link href="/docs" className="pk-nav__drawer-cta" onClick={close}>
            Get started
          </Link>
        </div>
      )}
    </>
  );
}
