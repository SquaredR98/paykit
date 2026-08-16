'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { DocNavSection } from '../docs-types';
import './styles.css';

export function DocsMobileSidebar({ nav }: { nav: DocNavSection[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        className="pk-docs__mobile-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={open}
      >
        <svg
          width="18"
          height="18"
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
        <span>Menu</span>
      </button>

      {open && (
        <div className="pk-docs__mobile-drawer">
          {nav.map((section) => (
            <div key={section.label} className="pk-docs__navgrp">
              <h4>{section.label}</h4>
              <ul>
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? 'page' : undefined}
                      onClick={close}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
