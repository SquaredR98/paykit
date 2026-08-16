'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { DocNavSection } from '../docs-types';
import './styles.css';

export function DocsSidebar({ nav }: { nav: DocNavSection[] }) {
  const pathname = usePathname();

  return (
    <aside className="pk-docs__sidebar">
      {nav.map((section) => (
        <div key={section.label} className="pk-docs__navgrp">
          <h4>{section.label}</h4>
          <ul>
            {section.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.title}
                  {item.badge && (
                    <span className="pk-docs__nav-badge">{item.badge}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
