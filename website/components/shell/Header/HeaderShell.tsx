'use client';

import { useScrolled } from '@/lib/use-scrolled';

/**
 * Wraps the header so it can carry a scroll state without the whole header
 * becoming a client component — the logo, nav and CTA stay server-rendered.
 *
 * `data-scrolled` drives the frosted backdrop in styles.css.
 */
export function HeaderShell({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const scrolled = useScrolled();

  return (
    <header className={className} data-scrolled={scrolled ? 'true' : undefined}>
      {children}
    </header>
  );
}
