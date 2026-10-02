'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProviderRequestModal } from './ProviderRequestModal';
import './styles.css';

interface Provider {
  slug: string;
  name: string;
  tags: string[];
}

const shippedProviders: Provider[] = [
  { slug: 'stripe', name: 'Stripe', tags: ['Cards', 'Wallets', '3D Secure', 'Webhooks'] },
  { slug: 'razorpay', name: 'Razorpay', tags: ['Cards', 'UPI', 'Netbanking', 'Webhooks'] },
  { slug: 'paypal', name: 'PayPal', tags: ['PayPal Balance', 'Cards', 'Pay Later', 'Webhooks'] },
];

const plannedProviders: Provider[] = [
  { slug: 'square', name: 'Square', tags: ['Cards', 'Apple Pay', 'Google Pay'] },
  { slug: 'adyen', name: 'Adyen', tags: ['Cards', 'iDEAL', 'SEPA'] },
  { slug: 'cashfree', name: 'Cashfree', tags: ['Cards', 'UPI', 'Netbanking'] },
  { slug: 'phonepe', name: 'PhonePe', tags: ['UPI', 'Cards', 'Wallets'] },
  { slug: 'mollie', name: 'Mollie', tags: ['Cards', 'iDEAL', 'Bancontact'] },
];

function ProviderCell({ provider, dimmed }: { provider: Provider; dimmed?: boolean }) {
  return (
    <div className={`pk-pcell ${dimmed ? 'pk-pcell--soon' : ''}`}>
      <span className="pk-pslug">{provider.slug}</span>
      <div className="pk-pname">{provider.name}</div>
      <div className="pk-tags">
        {provider.tags.map((tag) => (
          <span key={tag} className="pk-tag">{tag}</span>
        ))}
      </div>
    </div>
  );
}

export function Providers() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="pk-providers" id="providers">
      <div className="pk-sechead pk-sechead--center">
        <span className="pk-eyebrow">Provider support</span>
        <h2 className="pk-sec-title">Adapters for every provider you need</h2>
        <p className="pk-lede">
          Every adapter is free and MIT licensed. 25+ providers planned,
          prioritized by what the community asks for.
        </p>
      </div>

      {/* Shipped */}
      <div className="pk-subrow">
        <span className="pk-eyebrow">Shipped</span>
        <span className="pk-subrow__spacer" />
        <span className="pk-bdg pk-bdg--ok">Free &middot; MIT</span>
      </div>
      <div className="pk-g3 pk-providers__band">
        {shippedProviders.map((p) => (
          <ProviderCell key={p.slug} provider={p} />
        ))}
      </div>

      {/* Up next */}
      <div className="pk-subrow">
        <span className="pk-eyebrow">Up next</span>
        <span className="pk-subrow__spacer" />
        <span className="pk-bdg pk-bdg--neutral">Planned</span>
      </div>
      <div className="pk-g3 pk-providers__band">
        {plannedProviders.map((p) => (
          <ProviderCell key={p.slug} provider={p} dimmed />
        ))}
        <div className="pk-pcell pk-pcell--request">
          <span className="pk-pname">Need a different provider?</span>
          <p className="pk-pcell__desc">
            Tell us which provider you need and we&rsquo;ll prioritize it.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="pk-btn pk-btn--secondary pk-btn--sm"
          >
            Request a provider
          </button>
          <span className="pk-pcell__powered">
            Powered by{' '}
            <a
              href="https://fieldcraft.squaredr.tech"
              target="_blank"
              rel="noopener noreferrer"
            >
              FieldCraft
            </a>
          </span>
        </div>
      </div>

      {/* Build your own adapter — standalone CTA */}
      <div className="pk-providers__cta">
        <span className="pk-pname">Build your own adapter</span>
        <p className="pk-pcell__desc">
          Implement the PaymentAdapter interface, map your provider&rsquo;s API
          to unified types, and plug it in.
        </p>
        <Link
          href="/docs/guides/custom-adapter"
          className="pk-btn pk-btn--secondary pk-btn--sm"
        >
          Read the guide &rarr;
        </Link>
      </div>

      <ProviderRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}
