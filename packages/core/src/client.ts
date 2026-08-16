import type { PaymentAdapter } from './adapter.js';
import type {
  ProviderConfig,
  ProviderCredentials,
  SingleProviderConfig,
  MultiProviderConfig,
  PayKitOptions,
} from './types/config.js';
import type { ProviderCapabilities } from './capabilities.js';
import type { CreateChargeParams, CaptureParams } from './types/charge.js';
import type { CreateRefundParams } from './types/refund.js';
import type { CreateCustomerParams, UpdateCustomerParams } from './types/customer.js';
import type { CreatePaymentMethodParams } from './types/payment-method.js';
import type {
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
  CancelSubscriptionParams,
} from './types/subscription.js';
import type { CreatePayoutParams } from './types/payout.js';
import type { ListParams, RequestOptions, ResponseMeta } from './types/common.js';
import type { UnifiedWebhookEvent } from './types/webhook.js';
import type {
  ChargeOperations,
  RefundOperations,
  CustomerOperations,
  PaymentMethodOperations,
  WebhookOperations,
  SubscriptionOperations,
  PayoutOperations,
} from './adapter.js';
import { getAdapter } from './registry.js';
import { resolveProvider } from './router.js';
import { NotSupportedError, ValidationError } from './errors.js';
import { getProviderInfo as _getProviderInfo, debug as _debug } from './debug.js';
import type { ProviderInfo } from './debug.js';
import { isSupportedCurrency } from './currency.js';
import { withRetry, defaultShouldRetry } from './retry.js';
import { createDefaultLogger, createOperationLogger, redact } from './logger.js';
import type { OperationLogger } from './logger.js';
import { generateIdempotencyKey } from './idempotency.js';

const VALID_INTERVALS = new Set(['day', 'week', 'month', 'year']);

/**
 * Direct adapter configuration — pass an already-instantiated adapter.
 *
 * @example
 * const paykit = new PayKit({
 *   adapter: new StripeAdapter({ secretKey: 'sk_test_xxx' }),
 * });
 */
export interface AdapterConfig {
  adapter: PaymentAdapter;
}

/**
 * Construct-style webhook params — matches the docs API.
 */
export interface ConstructWebhookParams {
  payload: string | Buffer;
  signature: string;
  secret: string;
}

/**
 * Extended webhook operations that include the `construct()` convenience method.
 */
export interface ExtendedWebhookOperations extends WebhookOperations {
  /**
   * Verify the signature and parse a webhook event in one step.
   */
  construct(params: ConstructWebhookParams): UnifiedWebhookEvent;
}

/**
 * Convenience type alias for any valid PayKit constructor configuration.
 * Accepts a direct adapter, a single-provider config, or a multi-provider config.
 *
 * @example
 * // Direct adapter
 * const config: PayKitConfig = { adapter: new StripeAdapter({ secretKey: '...' }) };
 *
 * // Single provider (registry-based)
 * const config: PayKitConfig = { provider: 'stripe', credentials: { secretKey: '...' } };
 *
 * // Multi provider
 * const config: PayKitConfig = {
 *   providers: { stripe: { secretKey: '...' }, razorpay: { keyId: '...' } },
 *   routing: { default: 'stripe', rules: [{ currency: 'INR', provider: 'razorpay' }] },
 * };
 */
export type PayKitConfig = ProviderConfig | AdapterConfig;

function isAdapterConfig(config: PayKitConfig): config is AdapterConfig {
  return 'adapter' in config;
}

function isSingleProvider(config: ProviderConfig): config is SingleProviderConfig {
  return 'provider' in config;
}

function isMultiProvider(config: ProviderConfig): config is MultiProviderConfig {
  return 'providers' in config;
}

/**
 * Validate charges.create parameters before hitting the provider.
 */
function validateChargeParams(params: CreateChargeParams): void {
  if (typeof params.amount !== 'number' || !Number.isFinite(params.amount) || params.amount <= 0) {
    throw new ValidationError('amount must be a positive number', { field: 'amount' });
  }
  if (!Number.isInteger(params.amount)) {
    throw new ValidationError('amount must be an integer (in smallest currency unit, e.g. cents)', { field: 'amount' });
  }
  if (typeof params.currency !== 'string' || params.currency.trim() === '') {
    throw new ValidationError('currency is required', { field: 'currency' });
  }
  if (params.description !== undefined && typeof params.description !== 'string') {
    throw new ValidationError('description must be a string', { field: 'description' });
  }
  if (!isSupportedCurrency(params.currency)) {
    console.warn(
      `[PayKit] Warning: currency "${params.currency}" is not in the known currency list. ` +
      'The charge will still be attempted, but the provider may reject it.',
    );
  }
}

/**
 * Validate refunds.create parameters before hitting the provider.
 */
function validateRefundParams(params: CreateRefundParams): void {
  if (typeof params.chargeId !== 'string' || params.chargeId.trim() === '') {
    throw new ValidationError('chargeId is required', { field: 'chargeId' });
  }
  if (params.amount !== undefined) {
    if (typeof params.amount !== 'number' || !Number.isFinite(params.amount) || params.amount <= 0) {
      throw new ValidationError('amount must be a positive number', { field: 'amount' });
    }
    if (!Number.isInteger(params.amount)) {
      throw new ValidationError('amount must be an integer (in smallest currency unit)', { field: 'amount' });
    }
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate customers.create parameters before hitting the provider.
 */
function validateCustomerParams(params: CreateCustomerParams): void {
  if (params.email !== undefined && (typeof params.email !== 'string' || !EMAIL_RE.test(params.email))) {
    throw new ValidationError('email must be a valid email address', { field: 'email' });
  }
  if (params.name !== undefined && (typeof params.name !== 'string' || params.name.length > 100)) {
    throw new ValidationError('name must be a string with 100 characters or fewer', { field: 'name' });
  }
}

/**
 * Validate subscriptions.create parameters before hitting the provider.
 */
function validateSubscriptionParams(params: CreateSubscriptionParams): void {
  if (typeof params.customer !== 'string' || params.customer.trim() === '') {
    throw new ValidationError('customer is required', { field: 'customer' });
  }
  if (typeof params.amount !== 'number' || !Number.isFinite(params.amount) || params.amount <= 0) {
    throw new ValidationError('amount must be a positive number', { field: 'amount' });
  }
  if (!Number.isInteger(params.amount)) {
    throw new ValidationError('amount must be an integer (in smallest currency unit)', { field: 'amount' });
  }
  if (typeof params.currency !== 'string' || params.currency.trim() === '') {
    throw new ValidationError('currency is required', { field: 'currency' });
  }
  if (!VALID_INTERVALS.has(params.interval)) {
    throw new ValidationError(
      `interval must be one of: day, week, month, year`,
      { field: 'interval' },
    );
  }
  if (params.intervalCount !== undefined) {
    if (typeof params.intervalCount !== 'number' || !Number.isInteger(params.intervalCount) || params.intervalCount <= 0) {
      throw new ValidationError('intervalCount must be a positive integer', { field: 'intervalCount' });
    }
  }
}

/**
 * UnifiedPayments — the main class developers interact with.
 * Also exported as `PayKit` for convenience.
 *
 * @example
 * // Simple — pass an adapter directly
 * import { PayKit } from '@squaredr/paykit';
 * import { StripeAdapter } from '@squaredr/paykit/stripe';
 *
 * const paykit = new PayKit({
 *   adapter: new StripeAdapter({ secretKey: 'sk_test_xxx' }),
 * });
 *
 * const charge = await paykit.charges.create({
 *   amount: 1000,
 *   currency: 'USD',
 * });
 *
 * @example
 * // Registry-based — provider name + credentials
 * import { UnifiedPayments } from '@squaredr/paykit';
 * import '@squaredr/paykit/stripe';
 *
 * const payments = new UnifiedPayments({
 *   provider: 'stripe',
 *   credentials: { secretKey: 'sk_test_xxx' },
 * });
 */
export class UnifiedPayments {
  private config: ProviderConfig | null;
  private directAdapter: PaymentAdapter | null = null;
  private adapters = new Map<string, PaymentAdapter>();
  private initialized = new Map<string, boolean>();
  private readonly options: PayKitOptions;
  private readonly log: OperationLogger;

  readonly charges: ChargeOperations;
  readonly refunds: RefundOperations;
  readonly customers: CustomerOperations;
  readonly paymentMethods: PaymentMethodOperations;
  readonly webhooks: ExtendedWebhookOperations;
  readonly subscriptions?: SubscriptionOperations;
  readonly payouts?: PayoutOperations;

  constructor(config: PayKitConfig) {
    if (isAdapterConfig(config)) {
      // Direct adapter mode — simplest API
      this.directAdapter = config.adapter;
      this.config = null;
      this.options = ('options' in config && config.options) ? config.options as PayKitOptions : {};
      this.adapters.set(config.adapter.name, config.adapter);
      this.initialized.set(config.adapter.name, true);
    } else {
      this.config = config;
      this.options = config.options ?? {};
    }

    // Initialize structured logger
    const logger = this.options.logger ?? createDefaultLogger();
    this.log = createOperationLogger(logger, this.options.logging ?? 'none');

    // Bind all resource operations
    this.charges = {
      create: async (params: CreateChargeParams) => {
        validateChargeParams(params);
        return this.withAdapter(params._provider, params.currency, (a) => a.charges.create(params), 'charges.create', params);
      },
      retrieve: (id: string) => this.withDefaultAdapter((a) => a.charges.retrieve(id), 'charges.retrieve', { id }),
      capture: (id: string, params?: CaptureParams) => this.withDefaultAdapter((a) => a.charges.capture(id, params), 'charges.capture', { id, ...params }),
      cancel: (id: string, options?: RequestOptions) => this.withDefaultAdapter((a) => a.charges.cancel(id, options), 'charges.cancel', { id }),
      list: (params?: ListParams) => this.withDefaultAdapter((a) => a.charges.list(params), 'charges.list', params),
    };

    this.refunds = {
      create: async (params: CreateRefundParams) => {
        validateRefundParams(params);
        return this.withDefaultAdapter((a) => a.refunds.create(params), 'refunds.create', params);
      },
      retrieve: (id: string) => this.withDefaultAdapter((a) => a.refunds.retrieve(id), 'refunds.retrieve', { id }),
      list: (params?: ListParams) => this.withDefaultAdapter((a) => a.refunds.list(params), 'refunds.list', params),
    };

    this.customers = {
      create: async (params: CreateCustomerParams) => {
        validateCustomerParams(params);
        return this.withDefaultAdapter((a) => a.customers.create(params), 'customers.create', params);
      },
      retrieve: (id: string) => this.withDefaultAdapter((a) => a.customers.retrieve(id), 'customers.retrieve', { id }),
      update: (id: string, params: UpdateCustomerParams) => this.withDefaultAdapter((a) => a.customers.update(id, params), 'customers.update', { id, ...params }),
      delete: (id: string) => this.withDefaultAdapter((a) => a.customers.delete(id), 'customers.delete', { id }),
      list: (params?: ListParams) => this.withDefaultAdapter((a) => a.customers.list(params), 'customers.list', params),
    };

    this.paymentMethods = {
      create: (params: CreatePaymentMethodParams) => this.withDefaultAdapter((a) => a.paymentMethods.create(params), 'paymentMethods.create', params),
      retrieve: (id: string) => this.withDefaultAdapter((a) => a.paymentMethods.retrieve(id), 'paymentMethods.retrieve', { id }),
      attach: (pmId: string, custId: string) => this.withDefaultAdapter((a) => a.paymentMethods.attach(pmId, custId), 'paymentMethods.attach', { pmId, custId }),
      detach: (pmId: string) => this.withDefaultAdapter((a) => a.paymentMethods.detach(pmId), 'paymentMethods.detach', { pmId }),
      list: (customerId: string) => this.withDefaultAdapter((a) => a.paymentMethods.list(customerId), 'paymentMethods.list', { customerId }),
    };

    this.webhooks = {
      verify: (payload: string | Buffer, headers: Record<string, string>, secret: string) => {
        const adapter = this.getDefaultAdapterSync();
        return adapter.webhooks.verify(payload, headers, secret);
      },
      parse: (payload: string | Buffer, headers: Record<string, string>, secret: string) => {
        const adapter = this.getDefaultAdapterSync();
        return adapter.webhooks.parse(payload, headers, secret);
      },
      construct: (params: ConstructWebhookParams) => {
        const adapter = this.getDefaultAdapterSync();
        const headers: Record<string, string> = {};
        // Map the signature to the correct header for each provider
        if (adapter.name === 'stripe') {
          headers['stripe-signature'] = params.signature;
        } else if (adapter.name === 'razorpay') {
          headers['x-razorpay-signature'] = params.signature;
        } else {
          // Generic fallback — put signature in common header names
          headers['x-webhook-signature'] = params.signature;
          headers['x-signature'] = params.signature;
        }
        return adapter.webhooks.parse(params.payload, headers, params.secret);
      },
    };

    // Optional operations — check capability before exposing
    const defaultAdapter = this.getDefaultAdapterForCapabilities();
    if (defaultAdapter) {
      if (defaultAdapter.capabilities.subscriptions && defaultAdapter.subscriptions) {
        this.subscriptions = {
          create: async (params: CreateSubscriptionParams) => {
            validateSubscriptionParams(params);
            return this.withDefaultAdapter((a) => {
              if (!a.subscriptions) throw new NotSupportedError(a.name, 'subscriptions');
              return a.subscriptions.create(params);
            }, 'subscriptions.create', params);
          },
          retrieve: (id: string) => this.withDefaultAdapter((a) => {
            if (!a.subscriptions) throw new NotSupportedError(a.name, 'subscriptions');
            return a.subscriptions.retrieve(id);
          }, 'subscriptions.retrieve', { id }),
          update: (id: string, params: UpdateSubscriptionParams) => this.withDefaultAdapter((a) => {
            if (!a.subscriptions) throw new NotSupportedError(a.name, 'subscriptions');
            return a.subscriptions.update(id, params);
          }, 'subscriptions.update', { id, ...params }),
          cancel: (id: string, params?: CancelSubscriptionParams) => this.withDefaultAdapter((a) => {
            if (!a.subscriptions) throw new NotSupportedError(a.name, 'subscriptions');
            return a.subscriptions.cancel(id, params);
          }, 'subscriptions.cancel', { id, ...params }),
          list: (params?: ListParams) => this.withDefaultAdapter((a) => {
            if (!a.subscriptions) throw new NotSupportedError(a.name, 'subscriptions');
            return a.subscriptions.list(params);
          }, 'subscriptions.list', params),
        };
      }

      if (defaultAdapter.capabilities.payouts && defaultAdapter.payouts) {
        this.payouts = {
          create: (params: CreatePayoutParams) => this.withDefaultAdapter((a) => {
            if (!a.payouts) throw new NotSupportedError(a.name, 'payouts');
            return a.payouts.create(params);
          }, 'payouts.create', params),
          retrieve: (id: string) => this.withDefaultAdapter((a) => {
            if (!a.payouts) throw new NotSupportedError(a.name, 'payouts');
            return a.payouts.retrieve(id);
          }, 'payouts.retrieve', { id }),
          list: (params?: ListParams) => this.withDefaultAdapter((a) => {
            if (!a.payouts) throw new NotSupportedError(a.name, 'payouts');
            return a.payouts.list(params);
          }, 'payouts.list', params),
        };
      }
    }
  }

  /**
   * Get capabilities of the default provider.
   */
  get capabilities(): ProviderCapabilities {
    if (this.directAdapter) {
      return this.directAdapter.capabilities;
    }
    const name = this.getDefaultProviderName();
    const AdapterClass = getAdapter(name);
    if (!AdapterClass) {
      throw new Error(
        `No adapter registered for "${name}". Did you install @squaredr/paykit/${name}?`,
      );
    }
    return new AdapterClass().capabilities;
  }

  /**
   * Get structured info about the default provider (name, capabilities, health).
   */
  async getProviderInfo(): Promise<ProviderInfo> {
    const adapter = this.directAdapter ?? this.getDefaultAdapterSync();
    return _getProviderInfo(adapter);
  }

  /**
   * Get a human-readable debug summary of the default provider.
   */
  async debug(): Promise<string> {
    const adapter = this.directAdapter ?? this.getDefaultAdapterSync();
    return _debug(adapter);
  }

  /**
   * Get the current provider name.
   */
  get provider(): string {
    if (this.directAdapter) {
      return this.directAdapter.name;
    }
    return this.getDefaultProviderName();
  }

  /**
   * Get the default adapter for capability checking during construction.
   * Returns the direct adapter, or creates a temp adapter from the registry.
   */
  private getDefaultAdapterForCapabilities(): PaymentAdapter | null {
    if (this.directAdapter) {
      return this.directAdapter;
    }
    const defaultProviderName = this.getDefaultProviderName();
    const AdapterClass = getAdapter(defaultProviderName);
    if (AdapterClass) {
      return new AdapterClass();
    }
    return null;
  }

  private getDefaultProviderName(): string {
    if (this.config && isSingleProvider(this.config)) {
      return this.config.provider;
    }
    if (this.config && isMultiProvider(this.config)) {
      return this.config.routing.default;
    }
    if (this.directAdapter) {
      return this.directAdapter.name;
    }
    throw new Error('Invalid config');
  }

  private getDefaultAdapterSync(): PaymentAdapter {
    if (this.directAdapter) {
      return this.directAdapter;
    }

    const name = this.getDefaultProviderName();
    const existing = this.adapters.get(name);
    if (existing) return existing;

    const AdapterClass = getAdapter(name);
    if (!AdapterClass) {
      throw new Error(
        `No adapter registered for "${name}". Did you install @squaredr/paykit/${name}?`,
      );
    }

    const adapter = new AdapterClass();
    this.adapters.set(name, adapter);
    return adapter;
  }

  private async getAdapterFor(providerName: string): Promise<PaymentAdapter> {
    if (this.directAdapter && this.directAdapter.name === providerName) {
      return this.directAdapter;
    }

    const existing = this.adapters.get(providerName);
    if (existing) {
      if (!this.initialized.get(providerName) && this.config) {
        const credentials = this.getCredentials(providerName);
        await existing.initialize(credentials);
        this.initialized.set(providerName, true);
      }
      return existing;
    }

    const AdapterClass = getAdapter(providerName);
    if (!AdapterClass) {
      throw new Error(
        `No adapter registered for "${providerName}". Did you install @squaredr/paykit/${providerName}?`,
      );
    }

    const adapter = new AdapterClass();
    if (this.config) {
      const credentials = this.getCredentials(providerName);
      await adapter.initialize(credentials);
    }
    this.adapters.set(providerName, adapter);
    this.initialized.set(providerName, true);
    return adapter;
  }

  private getCredentials(providerName: string): ProviderCredentials {
    if (!this.config) {
      throw new Error('Cannot get credentials in direct adapter mode');
    }
    if (isSingleProvider(this.config)) {
      return this.config.credentials;
    }
    if (isMultiProvider(this.config)) {
      const creds = this.config.providers[providerName];
      if (!creds) {
        throw new Error(
          `No credentials configured for provider "${providerName}". ` +
          `Add it to the "providers" config.`,
        );
      }
      return creds;
    }
    throw new Error('Invalid config');
  }

  private async withDefaultAdapter<T>(
    fn: (adapter: PaymentAdapter) => Promise<T>,
    operation?: string,
    params?: unknown,
  ): Promise<T> {
    if (this.directAdapter) {
      return this.executeWithInstrumentation(this.directAdapter, fn, operation, params);
    }
    const name = this.getDefaultProviderName();
    const adapter = await this.getAdapterFor(name);
    return this.executeWithInstrumentation(adapter, fn, operation, params);
  }

  private async withAdapter<T>(
    explicitProvider: string | undefined,
    currency: string | undefined,
    fn: (adapter: PaymentAdapter) => Promise<T>,
    operation?: string,
    params?: unknown,
  ): Promise<T> {
    let adapter: PaymentAdapter;

    if (this.directAdapter && !explicitProvider) {
      adapter = this.directAdapter;
    } else {
      let providerName: string;

      if (this.config && isMultiProvider(this.config)) {
        providerName = resolveProvider(this.config.routing, {
          _provider: explicitProvider,
          currency,
        });
      } else {
        providerName = explicitProvider ?? this.getDefaultProviderName();
      }

      adapter = await this.getAdapterFor(providerName);
    }

    return this.executeWithInstrumentation(adapter, fn, operation, params);
  }

  /**
   * Execute an adapter operation with retry, logging, lifecycle hooks, and _meta attachment.
   */
  private async executeWithInstrumentation<T>(
    adapter: PaymentAdapter,
    fn: (adapter: PaymentAdapter) => Promise<T>,
    operation?: string,
    params?: unknown,
  ): Promise<T> {
    const requestId = generateIdempotencyKey();
    const provider = adapter.name;
    const opName = operation ?? 'unknown';
    const timestamp = new Date();
    const startTime = Date.now();

    // Build request context (with redacted params)
    const requestContext = {
      operation: opName,
      provider,
      params: redact(params),
      requestId,
      timestamp,
    };

    // Fire onRequest hook
    this.options.onRequest?.(requestContext);
    this.log.debug(`${opName} started`, { provider, requestId });

    const maxRetries = this.options.retries ?? 0;
    const baseDelayMs = this.options.retryDelay ?? 500;

    try {
      const { result, attempt } = await withRetry(
        () => fn(adapter),
        {
          maxRetries,
          baseDelayMs,
          maxDelayMs: 10_000,
          shouldRetry: defaultShouldRetry,
        },
        ({ error, attempt, delayMs, willRetry }) => {
          const durationMs = Date.now() - startTime;
          this.options.onError?.({ ...requestContext, durationMs, error, attempt, willRetry });
          if (willRetry) {
            this.log.warn(`${opName} failed (attempt ${attempt}), retrying in ${Math.round(delayMs)}ms`, {
              provider, requestId, error,
            });
          } else {
            this.log.error(`${opName} failed (attempt ${attempt})`, {
              provider, requestId, error,
            });
          }
        },
      );

      const durationMs = Date.now() - startTime;

      // Build _meta
      const meta: ResponseMeta = { durationMs, provider, requestId, attempt };

      // Attach _meta to the result if it's an object
      if (result && typeof result === 'object' && !Array.isArray(result)) {
        (result as Record<string, unknown>)._meta = meta;
      }

      // Fire onResponse hook
      this.options.onResponse?.({ ...requestContext, durationMs, result });
      this.log.info(`${opName} succeeded in ${durationMs}ms`, { provider, requestId, attempt });

      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      // Final error (after all retries exhausted) — onError was already called per-attempt by the retry hook.
      // Log the final failure at error level.
      this.log.error(`${opName} failed after ${durationMs}ms`, { provider, requestId, error });
      throw error;
    }
  }
}
