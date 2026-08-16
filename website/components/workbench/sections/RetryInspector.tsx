'use client';

import { useState } from 'react';
import { FieldRow } from '../FieldRow';
import { ResponseViewer } from '../ResponseViewer';
import { executeWithRetryInspector } from '@/app/actions/workbench';
import type { RetryInspectorResult, HookEvent } from '@/app/actions/workbench';

interface RetryInspectorProps {
  configuredProviders: string[];
}

function EventTimeline({ events }: { events: HookEvent[] }) {
  if (events.length === 0) return null;

  return (
    <div className="wb-timeline">
      {events.map((event, i) => (
        <div key={i} className={`wb-timeline__entry wb-timeline__entry--${event.type}`}>
          <span className="wb-timeline__time">{event.timestamp}ms</span>
          <span className="wb-timeline__msg">
            <strong style={{ color: 'var(--text-strong)' }}>
              {event.type === 'request' ? 'REQ' : event.type === 'response' ? 'RES' : 'ERR'}
            </strong>
            {' '}
            {String(event.data.operation)}
            {event.data.attempt !== undefined && ` (attempt ${String(event.data.attempt)})`}
            {event.data.willRetry !== undefined && (
              <span style={{ color: event.data.willRetry ? 'var(--text-warn)' : 'var(--text-bad)' }}>
                {event.data.willRetry ? ' \u2192 will retry' : ' \u2192 final'}
              </span>
            )}
            {event.data.durationMs !== undefined && (
              <span className="text-pk-subtle"> [{String(event.data.durationMs)}ms]</span>
            )}
            {event.data.error != null && (
              <span style={{ color: 'var(--text-bad)' }}> {String(event.data.error)}</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RetryInspector({ configuredProviders }: RetryInspectorProps) {
  const [provider, setProvider] = useState(configuredProviders[0] ?? 'stripe');
  const [retries, setRetries] = useState('0');
  const [retryDelay, setRetryDelay] = useState('500');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RetryInspectorResult | null>(null);

  async function handleExecute() {
    setLoading(true);
    setResult(null);
    try {
      const res = await executeWithRetryInspector(
        provider,
        parseInt(retries, 10),
        parseInt(retryDelay, 10),
      );
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p className="text-pk-muted mb-(--space-4)" style={{ font: 'var(--type-body-sm)' }}>
        Runs a read-only <code className="font-mono" style={{ fontSize: 'var(--code-size-sm)' }}>charges.list</code> operation
        through UnifiedPayments with lifecycle hooks enabled. The timeline below shows onRequest, onResponse, and onError callbacks.
      </p>

      <FieldRow label="Provider">
        <select className="wb-select" value={provider} onChange={(e) => setProvider(e.target.value)}>
          {configuredProviders.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </FieldRow>

      <FieldRow label="Retries" hint="0 = no retry, max 5">
        <input
          className="wb-input"
          type="number"
          min="0"
          max="5"
          value={retries}
          onChange={(e) => setRetries(e.target.value)}
        />
      </FieldRow>

      <FieldRow label="Retry Delay" hint="Base delay in ms (exponential backoff)">
        <input
          className="wb-input"
          type="number"
          min="100"
          max="10000"
          step="100"
          value={retryDelay}
          onChange={(e) => setRetryDelay(e.target.value)}
        />
      </FieldRow>

      <div className="wb-actions">
        <button
          type="button"
          className="pk-btn pk-btn--primary pk-btn--sm"
          onClick={handleExecute}
          disabled={loading}
        >
          {loading ? <span className="wb-spinner" /> : null}
          Execute
        </button>
      </div>

      {result && (
        <>
          <div className="mt-(--space-4) flex items-center gap-(--space-4)">
            <span
              className={`pk-bdg ${result.success ? 'pk-bdg--ok' : ''}`}
              style={!result.success ? { background: 'oklch(0.620 0.195 22 / 0.13)', color: 'var(--text-bad)' } : undefined}
            >
              {result.success ? 'Succeeded' : 'Failed'}
            </span>
            <span className="text-pk-muted" style={{ font: 'var(--type-code-sm)' }}>
              Total: {result.totalDurationMs}ms
            </span>
            <span className="text-pk-muted" style={{ font: 'var(--type-code-sm)' }}>
              Hook events: {result.events.length}
            </span>
          </div>

          <EventTimeline events={result.events} />

          {result.data && (
            <ResponseViewer data={result.data} durationMs={result.totalDurationMs} />
          )}

          {result.error && (
            <ResponseViewer error={result.error} durationMs={result.totalDurationMs} />
          )}
        </>
      )}
    </>
  );
}
