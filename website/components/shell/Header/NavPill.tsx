'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export interface NavLink {
  label: string;
  href: string;
  /** Rendered as a dropdown when present — used by the docs sections. */
  children?: { label: string; href: string }[];
}

/**
 * The centre nav pill — the site's only navigation.
 *
 * Three kinds of entry, highlighted differently:
 *   - `#anchor` links use scroll-spy, because anchors do not update on scroll
 *   - route links are active when the path matches
 *   - entries with `children` open a dropdown and are active when the current
 *     page is one of those children
 *
 * The docs put their sections here rather than in a second bar: one nav for the
 * whole site, with the page itself being content plus a right-hand TOC.
 */
export function NavPill({
  links,
  spy = true,
}: {
  links: NavLink[];
  spy?: boolean;
}) {
  const anchors = spy ? links.filter((l) => l.href.startsWith('#')) : [];
  const [active, setActive] = useState<string | null>(anchors[0]?.href ?? null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (anchors.length === 0) return;

    const sections = anchors
      .map((l) => document.querySelector(l.href))
      .filter((el): el is Element => el !== null);

    if (sections.length === 0) return;

    /*
     * rootMargin pulls the trigger line down to just under the sticky header,
     * so a section counts as "current" once its heading clears the header
     * rather than the moment its top edge touches the viewport.
     */
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [links]);

  // Close an open dropdown on outside click or Escape.
  useEffect(() => {
    if (!openMenu) return;

    function onPointerDown(e: MouseEvent) {
      if (!navRef.current?.contains(e.target as Node)) setOpenMenu(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenMenu(null);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openMenu]);

  // Navigating away should never leave a menu open.
  useEffect(() => setOpenMenu(null), [pathname]);

  return (
    <nav className="pk-v2-navpill pk-v2-chip-glass" ref={navRef}>
      {links.map((link) =>
        link.children ? (
          <div key={link.label} className="pk-v2-navpill__menu">
            <button
              type="button"
              aria-expanded={openMenu === link.label}
              aria-haspopup="true"
              className={
                link.children.some((c) => c.href === pathname)
                  ? 'pk-v2-navpill__link is-active'
                  : 'pk-v2-navpill__link'
              }
              onClick={() =>
                setOpenMenu(openMenu === link.label ? null : link.label)
              }
            >
              {link.label}
              <ChevronIcon />
            </button>

            {openMenu === link.label && (
              <div className="pk-v2-navpill__dropdown">
                {link.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={
                      pathname === child.href
                        ? 'pk-v2-navpill__item is-active'
                        : 'pk-v2-navpill__item'
                    }
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            className={
              isActive(link.href, active, pathname)
                ? 'pk-v2-navpill__link is-active'
                : 'pk-v2-navpill__link'
            }
          >
            {link.label}
          </Link>
        ),
      )}
    </nav>
  );
}

/**
 * Anchors are active when scroll-spy says so. Routes are active when the path
 * starts with them, except "/" which must match exactly or it would light up
 * on every page.
 */
function isActive(
  href: string,
  spiedAnchor: string | null,
  pathname: string,
): boolean {
  if (href.startsWith('#')) return href === spiedAnchor;
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
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
