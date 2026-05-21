import {
  registerAdapter,
  type PaymentAdapter,
  type ProviderCapabilities,
  type HealthStatus,
  type ChargeOperations,
  type RefundOperations,
  type CustomerOperations,
  type PaymentMethodOperations,
  type WebhookOperations,
  type UnifiedCharge,
  type UnifiedRefund,
  type UnifiedCustomer,
  type UnifiedPaymentMethod,
  type UnifiedWebhookEvent,
  type CreateChargeParams,
  type CreateRefundParams,
  type CreateCustomerParams,
  type UpdateCustomerParams,
  type CreatePaymentMethodParams,
  type CaptureParams,
  type PaginatedList,
  type ListParams,
  type RequestOptions,
} from '@squaredr/paykit';

const store = {
  charges: new Map<string, UnifiedCharge>(),
  refunds: new Map<string, UnifiedRefund>(),
  customers: new Map<string, UnifiedCustomer>(),
  paymentMethods: new Map<string, UnifiedPaymentMethod>(),
};

let counter = 0;
function mockId(prefix: string): string {
  return `${prefix}_mock_${++counter}_${Date.now()}`;
}

function emptyList<T>(): PaginatedList<T> {
  return { data: [], hasMore: false, totalCount: 0 };
}

const mockCharges: ChargeOperations = {
  async create(params: CreateChargeParams): Promise<UnifiedCharge> {
    const id = mockId('ch');
    const clientSecret = `${id}_secret_${Date.now()}`;
    const charge: UnifiedCharge = {
      id,
      providerId: id,
      provider: 'mock',
      amount: params.amount,
      currency: params.currency,
      status: 'pending',
      description: params.description,
      clientSecret,
      metadata: params.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
      _raw: {},
    };
    store.charges.set(id, charge);

    // Simulate async settlement
    setTimeout(() => {
      const c = store.charges.get(id);
      if (c && c.status === 'pending') {
        c.status = 'succeeded';
        c.updatedAt = new Date();
      }
    }, 3000);

    return charge;
  },

  async retrieve(id: string): Promise<UnifiedCharge> {
    const charge = store.charges.get(id);
    if (!charge) throw new Error(`Charge ${id} not found`);
    return charge;
  },

  async capture(id: string, _params?: CaptureParams): Promise<UnifiedCharge> {
    const charge = store.charges.get(id);
    if (!charge) throw new Error(`Charge ${id} not found`);
    charge.status = 'succeeded';
    charge.updatedAt = new Date();
    return charge;
  },

  async cancel(id: string, _options?: RequestOptions): Promise<UnifiedCharge> {
    const charge = store.charges.get(id);
    if (!charge) throw new Error(`Charge ${id} not found`);
    charge.status = 'canceled';
    charge.updatedAt = new Date();
    return charge;
  },

  async list(_params?: ListParams): Promise<PaginatedList<UnifiedCharge>> {
    return {
      data: [...store.charges.values()],
      hasMore: false,
      totalCount: store.charges.size,
    };
  },
};

const mockRefunds: RefundOperations = {
  async create(params: CreateRefundParams): Promise<UnifiedRefund> {
    const id = mockId('re');
    const refund: UnifiedRefund = {
      id,
      providerId: id,
      provider: 'mock',
      chargeId: params.chargeId,
      amount: params.amount ?? 0,
      currency: 'usd',
      status: 'succeeded',
      createdAt: new Date(),
      _raw: {},
    };
    store.refunds.set(id, refund);
    return refund;
  },
  async retrieve(id: string): Promise<UnifiedRefund> {
    const refund = store.refunds.get(id);
    if (!refund) throw new Error(`Refund ${id} not found`);
    return refund;
  },
  async list(_params?: ListParams): Promise<PaginatedList<UnifiedRefund>> {
    return emptyList();
  },
};

const mockCustomers: CustomerOperations = {
  async create(params: CreateCustomerParams): Promise<UnifiedCustomer> {
    const id = mockId('cus');
    const customer: UnifiedCustomer = {
      id,
      providerId: id,
      provider: 'mock',
      email: params.email,
      name: params.name,
      createdAt: new Date(),
      _raw: {},
    };
    store.customers.set(id, customer);
    return customer;
  },
  async retrieve(id: string): Promise<UnifiedCustomer> {
    const customer = store.customers.get(id);
    if (!customer) throw new Error(`Customer ${id} not found`);
    return customer;
  },
  async update(id: string, params: UpdateCustomerParams): Promise<UnifiedCustomer> {
    const customer = store.customers.get(id);
    if (!customer) throw new Error(`Customer ${id} not found`);
    if (params.email) customer.email = params.email;
    if (params.name) customer.name = params.name;
    return customer;
  },
  async delete(id: string): Promise<void> {
    store.customers.delete(id);
  },
  async list(_params?: ListParams): Promise<PaginatedList<UnifiedCustomer>> {
    return emptyList();
  },
};

const mockPaymentMethods: PaymentMethodOperations = {
  async create(_params: CreatePaymentMethodParams): Promise<UnifiedPaymentMethod> {
    const id = mockId('pm');
    const pm: UnifiedPaymentMethod = {
      id,
      providerId: id,
      provider: 'mock',
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2030,
      createdAt: new Date(),
      _raw: {},
    };
    store.paymentMethods.set(id, pm);
    return pm;
  },
  async retrieve(id: string): Promise<UnifiedPaymentMethod> {
    const pm = store.paymentMethods.get(id);
    if (!pm) throw new Error(`PaymentMethod ${id} not found`);
    return pm;
  },
  async attach(_pmId: string, _custId: string): Promise<void> {},
  async detach(_pmId: string): Promise<void> {},
  async list(_customerId: string): Promise<UnifiedPaymentMethod[]> {
    return [];
  },
};

const mockWebhooks: WebhookOperations = {
  verify(_payload: string | Buffer, _headers: Record<string, string>, _secret: string): boolean {
    return true;
  },
  parse(
    payload: string | Buffer,
    _headers: Record<string, string>,
    _secret: string,
  ): UnifiedWebhookEvent {
    const body = typeof payload === 'string' ? JSON.parse(payload) : JSON.parse(payload.toString());
    return {
      id: mockId('evt'),
      provider: 'mock',
      type: body.type ?? 'charge.succeeded',
      providerType: body.type ?? 'charge.succeeded',
      data: body.data ?? {},
      createdAt: new Date(),
      _raw: body,
    };
  },
};

export class MockAdapter implements PaymentAdapter {
  readonly name = 'mock';
  readonly capabilities: ProviderCapabilities = {
    charges: true,
    authAndCapture: true,
    refunds: true,
    partialRefunds: true,
    subscriptions: false,
    savedPaymentMethods: true,
    hostedCheckout: false,
    embeddableUI: false,
    payouts: false,
    multiCurrency: true,
    directDebit: false,
    webhooks: true,
    threeDS: false,
  };

  charges = mockCharges;
  refunds = mockRefunds;
  customers = mockCustomers;
  paymentMethods = mockPaymentMethods;
  webhooks = mockWebhooks;

  async initialize(): Promise<void> {}

  async healthCheck(): Promise<HealthStatus> {
    return { healthy: true, latencyMs: 1, message: 'Mock adapter' };
  }
}

export function registerMockAdapter(): void {
  registerAdapter('mock', MockAdapter);
}
