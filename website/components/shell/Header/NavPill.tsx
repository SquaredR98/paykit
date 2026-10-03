'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavLink {
  label: string;
  href: string;
}

/**
 * The centre nav pill.
 *
 * Two kinds of link, highlighted differently: `#anchor` links use scroll-spy,
 * because anchors do not update as you scroll; route links are active when the
 * current path matches. Docs pass `spy={false}` — their nav is all routes, and
 * running an observer for sections that do not exist is wasted work.
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
  const pathname = usePathname();

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

  return (
    <nav className="pk-v2-navpill pk-v2-chip-glass">
      {links.map((link) => (
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
      ))}
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
