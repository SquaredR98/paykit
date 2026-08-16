'use client';

import { useState } from 'react';
import './styles.css';

export function SubscribeCta() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // TODO: Implement actual subscription logic
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1000);
  };

  return (
    <section className="pk-cta-end">
      <div className="pk-cta-end__text">
        <span className="pk-eyebrow">Subscribe</span>
        <p className="pk-cta-end__desc">One email when we publish. No marketing.</p>
      </div>
      <form className="pk-sub" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === 'loading' || status === 'success'}
        />
        <button
          type="submit"
          className="pk-btn pk-btn--primary"
          disabled={status === 'loading' || status === 'success'}
        >
          {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
        </button>
      </form>
    </section>
  );
}
