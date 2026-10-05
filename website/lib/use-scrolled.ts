'use client';

import { useEffect, useState } from 'react';

/**
 * Whether the page has scrolled past a threshold.
 *
 * Used to fade in the header's frosted backdrop: transparent over the hero,
 * frosted once content would otherwise pass behind it.
 *
 * Reads scroll position once per frame rather than on every scroll event, and
 * only re-renders when the boolean actually flips — so a long scroll causes two
 * renders, not hundreds.
 */
export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;

    function update() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > threshold);
      });
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
    };
  }, [threshold]);

  return scrolled;
}
