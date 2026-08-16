interface ErrorResultProps {
  code: string;
  message: string;
  provider: string;
  providerCode: string;
  suggestion: string;
  isRetryable: boolean;
  httpStatus: number;
}

export function ErrorResult({ code, message, provider, providerCode, suggestion, isRetryable, httpStatus }: ErrorResultProps) {
  return (
    <div className="pk-error-demo__result">
      <div className="pk-error-demo__result-header">
        <span className="pk-error-demo__result-title">PaymentError</span>
        <span className={`pk-error-demo__badge ${isRetryable ? 'pk-error-demo__badge--retryable' : 'pk-error-demo__badge--fatal'}`}>
          {isRetryable ? 'retryable' : 'not retryable'}
        </span>
      </div>
      <div className="pk-error-demo__result-body">
        <div className="pk-error-demo__field">
          <span className="pk-error-demo__field-label">Code</span>
          <span className="pk-error-demo__field-value pk-error-demo__field-value--code">{code}</span>
        </div>
        <div className="pk-error-demo__field">
          <span className="pk-error-demo__field-label">Message</span>
          <span className="pk-error-demo__field-value">{message}</span>
        </div>
        <div className="pk-error-demo__field">
          <span className="pk-error-demo__field-label">Provider</span>
          <span className="pk-error-demo__field-value pk-error-demo__field-value--code">{provider}</span>
        </div>
        <div className="pk-error-demo__field">
          <span className="pk-error-demo__field-label">Provider code</span>
          <span className="pk-error-demo__field-value pk-error-demo__field-value--code">{providerCode}</span>
        </div>
        <div className="pk-error-demo__field">
          <span className="pk-error-demo__field-label">HTTP status</span>
          <span className="pk-error-demo__field-value pk-error-demo__field-value--code">{httpStatus}</span>
        </div>
        <div className="pk-error-demo__suggestion">{suggestion}</div>
      </div>
    </div>
  );
}
