import { notFound } from 'next/navigation';
import Link from 'next/link';

export default function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return (
    <div className="pk-frame">
      <header
        className="flex items-center justify-between border-b border-pk-grid px-(--space-6) h-(--control-h-xl)"
      >
        <div className="flex items-center gap-(--space-4)">
          <Link href="/" className="text-pk-muted hover:text-pk-body" style={{ fontSize: 'var(--text-sm)' }}>
            &larr; Home
          </Link>
          <span className="text-pk-hairline">|</span>
          <span className="text-pk-strong font-display font-semibold" style={{ fontSize: 'var(--text-lg)' }}>
            Dev Workbench
          </span>
          <span className="pk-bdg pk-bdg--accent pk-bdg--plain" style={{ fontSize: 'var(--text-2xs)' }}>
            DEV ONLY
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}
