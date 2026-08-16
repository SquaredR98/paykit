import Link from 'next/link';
import type { DocNavItem } from '../docs-types';
import './styles.css';

interface Props {
  prev: DocNavItem | null;
  next: DocNavItem | null;
}

export function DocsPagination({ prev, next }: Props) {
  if (!prev && !next) return null;

  return (
    <div className="pk-docs__pager">
      {prev ? (
        <Link href={prev.href}>
          <span className="pk-docs__pager-dir">&larr; Previous</span>
          <span className="pk-docs__pager-title">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} className="pk-docs__pager-next">
          <span className="pk-docs__pager-dir">Next &rarr;</span>
          <span className="pk-docs__pager-title">{next.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
