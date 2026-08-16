'use client';

import { useEffect, useState } from 'react';
import './styles.css';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface ArticleTocProps {
  items?: TocItem[];
}

export function ArticleToc({ items = [] }: ArticleTocProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      }
    );

    const headings = document.querySelectorAll('article h2[id], article h3[id]');
    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="pk-toc">
      <ul className="pk-toc__list">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? 'pk-toc__item--sub' : ''}>
            <a
              href={`#${item.id}`}
              className={activeId === item.id ? 'pk-toc__link pk-toc__link--active' : 'pk-toc__link'}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
