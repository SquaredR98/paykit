'use client';

import { useState } from 'react';
import type { ProviderCapabilities } from '@squaredr/paykit';
import { syntaxHighlight } from '@/lib/json-highlight';
import { CodeCard, Eyebrow } from '@/components/ui';
import './styles.css';

/* ── Capability data (sourced from adapter source code) ── */

interface CapabilityDef {
  key: string;
  label: string;
  description: string;
  snippet: (provider: string) => string;
}

const CAPABILITIES: CapabilityDef[] = [
  {
    key: 'charges',
    label: 'Charges',
    description: 'Create and process payments',
    snippet: (p) => `const charge = await paykit.charges.create({\n  amount: 1000,\n  currency: 'USD',\n  description: 'Order #123',\n});\n// provider: ${p}`,
  },
  {
    key: 'authAndCapture',
    label: 'Auth & Capture',
    description: 'Separate authorize and capture flows',
    snippet: (p) => `// Authorize\nconst charge = await paykit.charges.create({\n  amount: 5000,\n  currency: 'USD',\n  capture: false, // authorize only\n});\n\n// Capture later\nawait paykit.charges.capture(charge.id);\n// provider: ${p}`,
  },
  {
    key: 'refunds',
    label: 'Refunds',
    description: 'Issue full refunds',
    snippet: (p) => `const refund = await paykit.refunds.create({\n  chargeId: 'ch_xxx',\n});\n// provider: ${p}`,
  },
  {
    key: 'partialRefunds',
    label: 'Partial Refunds',
    description: 'Refund less than the full amount',
    snippet: (p) => `const refund = await paykit.refunds.create({\n  chargeId: 'ch_xxx',\n  amount: 500, // partial\n});\n// provider: ${p}`,
  },
  {
    key: 'subscriptions',
    label: 'Subscriptions',
    description: 'Recurring billing',
    snippet: (p) => `const sub = await paykit.subscriptions.create({\n  customer: 'cus_xxx',\n  amount: 1999,\n  currency: 'USD',\n  interval: 'month',\n});\n// provider: ${p}`,
  },
  {
    key: 'savedPaymentMethods',
    label: 'Saved Payment Methods',
    description: 'Store and reuse cards/methods',
    snippet: (p) => `const methods = await paykit.paymentMethods.list({\n  customer: 'cus_xxx',\n});\n// provider: ${p}`,
  },
  {
    key: 'hostedCheckout',
    label: 'Hosted Checkout',
    description: 'Provider-hosted checkout page',
    snippet: (p) => `// Redirect to provider-hosted checkout\nconst session = await paykit.charges.create({\n  amount: 2500,\n  currency: 'USD',\n  returnUrl: 'https://example.com/success',\n});\n// provider: ${p}`,
  },
  {
    key: 'embeddableUI',
    label: 'Embeddable UI',
    description: 'Drop-in card inputs and forms',
    snippet: (p) => `// React component\nimport { CheckoutForm } from '@squaredr/paykit-react';\n\n<CheckoutForm\n  provider="${p}"\n  amount={1000}\n  currency="USD"\n/>`,
  },
  {
    key: 'payouts',
    label: 'Payouts',
    description: 'Send money to bank accounts',
    snippet: (p) => `const payout = await paykit.payouts.create({\n  amount: 10000,\n  currency: 'USD',\n  destination: 'ba_xxx',\n});\n// provider: ${p}`,
  },
  {
    key: 'multiCurrency',
    label: 'Multi-Currency',
    description: 'Charge in multiple currencies',
    snippet: (p) => `// Charge in EUR\nconst charge = await paykit.charges.create({\n  amount: 950,\n  currency: 'EUR',\n});\n// provider: ${p}`,
  },
  {
    key: 'directDebit',
    label: 'Direct Debit',
    description: 'ACH / SEPA / bank debit',
    snippet: (p) => `// Direct debit payment\nconst charge = await paykit.charges.create({\n  amount: 5000,\n  currency: 'EUR',\n  paymentMethod: 'sepa_debit',\n});\n// provider: ${p}`,
  },
  {
    key: 'webhooks',
    label: 'Webhooks',
    description: 'Receive and verify event notifications',
    snippet: (p) => `const event = paykit.webhooks.construct({\n  payload: rawBody,\n  signature: headers['stripe-signature'],\n  secret: webhookSecret,\n});\n// event.type → 'charge.succeeded'\n// provider: ${p}`,
  },
  {
    key: 'threeDS',
    label: '3D Secure',
    description: 'Strong customer authentication',
    snippet: (p) => `// 3DS is handled automatically\n// when the provider requires it\nconst charge = await paykit.charges.create({\n  amount: 10000,\n  currency: 'GBP',\n});\n// provider: ${p}`,
  },
];

/*
 * Capability data now arrives as a prop, read from the adapters themselves in
 * lib/provider-capabilities.ts. It used to be 13 flags x 3 providers hardcoded
 * here, which violated Rule M3 and had drifted: the table advertised payouts
 * for Stripe and PayPal, neither of which implements any payout operation.
 */
export type ProviderName = 'stripe' | 'razorpay' | 'paypal';

export interface CapabilityMatrixProps {
  capabilities: Record<ProviderName, ProviderCapabilities>;
  providers: ProviderName[];
  providerLabels: Record<ProviderName, string>;
}

/* ── Component ── */

export function CapabilityMatrix({
  capabilities,
  providers,
  providerLabels,
}: CapabilityMatrixProps) {
  const [selected, setSelected] = useState<{ cap: CapabilityDef; provider: ProviderName } | null>(null);

  return (
    <div className="pk-capmatrix">
      <div className="pk-capmatrix__header">
        <Eyebrow>Provider capabilities</Eyebrow>
        <h1>Capability Matrix</h1>
        <p>
          Compare what each payment provider supports. Click any supported cell to see
          the PayKit code for that operation.
        </p>
      </div>

      <div className="pk-capmatrix__wrap">
        <table className="pk-capmatrix__table">
          <thead>
            <tr>
              <th>Capability</th>
              {providers.map((p) => (
                <th key={p}>{providerLabels[p]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAPABILITIES.map((cap) => (
              <tr key={cap.key}>
                <td>
                  <div className="text-pk-strong font-medium">{cap.label}</div>
                  <div className="pk-capmatrix__desc">{cap.description}</div>
                </td>
                {providers.map((p) => {
                  const supported = capabilities[p][cap.key as keyof ProviderCapabilities];
                  const isSelected = selected?.cap.key === cap.key && selected?.provider === p;
                  return (
                    <td key={p}>
                      {supported ? (
                        <button
                          type="button"
                          className="pk-capmatrix__yes cursor-pointer"
                          onClick={() => setSelected(isSelected ? null : { cap, provider: p })}
                          title={`View ${cap.label} code for ${p}`}
                          style={{
                            background: isSelected ? 'var(--accent-soft)' : 'none',
                            border: 'none',
                            padding: '4px 8px',
                            font: 'inherit',
                          }}
                        >
                          ✓
                        </button>
                      ) : (
                        <span className="pk-capmatrix__no">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pk-capmatrix__legend">
        <span className="pk-capmatrix__legend-item">
          <span className="pk-capmatrix__yes">✓</span> Supported
        </span>
        <span className="pk-capmatrix__legend-item">
          <span className="pk-capmatrix__no">—</span> Not available
        </span>
      </div>

      {selected && (
        <div className="pk-capmatrix__snippet">
          <p className="pk-capmatrix__snippet-label">
            {selected.cap.label} — {selected.provider.charAt(0).toUpperCase() + selected.provider.slice(1)}
          </p>
          <CodeCard
            filename={`${selected.cap.key}.ts`}
            html={`<pre><code>${syntaxHighlight(
              selected.cap.snippet(selected.provider),
            )}</code></pre>`}
          />
        </div>
      )}
    </div>
  );
}
