import Link from 'next/link';

const providers = [
  {
    id: 'stripe',
    name: 'Stripe',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
      </svg>
    ),
    description: 'Card payments with inline elements, 3D Secure verification, and redirect support.',
    features: ['Payment Element (iframe)', '3D Secure / SCA', 'Apple Pay & Google Pay'],
    testCard: '4242 4242 4242 4242',
    color: '#635BFF',
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M22.436 0l-11.91 7.753-1.174 4.276 6.625-4.32L11.46 24h4.391L22.436 0zM7.788 7.396L1.564 24h4.39l4.14-11.09-2.306-5.514z" />
      </svg>
    ),
    description: 'Full-screen checkout modal with cards, UPI, netbanking, and wallet support.',
    features: ['Modal checkout flow', 'UPI / Netbanking / Wallets', 'Built-in 3DS & OTP'],
    testCard: '4111 1111 1111 1111',
    color: '#0066FF',
  },
] as const;

export default function Home() {
  const isMock = process.env.MOCK_PAYMENTS === 'true';

  return (
    <main className="flex-1 flex items-center justify-center p-6 relative sr-dotgrid overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-[color-mix(in_srgb,var(--sr-accent),transparent_96%)] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[2.5px] text-sr-accent px-4 py-1.5 rounded-full border border-sr-accent/20 bg-sr-accent/5">
            <span className="w-1.5 h-1.5 rounded-full bg-sr-accent animate-pulse" />
            Payment SDK
          </div>
          <h1 className="text-[2.75rem] md:text-5xl font-bold tracking-[-0.04em] text-foreground leading-[1.1]">
            PayKit Demo
          </h1>
          <p className="text-sr-text-dim text-[15px] max-w-sm mx-auto leading-relaxed">
            Choose a provider to test the full checkout flow
          </p>
          {isMock && (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-sr-warn px-3 py-1 rounded-full border border-[color-mix(in_srgb,var(--sr-warn),transparent_80%)] bg-[color-mix(in_srgb,var(--sr-warn),transparent_92%)]">
              <span className="w-1.5 h-1.5 rounded-full bg-sr-warn animate-pulse" />
              Mock Mode
            </span>
          )}
        </div>

        {/* Provider cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {providers.map((p) => (
            <Link
              key={p.id}
              href={`/checkout?provider=${p.id}`}
              className="group relative rounded-xl border border-sr-border-strong bg-sr-surface/80 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-sr-accent/30 hover:shadow-[0_0_40px_-8px_color-mix(in_srgb,var(--sr-accent),transparent_65%)] hover:-translate-y-1"
            >
              {/* Top accent line */}
              <div
                className="h-[2px] w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${p.color}, transparent)` }}
              />

              <div className="p-6 space-y-4">
                {/* Provider header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sr-ink-800 border border-sr-ink-700 flex items-center justify-center text-sr-text-dim group-hover:text-sr-accent group-hover:border-sr-accent/20 transition-colors duration-300">
                      {p.icon}
                    </div>
                    <h2 className="text-lg font-semibold tracking-[-0.01em]">{p.name}</h2>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-sr-ink-700 flex items-center justify-center text-sr-text-muted group-hover:border-sr-accent/30 group-hover:text-sr-accent group-hover:bg-sr-accent/5 transition-all duration-300">
                    <svg className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[13px] text-sr-text-dim leading-relaxed">
                  {p.description}
                </p>

                {/* Features */}
                <div className="space-y-1.5">
                  {p.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-sr-text-muted font-mono">
                      <span className="w-1 h-1 rounded-full bg-sr-ink-600 group-hover:bg-sr-accent/50 transition-colors duration-300" />
                      {f}
                    </div>
                  ))}
                </div>

                {/* Test card */}
                <div className="pt-3 mt-1 border-t border-sr-ink-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-sr-text-muted font-mono uppercase tracking-wider">Test card</span>
                    <code className="text-xs text-sr-accent/70 font-mono tracking-wider">{p.testCard}</code>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-4 text-[11px] text-sr-text-muted font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sr-success" />
              All tests passing
            </span>
            <span className="text-sr-ink-700">|</span>
            <span>v0.1.0</span>
          </div>
          <p className="text-xs text-sr-text-muted/60 font-mono tracking-wide">
            Powered by <code className="text-sr-accent/50">@squaredr/paykit</code>
          </p>
        </div>
      </div>
    </main>
  );
}
