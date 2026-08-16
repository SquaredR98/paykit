'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { href: '/workbench', title: 'Home' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/workbench/charges', title: 'Charges' },
      { href: '/workbench/refunds', title: 'Refunds' },
      { href: '/workbench/customers', title: 'Customers' },
      { href: '/workbench/subscriptions', title: 'Subscriptions' },
    ],
  },
  {
    label: 'Utilities',
    items: [
      { href: '/workbench/currency', title: 'Currency Tools' },
      { href: '/workbench/errors', title: 'Error Catalog' },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      { href: '/workbench/providers', title: 'Providers' },
      { href: '/workbench/retry', title: 'Retry & Hooks' },
    ],
  },
];

export function WorkbenchSidebar() {
  const pathname = usePathname();

  return (
    <aside className="wb-sidebar">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="wb-sidebar__group">
          <h4 className="wb-sidebar__heading">{group.label}</h4>
          <ul className="wb-sidebar__list">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  className="wb-sidebar__link"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
