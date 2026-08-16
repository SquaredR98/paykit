/**
 * Stripe credentials.
 *
 * @example
 * { secretKey: 'sk_test_xxx' }
 */
export interface StripeCredentials {
  /** Stripe secret key (starts with `sk_test_` or `sk_live_`). */
  secretKey: string;
  /** Stripe publishable key (for client-side usage). */
  publishableKey?: string;
  /** Stripe webhook signing secret (`whsec_...`). */
  webhookSecret?: string;
  /** Allow additional string properties for forward compatibility. */
  [key: string]: string | undefined;
}

/**
 * Razorpay credentials.
 *
 * @example
 * { keyId: 'rzp_test_xxx', keySecret: 'xxx' }
 */
export interface RazorpayCredentials {
  /** Razorpay Key ID (starts with `rzp_test_` or `rzp_live_`). */
  keyId: string;
  /** Razorpay Key Secret. */
  keySecret: string;
  /** Razorpay webhook secret for signature verification. */
  webhookSecret?: string;
  /** Allow additional string properties for forward compatibility. */
  [key: string]: string | undefined;
}

/**
 * PayPal credentials.
 *
 * @example
 * { clientId: 'xxx', clientSecret: 'xxx' }
 */
export interface PayPalCredentials {
  /** PayPal REST API client ID. */
  clientId: string;
  /** PayPal REST API client secret. */
  clientSecret: string;
  /** PayPal webhook ID for signature verification. */
  webhookId?: string;
  /** Set to `'false'` for production. Defaults to sandbox mode. */
  sandbox?: string;
  /** Allow additional string properties for forward compatibility. */
  [key: string]: string | undefined;
}

/**
 * Provider credentials — typed per known provider, with `Record<string, string>`
 * as a fallback for custom/future adapters.
 *
 * @example
 * // Stripe
 * { secretKey: 'sk_test_xxx' }
 *
 * // Razorpay
 * { keyId: 'rzp_test_xxx', keySecret: 'xxx' }
 *
 * // PayPal
 * { clientId: 'xxx', clientSecret: 'xxx' }
 */
export type ProviderCredentials =
  | StripeCredentials
  | RazorpayCredentials
  | PayPalCredentials
  | Record<string, string>;

/**
 * Log levels for the SDK.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

/**
 * Custom logger interface — plug in your own logger (e.g. pino, winston).
 *
 * @example
 * const paykit = new PayKit({
 *   adapter: stripe,
 *   options: { logger: console },
 * });
 */
export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

/**
 * Context passed to the `onRequest` lifecycle hook before an operation executes.
 */
export interface RequestContext {
  /** Operation name, e.g. `'charges.create'`, `'refunds.retrieve'`. */
  operation: string;
  /** Provider handling this request. */
  provider: string;
  /** Operation parameters (sensitive fields are redacted). */
  params: unknown;
  /** Unique request ID for correlating logs. */
  requestId: string;
  /** When the request started. */
  timestamp: Date;
}

/**
 * Context passed to the `onResponse` lifecycle hook after a successful operation.
 */
export interface ResponseContext extends RequestContext {
  /** Time taken for the operation in milliseconds. */
  durationMs: number;
  /** The operation result (unified response object). */
  result: unknown;
}

/**
 * Context passed to the `onError` lifecycle hook when an operation fails.
 */
export interface ErrorContext extends RequestContext {
  /** Time taken before the error occurred in milliseconds. */
  durationMs: number;
  /** The error that occurred. */
  error: unknown;
  /** Which attempt this error occurred on (1 = first try). */
  attempt: number;
  /** Whether the operation will be retried after this error. */
  willRetry: boolean;
}

/**
 * Shared options for the SDK.
 */
export interface PayKitOptions {
  /** Default request timeout in milliseconds. */
  timeout?: number;
  /** Number of automatic retries for retryable errors. */
  retries?: number;
  /** Base delay in milliseconds for retry backoff. Default: 500. */
  retryDelay?: number;
  /** Automatically generate idempotency keys for mutating operations. */
  idempotencyKey?: boolean;
  /** Minimum log level. Set to `'none'` to disable logging. */
  logging?: LogLevel;
  /** Custom logger implementation. Defaults to `console`. */
  logger?: Logger;
  /** Called before each provider operation. */
  onRequest?: (context: RequestContext) => void;
  /** Called after each successful provider operation. */
  onResponse?: (context: ResponseContext) => void;
  /** Called when an operation fails (before retry, if applicable). */
  onError?: (context: ErrorContext) => void;
}

/**
 * Single-provider configuration — use one payment provider.
 *
 * @example
 * const paykit = new PayKit({
 *   provider: 'stripe',
 *   credentials: { secretKey: 'sk_test_xxx' },
 * });
 */
export interface SingleProviderConfig {
  /** Provider name (must match a registered adapter, e.g. `'stripe'`, `'razorpay'`). */
  provider: string;
  /** Provider-specific credentials. */
  credentials: ProviderCredentials;
  /** SDK options. */
  options?: PayKitOptions;
}

/**
 * Routing rule for multi-provider setups.
 *
 * @example
 * { currency: 'INR', provider: 'razorpay' }
 * { currency: 'USD', provider: 'stripe' }
 * { region: 'EU', provider: 'adyen' }
 */
export interface RoutingRule {
  /** Match charges with this currency. */
  currency?: string;
  /** Match charges from this region. */
  region?: string;
  /** Match charges using this payment method type. */
  paymentMethod?: string;
  /** Provider to route to when this rule matches. */
  provider: string;
}

/**
 * Routing configuration for multi-provider setups.
 */
export interface RoutingConfig {
  /** Default provider when no routing rule matches. */
  default: string;
  /** Ordered list of routing rules — first match wins. */
  rules: RoutingRule[];
}

/**
 * Multi-provider configuration — use multiple payment providers with automatic routing.
 *
 * @example
 * const paykit = new PayKit({
 *   providers: {
 *     stripe: { secretKey: 'sk_test_xxx' },
 *     razorpay: { keyId: 'rzp_test_xxx', keySecret: 'xxx' },
 *   },
 *   routing: {
 *     default: 'stripe',
 *     rules: [{ currency: 'INR', provider: 'razorpay' }],
 *   },
 * });
 */
export interface MultiProviderConfig {
  /** Map of provider name to credentials. */
  providers: Record<string, ProviderCredentials>;
  /** Routing rules and default provider. */
  routing: RoutingConfig;
  /** SDK options. */
  options?: PayKitOptions;
}

/**
 * Union type — either single or multi-provider config.
 * See also {@link PayKitConfig} which adds direct adapter config.
 */
export type ProviderConfig = SingleProviderConfig | MultiProviderConfig;
