import { highlight } from '@/lib/shiki';
import './styles.css';

const adapterCode = `// Only this line changes:
import { StripeAdapter } from '@squaredr/paykit/stripe';`;

function EdgeArrow({ active }: { active?: boolean }) {
  return (
    <div className="pk-cedge">
      <svg width="100%" height="10" viewBox="0 0 52 10" preserveAspectRatio="none">
        <line
          x1="2" y1="5" x2="45" y2="5"
          stroke={active ? 'var(--blue-500)' : 'var(--border-strong)'}
          strokeWidth="1"
          strokeDasharray="4 4"
          className={active ? 'pk-cedge__line--active' : undefined}
        />
        <path
          d="M45 1.5 L50 5 L45 8.5"
          fill="none"
          stroke={active ? 'var(--blue-500)' : 'var(--border-strong)'}
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

export async function HowItWorks() {
  const codeHtml = await highlight(adapterCode);

  return (
    <section className="pk-blk" id="how">
      <div className="pk-sechead pk-sechead--center">
        <span className="pk-eyebrow">How it works</span>
        <h2 className="pk-sec-title">One API. Any provider.</h2>
        <p className="pk-lede">
          PayKit sits between your app and payment providers. The adapter pattern
          lets you swap providers by changing a single line.
        </p>
      </div>
      <div className="pk-how__body">
        <div className="pk-chain">
          <div className="pk-cnode">
            <span className="pk-cnode__title">Your app</span>
            <span className="pk-cnode__sub">Express / Next.js</span>
          </div>
          <EdgeArrow active />
          <div className="pk-cnode pk-cnode--active">
            <span className="pk-cnode__title">PayKit core</span>
            <span className="pk-cnode__sub">@squaredr/paykit</span>
          </div>
          <EdgeArrow active />
          <div className="pk-cnode pk-cnode--active">
            <span className="pk-cnode__title">Stripe adapter</span>
            <span className="pk-cnode__sub">@squaredr/paykit/stripe</span>
          </div>
          <EdgeArrow />
          <div className="pk-cnode">
            <span className="pk-cnode__title">Stripe API</span>
            <span className="pk-cnode__sub">api.stripe.com</span>
          </div>
        </div>
        <div className="pk-how__swap">
          <span className="pk-note">swap for</span>
          <span className="pk-tag">razorpay</span>
          <span className="pk-tag">paypal</span>
          <span className="pk-tag">cashfree</span>
          <span className="pk-tag">+ 21 more</span>
        </div>
        <div className="pk-term pk-how__code">
          <div className="pk-term__bar">
            <span className="pk-term__file">adapter.ts</span>
          </div>
          <div dangerouslySetInnerHTML={{ __html: codeHtml }} />
        </div>
      </div>
    </section>
  );
}
