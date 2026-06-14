/**
 * Unified error codes — every provider's errors map to one of these.
 */
export type PaymentErrorCode =
  | 'card_declined'
  | 'insufficient_funds'
  | 'invalid_card'
  | 'expired_card'
  | 'processing_error'
  | 'authentication_required'
  | 'rate_limit'
  | 'network_error'
  | 'invalid_request'
  | 'provider_unavailable'
  | 'not_supported'
  | 'not_found'
  | 'duplicate_transaction'
  | 'fraud_detected'
  | 'currency_not_supported'
  | 'amount_too_small'
  | 'amount_too_large'
  | 'already_captured'
  | 'already_refunded';

/**
 * Human-readable fix suggestions keyed by error code.
 * Used by PaymentError to auto-populate the `suggestion` field.
 */
export const ERROR_SUGGESTIONS: Record<PaymentErrorCode, string> = {
  card_declined: 'The card was declined. Try a different card or contact your bank.',
  insufficient_funds: 'The card has insufficient funds. Try a different payment method.',
  invalid_card: 'The card number, expiry, or CVC is invalid. Check the details and try again.',
  expired_card: 'The card has expired. Use a different card.',
  processing_error: 'A processing error occurred. Please try again in a moment.',
  authentication_required: 'Additional authentication is required. Complete 3D Secure or OTP verification.',
  rate_limit: 'Too many requests. Wait a moment and try again.',
  network_error: 'A network error occurred. Check your connection and try again.',
  invalid_request: 'The request was invalid. Check the parameters and try again.',
  provider_unavailable: 'The payment provider is temporarily unavailable. Try again later.',
  not_supported: 'This operation is not supported by the current payment provider.',
  not_found: 'The requested resource was not found. Verify the ID and try again.',
  duplicate_transaction: 'This transaction has already been processed. Check your records.',
  fraud_detected: 'The transaction was flagged as potentially fraudulent. Contact support.',
  currency_not_supported: 'This currency is not supported by the current provider. Try a different currency or provider.',
  amount_too_small: 'The amount is below the minimum allowed. Increase the amount and try again.',
  amount_too_large: 'The amount exceeds the maximum allowed. Reduce the amount and try again.',
  already_captured: 'This charge has already been captured.',
  already_refunded: 'This charge has already been refunded.',
};
