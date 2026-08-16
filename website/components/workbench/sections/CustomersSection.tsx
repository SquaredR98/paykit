'use client';

import { useState } from 'react';
import { FieldRow } from '../FieldRow';
import { ResponseViewer } from '../ResponseViewer';
import { executeOperation } from '@/app/actions/workbench';
import type { OperationResult } from '@/app/actions/workbench';

interface CustomersSectionProps {
  configuredProviders: string[];
}

type OpTab = 'create' | 'retrieve' | 'update' | 'delete' | 'list';

export function CustomersSection({ configuredProviders }: CustomersSectionProps) {
  const [opTab, setOpTab] = useState<OpTab>('create');
  const [provider, setProvider] = useState(configuredProviders[0] ?? 'stripe');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OperationResult | null>(null);

  const [email, setEmail] = useState('test@example.com');
  const [name, setName] = useState('Test User');
  const [customerId, setCustomerId] = useState('');
  const [listLimit, setListLimit] = useState('5');

  async function handleCreate() {
    setLoading(true);
    setResult(null);
    try {
      const res = await executeOperation(provider, 'customers', 'create', {
        email,
        name,
        metadata: { source: 'dev-workbench' },
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  async function handleRetrieve() {
    if (!customerId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await executeOperation(provider, 'customers', 'retrieve', { id: customerId });
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    if (!customerId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await executeOperation(provider, 'customers', 'update', {
        id: customerId,
        email,
        name,
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!customerId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await executeOperation(provider, 'customers', 'delete', { id: customerId });
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  async function handleList() {
    setLoading(true);
    setResult(null);
    try {
      const res = await executeOperation(provider, 'customers', 'list', {
        limit: parseInt(listLimit, 10),
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  const tabs: OpTab[] = ['create', 'retrieve', 'update', 'delete', 'list'];

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
        {tabs.map((tab) => (
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
          <FieldRow label="Email">
            <input className="wb-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="test@example.com" />
          </FieldRow>
          <FieldRow label="Name">
            <input className="wb-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Test User" />
          </FieldRow>
          <div className="wb-actions">
            <button type="button" className="pk-btn pk-btn--primary pk-btn--sm" onClick={handleCreate} disabled={loading}>
              {loading ? <span className="wb-spinner" /> : null}
              Create Customer
            </button>
          </div>
        </>
      )}

      {(opTab === 'retrieve' || opTab === 'update' || opTab === 'delete') && (
        <>
          <FieldRow label="Customer ID">
            <input className="wb-input" value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="cus_xxx" />
          </FieldRow>
          {opTab === 'update' && (
            <>
              <FieldRow label="Email">
                <input className="wb-input" value={email} onChange={(e) => setEmail(e.target.value)} />
              </FieldRow>
              <FieldRow label="Name">
                <input className="wb-input" value={name} onChange={(e) => setName(e.target.value)} />
              </FieldRow>
            </>
          )}
          <div className="wb-actions">
            <button
              type="button"
              className={`pk-btn pk-btn--sm ${opTab === 'delete' ? 'pk-btn--secondary' : 'pk-btn--primary'}`}
              onClick={opTab === 'retrieve' ? handleRetrieve : opTab === 'update' ? handleUpdate : handleDelete}
              disabled={loading || !customerId.trim()}
              style={opTab === 'delete' ? { color: 'var(--text-bad)' } : undefined}
            >
              {loading ? <span className="wb-spinner" /> : null}
              {opTab.charAt(0).toUpperCase() + opTab.slice(1)}
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
              List Customers
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
