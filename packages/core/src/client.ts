import type { PaymentAdapter } from './adapter.js';
import type {
  ProviderConfig,
  SingleProviderConfig,
  MultiProviderConfig,
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
import type { ListParams, RequestOptions } from './types/common.js';
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
import { NotSupportedError } from './errors.js';

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

function isAdapterConfig(config: ProviderConfig | AdapterConfig): config is AdapterConfig {
  return 'adapter' in config;
}

function isSingleProvider(config: ProviderConfig): config is SingleProviderConfig {
  return 'provider' in config;
}

function isMultiProvider(config: ProviderConfig): config is MultiProviderConfig {
  return 'providers' in config;
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

  readonly charges: ChargeOperations;
  readonly refunds: RefundOperations;
  readonly customers: CustomerOperations;
  readonly paymentMethods: PaymentMethodOperations;
  readonly webhooks: ExtendedWebhookOperations;
  readonly subscriptions?: SubscriptionOperations;
  readonly payouts?: PayoutOperations;

  constructor(config: ProviderConfig | AdapterConfig) {
    if (isAdapterConfig(config)) {
      // Direct adapter mode — simplest API
      this.directAdapter = config.adapter;
      this.config = null;
      this.adapters.set(config.adapter.name, config.adapter);
      this.initialized.set(config.adapter.name, true);
    } else {
      this.config = config;
    }

    // Bind all resource operations
    this.charges = {
      create: (params: CreateChargeParams) => this.withAdapter(params._provider, params.currency, (a) => a.charges.create(params)),
      retrieve: (id: string) => this.withDefaultAdapter((a) => a.charges.retrieve(id)),
      capture: (id: string, params?: CaptureParams) => this.withDefaultAdapter((a) => a.charges.capture(id, params)),
      cancel: (id: string, options?: RequestOptions) => this.withDefaultAdapter((a) => a.charges.cancel(id, options)),
      list: (params?: ListParams) => this.withDefaultAdapter((a) => a.charges.list(params)),
    };

    this.refunds = {
      create: (params: CreateRefundParams) => this.withDefaultAdapter((a) => a.refunds.create(params)),
      retrieve: (id: string) => this.withDefaultAdapter((a) => a.refunds.retrieve(id)),
      list: (params?: ListParams) => this.withDefaultAdapter((a) => a.refunds.list(params)),
    };

    this.customers = {
      create: (params: CreateCustomerParams) => this.withDefaultAdapter((a) => a.customers.create(params)),
      retrieve: (id: string) => this.withDefaultAdapter((a) => a.customers.retrieve(id)),
      update: (id: string, params: UpdateCustomerParams) => this.withDefaultAdapter((a) => a.customers.update(id, params)),
      delete: (id: string) => this.withDefaultAdapter((a) => a.customers.delete(id)),
      list: (params?: ListParams) => this.withDefaultAdapter((a) => a.customers.list(params)),
    };

    this.paymentMethods = {
      create: (params: CreatePaymentMethodParams) => this.withDefaultAdapter((a) => a.paymentMethods.create(params)),
      retrieve: (id: string) => this.withDefaultAdapter((a) => a.paymentMethods.retrieve(id)),
      attach: (pmId: string, custId: string) => this.withDefaultAdapter((a) => a.paymentMethods.attach(pmId, custId)),
      detach: (pmId: string) => this.withDefaultAdapter((a) => a.paymentMethods.detach(pmId)),
      list: (customerId: string) => this.withDefaultAdapter((a) => a.paymentMethods.list(customerId)),
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
          create: (params: CreateSubscriptionParams) => this.withDefaultAdapter((a) => {
            if (!a.subscriptions) throw new NotSupportedError(a.name, 'subscriptions');
            return a.subscriptions.create(params);
          }),
          retrieve: (id: string) => this.withDefaultAdapter((a) => {
            if (!a.subscriptions) throw new NotSupportedError(a.name, 'subscriptions');
            return a.subscriptions.retrieve(id);
          }),
          update: (id: string, params: UpdateSubscriptionParams) => this.withDefaultAdapter((a) => {
            if (!a.subscriptions) throw new NotSupportedError(a.name, 'subscriptions');
            return a.subscriptions.update(id, params);
          }),
          cancel: (id: string, params?: CancelSubscriptionParams) => this.withDefaultAdapter((a) => {
            if (!a.subscriptions) throw new NotSupportedError(a.name, 'subscriptions');
            return a.subscriptions.cancel(id, params);
          }),
          list: (params?: ListParams) => this.withDefaultAdapter((a) => {
            if (!a.subscriptions) throw new NotSupportedError(a.name, 'subscriptions');
            return a.subscriptions.list(params);
          }),
        };
      }

      if (defaultAdapter.capabilities.payouts && defaultAdapter.payouts) {
        this.payouts = {
          create: (params: CreatePayoutParams) => this.withDefaultAdapter((a) => {
            if (!a.payouts) throw new NotSupportedError(a.name, 'payouts');
            return a.payouts.create(params);
          }),
          retrieve: (id: string) => this.withDefaultAdapter((a) => {
            if (!a.payouts) throw new NotSupportedError(a.name, 'payouts');
            return a.payouts.retrieve(id);
          }),
          list: (params?: ListParams) => this.withDefaultAdapter((a) => {
            if (!a.payouts) throw new NotSupportedError(a.name, 'payouts');
            return a.payouts.list(params);
          }),
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

  private getCredentials(providerName: string): Record<string, string> {
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

  private async withDefaultAdapter<T>(fn: (adapter: PaymentAdapter) => Promise<T>): Promise<T> {
    if (this.directAdapter) {
      return fn(this.directAdapter);
    }
    const name = this.getDefaultProviderName();
    const adapter = await this.getAdapterFor(name);
    return fn(adapter);
  }

  private async withAdapter<T>(
    explicitProvider: string | undefined,
    currency: string | undefined,
    fn: (adapter: PaymentAdapter) => Promise<T>,
  ): Promise<T> {
    if (this.directAdapter && !explicitProvider) {
      return fn(this.directAdapter);
    }

    let providerName: string;

    if (this.config && isMultiProvider(this.config)) {
      providerName = resolveProvider(this.config.routing, {
        _provider: explicitProvider,
        currency,
      });
    } else {
      providerName = explicitProvider ?? this.getDefaultProviderName();
    }

    const adapter = await this.getAdapterFor(providerName);
    return fn(adapter);
  }
}
