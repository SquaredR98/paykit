'use client';

import { useState } from 'react';
import { syntaxHighlight, formatJson } from '@/lib/json-highlight';

interface ResponseViewerProps {
  data?: unknown;
  meta?: unknown;
  raw?: unknown;
  error?: {
    code: string;
    message: string;
    provider?: string;
    providerCode?: string;
    suggestion?: string;
    isRetryable?: boolean;
  };
  durationMs?: number;
}

type Tab = 'result' | 'raw' | 'meta';

export function ResponseViewer({ data, meta, raw, error, durationMs }: ResponseViewerProps) {
  const [tab, setTab] = useState<Tab>('result');

  if (error) {
    return (
      <div className="pk-term mt-(--space-4)">
        <div className="pk-term__bar">
          <span className="pk-term__file">Error</span>
          {durationMs !== undefined && (
            <div className="pk-term__meta">
              <span className="pk-term__note">{durationMs}ms</span>
            </div>
          )}
        </div>
        <pre className="pk-term__code" style={{ color: 'var(--text-bad)' }}>
          <code>{`${error.code}: ${error.message}`}</code>
          {error.providerCode && <code>{`\nProvider code: ${error.providerCode}`}</code>}
          {error.suggestion && <code>{`\nSuggestion: ${error.suggestion}`}</code>}
          {error.isRetryable !== undefined && <code>{`\nRetryable: ${error.isRetryable}`}</code>}
        </pre>
      </div>
    );
  }

  if (data === undefined && meta === undefined && raw === undefined) {
    return null;
  }

  const allTabs: { key: Tab; label: string; content: unknown }[] = [
    { key: 'result' as Tab, label: 'Result', content: data },
    { key: 'raw' as Tab, label: 'Raw', content: raw },
    { key: 'meta' as Tab, label: 'Meta', content: meta },
  ];
  const tabs = allTabs.filter((t): t is { key: Tab; label: string; content: unknown } =>
    t.content !== undefined && t.content !== null,
  );

  const activeContent = tabs.find((t) => t.key === tab)?.content ?? data;

  return (
    <div className="pk-term mt-(--space-4)">
      <div className="pk-term__bar">
        <div className="flex items-stretch">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className="pk-term__file cursor-pointer"
              style={{
                borderBottom: tab === t.key ? '2px solid var(--border-accent)' : '2px solid transparent',
                color: tab === t.key ? 'var(--text-strong)' : undefined,
              }}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {durationMs !== undefined && (
          <div className="pk-term__meta">
            <span className="pk-term__note">{durationMs}ms</span>
          </div>
        )}
      </div>
      <pre className="pk-term__code">
        <code
          dangerouslySetInnerHTML={{
            __html: syntaxHighlight(formatJson(activeContent)),
          }}
        />
      </pre>
    </div>
  );
}
