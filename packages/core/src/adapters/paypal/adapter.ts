import { NotSupportedError, PaymentError } from '../../errors.js';
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
import {
  Client,
  Environment,
  OrdersController,
  PaymentsController,
  VaultController,
  SubscriptionsController,
  ApiError,
  type OrderRequest,
  type RefundRequest,
  CheckoutPaymentIntent,
  VaultTokenRequestType,
  TenureType,
} from '@paypal/paypal-server-sdk';
import { mapPayPalOrderToCharge } from './mappers/charge.js';
import { mapPayPalRefund } from './mappers/refund.js';
import { mapPayPalPaymentMethod } from './mappers/payment-method.js';
import { mapPayPalSubscription } from './mappers/subscription.js';
import { mapPayPalWebhookEvent, type PayPalWebhookEvent } from './mappers/webhook.js';
import { mapPayPalError } from './mappers/error.js';
import { ZERO_DECIMAL_CURRENCIES } from './constants.js';

/**
 * PayPal adapter using the official PayPal Server SDK.
 *
 * Uses @paypal/paypal-server-sdk v2.4.0 for type-safe API access.
 *
 * Key differences from Stripe:
 * - Charges use the Orders API v2 (create order → approve → capture)
 * - Amounts are decimal strings ("29.99"), not integers (2999)
 * - Refunds target capture IDs, not order IDs
 * - Subscriptions use a Plan + Subscription two-step flow
 * - Webhook verification uses PayPal's postback API (verify-webhook-signature)
 */
export class PayPalAdapter implements PaymentAdapter {
  readonly name = 'paypal';
  readonly capabilities: ProviderCapabilities = {
    charges: true,
    authAndCapture: true,
    refunds: true,
    partialRefunds: true,
    subscriptions: true,
    savedPaymentMethods: true,
    hostedCheckout: true,
    embeddableUI: true, // PayPal JS SDK renders embeddable buttons and card fields
    payouts: true,
    multiCurrency: true,
    directDebit: false,
    webhooks: true,
    threeDS: true,
  };

  private paypalClient!: Client;
  private ordersController!: OrdersController;
  private paymentsController!: PaymentsController;
  private vaultController!: VaultController;
  private subscriptionsController!: SubscriptionsController;
  private isSandbox = true;

  constructor(credentials?: ProviderCredentials) {
    if (credentials?.clientId && credentials?.clientSecret) {
      this.initializeClient(credentials);
    }
  }

  async initialize(credentials: ProviderCredentials): Promise<void> {
    if (!credentials.clientId || !credentials.clientSecret) {
      const missing = [];
      if (!credentials.clientId) missing.push('clientId (set PAYPAL_CLIENT_ID in your environment)');
      if (!credentials.clientSecret) missing.push('clientSecret (set PAYPAL_CLIENT_SECRET in your environment)');
      throw new Error(
        `Missing credentials for PayPal adapter: ${missing.join(', ')}. ` +
        'Pass { clientId: "...", clientSecret: "..." } in credentials.',
      );
    }
    this.initializeClient(credentials);
  }

  private initializeClient(credentials: ProviderCredentials): void {
    this.isSandbox = credentials.sandbox !== 'false';
    this.paypalClient = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: credentials.clientId || '',
        oAuthClientSecret: credentials.clientSecret || '',
      },
      environment: this.isSandbox ? Environment.Sandbox : Environment.Production,
    });

    // Initialize controllers
    this.ordersController = new OrdersController(this.paypalClient);
    this.paymentsController = new PaymentsController(this.paypalClient);
    this.vaultController = new VaultController(this.paypalClient);
    this.subscriptionsController = new SubscriptionsController(this.paypalClient);
  }

  private get baseUrl(): string {
    return this.isSandbox
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';
  }

  async healthCheck(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      // Make a simple API call to verify connectivity
      // Use the orders controller to check if we can authenticate
      await this.paypalClient.clientCredentialsAuthManager.fetchToken();
      return { healthy: true, latencyMs: Date.now() - start };
    } catch {
      return { healthy: false, latencyMs: Date.now() - start, message: 'PayPal API unreachable' };
    }
  }

  private wrap<T>(fn: () => Promise<T>): Promise<T> {
    return fn().catch((err) => {
      if (err instanceof ApiError) {
        // Map PayPal SDK ApiError to our PaymentError
        throw mapPayPalError({
          statusCode: err.statusCode || 500,
          errorName: err.name || 'UNKNOWN_ERROR',
          message: err.message,
          details: (err.result as any)?.details,
        });
      }
      throw err;
    });
  }

  /**
   * Convert smallest-unit integer (2999) to PayPal decimal string ("29.99").
   */
  private toPayPalAmount(amount: number, currency: string): string {
    if (ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())) {
      return String(amount);
    }
    return (amount / 100).toFixed(2);
  }

  // ─── Charges (Orders API v2) ──────────────────────────────────

  charges: ChargeOperations = {
    create: (params: CreateChargeParams) =>
      this.wrap(async () => {
        const currency = params.currency.toUpperCase();
        const orderRequest: OrderRequest = {
          intent: params.capture === false ? CheckoutPaymentIntent.Authorize : CheckoutPaymentIntent.Capture,
          purchaseUnits: [
            {
              amount: {
                currencyCode: currency,
                value: this.toPayPalAmount(params.amount, currency),
              },
              description: params.description,
              customId: params.metadata ? JSON.stringify(params.metadata) : undefined,
            },
          ],
          paymentSource: params.source
            ? { paypal: { vaultId: params.source } }
            : undefined,
        };

        const { result: order } = await this.ordersController.createOrder({
          body: orderRequest,
          paypalRequestId: params.idempotencyKey,
        });
        return mapPayPalOrderToCharge(order);
      }),

    retrieve: (id: string) =>
      this.wrap(async () => {
        const { result: order } = await this.ordersController.getOrder({ id });
        return mapPayPalOrderToCharge(order);
      }),

    capture: (id: string, params?: CaptureParams) =>
      this.wrap(async () => {
        if (params?.amount) {
          // Partial capture — only possible on authorizations (AUTHORIZE intent).
          // The id should be an authorization ID. We capture via Payments v2 API
          // which supports specifying a partial amount.
          const { result: order } = await this.ordersController.getOrder({ id });
          const currency = order.purchaseUnits?.[0]?.amount?.currencyCode ?? 'USD';
          const authId =
            order.purchaseUnits?.[0]?.payments?.authorizations?.[0]?.id;

          if (!authId) {
            throw new Error(
              'Cannot perform partial capture: no authorization found on this order. ' +
              'Partial captures require AUTHORIZE intent.',
            );
          }

          await this.paymentsController.captureAuthorizedPayment({
            authorizationId: authId,
            body: {
              amount: {
                currencyCode: currency,
                value: this.toPayPalAmount(params.amount, currency),
              },
              finalCapture: true,
            },
          });

          // Re-fetch the order to return a full UnifiedCharge
          const { result: updatedOrder } = await this.ordersController.getOrder({ id });
          return mapPayPalOrderToCharge(updatedOrder);
        }

        // Full capture — use Orders v2 captureOrder
        const { result: order } = await this.ordersController.captureOrder({
          id,
        });
        return mapPayPalOrderToCharge(order);
      }),

    cancel: (_id: string, _options?: RequestOptions) => {
      throw new NotSupportedError('paypal', 'charges.cancel');
    },

    list: (_params?: ListParams) => {
      // PayPal Orders API v2 does not support listing orders
      throw new NotSupportedError('paypal', 'charges.list');
    },
  };

  // ─── Refunds ──────────────────────────────────────────────────

  refunds: RefundOperations = {
    create: (params: CreateRefundParams) =>
      this.wrap(async () => {
        // PayPal refunds target a capture ID, not an order ID.
        // The chargeId should be the capture ID.
        const captureId = params.chargeId;

        let body: RefundRequest | undefined;

        if (params.amount) {
          // Partial refund — fetch the capture to get the actual currency,
          // since PayPal requires currency_code to match the original capture.
          const { result: capture } = await this.paymentsController.getCapturedPayment({
            captureId,
          });
          const currency = capture.amount?.currencyCode ?? 'USD';
          body = {
            amount: {
              currencyCode: currency,
              value: this.toPayPalAmount(params.amount, currency),
            },
            noteToPayer: params.reason,
          };
        } else if (params.reason) {
          // Full refund with a reason — no amount needed
          body = { noteToPayer: params.reason };
        }
        // else: full refund with no body — PayPal refunds the full capture amount

        const { result: refund } = await this.paymentsController.refundCapturedPayment({
          captureId,
          paypalRequestId: params.idempotencyKey,
          body,
        });
        return mapPayPalRefund(refund, captureId);
      }),

    retrieve: (id: string) =>
      this.wrap(async () => {
        const { result: refund } = await this.paymentsController.getRefund({ refundId: id });
        return mapPayPalRefund(refund);
      }),

    list: (_params?: ListParams) => {
      // PayPal does not have a refunds listing endpoint
      throw new NotSupportedError('paypal', 'refunds.list');
    },
  };

  // ─── Customers ────────────────────────────────────────────────
  // NOTE: PayPal does not have a separate customers API like Stripe.
  // Customer references are just IDs used in subscriptions and vault tokens.

  customers: CustomerOperations = {
    create: (_params: CreateCustomerParams) => {
      throw new NotSupportedError('paypal', 'customers.create (PayPal has no customers API)');
    },

    retrieve: (_id: string) => {
      throw new NotSupportedError('paypal', 'customers.retrieve (PayPal has no customers API)');
    },

    update: (_id: string, _params: UpdateCustomerParams) => {
      throw new NotSupportedError('paypal', 'customers.update (PayPal has no customers API)');
    },

    delete: (_id: string) => {
      throw new NotSupportedError('paypal', 'customers.delete (PayPal has no customers API)');
    },

    list: (_params?: ListParams) => {
      throw new NotSupportedError('paypal', 'customers.list (PayPal has no customers API)');
    },
  };

  // ─── Payment Methods (Vault Tokens) ──────────────────────────

  paymentMethods: PaymentMethodOperations = {
    create: (params: CreatePaymentMethodParams) =>
      this.wrap(async () => {
        // PayPal vault tokens are created from setup tokens
        const { result: token } = await this.vaultController.createPaymentToken({
          body: {
            paymentSource: {
              token: {
                id: params.token || '',
                type: VaultTokenRequestType.SetupToken,
              },
            },
            customer: params.customerId ? { id: params.customerId } : undefined,
          },
          paypalRequestId: params.metadata?.idempotencyKey as string,
        });
        return mapPayPalPaymentMethod(token);
      }),

    retrieve: (id: string) =>
      this.wrap(async () => {
        const { result: token } = await this.vaultController.getPaymentToken(id);
        return mapPayPalPaymentMethod(token);
      }),

    attach: (_paymentMethodId: string, _customerId: string) => {
      // PayPal vault tokens are associated at creation time
      throw new NotSupportedError('paypal', 'paymentMethods.attach');
    },

    detach: (paymentMethodId: string) =>
      this.wrap(async () => {
        await this.vaultController.deletePaymentToken(paymentMethodId);
      }),

    list: (customerId: string) =>
      this.wrap(async () => {
        const { result } = await this.vaultController.listCustomerPaymentTokens({ customerId });
        return (result.paymentTokens ?? []).map(mapPayPalPaymentMethod);
      }),
  };

  // ─── Webhooks ─────────────────────────────────────────────────
  //
  // PayPal uses RSA-SHA256 certificate-based webhook signing, which cannot be
  // verified synchronously without downloading certificates. The synchronous
  // `verify()` method performs structural header validation only.
  //
  // For cryptographic verification, use `verifyWebhookAsync()` which calls
  // PayPal's POST /v1/notifications/verify-webhook-signature endpoint.
  //
  // Recommended usage:
  //   const isValid = await adapter.verifyWebhookAsync(payload, headers, webhookId);
  //   if (isValid) {
  //     const event = adapter.webhooks.parse(payload, headers, webhookId);
  //   }

  /** Required headers that PayPal sends with every webhook transmission. */
  private static readonly REQUIRED_WEBHOOK_HEADERS = [
    'paypal-transmission-id',
    'paypal-transmission-time',
    'paypal-transmission-sig',
    'paypal-cert-url',
    'paypal-auth-algo',
  ] as const;

  webhooks: WebhookOperations = {
    /**
     * Structural validation only — checks that all required PayPal webhook
     * headers are present and non-empty. Does NOT perform cryptographic
     * signature verification (PayPal requires an async API call for that).
     *
     * For full verification, use `adapter.verifyWebhookAsync()` instead.
     *
     * @param secret — The webhook ID from PayPal dashboard (not a signing secret).
     */
    verify: (_payload: string | Buffer, headers: Record<string, string>, _secret: string): boolean => {
      try {
        for (const header of PayPalAdapter.REQUIRED_WEBHOOK_HEADERS) {
          if (!headers[header]) return false;
        }
        return true;
      } catch {
        return false;
      }
    },

    /**
     * Parse a PayPal webhook payload into a unified event.
     *
     * Performs structural header validation before parsing. For cryptographic
     * signature verification, call `adapter.verifyWebhookAsync()` before this.
     *
     * @param secret — The webhook ID from PayPal dashboard.
     */
    parse: (payload: string | Buffer, headers: Record<string, string>, secret: string) => {
      const body = typeof payload === 'string' ? payload : payload.toString();

      // Structural validation — ensures required headers are present
      const isValid = this.webhooks.verify(payload, headers, secret);
      if (!isValid) {
        throw new Error(
          'Invalid PayPal webhook: missing required headers. ' +
          'Expected: paypal-transmission-id, paypal-transmission-time, ' +
          'paypal-transmission-sig, paypal-cert-url, paypal-auth-algo.',
        );
      }

      const parsed: PayPalWebhookEvent = JSON.parse(body);
      const mapped = mapPayPalWebhookEvent(parsed);
      if (!mapped) {
        return {
          id: parsed.id,
          provider: 'paypal',
          type: parsed.event_type as never,
          providerType: parsed.event_type,
          data: parsed.resource,
          createdAt: new Date(parsed.create_time),
          _raw: parsed,
        };
      }
      return mapped;
    },
  };

  /**
   * Verify a PayPal webhook signature using PayPal's postback API.
   *
   * Calls POST /v1/notifications/verify-webhook-signature to delegate
   * verification to PayPal's servers. This is the recommended approach
   * for production webhook handling.
   *
   * @param payload  — Raw request body (must not be parsed/re-serialized).
   * @param headers  — HTTP headers from the webhook request.
   * @param webhookId — The webhook ID from your PayPal dashboard.
   * @returns `true` if PayPal confirms the signature is valid.
   */
  async verifyWebhookAsync(
    payload: string | Buffer,
    headers: Record<string, string>,
    webhookId: string,
  ): Promise<boolean> {
    try {
      const body = typeof payload === 'string' ? payload : payload.toString();
      const token = await this.paypalClient.clientCredentialsAuthManager.fetchToken();

      const response = await fetch(
        `${this.baseUrl}/v1/notifications/verify-webhook-signature`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.accessToken}`,
          },
          body: JSON.stringify({
            auth_algo: headers['paypal-auth-algo'] ?? '',
            cert_url: headers['paypal-cert-url'] ?? '',
            transmission_id: headers['paypal-transmission-id'] ?? '',
            transmission_sig: headers['paypal-transmission-sig'] ?? '',
            transmission_time: headers['paypal-transmission-time'] ?? '',
            webhook_id: webhookId,
            webhook_event: JSON.parse(body),
          }),
        },
      );

      if (!response.ok) return false;

      const result = (await response.json()) as { verification_status?: string };
      return result.verification_status === 'SUCCESS';
    } catch {
      return false;
    }
  }

  // ─── Subscriptions (Billing API) ──────────────────────────────

  /**
   * Ensure a PayPal Catalog Product exists for subscription billing plans.
   *
   * If `metadata.productId` is provided, uses that directly.
   * Otherwise, creates a product via the Catalog Products API (not in the SDK).
   */
  private async ensureProduct(metadata?: Record<string, string>): Promise<string> {
    if (metadata?.productId) return metadata.productId;

    const token = await this.paypalClient.clientCredentialsAuthManager.fetchToken();
    const response = await fetch(`${this.baseUrl}/v1/catalogs/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify({
        name: metadata?.productName || 'PayKit Subscription',
        type: 'SERVICE',
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      let parsed: any;
      try { parsed = JSON.parse(body); } catch { parsed = {}; }
      throw mapPayPalError({
        statusCode: response.status,
        errorName: parsed?.name || 'INTERNAL_SERVER_ERROR',
        message: parsed?.message || `Failed to create PayPal catalog product: ${response.status} ${body}`,
        details: parsed?.details,
      });
    }

    const product = (await response.json()) as { id: string };
    return product.id;
  }

  subscriptions: SubscriptionOperations = {
    create: (params: CreateSubscriptionParams) =>
      this.wrap(async () => {
        const currency = params.currency.toUpperCase();

        // Step 1: Ensure a catalog product exists
        const productId = await this.ensureProduct(params.metadata);

        // Step 2: Create a billing plan
        const { result: plan } = await this.subscriptionsController.createBillingPlan({
          body: {
            productId,
            name: params.metadata?.planName || 'Subscription Plan',
            description: params.metadata?.planDescription,
            billingCycles: [
              {
                tenureType: TenureType.Regular,
                sequence: 1,
                totalCycles: 0, // Infinite
                frequency: {
                  intervalUnit: params.interval.toUpperCase() as any,
                  intervalCount: params.intervalCount ?? 1,
                },
                pricingScheme: {
                  fixedPrice: {
                    currencyCode: currency,
                    value: this.toPayPalAmount(params.amount, currency),
                  },
                },
              },
            ],
            paymentPreferences: {
              autoBillOutstanding: true,
            },
          },
        });

        // Step 3: Create the subscription
        // returnUrl/cancelUrl are required for PayPal's approval redirect flow.
        const returnUrl = params.metadata?.returnUrl;
        const cancelUrl = params.metadata?.cancelUrl;
        if (!returnUrl || !cancelUrl) {
          throw new PaymentError({
            code: 'invalid_request',
            message: 'PayPal subscriptions require returnUrl and cancelUrl in metadata',
            provider: 'paypal',
            isRetryable: false,
          });
        }

        const { result: sub } = await this.subscriptionsController.createSubscription({
          body: {
            planId: plan.id || '',
            subscriber: params.customer
              ? { payerId: params.customer }
              : undefined,
            applicationContext: {
              returnUrl,
              cancelUrl,
            },
          },
        });

        return mapPayPalSubscription(sub, plan);
      }),

    retrieve: (id: string) =>
      this.wrap(async () => {
        const { result: sub } = await this.subscriptionsController.getSubscription({ id });
        // Try to get the plan details too
        let plan;
        if (sub.planId) {
          try {
            const { result: planResult } = await this.subscriptionsController.getBillingPlan(sub.planId);
            plan = planResult;
          } catch {
            // Plan fetch failed, continue without it
          }
        }
        return mapPayPalSubscription(sub, plan);
      }),

    update: (_id: string, _params: UpdateSubscriptionParams) =>
      this.wrap(async () => {
        // PayPal subscription update is complex and requires plan modification
        // For now, throw NotSupportedError - implement when needed
        throw new NotSupportedError('paypal', 'subscriptions.update (complex - requires plan modification)');
      }),

    cancel: (id: string, params?: CancelSubscriptionParams) =>
      this.wrap(async () => {
        const reason = 'Canceled via PayKit';

        if (params?.cancelAtPeriodEnd) {
          // PayPal has no direct "cancel at period end". The closest equivalent
          // is suspending the subscription, which stops future billing while
          // keeping it active until the current period ends.
          await this.subscriptionsController.suspendSubscription({
            id,
            body: { reason },
          });
        } else {
          await this.subscriptionsController.cancelSubscription({
            id,
            body: { reason },
          });
        }

        const { result: sub } = await this.subscriptionsController.getSubscription({ id });
        return mapPayPalSubscription(sub);
      }),

    list: (params?: ListParams) =>
      this.wrap(async () => {
        const { result } = await this.subscriptionsController.listSubscriptions({
          pageSize: params?.limit ?? 10,
        });
        // Map each subscription (without plan details for list view)
        const data = (result.subscriptions ?? []).map((sub) => mapPayPalSubscription(sub));
        return {
          data,
          hasMore: (result.links ?? []).some((link) => link.rel === 'next'),
        };
      }),
  };
}
