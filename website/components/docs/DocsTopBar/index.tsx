import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/layout/old/ThemeToggle';
import './styles.css';

export function DocsTopBar() {
  return (
    <header className="pk-docs-topbar">
      <div className="pk-docs-topbar__inner">
        <Link href="/" className="pk-docs-topbar__lockup">
          <Logo />
        </Link>
        <span className="pk-docs-topbar__crumb">docs</span>

        <div className="pk-docs-topbar__right">
          <nav className="pk-docs-topbar__nav">
            <Link href="/">Product</Link>
            <span aria-current="page">Docs</span>
          </nav>
          <a
            href="https://github.com/SquaredR98/paykit"
            className="pk-docs-topbar__icon-btn"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.723-1.335-1.723-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.316 3.3 1.209A11.707 11.707 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.917 24 17.495 24 12.292 24 5.78 18.627.5 12 .5z" />
            </svg>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
