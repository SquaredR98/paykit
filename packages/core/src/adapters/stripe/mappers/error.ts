import type Stripe from 'stripe';
import { PaymentError } from '../../../errors.js';
import type { PaymentErrorCode } from '../../../types/error.js';

const ERROR_CODE_MAP: Record<string, PaymentErrorCode> = {
  card_declined: 'card_declined',
  insufficient_funds: 'insufficient_funds',
  invalid_number: 'invalid_card',
  invalid_expiry_month: 'invalid_card',
  invalid_expiry_year: 'invalid_card',
  invalid_cvc: 'invalid_card',
  expired_card: 'expired_card',
  processing_error: 'processing_error',
  authentication_required: 'authentication_required',
  rate_limit: 'rate_limit',
  invalid_request_error: 'invalid_request',
  amount_too_small: 'amount_too_small',
  amount_too_large: 'amount_too_large',
};

const RETRYABLE_CODES = new Set<string>([
  'rate_limit',
  'processing_error',
  'lock_timeout',
]);

export function mapStripeError(err: Stripe.errors.StripeError): PaymentError {
  const code = err.code ?? err.type ?? 'processing_error';

  return new PaymentError({
    code: ERROR_CODE_MAP[code] ?? 'processing_error',
    message: err.message,
    provider: 'stripe',
    providerCode: code,
    providerMessage: err.message,
    isRetryable: RETRYABLE_CODES.has(code),
    httpStatus: err.statusCode,
    _raw: err,
  });
}
