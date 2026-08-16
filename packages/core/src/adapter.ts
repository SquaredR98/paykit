import type { ProviderCapabilities } from './capabilities.js';
import type { ProviderCredentials } from './types/config.js';
import type { UnifiedCharge, CreateChargeParams, CaptureParams } from './types/charge.js';
import type { UnifiedRefund, CreateRefundParams } from './types/refund.js';
import type { UnifiedCustomer, CreateCustomerParams, UpdateCustomerParams } from './types/customer.js';
import type {
  UnifiedPaymentMethod,
  CreatePaymentMethodParams,
} from './types/payment-method.js';
import type { UnifiedWebhookEvent } from './types/webhook.js';
import type {
  UnifiedSubscription,
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
  CancelSubscriptionParams,
} from './types/subscription.js';
import type { UnifiedPayout, CreatePayoutParams } from './types/payout.js';
import type { PaginatedList, ListParams, RequestOptions } from './types/common.js';
import type { ClientAdapter } from './types/client-adapter.js';

/**
 * Health check result returned by `adapter.healthCheck()`.
 */
export interface HealthStatus {
  /** Whether the provider is reachable and responding. */
  healthy: boolean;
  /** Round-trip latency in milliseconds. */
  latencyMs?: number;
  /** Human-readable status message (e.g. error reason if unhealthy). */
  message?: string;
}

/**
 * Charge operations every adapter must implement.
 */
export interface ChargeOperations {
  create(params: CreateChargeParams): Promise<UnifiedCharge>;
  retrieve(id: string): Promise<UnifiedCharge>;
  capture(id: string, params?: CaptureParams): Promise<UnifiedCharge>;
  cancel(id: string, options?: RequestOptions): Promise<UnifiedCharge>;
  list(params?: ListParams): Promise<PaginatedList<UnifiedCharge>>;
}

/**
 * Refund operations every adapter must implement.
 */
export interface RefundOperations {
  create(params: CreateRefundParams): Promise<UnifiedRefund>;
  retrieve(id: string): Promise<UnifiedRefund>;
  list(params?: ListParams): Promise<PaginatedList<UnifiedRefund>>;
}

/**
 * Customer operations every adapter must implement.
 */
export interface CustomerOperations {
  create(params: CreateCustomerParams): Promise<UnifiedCustomer>;
  retrieve(id: string): Promise<UnifiedCustomer>;
  update(id: string, params: UpdateCustomerParams): Promise<UnifiedCustomer>;
  delete(id: string): Promise<void>;
  list(params?: ListParams): Promise<PaginatedList<UnifiedCustomer>>;
}

/**
 * Payment method operations every adapter must implement.
 */
export interface PaymentMethodOperations {
  create(params: CreatePaymentMethodParams): Promise<UnifiedPaymentMethod>;
  retrieve(id: string): Promise<UnifiedPaymentMethod>;
  attach(paymentMethodId: string, customerId: string): Promise<void>;
  detach(paymentMethodId: string): Promise<void>;
  list(customerId: string): Promise<UnifiedPaymentMethod[]>;
}

/**
 * Webhook operations every adapter must implement.
 */
export interface WebhookOperations {
  verify(payload: string | Buffer, headers: Record<string, string>, secret: string): boolean;
  parse(
    payload: string | Buffer,
    headers: Record<string, string>,
    secret: string,
  ): UnifiedWebhookEvent;
}

/**
 * Subscription operations — optional, not all providers support this.
 */
export interface SubscriptionOperations {
  create(params: CreateSubscriptionParams): Promise<UnifiedSubscription>;
  retrieve(id: string): Promise<UnifiedSubscription>;
  update(id: string, params: UpdateSubscriptionParams): Promise<UnifiedSubscription>;
  cancel(id: string, params?: CancelSubscriptionParams): Promise<UnifiedSubscription>;
  list(params?: ListParams): Promise<PaginatedList<UnifiedSubscription>>;
}

/**
 * Payout operations — optional, not all providers support this.
 */
export interface PayoutOperations {
  create(params: CreatePayoutParams): Promise<UnifiedPayout>;
  retrieve(id: string): Promise<UnifiedPayout>;
  list(params?: ListParams): Promise<PaginatedList<UnifiedPayout>>;
}

/**
 * The contract every payment adapter must implement.
 * This is the core interface of the entire SDK — all providers
 * (Stripe, Razorpay, PayPal, etc.) conform to this shape.
 *
 * @example
 * class MyAdapter implements PaymentAdapter {
 *   readonly name = 'my-provider';
 *   readonly capabilities = { charges: true, refunds: true, ... };
 *   // ... implement all required operations
 * }
 */
export interface PaymentAdapter {
  /** Unique provider name (e.g. `'stripe'`, `'razorpay'`). */
  readonly name: string;
  /** Declares which operations this adapter supports. */
  readonly capabilities: ProviderCapabilities;

  /** Initialize the adapter with provider credentials. Called once before first use. */
  initialize(credentials: ProviderCredentials): Promise<void>;
  /** Check if the provider is reachable and responding. */
  healthCheck(): Promise<HealthStatus>;

  /** Charge (payment) operations — required. */
  charges: ChargeOperations;
  /** Refund operations — required. */
  refunds: RefundOperations;
  /** Customer operations — required. */
  customers: CustomerOperations;
  /** Payment method operations — required. */
  paymentMethods: PaymentMethodOperations;
  /** Webhook verification and parsing — required. */
  webhooks: WebhookOperations;

  /** Subscription operations — optional, check `capabilities.subscriptions`. */
  subscriptions?: SubscriptionOperations;
  /** Payout operations — optional, check `capabilities.payouts`. */
  payouts?: PayoutOperations;

  /** Optional browser-side client adapter for provider-hosted UIs. */
  client?: ClientAdapter;
}
