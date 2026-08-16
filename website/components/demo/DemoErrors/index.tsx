'use client';

import { useState, useMemo } from 'react';
import { ERROR_SAMPLES, ERROR_PROVIDERS, getErrorsByProvider } from '@/lib/demo-data/error-samples';
import { SplitView } from '@/components/demo/shared/SplitView';
import { JsonViewer } from '@/components/demo/shared/JsonViewer';
import { ErrorResult } from './ErrorResult';
import { ErrorCodeTable } from './ErrorCodeTable';
import './styles.css';

interface DemoErrorsProps {
  errorSuggestions: Record<string, string>;
}

export function DemoErrors({ errorSuggestions }: DemoErrorsProps) {
  const [provider, setProvider] = useState<string>(ERROR_PROVIDERS[0]);
  const scenarios = useMemo(() => getErrorsByProvider(provider), [provider]);
  const [scenarioIndex, setScenarioIndex] = useState(0);

  const sample = scenarios[scenarioIndex] ?? ERROR_SAMPLES[0]!;

  const handleProviderChange = (p: string) => {
    setProvider(p);
    setScenarioIndex(0);
  };

  return (
    <div className="pk-error-demo">
      <div className="pk-error-demo__controls">
        <select
          className="pk-error-demo__select"
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value)}
        >
          {ERROR_PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
        <select
          className="pk-error-demo__select"
          value={scenarioIndex}
          onChange={(e) => setScenarioIndex(Number(e.target.value))}
        >
          {scenarios.map((s, i) => (
            <option key={s.scenario} value={i}>
              {s.scenario}
              {s.testCard ? ` (${s.testCard})` : ''}
            </option>
          ))}
        </select>
      </div>

      <SplitView
        leftLabel={`Raw ${sample.provider} error`}
        rightLabel="Normalized PaymentError"
        left={<JsonViewer data={sample.rawError} title={`${sample.provider} error`} maxHeight={420} />}
        right={<ErrorResult {...sample.normalizedError} />}
      />

      <ErrorCodeTable codes={errorSuggestions} />
    </div>
  );
}
