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
 *
 * @typeParam TProviders - Union of provider name strings, inferred from the adapters.
 */
export interface PaymentRouterConfig<TProviders extends string = string> {
  routes: PaymentRoute[];
  default: PaymentAdapter & { name: TProviders };
}

/**
 * Helper type to extract provider names from a PaymentRouterConfig.
 */
export type InferProviders<T extends PaymentRouterConfig> =
  | T['default']['name']
  | T['routes'][number]['adapter']['name'];

/**
 * PaymentRouter — route payments to different providers based on
 * currency, region, or explicit override.
 *
 * The `TProviders` type parameter is inferred from the adapters passed
 * in the config, giving you type-safe provider name checks on
 * `webhooksFor()` and `resolveAdapter()`.
 *
 * @typeParam TProviders - Union of provider name strings (inferred automatically).
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
export class PaymentRouter<TProviders extends string = string> {
  private routes: PaymentRoute[];
  private defaultAdapter: PaymentAdapter;
  private adapterMap = new Map<string, PaymentAdapter>();

  constructor(config: PaymentRouterConfig<TProviders>) {
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
    const adapter = this.resolveAdapter({ provider: params._provider, currency: params.currency });
    return adapter.charges.create(params);
  }

  /**
   * Get webhook operations for a specific provider.
   *
   * @param providerName - One of the provider names registered in this router.
   */
  webhooksFor(providerName: TProviders): ExtendedWebhookOperations {
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
   * Public so callers can preview routing decisions without creating a charge.
   *
   * @example
   * const adapter = router.resolveAdapter({ currency: 'INR' });
   * console.log(adapter.name); // 'razorpay'
   */
  resolveAdapter(options?: { provider?: TProviders | string; currency?: string; region?: string }): PaymentAdapter {
    const { provider: explicitProvider, currency, region } = options ?? {};

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
      if (route.region && region) {
        if (route.region.toLowerCase() === region.toLowerCase()) {
          return route.adapter;
        }
      }
    }

    // Fall back to default
    return this.defaultAdapter;
  }
}
