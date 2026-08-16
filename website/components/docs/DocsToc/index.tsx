'use client';

import { useEffect, useState, type ReactNode } from 'react';
import './styles.css';

interface TocItem {
  title: ReactNode;
  url: string;
  depth: number;
}

export function DocsToc({ toc }: { toc: TocItem[] }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const headings = toc
      .map((item) => document.getElementById(item.url.slice(1)))
      .filter(Boolean) as HTMLElement[];

    if (!headings.length) return;

    const onScroll = () => {
      const y = window.scrollY + 130;
      let current = headings[0];
      for (const h of headings) {
        if (h.offsetTop <= y) current = h;
      }
      setActiveId(current.id);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [toc]);

  if (!toc.length) return null;

  return (
    <nav className="pk-docs__toc">
      <h4>On this page</h4>
      {toc.map((item) => (
        <a
          key={item.url}
          href={item.url}
          aria-current={activeId === item.url.slice(1) ? 'true' : undefined}
          style={item.depth > 2 ? { paddingLeft: 20 } : undefined}
        >
          {item.title}
        </a>
      ))}
    </nav>
  );
}
