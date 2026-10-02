'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * 40px glass chip showing a sun in dark mode and a moon in light mode —
 * matching design-system/ui_kits/marketing/index.html, where the toggle sits in
 * the header beside the CTA (not in the footer).
 *
 * The provider is configured in app/layout.tsx with
 * `attribute: ['class', 'data-theme']`, so toggling writes `data-theme="light"`
 * on <html>, which is the selector the v2 tokens key off.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes cannot know the theme during SSR. Assume dark (the default) for
  // the first paint, then correct after mount so markup never mismatches.
  useEffect(() => setMounted(true), []);
  const isDark = mounted ? resolvedTheme !== 'light' : true;

  return (
    <button
      type="button"
      className="pk-v2-toggle pk-v2-chip-glass"
      aria-label={
        mounted ? `Switch to ${isDark ? 'light' : 'dark'} theme` : 'Toggle theme'
      }
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
    </svg>
  );
}
