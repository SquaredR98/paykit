import Link from 'next/link';
import './styles.css';

export function Logo() {
  return (
    <Link href="/" className="pk-logo">
      <svg className="pk-logo__mark" width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="1.25" y="1.25" width="11.5" height="11.5" stroke="currentColor" strokeWidth="2.5" />
        <rect x="19.25" y="1.25" width="11.5" height="11.5" stroke="currentColor" strokeWidth="2.5" />
        <rect x="1.25" y="19.25" width="11.5" height="11.5" stroke="currentColor" strokeWidth="2.5" />
        <rect x="19" y="19" width="13" height="13" fill="var(--accent-solid)" />
      </svg>
      <span className="pk-logo__wordmark">Pay<span className="pk-logo__accent">Kit</span></span>
    </Link>
  );
}
