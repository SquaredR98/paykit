'use client';

import { useEffect, useState } from 'react';

/**
 * Whether this visitor should get decorative animation.
 *
 * Two gates, both of which must pass:
 *   1. They have not asked for reduced motion.
 *   2. The device looks capable enough to paint it without stuttering.
 *
 * Starts false and only turns on after mount, so the expensive path is
 * opt-in rather than opt-out: a device we cannot measure gets the cheap
 * render, and SSR and first paint always match.
 *
 * Copied from the portfolio (ravi-ranjan.in) — see Rule M5.
 */
export function useMotionPreference() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');

    function evaluate() {
      if (query.matches) {
        setAllowed(false);
        return;
      }
      setAllowed(isDeviceCapable());
    }

    evaluate();
    query.addEventListener('change', evaluate);
    return () => query.removeEventListener('change', evaluate);
  }, []);

  return allowed;
}

/**
 * Cheap proxy for "can this machine afford three blurred, animated layers".
 * There is no real API for this, so we use the hints that exist and treat
 * anything unknown as not capable.
 */
function isDeviceCapable() {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };

  // Data Saver implies "spend nothing on decoration".
  if (nav.connection?.saveData) return false;

  // Chromium-only, in GB and deliberately coarse.
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4) {
    return false;
  }

  // Logical cores. Safari and Firefox omit it, so absence is not a failure —
  // fall through to the viewport check rather than punishing those browsers.
  if (
    typeof nav.hardwareConcurrency === 'number' &&
    nav.hardwareConcurrency > 0 &&
    nav.hardwareConcurrency < 4
  ) {
    return false;
  }

  // Phones repaint a full-bleed 64px blur far more expensively than desktops,
  // and the blobs are largely decorative at that size anyway.
  if (window.matchMedia('(max-width: 640px)').matches) return false;

  return true;
}
