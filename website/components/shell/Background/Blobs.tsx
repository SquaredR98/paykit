'use client';

import { useMotionPreference } from '@/lib/use-motion-preference';

/**
 * The three animated gradient blobs behind the glass panel.
 *
 * Each is a 384px circle under `blur(64px)`, animated continuously — which is
 * three large composited layers repainting forever. On a low-end or
 * reduced-motion device that is a real cost for pure decoration, so we render
 * nothing at all there rather than just pausing the animation. The static
 * background gradient stays either way, so the page never looks unfinished.
 *
 * Ported from the portfolio's BackgroundBlobs.
 */
export function Blobs() {
  const animate = useMotionPreference();

  if (!animate) return null;

  return (
    <>
      <div className="pk-v2-blob pk-v2-blob--cyan" />
      <div className="pk-v2-blob pk-v2-blob--blue" />
      <div className="pk-v2-blob pk-v2-blob--teal" />
    </>
  );
}
