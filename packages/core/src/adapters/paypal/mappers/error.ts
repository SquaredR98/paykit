import { PaymentError } from '../../../errors.js';
import type { PaymentErrorCode } from '../../../types/error.js';

/**
 * Simplified PayPalApiError interface for error mapping.
 * Compatible with both the SDK's ApiError and custom error structures.
 */
export interface PayPalApiError {
  statusCode: number;
  errorName: string;
  message: string;
  details?: Array<{ issue: string; description: string }>;
}

/**
 * PayPal API error name → unified error code.
 * Ref: https://developer.paypal.com/api/rest/reference/orders/v2/errors/
 */
const ERROR_NAME_MAP: Record<string, PaymentErrorCode> = {
  AUTHENTICATION_FAILURE: 'invalid_request',
  NOT_AUTHORIZED: 'invalid_request',
  INVALID_REQUEST: 'invalid_request',
  RESOURCE_NOT_FOUND: 'not_found',
  UNPROCESSABLE_ENTITY: 'processing_error',
  RATE_LIMIT_REACHED: 'rate_limit',
  INTERNAL_SERVER_ERROR: 'provider_unavailable',
  SERVICE_UNAVAILABLE: 'provider_unavailable',
  INSTRUMENT_DECLINED: 'card_declined',
  PAYER_ACTION_REQUIRED: 'authentication_required',
  ORDER_ALREADY_CAPTURED: 'already_captured',
  ORDER_NOT_APPROVED: 'processing_error',
  DUPLICATE_INVOICE_ID: 'duplicate_transaction',
  CURRENCY_NOT_SUPPORTED: 'currency_not_supported',
  AMOUNT_MISMATCH: 'invalid_request',
  INVALID_CURRENCY_CODE: 'currency_not_supported',
  CANNOT_BE_ZERO_OR_NEGATIVE: 'amount_too_small',
  DECIMAL_PRECISION: 'invalid_request',
  PERMISSION_DENIED: 'invalid_request',
  MAX_NUMBER_OF_PAYMENT_ATTEMPTS_EXCEEDED: 'card_declined',
  PAYEE_ACCOUNT_RESTRICTED: 'provider_unavailable',
  ORDER_ALREADY_AUTHORIZED: 'already_captured',
  REFUND_NOT_ALLOWED: 'already_refunded',
  REFUND_CAPTURE_CURRENCY_MISMATCH: 'currency_not_supported',
};

/**
 * PayPal issue-level detail → unified error code (for UNPROCESSABLE_ENTITY details).
 */
const ISSUE_MAP: Record<string, PaymentErrorCode> = {
  CARD_EXPIRED: 'expired_card',
  CARD_TYPE_NOT_SUPPORTED: 'invalid_card',
  INVALID_ACCOUNT: 'invalid_card',
  INSUFFICIENT_FUNDS: 'insufficient_funds',
  TRANSACTION_REFUSED: 'card_declined',
  PAYER_CANNOT_PAY: 'card_declined',
  FRAUD_DETECTED: 'fraud_detected',
};

const RETRYABLE_NAMES = new Set<string>([
  'RATE_LIMIT_REACHED',
  'INTERNAL_SERVER_ERROR',
  'SERVICE_UNAVAILABLE',
]);

export function mapPayPalError(err: PayPalApiError): PaymentError {
  // Try issue-level mapping first (more specific)
  let unifiedCode: PaymentErrorCode = ERROR_NAME_MAP[err.errorName] ?? 'processing_error';
  if (err.details && err.details.length > 0) {
    const issueCode = ISSUE_MAP[err.details[0]!.issue];
    if (issueCode) unifiedCode = issueCode;
  }

  return new PaymentError({
    code: unifiedCode,
    message: err.message,
    provider: 'paypal',
    providerCode: err.errorName,
    providerMessage: err.details?.[0]?.description ?? err.message,
    isRetryable: RETRYABLE_NAMES.has(err.errorName),
    httpStatus: err.statusCode,
    _raw: err,
  });
}
