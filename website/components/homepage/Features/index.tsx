import './styles.css';

const features = [
  {
    title: 'Unified API',
    description: 'One interface for every payment provider. Write integration code once, swap providers without touching business logic.',
    icon: 'layers',
  },
  {
    title: 'TypeScript-first',
    description: 'Full TypeScript support with generics for provider-specific types. Catch errors at compile time, not in production.',
    icon: 'shield-check',
  },
  {
    title: 'Extensible adapters',
    description: 'Implement the PaymentAdapter interface to add any provider. Three reference adapters included — build your own in under an hour.',
    icon: 'puzzle',
  },
  {
    title: 'Provider routing',
    description: 'Route payments by currency, region or custom rules. Send INR to Razorpay, USD to Stripe — automatically.',
    icon: 'route',
  },
  {
    title: 'Webhook normalization',
    description: 'Unified webhook events across providers. One handler for charge.succeeded regardless of the source.',
    icon: 'webhook',
  },
  {
    title: 'Error normalization',
    description: '19 unified error codes with human-readable suggestions and a retryable flag. No more parsing cryptic provider responses.',
    icon: 'alert-circle',
  },
  {
    title: 'Auth & capture',
    description: 'Hold funds, then capture when ready. Built-in support for hotels, rentals, and marketplace holds with partial capture.',
    icon: 'lock',
  },
  {
    title: 'Node.js + React',
    description: 'Server SDK for Node.js — works with Express, Fastify, Hono, Next.js. Frontend components for React with CheckoutForm, CardInput, and hooks.',
    icon: 'server',
  },
  {
    title: 'Lightweight',
    description: 'core: 26 KB \u00b7 react: 7 KB \u00b7 sdk-js: 4 KB. Zero runtime dependencies. Separate server and client entry points — only bundle what you use.',
    icon: 'feather',
  },
];

const iconPaths: Record<string, React.ReactNode> = {
  layers: <><path d="M12 2 2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>,
  'shield-check': <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>,
  puzzle: <><path d="M15.5 2H18a2 2 0 0 1 2 2v2.5" /><path d="M20 13.5V16a2 2 0 0 1-2 2h-2.5" /><path d="M8.5 22H6a2 2 0 0 1-2-2v-2.5" /><path d="M4 10.5V8a2 2 0 0 1 2-2h2.5" /><path d="M15.5 6a2.5 2.5 0 0 0 0-4" /><path d="M20 13.5a2.5 2.5 0 0 0 0-4" /><path d="M8.5 22a2.5 2.5 0 0 0 0-4" /><path d="M4 10.5a2.5 2.5 0 0 0 0 4" /></>,
  route: <><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></>,
  webhook: <><path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" /><path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" /><path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8H12" /></>,
  'alert-circle': <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
  lock: <><rect width="18" height="11" x="3" y="11" rx="0" ry="0" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  server: <><rect width="20" height="8" x="2" y="2" rx="0" ry="0" /><rect width="20" height="8" x="2" y="14" rx="0" ry="0" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></>,
  feather: <><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" /><line x1="16" y1="8" x2="2" y2="22" /><line x1="17.5" y1="15" x2="9" y2="15" /></>,
};

export function Features() {
  return (
    <section className="pk-blk pk-features">
      <div className="pk-sechead pk-sechead--center">
        <span className="pk-eyebrow">Features</span>
        <h2 className="pk-sec-title">Everything you need to accept payments</h2>
        <p className="pk-lede">
          PayKit handles the complexity so you can focus on building your product.
        </p>
      </div>
      <div className="pk-features__grid">
        {features.map((feature) => (
          <div key={feature.title} className="pk-cell pk-fcell">
            <span className="pk-fcell__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {iconPaths[feature.icon]}
              </svg>
            </span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
