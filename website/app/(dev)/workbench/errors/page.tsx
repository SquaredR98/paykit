'use client';

import { Explainer } from '@/components/workbench/Explainer';
import { CodeBlock } from '@/components/workbench/CodeBlock';
import { ErrorCatalog } from '@/components/workbench/sections/ErrorCatalog';
import { useWorkbench } from '@/components/workbench/WorkbenchContext';

export default function ErrorsPage() {
  const { errorCatalog } = useWorkbench();

  return (
    <>
      <Explainer eyebrow="Utilities" title="Error Catalog">
        <p>
          Every payment provider returns errors in its own format &mdash;
          Stripe uses <code>type</code> and <code>code</code>, Razorpay uses{' '}
          <code>error.code</code> and <code>error.description</code>, PayPal uses{' '}
          <code>name</code> and <code>details</code>. PayKit unifies all of them
          into 18 standard <code>PaymentErrorCode</code> values.
        </p>

        <h2>The PaymentError class</h2>
        <p>
          Every error thrown by PayKit is an instance of <code>PaymentError</code>,
          which extends <code>Error</code> with structured fields:
        </p>
        <CodeBlock filename="PaymentError">{`{
  code: "card_declined",        // one of 18 PaymentErrorCode values
  message: "Your card was declined",
  provider: "stripe",           // which provider threw the error
  providerCode: "card_declined", // the provider's native error code
  isRetryable: false,           // can this operation be retried?
  suggestion: "Try a different card or contact your bank"
}`}</CodeBlock>

        <h2>Error mappers</h2>
        <p>
          Each adapter has an error mapper that translates provider-native errors
          to PayKit&rsquo;s unified codes. For example, Stripe&rsquo;s{' '}
          <code>card_declined</code> maps to PayKit&rsquo;s <code>card_declined</code>,
          but Stripe&rsquo;s <code>rate_limit</code> maps to <code>rate_limit</code>{' '}
          with <code>isRetryable: true</code>.
        </p>

        <h2>Suggestions</h2>
        <p>
          Every error code has an auto-generated suggestion from the{' '}
          <code>ERROR_SUGGESTIONS</code> map. These are developer-facing hints
          for resolving the error. The full catalog is shown below.
        </p>
      </Explainer>

      <div className="wb-section-interactive">
        <ErrorCatalog entries={errorCatalog} />
      </div>
    </>
  );
}
