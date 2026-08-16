import { PaymentError } from './errors.js';

/**
 * Configuration for the retry utility.
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (0 = no retries, 1 = one retry after initial failure, etc.). */
  maxRetries: number;
  /** Base delay in milliseconds before the first retry. Default: 500. */
  baseDelayMs: number;
  /** Maximum delay in milliseconds between retries. Default: 10000. */
  maxDelayMs: number;
  /** Predicate to determine if an error is retryable. Defaults to checking `PaymentError.isRetryable`. */
  shouldRetry: (error: unknown) => boolean;
}

/**
 * Result metadata from a retry-wrapped operation.
 */
export interface RetryResult<T> {
  /** The successful result. */
  result: T;
  /** Which attempt succeeded (1 = first try, 2 = first retry, etc.). */
  attempt: number;
}

/**
 * Callback invoked before each retry attempt.
 */
export interface RetryHook {
  (info: { error: unknown; attempt: number; delayMs: number; willRetry: boolean }): void;
}

/**
 * Default retry predicate: retries if the error is a `PaymentError` with `isRetryable: true`.
 */
export function defaultShouldRetry(error: unknown): boolean {
  return error instanceof PaymentError && error.isRetryable;
}

/**
 * Execute an async function with exponential backoff and jitter.
 *
 * Uses the formula: `delay = min(baseDelay * 2^attempt + jitter, maxDelay)`
 * where jitter is a random value between 0 and baseDelay.
 *
 * @param fn - The async function to execute.
 * @param options - Retry configuration.
 * @param onRetry - Optional callback invoked before each retry (useful for logging/hooks).
 * @returns The result along with the attempt number.
 *
 * @example
 * const { result, attempt } = await withRetry(
 *   () => stripe.paymentIntents.create({ amount: 5000, currency: 'usd' }),
 *   { maxRetries: 3, baseDelayMs: 500, maxDelayMs: 10000, shouldRetry: defaultShouldRetry },
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
  onRetry?: RetryHook,
): Promise<RetryResult<T>> {
  const { maxRetries, baseDelayMs, maxDelayMs, shouldRetry } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await fn();
      return { result, attempt };
    } catch (error) {
      lastError = error;

      const willRetry = attempt <= maxRetries && shouldRetry(error);
      const delayMs = willRetry
        ? Math.min(baseDelayMs * 2 ** (attempt - 1) + Math.random() * baseDelayMs, maxDelayMs)
        : 0;

      onRetry?.({ error, attempt, delayMs, willRetry });

      if (!willRetry) {
        throw error;
      }

      await sleep(delayMs);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
