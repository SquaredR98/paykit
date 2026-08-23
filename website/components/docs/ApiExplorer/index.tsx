'use client';

import { useState, useMemo } from 'react';
import { executeOperation } from '@/app/actions/workbench';
import type { OperationResult } from '@/app/actions/workbench';
import { ResponseViewer } from '@/components/workbench/ResponseViewer';
import { syntaxHighlight } from '@/lib/json-highlight';
import './styles.css';

/* ── Operation definitions ── */

interface ParamDef {
  name: string;
  label: string;
  type: 'string' | 'number' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: string;
}

interface OperationDef {
  resource: string;
  operation: string;
  label: string;
  description: string;
  params: ParamDef[];
}

const OPERATIONS: OperationDef[] = [
  {
    resource: 'charges',
    operation: 'create',
    label: 'Create Charge',
    description: 'Create a new payment charge',
    params: [
      { name: 'amount', label: 'Amount', type: 'number', placeholder: '1000', required: true, defaultValue: '1000' },
      { name: 'currency', label: 'Currency', type: 'string', placeholder: 'USD', required: true, defaultValue: 'USD' },
      { name: 'description', label: 'Description', type: 'string', placeholder: 'Test charge' },
    ],
  },
  {
    resource: 'charges',
    operation: 'retrieve',
    label: 'Retrieve Charge',
    description: 'Get a charge by its ID',
    params: [
      { name: 'id', label: 'Charge ID', type: 'string', placeholder: 'pi_xxx or order_xxx', required: true },
    ],
  },
  {
    resource: 'charges',
    operation: 'list',
    label: 'List Charges',
    description: 'List recent charges',
    params: [
      { name: 'limit', label: 'Limit', type: 'number', placeholder: '5', defaultValue: '5' },
    ],
  },
  {
    resource: 'charges',
    operation: 'capture',
    label: 'Capture Charge',
    description: 'Capture a previously authorized charge',
    params: [
      { name: 'id', label: 'Charge ID', type: 'string', placeholder: 'pi_xxx', required: true },
    ],
  },
  {
    resource: 'refunds',
    operation: 'create',
    label: 'Create Refund',
    description: 'Refund a charge (full or partial)',
    params: [
      { name: 'chargeId', label: 'Charge ID', type: 'string', placeholder: 'pi_xxx', required: true },
      { name: 'amount', label: 'Amount', type: 'number', placeholder: 'Leave empty for full refund' },
      { name: 'reason', label: 'Reason', type: 'string', placeholder: 'requested_by_customer' },
    ],
  },
  {
    resource: 'refunds',
    operation: 'retrieve',
    label: 'Retrieve Refund',
    description: 'Get a refund by its ID',
    params: [
      { name: 'id', label: 'Refund ID', type: 'string', placeholder: 're_xxx', required: true },
    ],
  },
  {
    resource: 'refunds',
    operation: 'list',
    label: 'List Refunds',
    description: 'List recent refunds',
    params: [
      { name: 'limit', label: 'Limit', type: 'number', placeholder: '5', defaultValue: '5' },
    ],
  },
  {
    resource: 'customers',
    operation: 'create',
    label: 'Create Customer',
    description: 'Create a new customer record',
    params: [
      { name: 'email', label: 'Email', type: 'string', placeholder: 'test@example.com' },
      { name: 'name', label: 'Name', type: 'string', placeholder: 'Jane Doe' },
    ],
  },
  {
    resource: 'customers',
    operation: 'retrieve',
    label: 'Retrieve Customer',
    description: 'Get a customer by ID',
    params: [
      { name: 'id', label: 'Customer ID', type: 'string', placeholder: 'cus_xxx', required: true },
    ],
  },
  {
    resource: 'customers',
    operation: 'list',
    label: 'List Customers',
    description: 'List customers',
    params: [
      { name: 'limit', label: 'Limit', type: 'number', placeholder: '5', defaultValue: '5' },
    ],
  },
  {
    resource: 'subscriptions',
    operation: 'create',
    label: 'Create Subscription',
    description: 'Start a recurring subscription',
    params: [
      { name: 'customer', label: 'Customer ID', type: 'string', placeholder: 'cus_xxx', required: true },
      { name: 'amount', label: 'Amount', type: 'number', placeholder: '1999', required: true, defaultValue: '1999' },
      { name: 'currency', label: 'Currency', type: 'string', placeholder: 'USD', required: true, defaultValue: 'USD' },
      { name: 'interval', label: 'Interval', type: 'select', options: ['month', 'year', 'week', 'day'], defaultValue: 'month' },
    ],
  },
  {
    resource: 'subscriptions',
    operation: 'retrieve',
    label: 'Retrieve Subscription',
    description: 'Get a subscription by ID',
    params: [
      { name: 'id', label: 'Subscription ID', type: 'string', placeholder: 'sub_xxx', required: true },
    ],
  },
  {
    resource: 'subscriptions',
    operation: 'list',
    label: 'List Subscriptions',
    description: 'List subscriptions',
    params: [
      { name: 'limit', label: 'Limit', type: 'number', placeholder: '5', defaultValue: '5' },
    ],
  },
];

const PROVIDERS = ['stripe', 'razorpay', 'paypal'] as const;

/* ── Code snippet generator ── */

function generateSnippet(provider: string, op: OperationDef, values: Record<string, string>): string {
  const adapterMap: Record<string, string> = {
    stripe: 'StripeAdapter',
    razorpay: 'RazorpayAdapter',
    paypal: 'PayPalAdapter',
  };

  const lines: string[] = [
    `import { PayKit } from '@squaredr/paykit';`,
    `import { ${adapterMap[provider]} } from '@squaredr/paykit/${provider}';`,
    '',
    `const paykit = new PayKit({`,
    `  adapter: new ${adapterMap[provider]}({ /* credentials */ }),`,
    `});`,
    '',
  ];

  const paramEntries = op.params
    .filter((p) => values[p.name]?.trim())
    .map((p) => {
      const val = values[p.name];
      if (p.type === 'number') return `  ${p.name}: ${val}`;
      return `  ${p.name}: '${val}'`;
    });

  if (op.operation === 'create') {
    lines.push(`const result = await paykit.${op.resource}.create({`);
    paramEntries.forEach((e) => lines.push(`${e},`));
    lines.push(`});`);
  } else if (op.operation === 'retrieve') {
    lines.push(`const result = await paykit.${op.resource}.retrieve('${values.id ?? ''}');`);
  } else if (op.operation === 'list') {
    lines.push(`const result = await paykit.${op.resource}.list({`);
    lines.push(`  limit: ${values.limit || '10'},`);
    lines.push(`});`);
  } else if (op.operation === 'capture') {
    lines.push(`const result = await paykit.${op.resource}.capture('${values.id ?? ''}');`);
  }

  return lines.join('\n');
}

/* ── Component ── */

export function ApiExplorer() {
  const [provider, setProvider] = useState<string>('stripe');
  const [opIndex, setOpIndex] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OperationResult | null>(null);

  const op = OPERATIONS[opIndex];

  // Reset values when operation changes
  function handleOpChange(idx: number) {
    setOpIndex(idx);
    setResult(null);
    const defaults: Record<string, string> = {};
    OPERATIONS[idx].params.forEach((p) => {
      if (p.defaultValue) defaults[p.name] = p.defaultValue;
    });
    setValues(defaults);
  }

  function setValue(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleExecute() {
    setLoading(true);
    setResult(null);
    try {
      const params: Record<string, unknown> = {};
      op.params.forEach((p) => {
        const val = values[p.name];
        if (!val?.trim()) return;
        params[p.name] = p.type === 'number' ? parseInt(val, 10) : val;
      });
      const res = await executeOperation(provider, op.resource, op.operation, params);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  const snippet = useMemo(() => generateSnippet(provider, op, values), [provider, op, values]);

  const canExecute = op.params
    .filter((p) => p.required)
    .every((p) => values[p.name]?.trim());

  return (
    <div className="pk-explorer">
      <div className="pk-explorer__header">
        <span className="pk-eyebrow">API Explorer</span>
        <h1>Interactive API Console</h1>
        <p>
          Execute real PayKit operations against test-mode provider APIs.
          See unified responses, raw provider data, and the exact code to reproduce.
        </p>
      </div>

      {/* Controls: provider + operation */}
      <div className="pk-explorer__controls">
        <div className="pk-explorer__control">
          <label>Provider</label>
          <select
            value={provider}
            onChange={(e) => { setProvider(e.target.value); setResult(null); }}
          >
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="pk-explorer__control">
          <label>Operation</label>
          <select
            value={opIndex}
            onChange={(e) => handleOpChange(Number(e.target.value))}
            style={{ minWidth: '220px' }}
          >
            {OPERATIONS.map((o, i) => (
              <option key={`${o.resource}.${o.operation}`} value={i}>
                {o.resource}.{o.operation}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <p className="text-pk-muted mb-(--space-4)" style={{ font: 'var(--type-body-sm)' }}>
        {op.description}
      </p>

      {/* Parameters */}
      {op.params.length > 0 && (
        <div className="pk-explorer__params">
          {op.params.map((p) => (
            <div key={p.name} className="pk-explorer__param">
              <label htmlFor={`param-${p.name}`}>
                {p.label}
                {p.required && <span className="text-pk-bad ml-1">*</span>}
              </label>
              {p.type === 'select' ? (
                <select
                  id={`param-${p.name}`}
                  className="pk-explorer__control"
                  value={values[p.name] ?? p.defaultValue ?? ''}
                  onChange={(e) => setValue(p.name, e.target.value)}
                  style={{
                    height: 'var(--control-h-md)',
                    padding: '0 var(--space-3)',
                    paddingRight: 'var(--space-8)',
                    background: 'var(--surface-sunken)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-strong)',
                    font: 'var(--type-code)',
                    cursor: 'pointer',
                    appearance: 'none' as const,
                    flex: 1,
                  }}
                >
                  {p.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={`param-${p.name}`}
                  type={p.type === 'number' ? 'number' : 'text'}
                  value={values[p.name] ?? ''}
                  onChange={(e) => setValue(p.name, e.target.value)}
                  placeholder={p.placeholder}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Execute */}
      <div className="pk-explorer__execute">
        <button
          type="button"
          className="pk-btn pk-btn--primary pk-btn--sm"
          onClick={handleExecute}
          disabled={loading || !canExecute}
        >
          {loading && <span className="wb-spinner mr-(--space-2)" />}
          Execute
        </button>
        {loading && (
          <span className="text-pk-muted" style={{ font: 'var(--type-code-sm)' }}>
            Calling {provider}...
          </span>
        )}
      </div>

      {/* Response */}
      {result && (
        <ResponseViewer
          data={result.data}
          meta={result.meta}
          raw={result.raw}
          error={result.error}
          durationMs={result.durationMs}
        />
      )}

      {/* Code snippet */}
      <div className="pk-explorer__snippet">
        <p className="pk-explorer__snippet-label">Code</p>
        <div className="pk-term">
          <div className="pk-term__bar">
            <span className="pk-term__file">{op.resource}.ts</span>
          </div>
          <pre className="pk-term__code">
            <code
              dangerouslySetInnerHTML={{
                __html: syntaxHighlight(snippet),
              }}
            />
          </pre>
        </div>
      </div>
    </div>
  );
}
