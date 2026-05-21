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

function isSingleProvider(config: ProviderConfig): config is SingleProviderConfig {
  return 'provider' in config;
}

function isMultiProvider(config: ProviderConfig): config is MultiProviderConfig {
  return 'providers' in config;
}

/**
 * UnifiedPayments — the main class developers interact with.
 *
 * @example
 * import { UnifiedPayments } from '@squaredr/paykit';
 * import '@squaredr/paykit-stripe';
 *
 * const payments = new UnifiedPayments({
 *   provider: 'stripe',
 *   credentials: { secretKey: 'sk_test_xxx' },
 * });
 *
 * const charge = await payments.charges.create({
 *   amount: 1000,
 *   currency: 'USD',
 *   source: 'tok_visa',
 * });
 */
export class UnifiedPayments {
  private config: ProviderConfig;
  private adapters = new Map<string, PaymentAdapter>();
  private initialized = new Map<string, boolean>();

  readonly charges: ChargeOperations;
  readonly refunds: RefundOperations;
  readonly customers: CustomerOperations;
  readonly paymentMethods: PaymentMethodOperations;
  readonly webhooks: WebhookOperations;
  readonly subscriptions?: SubscriptionOperations;
  readonly payouts?: PayoutOperations;

  constructor(config: ProviderConfig) {
    this.config = config;

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
    };

    // Optional operations — check capability before exposing
    const defaultProviderName = this.getDefaultProviderName();
    const AdapterClass = getAdapter(defaultProviderName);
    if (AdapterClass) {
      const tempAdapter = new AdapterClass();
      if (tempAdapter.capabilities.subscriptions && tempAdapter.subscriptions) {
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

      if (tempAdapter.capabilities.payouts && tempAdapter.payouts) {
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
    const name = this.getDefaultProviderName();
    const AdapterClass = getAdapter(name);
    if (!AdapterClass) {
      throw new Error(
        `No adapter registered for "${name}". Did you install @squaredr/paykit-${name}?`,
      );
    }
    return new AdapterClass().capabilities;
  }

  /**
   * Get the current provider name.
   */
  get provider(): string {
    return this.getDefaultProviderName();
  }

  private getDefaultProviderName(): string {
    if (isSingleProvider(this.config)) {
      return this.config.provider;
    }
    return this.config.routing.default;
  }

  private getDefaultAdapterSync(): PaymentAdapter {
    const name = this.getDefaultProviderName();
    const existing = this.adapters.get(name);
    if (existing) return existing;

    const AdapterClass = getAdapter(name);
    if (!AdapterClass) {
      throw new Error(
        `No adapter registered for "${name}". Did you install @squaredr/paykit-${name}?`,
      );
    }

    const adapter = new AdapterClass();
    this.adapters.set(name, adapter);
    return adapter;
  }

  private async getAdapterFor(providerName: string): Promise<PaymentAdapter> {
    const existing = this.adapters.get(providerName);
    if (existing) {
      if (!this.initialized.get(providerName)) {
        const credentials = this.getCredentials(providerName);
        await existing.initialize(credentials);
        this.initialized.set(providerName, true);
      }
      return existing;
    }

    const AdapterClass = getAdapter(providerName);
    if (!AdapterClass) {
      throw new Error(
        `No adapter registered for "${providerName}". Did you install @squaredr/paykit-${providerName}?`,
      );
    }

    const adapter = new AdapterClass();
    const credentials = this.getCredentials(providerName);
    await adapter.initialize(credentials);
    this.adapters.set(providerName, adapter);
    this.initialized.set(providerName, true);
    return adapter;
  }

  private getCredentials(providerName: string): Record<string, string> {
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
    const name = this.getDefaultProviderName();
    const adapter = await this.getAdapterFor(name);
    return fn(adapter);
  }

  private async withAdapter<T>(
    explicitProvider: string | undefined,
    currency: string | undefined,
    fn: (adapter: PaymentAdapter) => Promise<T>,
  ): Promise<T> {
    let providerName: string;

    if (isMultiProvider(this.config)) {
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
