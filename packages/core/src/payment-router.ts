import type { PaymentAdapter } from './adapter.js';
import type { UnifiedCharge, CreateChargeParams } from './types/charge.js';
import type { ConstructWebhookParams, ExtendedWebhookOperations } from './client.js';
import type { UnifiedWebhookEvent } from './types/webhook.js';

/**
 * A routing rule that maps conditions to a specific adapter.
 */
export interface PaymentRoute {
  currency?: string;
  region?: string;
  adapter: PaymentAdapter;
}

/**
 * Configuration for the PaymentRouter.
 */
export interface PaymentRouterConfig {
  routes: PaymentRoute[];
  default: PaymentAdapter;
}

/**
 * PaymentRouter — route payments to different providers based on
 * currency, region, or explicit override.
 *
 * @example
 * const router = new PaymentRouter({
 *   routes: [
 *     { currency: 'INR', adapter: razorpay },
 *     { currency: 'USD', adapter: stripe },
 *   ],
 *   default: stripe,
 * });
 *
 * // Automatically picks Razorpay for INR, Stripe for USD
 * const charge = await router.createCharge({
 *   amount: 50000,
 *   currency: 'INR',
 * });
 */
export class PaymentRouter {
  private routes: PaymentRoute[];
  private defaultAdapter: PaymentAdapter;
  private adapterMap = new Map<string, PaymentAdapter>();

  constructor(config: PaymentRouterConfig) {
    this.routes = config.routes;
    this.defaultAdapter = config.default;

    // Index adapters by name for quick lookup
    this.adapterMap.set(config.default.name, config.default);
    for (const route of config.routes) {
      this.adapterMap.set(route.adapter.name, route.adapter);
    }
  }

  /**
   * Create a charge, routing to the correct provider based on
   * currency/region or explicit `_provider` override.
   */
  async createCharge(params: CreateChargeParams): Promise<UnifiedCharge> {
    const adapter = this.resolveAdapter(params._provider, params.currency);
    return adapter.charges.create(params);
  }

  /**
   * Get webhook operations for a specific provider.
   */
  webhooksFor(providerName: string): ExtendedWebhookOperations {
    const adapter = this.adapterMap.get(providerName);
    if (!adapter) {
      throw new Error(
        `No adapter registered in router for "${providerName}".`,
      );
    }
    return {
      verify: (payload, headers, secret) => adapter.webhooks.verify(payload, headers, secret),
      parse: (payload, headers, secret) => adapter.webhooks.parse(payload, headers, secret),
      construct: (params: ConstructWebhookParams): UnifiedWebhookEvent => {
        const headers: Record<string, string> = {};
        if (adapter.name === 'stripe') {
          headers['stripe-signature'] = params.signature;
        } else if (adapter.name === 'razorpay') {
          headers['x-razorpay-signature'] = params.signature;
        } else {
          headers['x-webhook-signature'] = params.signature;
          headers['x-signature'] = params.signature;
        }
        return adapter.webhooks.parse(params.payload, headers, params.secret);
      },
    };
  }

  /**
   * Resolve which adapter to use based on routing rules.
   */
  private resolveAdapter(explicitProvider?: string, currency?: string): PaymentAdapter {
    // Explicit override
    if (explicitProvider) {
      const adapter = this.adapterMap.get(explicitProvider);
      if (adapter) return adapter;
      throw new Error(`No adapter registered in router for "${explicitProvider}".`);
    }

    // Check rules in order — first match wins
    for (const route of this.routes) {
      if (route.currency && currency) {
        if (route.currency.toUpperCase() === currency.toUpperCase()) {
          return route.adapter;
        }
      }
    }

    // Fall back to default
    return this.defaultAdapter;
  }
}
