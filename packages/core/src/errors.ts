import type { PaymentErrorCode } from './types/error.js';

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
  readonly httpStatus?: number;
  readonly _raw?: unknown;

  constructor(options: PaymentErrorOptions) {
    super(options.message);
    this.name = 'PaymentError';
    this.code = options.code;
    this.provider = options.provider;
    this.providerCode = options.providerCode;
    this.providerMessage = options.providerMessage;
    this.isRetryable = options.isRetryable ?? false;
    this.httpStatus = options.httpStatus;
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
