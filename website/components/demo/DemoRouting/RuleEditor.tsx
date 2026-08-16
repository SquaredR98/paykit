export interface RoutingRule {
  currency: string;
  provider: string;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'BRL', 'AUD', 'CAD', 'SGD', 'MYR'];
const PROVIDERS = ['stripe', 'razorpay', 'paypal'];

interface RuleEditorProps {
  rules: RoutingRule[];
  defaultProvider: string;
  onRulesChange: (rules: RoutingRule[]) => void;
  onDefaultChange: (provider: string) => void;
}

export function RuleEditor({ rules, defaultProvider, onRulesChange, onDefaultChange }: RuleEditorProps) {
  const updateRule = (index: number, field: keyof RoutingRule, value: string) => {
    const next = rules.map((r, i) => (i === index ? { ...r, [field]: value } : r));
    onRulesChange(next);
  };

  const removeRule = (index: number) => {
    onRulesChange(rules.filter((_, i) => i !== index));
  };

  const addRule = () => {
    const usedCurrencies = new Set(rules.map((r) => r.currency));
    const nextCurrency = CURRENCIES.find((c) => !usedCurrencies.has(c)) ?? 'USD';
    onRulesChange([...rules, { currency: nextCurrency, provider: 'stripe' }]);
  };

  return (
    <div className="pk-routing-demo__editor">
      <div className="pk-routing-demo__rules">
        <div className="pk-routing-demo__rule-header">
          <span className="pk-routing-demo__rule-title">Routing rules</span>
        </div>
        {rules.map((rule, i) => (
          <div key={i} className="pk-routing-demo__rule">
            <span>currency ===</span>
            <select
              className="pk-routing-demo__rule-select"
              value={rule.currency}
              onChange={(e) => updateRule(i, 'currency', e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="pk-routing-demo__rule-arrow">→</span>
            <select
              className="pk-routing-demo__rule-select"
              value={rule.provider}
              onChange={(e) => updateRule(i, 'provider', e.target.value)}
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <button
              type="button"
              className="pk-routing-demo__rule-remove"
              onClick={() => removeRule(i)}
              title="Remove rule"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {rules.length < CURRENCIES.length && (
        <button type="button" className="pk-routing-demo__add-btn" onClick={addRule}>
          + Add rule
        </button>
      )}
      <div className="pk-routing-demo__default">
        <span className="pk-routing-demo__default-label">fallback →</span>
        <select
          className="pk-routing-demo__rule-select"
          value={defaultProvider}
          onChange={(e) => onDefaultChange(e.target.value)}
        >
          {PROVIDERS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
