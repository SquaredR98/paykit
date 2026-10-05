'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavLink } from './NavPill';

/**
 * The nav as a panel, for widths where the pill does not fit.
 *
 * Mirrors the portfolio's MobileNavigation: a "Menu" pill that opens a
 * backdrop plus a panel listing every destination. Entries with children are
 * flattened into a labelled group, so a phone shows the full set rather than
 * hiding pages behind a dropdown inside a dropdown.
 *
 * Built with useState rather than a popover library — the site carries no
 * headless UI dependency and this is one menu.
 */
export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation, and on Escape while open.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    // Stop the page scrolling behind the panel.
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="pk-v2-mobilenav__btn pk-v2-chip-glass"
        aria-expanded={open}
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
      >
        Menu
        <ChevronIcon />
      </button>

      {open && (
        <>
          <div
            className="pk-v2-mobilenav__backdrop"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="pk-v2-mobilenav__panel" role="dialog" aria-modal="true">
            <div className="pk-v2-mobilenav__head">
              <h2>Navigation</h2>
              <button
                type="button"
                aria-label="Close navigation"
                className="pk-v2-mobilenav__close"
                onClick={() => setOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="pk-v2-mobilenav__list">
              {links.map((link) =>
                link.children ? (
                  <div key={link.label} className="pk-v2-mobilenav__group">
                    <span className="pk-v2-mobilenav__group-label">
                      {link.label}
                    </span>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={
                          pathname === child.href
                            ? 'pk-v2-mobilenav__link is-active'
                            : 'pk-v2-mobilenav__link'
                        }
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={
                      pathname === link.href
                        ? 'pk-v2-mobilenav__link is-active'
                        : 'pk-v2-mobilenav__link'
                    }
                  >
                    {link.label}
                  </Link>
                ),
              )}
              {/*
                The header's CTA chip is hidden below 480px, so this is the
                only route to it on a phone. Same reason the portfolio puts its
                resume link in this panel.
              */}
              <a
                className="pk-v2-mobilenav__cta"
                href="https://ravi-ranjan.in/contact"
                target="_blank"
                rel="noopener noreferrer"
              >
                Need payments built?
              </a>
            </nav>
          </div>
        </>
      )}
    </>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
