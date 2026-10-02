import Link from 'next/link';
import { highlight } from '@/lib/shiki';
import { HeroCardStack } from './HeroCardStack';
import { TrustSignals } from '@/components/homepage/old/TrustSignals';
import './styles.css';

const heroCode = `import { PayKit } from '@squaredr/paykit';
import { StripeAdapter } from '@squaredr/paykit/stripe';

const paykit = new PayKit({
  adapter: new StripeAdapter({ secretKey: 'sk_live_…' }),
});

const charge = await paykit.charges.create({
  amount: 5000,
  currency: 'usd',
});`;

const CARET = '<span class="pk-caret">▍</span>';

export async function Hero() {
  const raw = await highlight(heroCode);
  const codeHtml = raw.replace('</code></pre>', `${CARET}</code></pre>`);
  return (
    <section className="pk-blk pk-hero">
      <div className="pk-hero__grid">
        <div className="pk-hero__content">
          <span className="pk-bdg pk-bdg--accent">Open source &middot; MIT licensed</span>
          <h1 className="pk-hero__title">
            Stop juggling payment&nbsp;APIs. Use&nbsp;one.
          </h1>
          <p className="pk-hero__lede">
            A TypeScript-first Node.js library with React components for accepting
            payments across Stripe, Razorpay, PayPal and more. Write your integration
            once — swap providers without changing a line of code.
          </p>
          <div className="pk-hero__meta">
            <span>400+ tests</span>
            <em>/</em>
            <span>Node.js + React</span>
            <em>/</em>
            <span>TypeScript-first</span>
            <em>/</em>
            <span>MIT licensed</span>
          </div>
          <div className="pk-hero__cta-row">
            <Link href="/docs" className="pk-btn pk-btn--primary pk-btn--xl">
              Get started
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="https://github.com/SquaredR98/paykit"
              className="pk-btn pk-btn--secondary pk-btn--xl"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </div>
        </div>
        <div className="pk-hero__deck-wrap">
          <HeroCardStack codeHtml={codeHtml} />
          <TrustSignals />
        </div>
      </div>
    </section>
  );
}
