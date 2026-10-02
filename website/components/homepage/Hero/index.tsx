import { Button, CopyInstall } from '@/components/ui';
import './styles.css';

/**
 * Homepage hero.
 *
 * Copy is carried over from v1 unchanged — it is accurate, which matters here:
 * the design mockup's hero claims "eleven providers" and "23 webhook events",
 * neither of which is true. Every number below is counted from source per
 * Rule M3; see components/CONVENTIONS.md §7.
 */

/*
 * Ordered to lead with depth of normalization, not provider count.
 *
 * "3 adapters" as the first number invites the comparison PayKit loses — three
 * is unimpressive next to "every payment provider", and nobody needs three.
 * What is actually hard to build is the normalization layer, so the strip leads
 * with that and ends on the two facts that matter to someone choosing an
 * abstraction: there is one API to learn, and nothing locks you in.
 *
 * Every count is from source per Rule M3 — see components/CONVENTIONS.md §7.
 */
const stats = [
  { value: '22', label: 'Unified webhook events' },
  { value: '19', label: 'Normalized error codes' },
  { value: '1', label: 'API to learn' },
  { value: '0', label: 'Vendor lock-in' },
];

export function Hero() {
  return (
    <section className="pk-v2-hero">
      <span className="pk-v2-hero__badge">Open source &middot; MIT licensed</span>

      {/*
        The one gradient-text phrase allowed per page (Rule M5). Everything else
        on this page uses solid colour.
      */}
      <h1 className="pk-v2-hero__title">
        Stop juggling payment APIs. <span>One SDK, every provider.</span>
      </h1>

      {/*
        "with a config change, not a rewrite" rather than "without changing a
        line of code" — the stronger claim is not yet true. In multi-provider
        mode only charges.create() routes; charges.retrieve() still goes to the
        default provider. See .plan/website-claims-audit.md.
      */}
      <p className="pk-v2-hero__lede">
        A TypeScript-first Node.js library with React components for accepting
        payments across Stripe, Razorpay and PayPal. Write your integration once
        — then switch providers with a config change, not a rewrite.
      </p>

      <div className="pk-v2-hero__actions">
        <Button href="/docs">
          Get started
          <ArrowIcon />
        </Button>
        <Button
          href="https://github.com/SquaredR98/paykit"
          variant="secondary"
          external
        >
          <StarIcon />
          Star on GitHub
        </Button>
        <CopyInstall command="pnpm add @squaredr/paykit" />
      </div>

      <dl className="pk-v2-hero__stats">
        {stats.map((stat) => (
          <div key={stat.label} className="pk-v2-hero__stat">
            <dt className="pk-v2-hero__stat-value">{stat.value}</dt>
            <dd className="pk-v2-hero__stat-label">{stat.label}</dd>
          </div>
        ))}
      </dl>

      <p className="pk-v2-hero__stack">
        Node 20+ &middot; TypeScript-first &middot; Express, Fastify, Hono, Next.js
      </p>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
