'use client';

import { useState, useMemo } from 'react';
import { syntaxHighlight } from '@/lib/json-highlight';
import { SplitView } from '@/components/demo/shared/SplitView';
import { RuleEditor, type RoutingRule } from './RuleEditor';
import { RoutingResult } from './RoutingResult';
import './styles.css';

const INITIAL_RULES: RoutingRule[] = [
  { currency: 'INR', provider: 'razorpay' },
  { currency: 'EUR', provider: 'paypal' },
];

const TEST_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'BRL', 'AUD', 'CAD', 'SGD', 'MYR'];

function resolveProvider(
  rules: RoutingRule[],
  defaultProvider: string,
  currency: string,
): { provider: string; reason: string } {
  for (let i = 0; i < rules.length; i++) {
    if (rules[i]!.currency.toUpperCase() === currency.toUpperCase()) {
      return {
        provider: rules[i]!.provider,
        reason: `Matched rule ${i + 1}: currency === '${rules[i]!.currency}'`,
      };
    }
  }
  return { provider: defaultProvider, reason: 'No rule matched — using default' };
}

function generateRouterCode(rules: RoutingRule[], defaultProvider: string): string {
  const routeLines = rules
    .map((r) => `    { currency: '${r.currency}', adapter: ${r.provider} },`)
    .join('\n');

  return `const router = new PaymentRouter({
  routes: [
${routeLines}
  ],
  default: ${defaultProvider},
});

// Usage
const charge = await router.createCharge({
  amount: 4900,
  currency: 'usd',
});`;
}

function highlightCode(code: string): string {
  // Simple regex-based syntax highlighting for client-side use
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /('(?:[^'\\]|\\.)*')/g,
      '<span class="pk-json-string">$1</span>',
    )
    .replace(
      /\b(const|new|await)\b/g,
      '<span class="pk-json-bool">$1</span>',
    )
    .replace(
      /\b(\d+)\b/g,
      '<span class="pk-json-number">$1</span>',
    )
    .replace(
      /(\/\/.*)/g,
      '<span class="pk-json-null">$1</span>',
    );
}

export function DemoRouting() {
  const [rules, setRules] = useState<RoutingRule[]>(INITIAL_RULES);
  const [defaultProvider, setDefaultProvider] = useState('stripe');
  const [testCurrency, setTestCurrency] = useState('USD');

  const result = useMemo(
    () => resolveProvider(rules, defaultProvider, testCurrency),
    [rules, defaultProvider, testCurrency],
  );

  const codeHtml = useMemo(
    () => highlightCode(generateRouterCode(rules, defaultProvider)),
    [rules, defaultProvider],
  );

  return (
    <div className="pk-routing-demo">
      <RuleEditor
        rules={rules}
        defaultProvider={defaultProvider}
        onRulesChange={setRules}
        onDefaultChange={setDefaultProvider}
      />

      <SplitView
        leftLabel="Test routing"
        rightLabel="Generated code"
        left={
          <div>
            <div className="pk-routing-demo__test-row">
              <select
                className="pk-routing-demo__test-select"
                value={testCurrency}
                onChange={(e) => setTestCurrency(e.target.value)}
              >
                {TEST_CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <RoutingResult provider={result.provider} reason={result.reason} />
            </div>
          </div>
        }
        right={
          <div className="pk-term">
            <div className="pk-term__bar">
              <span className="pk-term__file">router.ts</span>
            </div>
            <pre className="pk-term__code">
              <code dangerouslySetInnerHTML={{ __html: codeHtml }} />
            </pre>
          </div>
        }
      />
    </div>
  );
}
