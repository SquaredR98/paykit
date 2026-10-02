'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface NavLink {
  label: string;
  href: string;
}

/**
 * The centre nav pill, with scroll-spy on same-page anchors.
 *
 * Only `#anchor` links take part in the highlight; real routes like /docs are
 * rendered as plain links. The kit highlights the section currently in view,
 * which needs an observer because anchors do not update on scroll by themselves.
 */
export function NavPill({ links }: { links: NavLink[] }) {
  const anchors = links.filter((l) => l.href.startsWith('#'));
  const [active, setActive] = useState<string | null>(anchors[0]?.href ?? null);

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
          className={link.href === active ? 'pk-v2-navpill__link is-active' : 'pk-v2-navpill__link'}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
