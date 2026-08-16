'use client';

import { useState } from 'react';
import { StatusBadge } from '../StatusBadge';
import { getProviderStatuses } from '@/app/actions/workbench';
import type { ProviderStatusResult } from '@/app/actions/workbench';

interface ProviderStatusProps {
  initialStatuses: ProviderStatusResult[];
}

const CAPABILITY_LABELS: Record<string, string> = {
  charges: 'Charges',
  authAndCapture: 'Auth & Capture',
  refunds: 'Refunds',
  partialRefunds: 'Partial Refunds',
  subscriptions: 'Subscriptions',
  savedPaymentMethods: 'Saved PMs',
  hostedCheckout: 'Hosted Checkout',
  embeddableUI: 'Embeddable UI',
  payouts: 'Payouts',
  multiCurrency: 'Multi-Currency',
  directDebit: 'Direct Debit',
  webhooks: 'Webhooks',
  threeDS: '3D Secure',
};

export function ProviderStatus({ initialStatuses }: ProviderStatusProps) {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    try {
      const updated = await getProviderStatuses();
      setStatuses(updated);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <>
      <div className="flex justify-end mb-(--space-4)">
        <button
          type="button"
          className="pk-btn pk-btn--secondary pk-btn--sm"
          onClick={refresh}
          disabled={refreshing}
        >
          {refreshing ? <span className="wb-spinner" /> : null}
          Refresh
        </button>
      </div>

      <div className="wb-provider-grid">
        {statuses.map((status) => (
          <div key={status.provider} className="wb-provider-card">
            <div className="flex items-center justify-between mb-(--space-3)">
              <span
                className="text-pk-strong font-display font-semibold"
                style={{ fontSize: 'var(--text-lg)' }}
              >
                {status.provider}
              </span>
              {!status.configured ? (
                <StatusBadge label="Not Configured" variant="neutral" />
              ) : status.health?.healthy ? (
                <StatusBadge
                  label={`Healthy${status.health.latencyMs ? ` (${status.health.latencyMs}ms)` : ''}`}
                  variant="ok"
                />
              ) : status.error ? (
                <StatusBadge label="Error" variant="bad" />
              ) : (
                <StatusBadge label="Unhealthy" variant="bad" />
              )}
            </div>

            {!status.configured && (
              <p className="text-pk-subtle" style={{ font: 'var(--type-code-sm)' }}>
                Set environment variables to enable this provider.
              </p>
            )}

            {status.error && (
              <p className="text-pk-subtle mt-(--space-2)" style={{ font: 'var(--type-code-sm)', color: 'var(--text-bad)' }}>
                {status.error}
              </p>
            )}

            {status.health && !status.health.healthy && status.health.message && (
              <p className="text-pk-subtle mt-(--space-2)" style={{ font: 'var(--type-code-sm)', color: 'var(--text-bad)' }}>
                {status.health.message}
              </p>
            )}

            {status.capabilities && (
              <div className="wb-cap-grid">
                {Object.entries(status.capabilities).map(([key, supported]) => (
                  <span
                    key={key}
                    className="pk-tag"
                    style={{
                      opacity: supported ? 1 : 0.35,
                      borderColor: supported ? 'var(--border-default)' : undefined,
                    }}
                  >
                    {CAPABILITY_LABELS[key] ?? key}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
