import type { PaymentErrorCode } from './types/error.js';
import { ERROR_SUGGESTIONS } from './types/error.js';

/**
 * Options for constructing a PaymentError.
 */
export interface PaymentErrorOptions {
  code: PaymentErrorCode;
  message: string;
  provider: string;
  providerCode?: string;
  providerMessage?: string;
  isRetryable?: boolean;
  httpStatus?: number;
  suggestion?: string;
  requestId?: string;
  _raw?: unknown;
}

/**
 * Unified payment error — all provider errors are mapped to this.
 */
export class PaymentError extends Error {
  readonly code: PaymentErrorCode;
  readonly provider: string;
  readonly providerCode?: string;
  readonly providerMessage?: string;
  readonly isRetryable: boolean;
  readonly suggestion: string;
  readonly httpStatus?: number;
  readonly requestId?: string;
  readonly _raw?: unknown;

  constructor(options: PaymentErrorOptions) {
    super(options.message);
    this.name = 'PaymentError';
    this.code = options.code;
    this.provider = options.provider;
    this.providerCode = options.providerCode;
    this.providerMessage = options.providerMessage;
    this.isRetryable = options.isRetryable ?? false;
    this.suggestion = options.suggestion ?? ERROR_SUGGESTIONS[options.code];
    this.httpStatus = options.httpStatus;
    this.requestId = options.requestId;
    this._raw = options._raw;
  }
}

/**
 * Thrown when a provider doesn't support a requested operation.
 */
export class NotSupportedError extends PaymentError {
  constructor(provider: string, operation: string) {
    super({
      code: 'not_supported',
      message: `${provider} does not support ${operation}`,
      provider,
      isRetryable: false,
    });
    this.name = 'NotSupportedError';
  }
}

/**
 * Thrown when input parameters fail validation before reaching the provider.
 *
 * @example
 * throw new ValidationError('amount must be greater than 0');
 * throw new ValidationError('currency is required', { field: 'currency' });
 */
export class ValidationError extends PaymentError {
  readonly field?: string;

  constructor(message: string, options?: { field?: string }) {
    super({
      code: 'invalid_request',
      message,
      provider: 'paykit',
      isRetryable: false,
    });
    this.name = 'ValidationError';
    this.field = options?.field;
  }
}

/**
 * Thrown when a provider request exceeds the configured timeout.
 */
export class PaymentTimeoutError extends PaymentError {
  readonly timeoutMs: number;

  constructor(provider: string, timeoutMs: number) {
    super({
      code: 'processing_error',
      message: `${provider} request timed out after ${timeoutMs}ms`,
      provider,
      isRetryable: true,
    });
    this.name = 'PaymentTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Thrown when a provider's health check fails or the provider is unreachable.
 */
export class ProviderUnavailableError extends PaymentError {
  constructor(provider: string, reason?: string) {
    super({
      code: 'provider_unavailable',
      message: reason
        ? `${provider} is unavailable: ${reason}`
        : `${provider} is unavailable`,
      provider,
      isRetryable: true,
    });
    this.name = 'ProviderUnavailableError';
  }
}
