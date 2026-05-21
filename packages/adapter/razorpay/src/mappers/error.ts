import { PaymentError, type PaymentErrorCode } from '@squaredr/paykit';

// Razorpay error.reason → unified error code
const ERROR_REASON_MAP: Record<string, PaymentErrorCode> = {
  input_validation_failed: 'invalid_request',
  payment_failed: 'card_declined',
  server_error: 'processing_error',
  gateway_error: 'processing_error',
  insufficient_balance: 'insufficient_funds',
};

// Razorpay error.code → unified error code
const ERROR_CODE_MAP: Record<string, PaymentErrorCode> = {
  BAD_REQUEST_ERROR: 'invalid_request',
  SERVER_ERROR: 'processing_error',
  GATEWAY_ERROR: 'processing_error',
};

const RETRYABLE_CODES = new Set<string>(['SERVER_ERROR', 'GATEWAY_ERROR']);

export interface RazorpayError {
  statusCode?: number;
  error?: {
    code?: string;
    description?: string;
    field?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: Record<string, unknown>;
  };
  message?: string;
}

export function mapRazorpayError(err: RazorpayError): PaymentError {
  const errBody = err.error ?? {};
  const reason = errBody.reason ?? '';
  const code = errBody.code ?? '';

  const unifiedCode: PaymentErrorCode =
    ERROR_REASON_MAP[reason] ?? ERROR_CODE_MAP[code] ?? 'processing_error';

  return new PaymentError({
    code: unifiedCode,
    message: errBody.description ?? err.message ?? 'Unknown Razorpay error',
    provider: 'razorpay',
    providerCode: code,
    providerMessage: errBody.description,
    isRetryable: RETRYABLE_CODES.has(code),
    httpStatus: err.statusCode,
    _raw: err,
  });
}
