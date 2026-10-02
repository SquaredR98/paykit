import { highlight } from '@/lib/shiki';
import { Eyebrow, Section } from '@/components/ui';
import { DemoClient } from './DemoClient';
import { DEMO_PROVIDER_ORDER, demoSnippet, type DemoProvider } from './providers';
import './styles.css';

/**
 * Live demo — a real test-mode checkout beside the code that produces it.
 *
 * The checkout genuinely runs: it uses @squaredr/paykit's own React components
 * against real Stripe / Razorpay / PayPal test credentials, so switching
 * provider re-mounts a different adapter rather than faking a result.
 *
 * Highlighting happens here because shiki is server-only. All three snippets
 * are highlighted up front and handed to the client, so switching provider
 * never needs a request.
 */
export async function Demo() {
  const snippets = {} as Record<DemoProvider, string>;
  for (const provider of DEMO_PROVIDER_ORDER) {
    snippets[provider] = await highlight(demoSnippet(provider));
  }

  return (
    <Section id="demo">
      <Eyebrow>Live demo</Eyebrow>
      <h2 className="pk-v2-section__title">Same checkout, any provider.</h2>
      <p className="pk-v2-section__sub">
        Pick a provider and pay with a test card. Only the adapter changes — the
        call, the response shape and the React components stay identical.
      </p>

      <DemoClient snippets={snippets} />
    </Section>
  );
}
