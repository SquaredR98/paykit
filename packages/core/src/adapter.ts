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
 * Health check result.
 */
export interface HealthStatus {
  healthy: boolean;
  latencyMs?: number;
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
 * This is the core interface of the entire SDK.
 */
export interface PaymentAdapter {
  readonly name: string;
  readonly capabilities: ProviderCapabilities;

  initialize(credentials: ProviderCredentials): Promise<void>;
  healthCheck(): Promise<HealthStatus>;

  charges: ChargeOperations;
  refunds: RefundOperations;
  customers: CustomerOperations;
  paymentMethods: PaymentMethodOperations;
  webhooks: WebhookOperations;

  subscriptions?: SubscriptionOperations;
  payouts?: PayoutOperations;

  /** Optional browser-side client adapter for provider-hosted UIs. */
  client?: ClientAdapter;
}
