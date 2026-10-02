'use client';

import { Explainer } from '@/components/workbench/Explainer';
import { MermaidDiagram } from '@/components/workbench/MermaidDiagram';
import { CodeBlock } from '@/components/workbench/CodeBlock';
import { RetryInspector } from '@/components/workbench/sections/RetryInspector';
import { useWorkbench } from '@/components/workbench/WorkbenchContext';

export default function RetryPage() {
  const { configuredProviders } = useWorkbench();

  return (
    <>
      <Explainer eyebrow="Infrastructure" title="Retry & Hooks">
        <p>
          <code>UnifiedPayments</code> includes built-in retry with exponential
          backoff and lifecycle hooks that fire at every stage of an operation.
          This page lets you configure retry settings and watch the hooks fire
          in real time.
        </p>

        <h2>How retry works</h2>
        <p>
          When an operation fails with <code>isRetryable: true</code>, PayKit
          automatically retries using exponential backoff with jitter:
        </p>
        <CodeBlock>{`delay = baseDelay * 2^attempt + random(0..baseDelay/2)`}</CodeBlock>
        <p>
          Set <code>retries: 0</code> to disable retry (the default). The maximum
          is 5 retries. The <code>retryDelay</code> parameter controls the base
          delay in milliseconds &mdash; actual delays grow exponentially from this
          base.
        </p>

        <h2>The shouldRetry check</h2>
        <p>
          Not every error should be retried. PayKit only retries when the error
          has <code>isRetryable === true</code>. Network timeouts, rate limits,
          and temporary provider outages are retryable. Card declines,
          authentication failures, and validation errors are not.
        </p>

        <h2>Lifecycle hooks</h2>
        <p>
          Three hooks fire during every operation:
        </p>
        <MermaidDiagram chart={`flowchart LR
  A["onRequest"] --> B{"Operation"}
  B -->|success| C["onResponse"]
  B -->|failure| D["onError"]
  D -->|"willRetry: true"| A
  D -->|"willRetry: false"| E["throw PaymentError"]
  C --> F["return result"]`} />
        <ul>
          <li>
            <code>onRequest(ctx)</code> &mdash; fires before each attempt.
            Receives <code>operation</code>, <code>provider</code>,{' '}
            <code>requestId</code>.
          </li>
          <li>
            <code>onResponse(ctx)</code> &mdash; fires after a successful attempt.
            Adds <code>durationMs</code>.
          </li>
          <li>
            <code>onError(ctx)</code> &mdash; fires after a failed attempt.
            Adds <code>attempt</code>, <code>willRetry</code>,{' '}
            <code>durationMs</code>, <code>error</code>.
          </li>
        </ul>

        <h2>The _meta.attempt field</h2>
        <p>
          Every response includes <code>_meta.attempt</code> &mdash; the attempt
          number that succeeded (starting at 1). If a charge succeeds on the
          third retry, <code>_meta.attempt</code> will be <code>3</code>. This
          is useful for monitoring retry rates and detecting flaky providers.
        </p>

        <h2>Logging levels</h2>
        <p>
          Set the <code>logging</code> option to control console output:{' '}
          <code>none</code>, <code>debug</code>, <code>info</code>,{' '}
          <code>warn</code>, or <code>error</code>. The retry inspector below
          uses <code>debug</code> for maximum visibility.
        </p>
      </Explainer>

      <div className="wb-section-interactive">
        <RetryInspector configuredProviders={configuredProviders} />
      </div>
    </>
  );
}
