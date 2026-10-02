import Link from 'next/link';
import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'Changelog',
  description:
    'Release history for all PayKit npm packages — @squaredr/paykit, @squaredr/paykit-react, and @squaredr/paykit-js.',
  alternates: { canonical: '/changelog' },
};

type ChangeType = 'feat' | 'fix' | 'infra';

interface Change {
  type: ChangeType;
  text: string;
}

interface Release {
  version: string;
  date: string;
  label?: string;
  packages: { name: string; version: string }[];
  changes: Change[];
}

const changeTypeLabels: Record<ChangeType, string> = {
  feat: 'Feature',
  fix: 'Fix',
  infra: 'Infrastructure',
};

const releases: Release[] = [
  {
    version: '0.10.0',
    date: '2026-08-10',
    label: 'Latest',
    packages: [
      { name: '@squaredr/paykit', version: '0.10.0' },
      { name: '@squaredr/paykit-react', version: '1.1.0' },
      { name: '@squaredr/paykit-js', version: '1.1.0' },
    ],
    changes: [
      { type: 'feat', text: 'PayPal client adapter — dual-mode Buttons + Advanced Card Fields' },
      { type: 'feat', text: 'PayPal provider bridge for frontend SDK (paykit-js)' },
      { type: 'feat', text: 'paymentMethodTypes prop on CheckoutForm and CardInput (paykit-react)' },
      { type: 'feat', text: 'PayPal webhook verification via postback API' },
      { type: 'feat', text: 'PayPal partial capture support' },
      { type: 'feat', text: 'PayPal subscription auto-create catalog product' },
      { type: 'fix', text: 'Improved mount safety — mounting guard, assertMounted, proper cleanup' },
      { type: 'fix', text: 'PayPal refund currency extraction' },
      { type: 'fix', text: 'PayPal charges.cancel error type' },
    ],
  },
  {
    version: '0.9.0',
    date: '2026-08-03',
    packages: [{ name: '@squaredr/paykit', version: '0.9.0' }],
    changes: [
      { type: 'feat', text: 'PayPal adapter — OAuth 2.0, Order → Capture flow' },
      { type: 'feat', text: 'PayPal mappers: charge, refund, customer, subscription, webhook, error' },
      { type: 'feat', text: 'PayPal added to SupportedProvider type' },
      { type: 'infra', text: '47 mapper tests + 75 adapter tests for PayPal' },
    ],
  },
  {
    version: '0.7.0',
    date: '2026-07-20',
    packages: [{ name: '@squaredr/paykit', version: '0.7.0' }],
    changes: [
      { type: 'feat', text: 'Validation module — charges.create param validation with ValidationError' },
      { type: 'feat', text: 'Currency utilities and WEBHOOK_EVENTS constants' },
      { type: 'feat', text: 'ProviderName type export' },
      { type: 'feat', text: '19 unified error codes with human-readable suggestions and retryable flag' },
      { type: 'feat', text: 'Debug logging support' },
      { type: 'feat', text: 'Mock adapter for testing' },
    ],
  },
  {
    version: '0.5.0',
    date: '2026-07-06',
    packages: [
      { name: '@squaredr/paykit', version: '0.5.0' },
      { name: '@squaredr/paykit-react', version: '1.0.0' },
      { name: '@squaredr/paykit-js', version: '1.0.0' },
    ],
    changes: [
      { type: 'infra', text: 'Package consolidation — all adapters as subpath exports of @squaredr/paykit' },
      { type: 'feat', text: 'Constructor sugar — new StripeAdapter({ secretKey })' },
      { type: 'feat', text: 'PayKit class alias for UnifiedPayments' },
      { type: 'feat', text: 'AdapterConfig — new PayKit({ adapter }) pattern' },
      { type: 'feat', text: 'webhooks.construct({ payload, signature, secret }) API' },
      { type: 'feat', text: 'PaymentRouter class for multi-provider routing' },
    ],
  },
  {
    version: '0.4.0',
    date: '2026-06-29',
    label: 'SDK API v1',
    packages: [
      { name: '@squaredr/paykit', version: '0.4.0' },
      { name: '@squaredr/paykit-react', version: '1.0.0' },
      { name: '@squaredr/paykit-js', version: '1.0.0' },
    ],
    changes: [
      { type: 'feat', text: 'Finalized public API surface' },
      { type: 'feat', text: 'Stripe adapter — charges, refunds, customers, subscriptions, webhooks' },
      { type: 'feat', text: 'Razorpay adapter — charges, refunds, customers, subscriptions, webhooks' },
      { type: 'feat', text: 'React components: PayKitProvider, CheckoutForm, CardInput' },
      { type: 'feat', text: 'React hooks: usePayKit, useCheckout' },
      { type: 'feat', text: 'Vanilla JS SDK: PayKitClient, mountCardInput, confirmPayment' },
      { type: 'infra', text: '252 unit tests passing' },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-06-22',
    label: 'Initial release',
    packages: [{ name: '@squaredr/paykit', version: '0.2.0' }],
    changes: [
      { type: 'feat', text: 'Core types: UnifiedCharge, UnifiedRefund, UnifiedCustomer' },
      { type: 'feat', text: 'PaymentAdapter interface' },
      { type: 'feat', text: 'Stripe adapter — basic charges + webhooks' },
      { type: 'feat', text: 'Razorpay adapter — basic charges + webhooks' },
      { type: 'infra', text: 'Tree-shakeable packages with separate server/client entry points' },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="pk-changelog">
      <div className="pk-sechead">
        <span className="pk-eyebrow">Changelog</span>
        <h1 className="pk-page">Release history</h1>
        <p className="pk-lede">
          Version history for the PayKit npm packages. Each release links directly to npm.
        </p>
      </div>

      <div className="pk-timeline">
        {releases.map((release, i) => (
          <article key={release.version} className="pk-tl-entry" id={`v${release.version}`}>
            <div className="pk-tl-spine">
              <span className={`pk-tl-dot ${i === 0 ? 'pk-tl-dot--latest' : ''}`} />
              {i < releases.length - 1 && <span className="pk-tl-line" />}
            </div>

            <div className="pk-tl-content">
              <div className="pk-tl-head">
                <a href={`#v${release.version}`} className="pk-tl-version">
                  v{release.version}
                </a>
                {release.label && (
                  <span className={`pk-bdg ${i === 0 ? 'pk-bdg--ok' : 'pk-bdg--neutral'}`}>
                    {release.label}
                  </span>
                )}
                <span className="pk-tl-spacer" />
                <time className="pk-tl-date" dateTime={release.date}>
                  {new Date(release.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </div>

              <div className="pk-tl-pkgs">
                {release.packages.map((pkg) => (
                  <a
                    key={pkg.name}
                    href={`https://www.npmjs.com/package/${pkg.name}/v/${pkg.version}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pk-tl-pkg"
                  >
                    {pkg.name}@{pkg.version}
                  </a>
                ))}
              </div>

              <ul className="pk-tl-changes">
                {release.changes.map((change) => (
                  <li key={change.text} className="pk-tl-change">
                    <span className={`pk-tl-tag pk-tl-tag--${change.type}`}>
                      {changeTypeLabels[change.type]}
                    </span>
                    <span>{change.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <div className="pk-changelog__cta">
        <div className="pk-term">
          <div className="pk-term__bar">
            <span className="pk-term__file">terminal</span>
          </div>
          <pre><code>npm install @squaredr/paykit</code></pre>
        </div>
        <div className="pk-changelog__actions">
          <Link href="/docs" className="pk-btn pk-btn--primary">
            Read the docs
          </Link>
          <a
            href="https://github.com/SquaredR98/paykit"
            className="pk-btn pk-btn--secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
