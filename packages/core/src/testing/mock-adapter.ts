import type {
  PaymentAdapter,
  ChargeOperations,
  RefundOperations,
  CustomerOperations,
  PaymentMethodOperations,
  WebhookOperations,
  HealthStatus,
} from '../adapter.js';
import type { ProviderCapabilities } from '../capabilities.js';
import type { ProviderCredentials } from '../types/config.js';
import type { UnifiedCharge, CreateChargeParams, CaptureParams } from '../types/charge.js';
import type { UnifiedRefund, CreateRefundParams } from '../types/refund.js';
import type { UnifiedCustomer, CreateCustomerParams, UpdateCustomerParams } from '../types/customer.js';
import type { CreatePaymentMethodParams } from '../types/payment-method.js';
import type { ListParams, RequestOptions } from '../types/common.js';
import { createMockCharge, createMockRefund, createMockCustomer } from './factories.js';

let counter = 0;
function nextId(prefix: string): string {
  return `${prefix}_mock_${++counter}`;
}

/**
 * In-memory mock adapter for testing. Implements the full PaymentAdapter
 * interface with configurable behavior.
 *
 * @example
 * import { MockAdapter } from '@squaredr/paykit/testing';
 *
 * const mock = new MockAdapter();
 * const paykit = new PayKit({ adapter: mock });
 * const charge = await paykit.charges.create({ amount: 1000, currency: 'USD' });
 */
export class MockAdapter implements PaymentAdapter {
  readonly name = 'mock';
  readonly capabilities: ProviderCapabilities = {
    charges: true,
    authAndCapture: true,
    refunds: true,
    partialRefunds: true,
    subscriptions: false,
    savedPaymentMethods: false,
    hostedCheckout: false,
    embeddableUI: false,
    payouts: false,
    multiCurrency: true,
    directDebit: false,
    webhooks: true,
    threeDS: false,
  };

  /** In-memory stores */
  readonly store = {
    charges: new Map<string, UnifiedCharge>(),
    refunds: new Map<string, UnifiedRefund>(),
    customers: new Map<string, UnifiedCustomer>(),
  };

  /** If set, all operations will throw this error */
  failWith: Error | null = null;

  async initialize(_credentials: ProviderCredentials): Promise<void> {
    // No-op for mock
  }

  async healthCheck(): Promise<HealthStatus> {
    if (this.failWith) {
      return { healthy: false, message: this.failWith.message };
    }
    return { healthy: true, latencyMs: 1 };
  }

  private checkFailure(): void {
    if (this.failWith) throw this.failWith;
  }

  charges: ChargeOperations = {
    create: async (params: CreateChargeParams) => {
      this.checkFailure();
      const id = nextId('ch');
      const charge = createMockCharge({
        id,
        providerId: id,
        amount: params.amount,
        currency: params.currency,
        description: params.description,
        status: 'succeeded',
        metadata: params.metadata,
      });
      this.store.charges.set(id, charge);
      return charge;
    },

    retrieve: async (id: string) => {
      this.checkFailure();
      const charge = this.store.charges.get(id);
      if (!charge) throw new Error(`Charge ${id} not found`);
      return charge;
    },

    capture: async (id: string, _params?: CaptureParams) => {
      this.checkFailure();
      const charge = this.store.charges.get(id);
      if (!charge) throw new Error(`Charge ${id} not found`);
      const captured = { ...charge, status: 'succeeded' as const };
      this.store.charges.set(id, captured);
      return captured;
    },

    cancel: async (id: string, _options?: RequestOptions) => {
      this.checkFailure();
      const charge = this.store.charges.get(id);
      if (!charge) throw new Error(`Charge ${id} not found`);
      const canceled = { ...charge, status: 'canceled' as const };
      this.store.charges.set(id, canceled);
      return canceled;
    },

    list: async (params?: ListParams) => {
      this.checkFailure();
      const all = Array.from(this.store.charges.values());
      const limit = params?.limit ?? 10;
      return { data: all.slice(0, limit), hasMore: all.length > limit };
    },
  };

  refunds: RefundOperations = {
    create: async (params: CreateRefundParams) => {
      this.checkFailure();
      const id = nextId('re');
      const refund = createMockRefund({
        id,
        providerId: id,
        chargeId: params.chargeId,
        amount: params.amount ?? 1000,
        reason: params.reason,
        metadata: params.metadata,
      });
      this.store.refunds.set(id, refund);
      return refund;
    },

    retrieve: async (id: string) => {
      this.checkFailure();
      const refund = this.store.refunds.get(id);
      if (!refund) throw new Error(`Refund ${id} not found`);
      return refund;
    },

    list: async (params?: ListParams) => {
      this.checkFailure();
      const all = Array.from(this.store.refunds.values());
      const limit = params?.limit ?? 10;
      return { data: all.slice(0, limit), hasMore: all.length > limit };
    },
  };

  customers: CustomerOperations = {
    create: async (params: CreateCustomerParams) => {
      this.checkFailure();
      const id = nextId('cus');
      const customer = createMockCustomer({
        id,
        providerId: id,
        email: params.email,
        name: params.name,
        phone: params.phone,
        metadata: params.metadata,
      });
      this.store.customers.set(id, customer);
      return customer;
    },

    retrieve: async (id: string) => {
      this.checkFailure();
      const customer = this.store.customers.get(id);
      if (!customer) throw new Error(`Customer ${id} not found`);
      return customer;
    },

    update: async (id: string, params: UpdateCustomerParams) => {
      this.checkFailure();
      const existing = this.store.customers.get(id);
      if (!existing) throw new Error(`Customer ${id} not found`);
      const updated = {
        ...existing,
        ...(params.email !== undefined && { email: params.email }),
        ...(params.name !== undefined && { name: params.name }),
        ...(params.phone !== undefined && { phone: params.phone }),
      };
      this.store.customers.set(id, updated);
      return updated;
    },

    delete: async (id: string) => {
      this.checkFailure();
      this.store.customers.delete(id);
    },

    list: async (params?: ListParams) => {
      this.checkFailure();
      const all = Array.from(this.store.customers.values());
      const limit = params?.limit ?? 10;
      return { data: all.slice(0, limit), hasMore: all.length > limit };
    },
  };

  paymentMethods: PaymentMethodOperations = {
    create: async (_params: CreatePaymentMethodParams) => {
      this.checkFailure();
      throw new Error('MockAdapter does not support paymentMethods');
    },
    retrieve: async (_id: string) => {
      this.checkFailure();
      throw new Error('MockAdapter does not support paymentMethods');
    },
    attach: async () => {
      this.checkFailure();
      throw new Error('MockAdapter does not support paymentMethods');
    },
    detach: async () => {
      this.checkFailure();
      throw new Error('MockAdapter does not support paymentMethods');
    },
    list: async () => {
      this.checkFailure();
      throw new Error('MockAdapter does not support paymentMethods');
    },
  };

  webhooks: WebhookOperations = {
    verify: () => true,
    parse: () => ({
      id: 'evt_mock_1',
      provider: 'mock',
      type: 'charge.succeeded' as any,
      providerType: 'mock.charge.succeeded',
      data: {},
      createdAt: new Date(),
      _raw: {},
    }),
  };
}
