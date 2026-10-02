'use client';

import Link from 'next/link';
import './styles.css';

/**
 * Pill button in the two variants the design system defines.
 *
 * Marked 'use client' because of the optional `onClick`: a server component
 * cannot pass a function across the boundary, so without this the first caller
 * to use that prop would hit a confusing serialization error. Every current
 * caller passes only an href, but this is a shared primitive.
 *
 * - primary: brand gradient, scales and gains a cyan glow on hover
 * - secondary: outlined in the accent ring, tints on hover
 *
 * Renders an <a> for external hrefs, a next/link for internal ones, and a
 * <button> when there is no href at all.
 */
interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: 'primary' | 'secondary';
  external?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export function Button({
  children,
  href,
  variant = 'primary',
  external,
  className,
  onClick,
  type = 'button',
}: ButtonProps) {
  const classes = [
    'pk-v2-btn',
    variant === 'primary' ? 'pk-v2-btn--primary' : 'pk-v2-btn--secondary',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href && external) {
    return (
      <a className={classes} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type={type} onClick={onClick}>
      {children}
    </button>
  );
}
