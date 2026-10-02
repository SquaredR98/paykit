'use client';

import { useEffect, useState } from 'react';
import './styles.css';

/**
 * 3px gradient bar pinned to the top of the viewport.
 *
 * Orientation without adding chrome: it answers "how much of this page is
 * left". Purely decorative, so it is hidden from assistive tech rather than
 * announced as a live value.
 *
 * Ported from the portfolio's ScrollProgress.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    function update() {
      // Coalesce the scroll storm into one measurement per frame.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
      });
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className="pk-v2-progress" aria-hidden="true">
      <span className="pk-v2-progress__bar" style={{ width: `${progress}%` }} />
    </div>
  );
}
