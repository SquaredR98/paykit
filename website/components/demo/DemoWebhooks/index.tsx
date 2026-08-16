'use client';

import { useState, useMemo } from 'react';
import { WEBHOOK_SAMPLES, WEBHOOK_PROVIDERS, getSamplesByProvider } from '@/lib/demo-data/webhook-samples';
import { SplitView } from '@/components/demo/shared/SplitView';
import { JsonViewer } from '@/components/demo/shared/JsonViewer';
import './styles.css';

export function DemoWebhooks() {
  const [provider, setProvider] = useState<string>(WEBHOOK_PROVIDERS[0]);
  const samples = useMemo(() => getSamplesByProvider(provider), [provider]);
  const [eventIndex, setEventIndex] = useState(0);

  const sample = samples[eventIndex] ?? WEBHOOK_SAMPLES[0]!;

  const handleProviderChange = (p: string) => {
    setProvider(p);
    setEventIndex(0);
  };

  return (
    <div className="pk-webhook-demo">
      <div className="pk-webhook-demo__controls">
        <div className="pk-webhook-demo__tabs">
          {WEBHOOK_PROVIDERS.map((p) => (
            <button
              key={p}
              type="button"
              className={`pk-webhook-demo__tab${provider === p ? ' pk-webhook-demo__tab--active' : ''}`}
              onClick={() => handleProviderChange(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <select
          className="pk-webhook-demo__select"
          value={eventIndex}
          onChange={(e) => setEventIndex(Number(e.target.value))}
        >
          {samples.map((s, i) => (
            <option key={s.providerType} value={i}>
              {s.providerType}
            </option>
          ))}
        </select>
      </div>

      <SplitView
        leftLabel={`Raw ${sample.provider} webhook`}
        rightLabel="Normalized UnifiedWebhookEvent"
        left={<JsonViewer data={sample.rawPayload} title={`${sample.provider} payload`} maxHeight={500} />}
        right={<JsonViewer data={sample.normalizedEvent} title="UnifiedWebhookEvent" maxHeight={500} />}
      />

      <div className="pk-webhook-demo__mapping">
        <span className="pk-webhook-demo__mapping-from">{sample.providerType}</span>
        <span className="pk-webhook-demo__mapping-arrow">→</span>
        <span className="pk-webhook-demo__mapping-to">{sample.normalizedType}</span>
      </div>
    </div>
  );
}
