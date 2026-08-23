'use client';

import { useEffect, useRef, useState } from 'react';

export function Counter({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [counted, setCounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || counted) return;
        setCounted(true);
        const start = performance.now();
        const duration = 900;
        function step(now: number) {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el!.textContent = String(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [counted, target]);

  return (
    <div className="pk-diff__counter">
      <span className="pk-diff__counter-num" ref={ref}>0</span>
      <span className="pk-diff__counter-cap">lines of boilerplate eliminated</span>
    </div>
  );
}
