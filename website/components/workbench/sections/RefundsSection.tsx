'use client';

import { useState } from 'react';
import { FieldRow } from '../FieldRow';
import { ResponseViewer } from '../ResponseViewer';
import { executeOperation } from '@/app/actions/workbench';
import type { OperationResult } from '@/app/actions/workbench';

interface RefundsSectionProps {
  configuredProviders: string[];
}

type OpTab = 'create' | 'retrieve' | 'list';

export function RefundsSection({ configuredProviders }: RefundsSectionProps) {
  const [opTab, setOpTab] = useState<OpTab>('create');
  const [provider, setProvider] = useState(configuredProviders[0] ?? 'stripe');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OperationResult | null>(null);

  const [chargeId, setChargeId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [refundId, setRefundId] = useState('');
  const [listLimit, setListLimit] = useState('5');

  async function handleCreate() {
    if (!chargeId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const params: Record<string, unknown> = { chargeId };
      if (amount) params.amount = parseInt(amount, 10);
      if (reason) params.reason = reason;
      const res = await executeOperation(provider, 'refunds', 'create', params);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  async function handleRetrieve() {
    if (!refundId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await executeOperation(provider, 'refunds', 'retrieve', { id: refundId });
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  async function handleList() {
    setLoading(true);
    setResult(null);
    try {
      const res = await executeOperation(provider, 'refunds', 'list', {
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
        {(['create', 'retrieve', 'list'] as const).map((tab) => (
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
          <FieldRow label="Charge ID">
            <input className="wb-input" value={chargeId} onChange={(e) => setChargeId(e.target.value)} placeholder="pi_xxx" />
          </FieldRow>
          <FieldRow label="Amount" hint="Leave empty for full refund">
            <input className="wb-input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Optional" />
          </FieldRow>
          <FieldRow label="Reason">
            <input className="wb-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional" />
          </FieldRow>
          <div className="wb-actions">
            <button type="button" className="pk-btn pk-btn--primary pk-btn--sm" onClick={handleCreate} disabled={loading || !chargeId.trim()}>
              {loading ? <span className="wb-spinner" /> : null}
              Create Refund
            </button>
          </div>
        </>
      )}

      {opTab === 'retrieve' && (
        <>
          <FieldRow label="Refund ID">
            <input className="wb-input" value={refundId} onChange={(e) => setRefundId(e.target.value)} placeholder="re_xxx" />
          </FieldRow>
          <div className="wb-actions">
            <button type="button" className="pk-btn pk-btn--primary pk-btn--sm" onClick={handleRetrieve} disabled={loading || !refundId.trim()}>
              {loading ? <span className="wb-spinner" /> : null}
              Retrieve
            </button>
          </div>
        </>
      )}

      {opTab === 'list' && (
        <>
          <FieldRow label="Limit">
            <input className="wb-input" type="number" value={listLimit} onChange={(e) => setListLimit(e.target.value)} placeholder="5" />
          </FieldRow>
          <div className="wb-actions">
            <button type="button" className="pk-btn pk-btn--primary pk-btn--sm" onClick={handleList} disabled={loading}>
              {loading ? <span className="wb-spinner" /> : null}
              List Refunds
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
