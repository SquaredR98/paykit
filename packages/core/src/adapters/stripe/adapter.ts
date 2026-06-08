import Stripe from 'stripe';
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
import type { CreatePaymentMethodParams } from '../../types/payment-method.js';
import type {
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
  CancelSubscriptionParams,
} from '../../types/subscription.js';
import type { ListParams, RequestOptions } from '../../types/common.js';
import type { ProviderCredentials } from '../../types/config.js';
import { mapPaymentIntentToCharge } from './mappers/charge.js';
import { mapStripeRefund } from './mappers/refund.js';
import { mapStripeCustomer } from './mappers/customer.js';
import { mapStripePaymentMethod } from './mappers/payment-method.js';
import { mapStripeSubscription } from './mappers/subscription.js';
import { mapStripeWebhookEvent } from './mappers/webhook.js';
import { mapStripeError } from './mappers/error.js';

export class StripeAdapter implements PaymentAdapter {
  readonly name = 'stripe';
  readonly capabilities: ProviderCapabilities = {
    charges: true,
    authAndCapture: true,
    refunds: true,
    partialRefunds: true,
    subscriptions: true,
    savedPaymentMethods: true,
    hostedCheckout: true,
    embeddableUI: true,
    payouts: true,
    multiCurrency: true,
    directDebit: true,
    webhooks: true,
    threeDS: true,
  };

  private stripe!: Stripe;

  constructor(credentials?: ProviderCredentials) {
    if (credentials?.secretKey) {
      this.stripe = new Stripe(credentials.secretKey);
    }
  }

  async initialize(credentials: ProviderCredentials): Promise<void> {
    if (!credentials.secretKey) {
      throw new Error('Stripe adapter requires "secretKey" in credentials');
    }
    this.stripe = new Stripe(credentials.secretKey);
  }

  async healthCheck(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      await this.stripe.balance.retrieve();
      return { healthy: true, latencyMs: Date.now() - start };
    } catch {
      return { healthy: false, latencyMs: Date.now() - start, message: 'Stripe API unreachable' };
    }
  }

  private wrap<T>(fn: () => Promise<T>): Promise<T> {
    return fn().catch((err) => {
      if (err instanceof Stripe.errors.StripeError) {
        throw mapStripeError(err);
      }
      throw err;
    });
  }

  charges: ChargeOperations = {
    create: (params: CreateChargeParams) =>
      this.wrap(async () => {
        const pi = await this.stripe.paymentIntents.create(
          {
            amount: params.amount,
            currency: params.currency.toLowerCase(),
            description: params.description,
            customer: params.customer,
            payment_method: params.source,
            confirm: params.source ? true : undefined,
            automatic_payment_methods: params.source ? undefined : { enabled: true },
            capture_method: params.capture === false ? 'manual' : 'automatic',
            metadata: params.metadata,
          },
          params.idempotencyKey ? { idempotencyKey: params.idempotencyKey } : undefined,
        );
        return mapPaymentIntentToCharge(pi);
      }),

    retrieve: (id: string) =>
      this.wrap(async () => {
        const pi = await this.stripe.paymentIntents.retrieve(id);
        return mapPaymentIntentToCharge(pi);
      }),

    capture: (id: string, params?: CaptureParams) =>
      this.wrap(async () => {
        const pi = await this.stripe.paymentIntents.capture(id, {
          amount_to_capture: params?.amount,
        });
        return mapPaymentIntentToCharge(pi);
      }),

    cancel: (id: string, options?: RequestOptions) =>
      this.wrap(async () => {
        const pi = await this.stripe.paymentIntents.cancel(
          id,
          undefined,
          options?.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : undefined,
        );
        return mapPaymentIntentToCharge(pi);
      }),

    list: (params?: ListParams) =>
      this.wrap(async () => {
        const result = await this.stripe.paymentIntents.list({
          limit: params?.limit ?? 10,
          starting_after: params?.startingAfter,
          ending_before: params?.endingBefore,
        });
        return {
          data: result.data.map(mapPaymentIntentToCharge),
          hasMore: result.has_more,
        };
      }),
  };

  refunds: RefundOperations = {
    create: (params: CreateRefundParams) =>
      this.wrap(async () => {
        const refund = await this.stripe.refunds.create(
          {
            payment_intent: params.chargeId,
            amount: params.amount,
            reason: params.reason as Stripe.RefundCreateParams.Reason | undefined,
            metadata: params.metadata,
          },
          params.idempotencyKey ? { idempotencyKey: params.idempotencyKey } : undefined,
        );
        return mapStripeRefund(refund);
      }),

    retrieve: (id: string) =>
      this.wrap(async () => {
        const refund = await this.stripe.refunds.retrieve(id);
        return mapStripeRefund(refund);
      }),

    list: (params?: ListParams) =>
      this.wrap(async () => {
        const result = await this.stripe.refunds.list({
          limit: params?.limit ?? 10,
          starting_after: params?.startingAfter,
          ending_before: params?.endingBefore,
        });
        return {
          data: result.data.map(mapStripeRefund),
          hasMore: result.has_more,
        };
      }),
  };

  customers: CustomerOperations = {
    create: (params: CreateCustomerParams) =>
      this.wrap(async () => {
        const customer = await this.stripe.customers.create({
          email: params.email,
          name: params.name,
          phone: params.phone,
          metadata: params.metadata,
        });
        return mapStripeCustomer(customer);
      }),

    retrieve: (id: string) =>
      this.wrap(async () => {
        const customer = await this.stripe.customers.retrieve(id);
        if (customer.deleted) throw new Error(`Customer ${id} has been deleted`);
        return mapStripeCustomer(customer as Stripe.Customer);
      }),

    update: (id: string, params: UpdateCustomerParams) =>
      this.wrap(async () => {
        const customer = await this.stripe.customers.update(id, {
          email: params.email,
          name: params.name,
          phone: params.phone,
          metadata: params.metadata,
        });
        return mapStripeCustomer(customer);
      }),

    delete: (id: string) =>
      this.wrap(async () => {
        await this.stripe.customers.del(id);
      }),

    list: (params?: ListParams) =>
      this.wrap(async () => {
        const result = await this.stripe.customers.list({
          limit: params?.limit ?? 10,
          starting_after: params?.startingAfter,
          ending_before: params?.endingBefore,
        });
        return {
          data: result.data.map(mapStripeCustomer),
          hasMore: result.has_more,
        };
      }),
  };

  paymentMethods: PaymentMethodOperations = {
    create: (params: CreatePaymentMethodParams) =>
      this.wrap(async () => {
        const pm = await this.stripe.paymentMethods.create({
          type: params.type === 'card' ? 'card' : (params.type as Stripe.PaymentMethodCreateParams.Type),
          metadata: params.metadata,
        });
        return mapStripePaymentMethod(pm);
      }),

    retrieve: (id: string) =>
      this.wrap(async () => {
        const pm = await this.stripe.paymentMethods.retrieve(id);
        return mapStripePaymentMethod(pm);
      }),

    attach: (paymentMethodId: string, customerId: string) =>
      this.wrap(async () => {
        await this.stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId,
        });
      }),

    detach: (paymentMethodId: string) =>
      this.wrap(async () => {
        await this.stripe.paymentMethods.detach(paymentMethodId);
      }),

    list: (customerId: string) =>
      this.wrap(async () => {
        const result = await this.stripe.paymentMethods.list({
          customer: customerId,
          type: 'card',
        });
        return result.data.map(mapStripePaymentMethod);
      }),
  };

  webhooks: WebhookOperations = {
    verify: (payload: string | Buffer, headers: Record<string, string>, secret: string): boolean => {
      try {
        this.stripe.webhooks.constructEvent(
          typeof payload === 'string' ? payload : payload.toString(),
          headers['stripe-signature'] ?? '',
          secret,
        );
        return true;
      } catch {
        return false;
      }
    },

    parse: (payload: string | Buffer, headers: Record<string, string>, secret: string) => {
      const event = this.stripe.webhooks.constructEvent(
        typeof payload === 'string' ? payload : payload.toString(),
        headers['stripe-signature'] ?? '',
        secret,
      );
      const mapped = mapStripeWebhookEvent(event);
      if (!mapped) {
        return {
          id: event.id,
          provider: 'stripe',
          type: event.type as never,
          providerType: event.type,
          data: event.data.object,
          createdAt: new Date(event.created * 1000),
          _raw: event,
        };
      }
      return mapped;
    },
  };

  subscriptions: SubscriptionOperations = {
    create: (params: CreateSubscriptionParams) =>
      this.wrap(async () => {
        // Create a product + price first, then subscribe
        const product = await this.stripe.products.create({ name: 'Subscription' });
        const price = await this.stripe.prices.create({
          currency: params.currency.toLowerCase(),
          unit_amount: params.amount,
          recurring: {
            interval: params.interval,
            interval_count: params.intervalCount ?? 1,
          },
          product: product.id,
        });
        const sub = await this.stripe.subscriptions.create({
          customer: params.customer,
          items: [{ price: price.id }],
          metadata: params.metadata,
        });
        return mapStripeSubscription(sub);
      }),

    retrieve: (id: string) =>
      this.wrap(async () => {
        const sub = await this.stripe.subscriptions.retrieve(id);
        return mapStripeSubscription(sub);
      }),

    update: (id: string, params: UpdateSubscriptionParams) =>
      this.wrap(async () => {
        const sub = await this.stripe.subscriptions.update(id, {
          metadata: params.metadata,
        });
        return mapStripeSubscription(sub);
      }),

    cancel: (id: string, params?: CancelSubscriptionParams) =>
      this.wrap(async () => {
        if (params?.cancelAtPeriodEnd) {
          const sub = await this.stripe.subscriptions.update(id, {
            cancel_at_period_end: true,
          });
          return mapStripeSubscription(sub);
        }
        const sub = await this.stripe.subscriptions.cancel(id);
        return mapStripeSubscription(sub);
      }),

    list: (params?: ListParams) =>
      this.wrap(async () => {
        const result = await this.stripe.subscriptions.list({
          limit: params?.limit ?? 10,
          starting_after: params?.startingAfter,
          ending_before: params?.endingBefore,
        });
        return {
          data: result.data.map(mapStripeSubscription),
          hasMore: result.has_more,
        };
      }),
  };
}
