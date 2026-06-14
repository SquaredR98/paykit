import { describe, it, expect } from 'vitest';
import { PaymentError, NotSupportedError } from '../src/errors';
import { ERROR_SUGGESTIONS } from '../src/types/error';
import type { PaymentErrorCode } from '../src/types/error';

describe('PaymentError', () => {
  it('creates an error with all fields', () => {
    const err = new PaymentError({
      code: 'card_declined',
      message: 'Your card was declined',
      provider: 'stripe',
      providerCode: 'card_declined',
      providerMessage: 'Your card was declined.',
      isRetryable: false,
      httpStatus: 402,
      _raw: { type: 'card_error' },
    });

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(PaymentError);
    expect(err.name).toBe('PaymentError');
    expect(err.code).toBe('card_declined');
    expect(err.message).toBe('Your card was declined');
    expect(err.provider).toBe('stripe');
    expect(err.providerCode).toBe('card_declined');
    expect(err.providerMessage).toBe('Your card was declined.');
    expect(err.isRetryable).toBe(false);
    expect(err.httpStatus).toBe(402);
    expect(err._raw).toEqual({ type: 'card_error' });
  });

  it('defaults isRetryable to false', () => {
    const err = new PaymentError({
      code: 'processing_error',
      message: 'Processing error',
      provider: 'razorpay',
    });

    expect(err.isRetryable).toBe(false);
  });

  it('allows isRetryable to be true', () => {
    const err = new PaymentError({
      code: 'rate_limit',
      message: 'Too many requests',
      provider: 'stripe',
      isRetryable: true,
    });

    expect(err.isRetryable).toBe(true);
  });

  it('leaves optional fields undefined when not provided', () => {
    const err = new PaymentError({
      code: 'invalid_request',
      message: 'Bad request',
      provider: 'adyen',
    });

    expect(err.providerCode).toBeUndefined();
    expect(err.providerMessage).toBeUndefined();
    expect(err.httpStatus).toBeUndefined();
    expect(err._raw).toBeUndefined();
  });

  it('has a proper stack trace', () => {
    const err = new PaymentError({
      code: 'card_declined',
      message: 'Declined',
      provider: 'stripe',
    });

    expect(err.stack).toBeDefined();
    expect(err.stack).toContain('Declined');
  });

  it('auto-populates suggestion from ERROR_SUGGESTIONS', () => {
    const err = new PaymentError({
      code: 'card_declined',
      message: 'Your card was declined',
      provider: 'stripe',
    });

    expect(err.suggestion).toBe(ERROR_SUGGESTIONS['card_declined']);
    expect(err.suggestion).toContain('Try a different card');
  });

  it('allows custom suggestion to override default', () => {
    const err = new PaymentError({
      code: 'card_declined',
      message: 'Your card was declined',
      provider: 'stripe',
      suggestion: 'Please use a Visa card instead.',
    });

    expect(err.suggestion).toBe('Please use a Visa card instead.');
  });

  it('provides suggestions for all error codes', () => {
    const codes: PaymentErrorCode[] = [
      'card_declined',
      'insufficient_funds',
      'invalid_card',
      'expired_card',
      'processing_error',
      'authentication_required',
      'rate_limit',
      'network_error',
      'invalid_request',
      'provider_unavailable',
      'not_supported',
      'not_found',
      'duplicate_transaction',
      'fraud_detected',
      'currency_not_supported',
      'amount_too_small',
      'amount_too_large',
      'already_captured',
      'already_refunded',
    ];

    for (const code of codes) {
      const err = new PaymentError({
        code,
        message: `Error: ${code}`,
        provider: 'test',
      });

      expect(err.suggestion).toBeTruthy();
      expect(typeof err.suggestion).toBe('string');
      expect(err.suggestion.length).toBeGreaterThan(10);
    }
  });
});

describe('NotSupportedError', () => {
  it('creates an error with code not_supported', () => {
    const err = new NotSupportedError('phonepe', 'subscriptions');

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(PaymentError);
    expect(err).toBeInstanceOf(NotSupportedError);
    expect(err.name).toBe('NotSupportedError');
    expect(err.code).toBe('not_supported');
    expect(err.provider).toBe('phonepe');
    expect(err.message).toBe('phonepe does not support subscriptions');
    expect(err.isRetryable).toBe(false);
  });

  it('has auto-populated suggestion', () => {
    const err = new NotSupportedError('phonepe', 'subscriptions');
    expect(err.suggestion).toBe(ERROR_SUGGESTIONS['not_supported']);
  });
});

describe('ERROR_SUGGESTIONS', () => {
  it('has a suggestion for every PaymentErrorCode', () => {
    const expectedCodes: PaymentErrorCode[] = [
      'card_declined',
      'insufficient_funds',
      'invalid_card',
      'expired_card',
      'processing_error',
      'authentication_required',
      'rate_limit',
      'network_error',
      'invalid_request',
      'provider_unavailable',
      'not_supported',
      'not_found',
      'duplicate_transaction',
      'fraud_detected',
      'currency_not_supported',
      'amount_too_small',
      'amount_too_large',
      'already_captured',
      'already_refunded',
    ];

    for (const code of expectedCodes) {
      expect(ERROR_SUGGESTIONS[code]).toBeDefined();
      expect(typeof ERROR_SUGGESTIONS[code]).toBe('string');
    }
  });
});
