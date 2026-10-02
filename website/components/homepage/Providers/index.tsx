import Link from 'next/link';
import { Eyebrow, Section } from '@/components/ui';
import { shippedProviders, plannedProviders, type Provider } from './providers';
import './styles.css';

/**
 * Provider adapters, split into what ships today and what is planned.
 *
 * The split is the point. Three adapters is a small number, and burying that
 * would be the kind of claim the audit in .plan/website-claims-audit.md exists
 * to catch — so "Shipped" and "Planned" are separate, labelled groups with the
 * shipped count stated outright.
 */
export function Providers() {
  return (
    <Section id="providers">
      <Eyebrow>Adapters</Eyebrow>
      <h2 className="pk-v2-section__title">One interface, every provider.</h2>
      <p className="pk-v2-section__sub">
        Every adapter implements the same charge, refund, customer and webhook
        contract. Provider-specific fields stay available on{' '}
        <code className="pk-v2-inline-code">charge._raw</code>.
      </p>

      <div className="pk-v2-providers__group">
        <span className="pk-v2-providers__label">
          Shipped
          <span className="pk-v2-badge pk-v2-badge--ok">
            {shippedProviders.length} adapters
          </span>
        </span>
      </div>

      <div className="pk-v2-providers">
        {shippedProviders.map((provider) => (
          <ProviderTile key={provider.slug} provider={provider} />
        ))}
      </div>

      <div className="pk-v2-providers__group">
        <span className="pk-v2-providers__label">
          Planned
          <span className="pk-v2-badge pk-v2-badge--neutral">
            prioritized by requests
          </span>
        </span>
      </div>

      <div className="pk-v2-providers">
        {plannedProviders.map((provider) => (
          <ProviderTile key={provider.slug} provider={provider} planned />
        ))}

        <Link href="/docs/guides/custom-adapter" className="pk-v2-providers__request">
          <PlusIcon />
          Build your own adapter
        </Link>
      </div>
    </Section>
  );
}

function ProviderTile({
  provider,
  planned,
}: {
  provider: Provider;
  planned?: boolean;
}) {
  return (
    <div
      className={
        planned ? 'pk-v2-prov pk-v2-prov--planned' : 'pk-v2-prov'
      }
    >
      <div className="pk-v2-prov__top">
        <span className="pk-v2-prov__glyph" aria-hidden="true">
          {provider.glyph}
        </span>
        <span
          className={
            planned
              ? 'pk-v2-badge pk-v2-badge--neutral'
              : 'pk-v2-badge pk-v2-badge--ok'
          }
        >
          {planned ? 'planned' : 'shipped'}
        </span>
      </div>
      <div>
        <h3 className="pk-v2-prov__name">{provider.name}</h3>
        <p className="pk-v2-prov__summary">{provider.summary}</p>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
