'use client';

import { useState } from 'react';
import { FieldRow } from '../FieldRow';
import { ResponseViewer } from '../ResponseViewer';
import { executeOperation } from '@/app/actions/workbench';
import type { OperationResult } from '@/app/actions/workbench';

interface ChargesSectionProps {
  configuredProviders: string[];
}

type OpTab = 'create' | 'retrieve' | 'list';

export function ChargesSection({ configuredProviders }: ChargesSectionProps) {
  const [opTab, setOpTab] = useState<OpTab>('create');
  const [provider, setProvider] = useState(configuredProviders[0] ?? 'stripe');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OperationResult | null>(null);

  // Create form
  const [amount, setAmount] = useState('1000');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('Workbench test charge');

  // Retrieve form
  const [chargeId, setChargeId] = useState('');

  // List form
  const [listLimit, setListLimit] = useState('5');

  async function handleCreate() {
    setLoading(true);
    setResult(null);
    try {
      const res = await executeOperation(provider, 'charges', 'create', {
        amount: parseInt(amount, 10),
        currency,
        description,
        metadata: { source: 'dev-workbench' },
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  async function handleRetrieve() {
    if (!chargeId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await executeOperation(provider, 'charges', 'retrieve', { id: chargeId });
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  async function handleList() {
    setLoading(true);
    setResult(null);
    try {
      const res = await executeOperation(provider, 'charges', 'list', {
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
        <select
          className="wb-select"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
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
          <FieldRow label="Amount" hint="In smallest unit (e.g. 1000 = $10.00)">
            <input
              className="wb-input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
            />
          </FieldRow>
          <FieldRow label="Currency">
            <input
              className="wb-input"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              placeholder="USD"
            />
          </FieldRow>
          <FieldRow label="Description">
            <input
              className="wb-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Test charge"
            />
          </FieldRow>
          <div className="wb-actions">
            <button
              type="button"
              className="pk-btn pk-btn--primary pk-btn--sm"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? <span className="wb-spinner" /> : null}
              Create Charge
            </button>
          </div>
        </>
      )}

      {opTab === 'retrieve' && (
        <>
          <FieldRow label="Charge ID">
            <input
              className="wb-input"
              value={chargeId}
              onChange={(e) => setChargeId(e.target.value)}
              placeholder="pi_xxx or order_xxx"
            />
          </FieldRow>
          <div className="wb-actions">
            <button
              type="button"
              className="pk-btn pk-btn--primary pk-btn--sm"
              onClick={handleRetrieve}
              disabled={loading || !chargeId.trim()}
            >
              {loading ? <span className="wb-spinner" /> : null}
              Retrieve
            </button>
          </div>
        </>
      )}

      {opTab === 'list' && (
        <>
          <FieldRow label="Limit">
            <input
              className="wb-input"
              type="number"
              value={listLimit}
              onChange={(e) => setListLimit(e.target.value)}
              placeholder="5"
            />
          </FieldRow>
          <div className="wb-actions">
            <button
              type="button"
              className="pk-btn pk-btn--primary pk-btn--sm"
              onClick={handleList}
              disabled={loading}
            >
              {loading ? <span className="wb-spinner" /> : null}
              List Charges
            </button>
          </div>
        </>
      )}

      {result && (
        <ResponseViewer
          data={result.data}
          meta={result.meta}
          raw={result.raw}
          error={result.error}
          durationMs={result.durationMs}
        />
      )}
    </>
  );
}
