import Razorpay from 'razorpay';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils';
import { NotSupportedError } from '../../errors.js';
import type {
  PaymentAdapter,
  ChargeOperations,
  RefundOperations,
  CustomerOperations,
  PaymentMethodOperations,
  WebhookOperations,
  SubscriptionOperations,
  HealthStatus,
} from '../../adapter.js';
import type { ProviderCapabilities } from '../../capabilities.js';
import type { CreateChargeParams, CaptureParams } from '../../types/charge.js';
import type { CreateRefundParams } from '../../types/refund.js';
import type { CreateCustomerParams, UpdateCustomerParams } from '../../types/customer.js';
import type {
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
  CancelSubscriptionParams,
} from '../../types/subscription.js';
import type { ListParams } from '../../types/common.js';
import type { ProviderCredentials } from '../../types/config.js';
import { mapRazorpayOrderToCharge, mapRazorpayPaymentToCharge } from './mappers/charge.js';
import { mapRazorpayRefund } from './mappers/refund.js';
import { mapRazorpayCustomer } from './mappers/customer.js';
import { mapRazorpaySubscription } from './mappers/subscription.js';
import { mapRazorpayWebhookEvent } from './mappers/webhook.js';
import { mapRazorpayError, type RazorpayError } from './mappers/error.js';

export class RazorpayAdapter implements PaymentAdapter {
  readonly name = 'razorpay';
  readonly capabilities: ProviderCapabilities = {
    charges: true,
    authAndCapture: true,
    refunds: true,
    partialRefunds: true,
    subscriptions: true,
    savedPaymentMethods: false,
    hostedCheckout: true,
    embeddableUI: true,
    payouts: true,
    multiCurrency: true,
    directDebit: false,
    webhooks: true,
    threeDS: true,
  };

  private razorpay!: InstanceType<typeof Razorpay>;

  async initialize(credentials: ProviderCredentials): Promise<void> {
    if (!credentials.keyId || !credentials.keySecret) {
      throw new Error('Razorpay adapter requires "keyId" and "keySecret" in credentials');
    }
    this.razorpay = new Razorpay({
      key_id: credentials.keyId,
      key_secret: credentials.keySecret,
    });
  }

  async healthCheck(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      // Razorpay doesn't have a dedicated health endpoint;
      // use a lightweight list call to verify connectivity.
      await this.razorpay.orders.all({ count: 1 });
      return { healthy: true, latencyMs: Date.now() - start };
    } catch {
      return { healthy: false, latencyMs: Date.now() - start, message: 'Razorpay API unreachable' };
    }
  }

  private wrap<T>(fn: () => Promise<T>): Promise<T> {
    return fn().catch((err: RazorpayError) => {
      if (err.statusCode && err.error) {
        throw mapRazorpayError(err);
      }
      throw err;
    });
  }

  // Razorpay uses Orders as the charge initiation point.
  // After an order is created, the frontend collects payment.
  // "retrieve" fetches the payment (post-checkout).
  charges: ChargeOperations = {
    create: (params: CreateChargeParams) =>
      this.wrap(async () => {
        const order = await this.razorpay.orders.create({
          amount: params.amount,
          currency: params.currency.toUpperCase(),
          receipt: params.description,
          notes: params.metadata ?? {},
        });
        return mapRazorpayOrderToCharge(order);
      }),

    retrieve: (id: string) =>
      this.wrap(async () => {
        // If it's a payment ID (pay_*), fetch as payment; else as order
        if (id.startsWith('pay_')) {
          const payment = await this.razorpay.payments.fetch(id);
          return mapRazorpayPaymentToCharge(payment);
        }
        const order = await this.razorpay.orders.fetch(id);
        return mapRazorpayOrderToCharge(order);
      }),

    capture: (id: string, params?: CaptureParams) =>
      this.wrap(async () => {
        const payment = await this.razorpay.payments.fetch(id);
        const captured = await this.razorpay.payments.capture(
          id,
          params?.amount ?? payment.amount,
          payment.currency,
        );
        return mapRazorpayPaymentToCharge(captured);
      }),

    cancel: () => {
      throw new Error('Razorpay does not support cancelling orders directly');
    },

    list: (params?: ListParams) =>
      this.wrap(async () => {
        const result = await this.razorpay.orders.all({
          count: params?.limit ?? 10,
          skip: 0,
        });
        return {
          data: (result.items ?? []).map(mapRazorpayOrderToCharge),
          hasMore: (result.items?.length ?? 0) === (params?.limit ?? 10),
        };
      }),
  };

  refunds: RefundOperations = {
    create: (params: CreateRefundParams) =>
      this.wrap(async () => {
        const refund = await this.razorpay.payments.refund(params.chargeId, {
          amount: params.amount,
          notes: params.metadata ?? {},
        });
        return mapRazorpayRefund(refund);
      }),

    retrieve: (id: string) =>
      this.wrap(async () => {
        const refund = await this.razorpay.refunds.fetch(id);
        return mapRazorpayRefund(refund);
      }),

    list: (params?: ListParams) =>
      this.wrap(async () => {
        const result = await this.razorpay.refunds.all({
          count: params?.limit ?? 10,
          skip: 0,
        });
        return {
          data: (result.items ?? []).map(mapRazorpayRefund),
          hasMore: (result.items?.length ?? 0) === (params?.limit ?? 10),
        };
      }),
  };

  customers: CustomerOperations = {
    create: (params: CreateCustomerParams) =>
      this.wrap(async () => {
        const customer = await this.razorpay.customers.create({
          name: params.name ?? '',
          email: params.email,
          contact: params.phone,
          notes: params.metadata ?? {},
        });
        return mapRazorpayCustomer(customer);
      }),

    retrieve: (id: string) =>
      this.wrap(async () => {
        const customer = await this.razorpay.customers.fetch(id);
        return mapRazorpayCustomer(customer);
      }),

    update: (id: string, params: UpdateCustomerParams) =>
      this.wrap(async () => {
        const customer = await this.razorpay.customers.edit(id, {
          name: params.name,
          email: params.email,
          contact: params.phone,
        });
        return mapRazorpayCustomer(customer);
      }),

    delete: () => {
      throw new Error('Razorpay does not support deleting customers');
    },

    list: (params?: ListParams) =>
      this.wrap(async () => {
        const result = await this.razorpay.customers.all({
          count: params?.limit ?? 10,
          skip: 0,
        });
        return {
          data: (result.items ?? []).map(mapRazorpayCustomer),
          hasMore: (result.items?.length ?? 0) === (params?.limit ?? 10),
        };
      }),
  };

  // Razorpay doesn't have a standalone payment methods API.
  // Payment methods are handled via Checkout (frontend) and stored as tokens.
  paymentMethods: PaymentMethodOperations = {
    create: () => {
      throw new NotSupportedError('razorpay', 'paymentMethods.create');
    },
    retrieve: () => {
      throw new NotSupportedError('razorpay', 'paymentMethods.retrieve');
    },
    attach: () => {
      throw new NotSupportedError('razorpay', 'paymentMethods.attach');
    },
    detach: () => {
      throw new NotSupportedError('razorpay', 'paymentMethods.detach');
    },
    list: () => {
      throw new NotSupportedError('razorpay', 'paymentMethods.list');
    },
  };

  webhooks: WebhookOperations = {
    verify: (payload: string | Buffer, headers: Record<string, string>, secret: string): boolean => {
      try {
        const body = typeof payload === 'string' ? payload : payload.toString();
        const signature = headers['x-razorpay-signature'] ?? '';
        return validateWebhookSignature(body, signature, secret);
      } catch {
        return false;
      }
    },

    parse: (payload: string | Buffer, headers: Record<string, string>, secret: string) => {
      const body = typeof payload === 'string' ? payload : payload.toString();
      const signature = headers['x-razorpay-signature'] ?? '';
      validateWebhookSignature(body, signature, secret);

      const parsed = JSON.parse(body);
      const mapped = mapRazorpayWebhookEvent(parsed);
      if (!mapped) {
        return {
          id: `${parsed.event}_${parsed.created_at}`,
          provider: 'razorpay',
          type: parsed.event as never,
          providerType: parsed.event,
          data: parsed.payload,
          createdAt: new Date(parsed.created_at * 1000),
          _raw: parsed,
        };
      }
      return mapped;
    },
  };

  private mapInterval(interval: string): 'daily' | 'weekly' | 'monthly' | 'yearly' {
    const map: Record<string, 'daily' | 'weekly' | 'monthly' | 'yearly'> = {
      day: 'daily',
      week: 'weekly',
      month: 'monthly',
      year: 'yearly',
    };
    return map[interval] ?? 'monthly';
  }

  subscriptions: SubscriptionOperations = {
    create: (params: CreateSubscriptionParams) =>
      this.wrap(async () => {
        // Razorpay requires a plan_id. We create a plan first, then the subscription.
        const plan = await (this.razorpay.plans.create({
          period: this.mapInterval(params.interval),
          interval: params.intervalCount ?? 1,
          item: {
            name: 'Subscription',
            amount: params.amount,
            currency: params.currency.toUpperCase(),
          },
        }) as Promise<{ id: string }>);
        const sub = await this.razorpay.subscriptions.create({
          plan_id: plan.id,
          total_count: 12, // Default to 12 billing cycles
          customer_notify: 1,
          notes: params.metadata ?? {},
        });
        return mapRazorpaySubscription(sub);
      }),

    retrieve: (id: string) =>
      this.wrap(async () => {
        const sub = await this.razorpay.subscriptions.fetch(id);
        return mapRazorpaySubscription(sub);
      }),

    update: (id: string, params: UpdateSubscriptionParams) =>
      this.wrap(async () => {
        const sub = await this.razorpay.subscriptions.update(id, {
          ...(params.metadata ? { notes: params.metadata } : {}),
        });
        return mapRazorpaySubscription(sub);
      }),

    cancel: (id: string, params?: CancelSubscriptionParams) =>
      this.wrap(async () => {
        const sub = await this.razorpay.subscriptions.cancel(
          id,
          params?.cancelAtPeriodEnd ? true : false,
        );
        return mapRazorpaySubscription(sub);
      }),

    list: (params?: ListParams) =>
      this.wrap(async () => {
        const result = await this.razorpay.subscriptions.all({
          count: params?.limit ?? 10,
          skip: 0,
        });
        return {
          data: (result.items ?? []).map(mapRazorpaySubscription),
          hasMore: (result.items?.length ?? 0) === (params?.limit ?? 10),
        };
      }),
  };
}
