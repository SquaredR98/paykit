'use client';

import { useState, useCallback } from 'react';
import { HeroLiveCheckout } from './HeroLiveCheckout';

export function HeroCardStack({ codeHtml }: { codeHtml: string }) {
  const [live, setLive] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const handleActivate = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => {
      setLive(true);
      setTransitioning(false);
    }, 200);
  }, []);

  if (live) {
    return <HeroLiveCheckout codeHtml={codeHtml} />;
  }

  return (
    <div className={`pk-deck-preview ${transitioning ? 'pk-deck--fade-out' : ''}`}>
      <div className="pk-deck-preview__form">
        <div className="pk-deck-preview__field">
          <span className="pk-deck-preview__label">Card number</span>
          <span className="pk-deck-preview__value">4242 4242 4242 4242</span>
        </div>
        <div className="pk-deck-preview__row">
          <div className="pk-deck-preview__field">
            <span className="pk-deck-preview__label">Expiry</span>
            <span className="pk-deck-preview__value">12 / 28</span>
          </div>
          <div className="pk-deck-preview__field">
            <span className="pk-deck-preview__label">CVC</span>
            <span className="pk-deck-preview__value">123</span>
          </div>
        </div>
        <button className="pk-deck-preview__cta" onClick={handleActivate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <polygon points="6,3 20,12 6,21" />
          </svg>
          Try it live
        </button>
      </div>
    </div>
  );
}
