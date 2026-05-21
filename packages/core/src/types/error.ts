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
  | 'invalid_request'
  | 'provider_unavailable'
  | 'not_supported'
  | 'duplicate_transaction'
  | 'fraud_detected'
  | 'currency_not_supported'
  | 'amount_too_small'
  | 'amount_too_large';
