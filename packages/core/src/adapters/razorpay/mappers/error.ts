import { PaymentError } from '../../../errors.js';
import type { PaymentErrorCode } from '../../../types/error.js';

// Razorpay error.reason → unified error code
const ERROR_REASON_MAP: Record<string, PaymentErrorCode> = {
  input_validation_failed: 'invalid_request',
  payment_failed: 'card_declined',
  server_error: 'processing_error',
  gateway_error: 'processing_error',
  insufficient_balance: 'insufficient_funds',
  network_error: 'network_error',
};

// Razorpay error.code → unified error code
const ERROR_CODE_MAP: Record<string, PaymentErrorCode> = {
  BAD_REQUEST_ERROR: 'invalid_request',
  SERVER_ERROR: 'processing_error',
  GATEWAY_ERROR: 'processing_error',
};

// Razorpay error.description patterns → unified error code
const DESCRIPTION_PATTERNS: Array<[RegExp, PaymentErrorCode]> = [
  [/already been captured/i, 'already_captured'],
  [/already been refunded/i, 'already_refunded'],
  [/not found/i, 'not_found'],
];

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
  const description = errBody.description ?? err.message ?? '';

  // Try reason map first, then code map, then description patterns
  let unifiedCode: PaymentErrorCode =
    ERROR_REASON_MAP[reason] ?? ERROR_CODE_MAP[code] ?? 'processing_error';

  // Fall back to description pattern matching for codes not covered by maps
  if (unifiedCode === 'processing_error' || unifiedCode === 'invalid_request') {
    for (const [pattern, mappedCode] of DESCRIPTION_PATTERNS) {
      if (pattern.test(description)) {
        unifiedCode = mappedCode;
        break;
      }
    }
  }

  return new PaymentError({
    code: unifiedCode,
    message: description || 'Unknown Razorpay error',
    provider: 'razorpay',
    providerCode: code,
    providerMessage: errBody.description,
    isRetryable: RETRYABLE_CODES.has(code),
    httpStatus: err.statusCode,
    _raw: err,
  });
}
