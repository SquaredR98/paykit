import type { PaymentErrorCode } from '@squaredr/paykit';

export interface ErrorSample {
  provider: 'stripe' | 'razorpay' | 'paypal';
  scenario: string;
  testCard?: string;
  rawError: Record<string, unknown>;
  normalizedError: {
    code: PaymentErrorCode;
    message: string;
    provider: string;
    providerCode: string;
    suggestion: string;
    isRetryable: boolean;
    httpStatus: number;
  };
}

export const ERROR_SAMPLES: ErrorSample[] = [
  // ── Stripe ────────────────────────────────────────────────
  {
    provider: 'stripe',
    scenario: 'Card declined',
    testCard: '4000 0000 0000 0002',
    rawError: {
      type: 'StripeCardError',
      code: 'card_declined',
      decline_code: 'generic_decline',
      message: 'Your card was declined.',
      param: '',
      statusCode: 402,
    },
    normalizedError: {
      code: 'card_declined',
      message: 'Your card was declined.',
      provider: 'stripe',
      providerCode: 'card_declined',
      suggestion: 'The card was declined. Try a different card or contact your bank.',
      isRetryable: false,
      httpStatus: 402,
    },
  },
  {
    provider: 'stripe',
    scenario: 'Insufficient funds',
    testCard: '4000 0000 0000 9995',
    rawError: {
      type: 'StripeCardError',
      code: 'insufficient_funds',
      decline_code: 'insufficient_funds',
      message: 'Your card has insufficient funds.',
      param: '',
      statusCode: 402,
    },
    normalizedError: {
      code: 'insufficient_funds',
      message: 'Your card has insufficient funds.',
      provider: 'stripe',
      providerCode: 'insufficient_funds',
      suggestion: 'The card has insufficient funds. Try a different payment method.',
      isRetryable: false,
      httpStatus: 402,
    },
  },
  {
    provider: 'stripe',
    scenario: 'Expired card',
    testCard: '4000 0000 0000 0069',
    rawError: {
      type: 'StripeCardError',
      code: 'expired_card',
      message: 'Your card has expired.',
      param: 'exp_month',
      statusCode: 402,
    },
    normalizedError: {
      code: 'expired_card',
      message: 'Your card has expired.',
      provider: 'stripe',
      providerCode: 'expired_card',
      suggestion: 'The card has expired. Use a different card.',
      isRetryable: false,
      httpStatus: 402,
    },
  },
  {
    provider: 'stripe',
    scenario: 'Processing error',
    testCard: '4000 0000 0000 0119',
    rawError: {
      type: 'StripeCardError',
      code: 'processing_error',
      message: 'An error occurred while processing your card. Try again in a little bit.',
      param: '',
      statusCode: 402,
    },
    normalizedError: {
      code: 'processing_error',
      message: 'An error occurred while processing your card. Try again in a little bit.',
      provider: 'stripe',
      providerCode: 'processing_error',
      suggestion: 'A processing error occurred. Please try again in a moment.',
      isRetryable: true,
      httpStatus: 402,
    },
  },
  {
    provider: 'stripe',
    scenario: 'Rate limit exceeded',
    rawError: {
      type: 'StripeRateLimitError',
      code: 'rate_limit',
      message: 'Too many requests made to the API too quickly.',
      statusCode: 429,
    },
    normalizedError: {
      code: 'rate_limit',
      message: 'Too many requests made to the API too quickly.',
      provider: 'stripe',
      providerCode: 'rate_limit',
      suggestion: 'Too many requests. Wait a moment and try again.',
      isRetryable: true,
      httpStatus: 429,
    },
  },
  {
    provider: 'stripe',
    scenario: 'Authentication required (3DS)',
    testCard: '4000 0027 6000 3184',
    rawError: {
      type: 'StripeCardError',
      code: 'authentication_required',
      message: 'This payment requires additional authentication.',
      param: '',
      statusCode: 402,
    },
    normalizedError: {
      code: 'authentication_required',
      message: 'This payment requires additional authentication.',
      provider: 'stripe',
      providerCode: 'authentication_required',
      suggestion: 'Additional authentication is required. Complete 3D Secure or OTP verification.',
      isRetryable: false,
      httpStatus: 402,
    },
  },

  // ── Razorpay ──────────────────────────────────────────────
  {
    provider: 'razorpay',
    scenario: 'Payment declined',
    rawError: {
      statusCode: 400,
      error: {
        code: 'BAD_REQUEST_ERROR',
        description: 'Payment was declined by the issuing bank',
        source: 'bank',
        step: 'payment_authorization',
        reason: 'payment_failed',
        metadata: {},
      },
    },
    normalizedError: {
      code: 'card_declined',
      message: 'Payment was declined by the issuing bank',
      provider: 'razorpay',
      providerCode: 'BAD_REQUEST_ERROR',
      suggestion: 'The card was declined. Try a different card or contact your bank.',
      isRetryable: false,
      httpStatus: 400,
    },
  },
  {
    provider: 'razorpay',
    scenario: 'Invalid request',
    rawError: {
      statusCode: 400,
      error: {
        code: 'BAD_REQUEST_ERROR',
        description: 'The amount must be at least INR 1.00',
        source: 'business',
        step: 'payment_initiation',
        reason: 'input_validation_failed',
        metadata: {},
        field: 'amount',
      },
    },
    normalizedError: {
      code: 'invalid_request',
      message: 'The amount must be at least INR 1.00',
      provider: 'razorpay',
      providerCode: 'BAD_REQUEST_ERROR',
      suggestion: 'The request was invalid. Check the parameters and try again.',
      isRetryable: false,
      httpStatus: 400,
    },
  },
  {
    provider: 'razorpay',
    scenario: 'Server error',
    rawError: {
      statusCode: 500,
      error: {
        code: 'SERVER_ERROR',
        description: 'An internal server error occurred. Please try again.',
        source: 'internal',
        step: 'payment_initiation',
        reason: 'server_error',
        metadata: {},
      },
    },
    normalizedError: {
      code: 'processing_error',
      message: 'An internal server error occurred. Please try again.',
      provider: 'razorpay',
      providerCode: 'SERVER_ERROR',
      suggestion: 'A processing error occurred. Please try again in a moment.',
      isRetryable: true,
      httpStatus: 500,
    },
  },
  {
    provider: 'razorpay',
    scenario: 'Gateway error',
    rawError: {
      statusCode: 502,
      error: {
        code: 'GATEWAY_ERROR',
        description: 'Payment processing failed due to an error at the bank or wallet gateway.',
        source: 'gateway',
        step: 'payment_authorization',
        reason: 'gateway_error',
        metadata: {},
      },
    },
    normalizedError: {
      code: 'processing_error',
      message: 'Payment processing failed due to an error at the bank or wallet gateway.',
      provider: 'razorpay',
      providerCode: 'GATEWAY_ERROR',
      suggestion: 'A processing error occurred. Please try again in a moment.',
      isRetryable: true,
      httpStatus: 502,
    },
  },

  // ── PayPal ────────────────────────────────────────────────
  {
    provider: 'paypal',
    scenario: 'Instrument declined',
    rawError: {
      statusCode: 422,
      errorName: 'INSTRUMENT_DECLINED',
      message: 'The instrument presented was either declined by the processor or bank, or it can\'t be used for this payment.',
      details: [
        {
          issue: 'TRANSACTION_REFUSED',
          description: 'The request was refused.',
        },
      ],
    },
    normalizedError: {
      code: 'card_declined',
      message: 'The instrument presented was either declined by the processor or bank, or it can\'t be used for this payment.',
      provider: 'paypal',
      providerCode: 'INSTRUMENT_DECLINED',
      suggestion: 'The card was declined. Try a different card or contact your bank.',
      isRetryable: false,
      httpStatus: 422,
    },
  },
  {
    provider: 'paypal',
    scenario: 'Insufficient funds',
    rawError: {
      statusCode: 422,
      errorName: 'UNPROCESSABLE_ENTITY',
      message: 'The requested action could not be performed.',
      details: [
        {
          issue: 'INSUFFICIENT_FUNDS',
          description: 'The buyer does not have enough funds to complete this payment.',
        },
      ],
    },
    normalizedError: {
      code: 'insufficient_funds',
      message: 'The requested action could not be performed.',
      provider: 'paypal',
      providerCode: 'UNPROCESSABLE_ENTITY',
      suggestion: 'The card has insufficient funds. Try a different payment method.',
      isRetryable: false,
      httpStatus: 422,
    },
  },
  {
    provider: 'paypal',
    scenario: 'Duplicate transaction',
    rawError: {
      statusCode: 422,
      errorName: 'DUPLICATE_INVOICE_ID',
      message: 'Duplicate invoice ID detected.',
      details: [
        {
          issue: 'DUPLICATE_INVOICE_ID',
          description: 'The API caller is sending an invoice_id that has already been used for a completed transaction.',
        },
      ],
    },
    normalizedError: {
      code: 'duplicate_transaction',
      message: 'Duplicate invoice ID detected.',
      provider: 'paypal',
      providerCode: 'DUPLICATE_INVOICE_ID',
      suggestion: 'This transaction has already been processed. Check your records.',
      isRetryable: false,
      httpStatus: 422,
    },
  },
  {
    provider: 'paypal',
    scenario: 'Service unavailable',
    rawError: {
      statusCode: 503,
      errorName: 'SERVICE_UNAVAILABLE',
      message: 'Service Unavailable.',
      details: [],
    },
    normalizedError: {
      code: 'provider_unavailable',
      message: 'Service Unavailable.',
      provider: 'paypal',
      providerCode: 'SERVICE_UNAVAILABLE',
      suggestion: 'The payment provider is temporarily unavailable. Try again later.',
      isRetryable: true,
      httpStatus: 503,
    },
  },
  {
    provider: 'paypal',
    scenario: 'Fraud detected',
    rawError: {
      statusCode: 422,
      errorName: 'UNPROCESSABLE_ENTITY',
      message: 'The requested action could not be performed.',
      details: [
        {
          issue: 'FRAUD_DETECTED',
          description: 'PayPal fraud filters have identified this transaction as high risk.',
        },
      ],
    },
    normalizedError: {
      code: 'fraud_detected',
      message: 'The requested action could not be performed.',
      provider: 'paypal',
      providerCode: 'UNPROCESSABLE_ENTITY',
      suggestion: 'The transaction was flagged as potentially fraudulent. Contact support.',
      isRetryable: false,
      httpStatus: 422,
    },
  },
];

/** Group samples by provider for UI selectors */
export function getErrorsByProvider(provider: string): ErrorSample[] {
  return ERROR_SAMPLES.filter((s) => s.provider === provider);
}

/** Unique providers in the sample set */
export const ERROR_PROVIDERS = ['stripe', 'razorpay', 'paypal'] as const;
