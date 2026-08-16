'use client';

import { useState } from 'react';
import { FieldRow } from '../FieldRow';
import { ResponseViewer } from '../ResponseViewer';
import { executeOperation } from '@/app/actions/workbench';
import type { OperationResult } from '@/app/actions/workbench';

interface SubscriptionsSectionProps {
  configuredProviders: string[];
}

type OpTab = 'create' | 'retrieve' | 'cancel' | 'list';

export function SubscriptionsSection({ configuredProviders }: SubscriptionsSectionProps) {
  const [opTab, setOpTab] = useState<OpTab>('create');
  const [provider, setProvider] = useState(configuredProviders[0] ?? 'stripe');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OperationResult | null>(null);

  const [customer, setCustomer] = useState('');
  const [amount, setAmount] = useState('1000');
  const [currency, setCurrency] = useState('USD');
  const [interval, setInterval] = useState('month');
  const [intervalCount, setIntervalCount] = useState('1');
  const [subscriptionId, setSubscriptionId] = useState('');
  const [listLimit, setListLimit] = useState('5');

  async function handleCreate() {
    if (!customer.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await executeOperation(provider, 'subscriptions', 'create', {
        customer,
        amount: parseInt(amount, 10),
        currency,
        interval,
        intervalCount: parseInt(intervalCount, 10),
        metadata: { source: 'dev-workbench' },
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  async function handleRetrieve() {
    if (!subscriptionId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await executeOperation(provider, 'subscriptions', 'retrieve', { id: subscriptionId });
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!subscriptionId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await executeOperation(provider, 'subscriptions', 'cancel', { id: subscriptionId });
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  async function handleList() {
    setLoading(true);
    setResult(null);
    try {
      const res = await executeOperation(provider, 'subscriptions', 'list', {
        limit: parseInt(listLimit, 10),
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <FieldRow label="Provider">
        <select className="wb-select" value={provider} onChange={(e) => setProvider(e.target.value)}>
          {configuredProviders.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </FieldRow>

      <div className="wb-op-tabs">
        {(['create', 'retrieve', 'cancel', 'list'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`wb-op-tab ${opTab === tab ? 'wb-op-tab--active' : ''}`}
            onClick={() => { setOpTab(tab); setResult(null); }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {opTab === 'create' && (
        <>
          <FieldRow label="Customer ID">
            <input className="wb-input" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="cus_xxx" />
          </FieldRow>
          <FieldRow label="Amount" hint="In smallest unit">
            <input className="wb-input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </FieldRow>
          <FieldRow label="Currency">
            <input className="wb-input" value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} />
          </FieldRow>
          <FieldRow label="Interval">
            <select className="wb-select" value={interval} onChange={(e) => setInterval(e.target.value)}>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </FieldRow>
          <FieldRow label="Interval Count">
            <input className="wb-input" type="number" value={intervalCount} onChange={(e) => setIntervalCount(e.target.value)} />
          </FieldRow>
          <div className="wb-actions">
            <button type="button" className="pk-btn pk-btn--primary pk-btn--sm" onClick={handleCreate} disabled={loading || !customer.trim()}>
              {loading ? <span className="wb-spinner" /> : null}
              Create Subscription
            </button>
          </div>
        </>
      )}

      {(opTab === 'retrieve' || opTab === 'cancel') && (
        <>
          <FieldRow label="Subscription ID">
            <input className="wb-input" value={subscriptionId} onChange={(e) => setSubscriptionId(e.target.value)} placeholder="sub_xxx" />
          </FieldRow>
          <div className="wb-actions">
            <button
              type="button"
              className={`pk-btn pk-btn--sm ${opTab === 'cancel' ? 'pk-btn--secondary' : 'pk-btn--primary'}`}
              onClick={opTab === 'retrieve' ? handleRetrieve : handleCancel}
              disabled={loading || !subscriptionId.trim()}
              style={opTab === 'cancel' ? { color: 'var(--text-bad)' } : undefined}
            >
              {loading ? <span className="wb-spinner" /> : null}
              {opTab === 'retrieve' ? 'Retrieve' : 'Cancel'}
            </button>
          </div>
        </>
      )}

      {opTab === 'list' && (
        <>
          <FieldRow label="Limit">
            <input className="wb-input" type="number" value={listLimit} onChange={(e) => setListLimit(e.target.value)} />
          </FieldRow>
          <div className="wb-actions">
            <button type="button" className="pk-btn pk-btn--primary pk-btn--sm" onClick={handleList} disabled={loading}>
              {loading ? <span className="wb-spinner" /> : null}
              List Subscriptions
            </button>
          </div>
        </>
      )}

      {result && (
        <ResponseViewer data={result.data} meta={result.meta} raw={result.raw} error={result.error} durationMs={result.durationMs} />
      )}
    </>
  );
}
