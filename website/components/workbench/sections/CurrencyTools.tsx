'use client';

import { useState } from 'react';
import { FieldRow } from '../FieldRow';
import { convertCurrency } from '@/app/actions/workbench';
import type { CurrencyConvertResult } from '@/app/actions/workbench';

export function CurrencyTools() {
  const [amount, setAmount] = useState('49.99');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState<CurrencyConvertResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleConvert() {
    setLoading(true);
    try {
      const res = await convertCurrency(parseFloat(amount), currency);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <FieldRow label="Amount" hint="Human-readable amount (e.g. 49.99)">
        <input
          className="wb-input"
          type="number"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="49.99"
        />
      </FieldRow>
      <FieldRow label="Currency">
        <input
          className="wb-input"
          value={currency}
          onChange={(e) => setCurrency(e.target.value.toUpperCase())}
          placeholder="USD"
          maxLength={3}
        />
      </FieldRow>
      <div className="wb-actions">
        <button
          type="button"
          className="pk-btn pk-btn--primary pk-btn--sm"
          onClick={handleConvert}
          disabled={loading}
        >
          {loading ? <span className="wb-spinner" /> : null}
          Convert
        </button>
      </div>

      {result && (
        <div className="mt-(--space-6) border border-pk-border">
          <table className="wb-error-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-pk-muted" style={{ font: 'var(--type-label)' }}>Input</td>
                <td style={{ font: 'var(--type-amount)' }}>{result.input}</td>
              </tr>
              <tr>
                <td className="text-pk-muted" style={{ font: 'var(--type-label)' }}>Smallest Unit</td>
                <td style={{ font: 'var(--type-amount)' }}>{result.smallestUnit}</td>
              </tr>
              <tr>
                <td className="text-pk-muted" style={{ font: 'var(--type-label)' }}>Display Amount</td>
                <td style={{ font: 'var(--type-amount)' }}>{result.displayAmount}</td>
              </tr>
              {result.info && (
                <>
                  <tr>
                    <td className="text-pk-muted" style={{ font: 'var(--type-label)' }}>Symbol</td>
                    <td>{result.info.symbol}</td>
                  </tr>
                  <tr>
                    <td className="text-pk-muted" style={{ font: 'var(--type-label)' }}>Name</td>
                    <td>{result.info.name}</td>
                  </tr>
                  <tr>
                    <td className="text-pk-muted" style={{ font: 'var(--type-label)' }}>Decimal Places</td>
                    <td>{result.info.decimalPlaces}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
