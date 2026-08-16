'use server';

import { StripeAdapter } from '@squaredr/paykit/stripe';
import { RazorpayAdapter } from '@squaredr/paykit/razorpay';
import { PayPalAdapter } from '@squaredr/paykit/paypal';
import {
  PaymentError,
  UnifiedPayments,
  getCurrencyInfo as _getCurrencyInfo,
  toSmallestUnit,
  fromSmallestUnit,
  ERROR_SUGGESTIONS,
} from '@squaredr/paykit';
import type { PaymentAdapter, RequestContext, ResponseContext, ErrorContext } from '@squaredr/paykit';
import type { PaymentErrorCode } from '@squaredr/paykit';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProviderStatusResult {
  provider: string;
  configured: boolean;
  health?: { healthy: boolean; latencyMs?: number; message?: string };
  capabilities?: Record<string, boolean>;
  error?: string;
}

export interface OperationResult {
  success: boolean;
  data?: unknown;
  meta?: unknown;
  raw?: unknown;
  error?: {
    code: string;
    message: string;
    provider?: string;
    providerCode?: string;
    suggestion?: string;
    isRetryable?: boolean;
  };
  durationMs: number;
}

export interface CurrencyConvertResult {
  input: number;
  currency: string;
  smallestUnit: number;
  displayAmount: number;
  info: { code: string; symbol: string; name: string; decimalPlaces: number } | null;
}

export interface ErrorCatalogEntry {
  code: string;
  suggestion: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getProviderEnv(provider: string): Record<string, string | undefined> {
  switch (provider) {
    case 'stripe':
      return {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      };
    case 'razorpay':
      return {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
      };
    case 'paypal':
      return {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      };
    default:
      return {};
  }
}

function isConfigured(provider: string): boolean {
  const env = getProviderEnv(provider);
  switch (provider) {
    case 'stripe':
      return !!env.secretKey;
    case 'razorpay':
      return !!env.keyId && !!env.keySecret;
    case 'paypal':
      return !!env.clientId && !!env.clientSecret;
    default:
      return false;
  }
}

async function createAdapter(provider: string): Promise<PaymentAdapter> {
  const env = getProviderEnv(provider);

  switch (provider) {
    case 'stripe': {
      const adapter = new StripeAdapter();
      await adapter.initialize({ secretKey: env.secretKey! });
      return adapter;
    }
    case 'razorpay': {
      const adapter = new RazorpayAdapter();
      await adapter.initialize({ keyId: env.keyId!, keySecret: env.keySecret! });
      return adapter;
    }
    case 'paypal': {
      const adapter = new PayPalAdapter();
      const sandbox = process.env.PAYPAL_SANDBOX !== 'false' ? 'true' : 'false';
      await adapter.initialize({ clientId: env.clientId!, clientSecret: env.clientSecret!, sandbox });
      return adapter;
    }
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

function sanitize(value: unknown): unknown {
  // JSON-safe deep clone — strips non-serializable values (functions, undefined, etc.)
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

export async function getProviderStatuses(): Promise<ProviderStatusResult[]> {
  const providers = ['stripe', 'razorpay', 'paypal'];
  const results: ProviderStatusResult[] = [];

  for (const provider of providers) {
    const configured = isConfigured(provider);
    if (!configured) {
      results.push({ provider, configured });
      continue;
    }

    try {
      const adapter = await createAdapter(provider);
      const health = await adapter.healthCheck();
      results.push({
        provider,
        configured,
        health,
        capabilities: adapter.capabilities as unknown as Record<string, boolean>,
      });
    } catch (err) {
      results.push({
        provider,
        configured,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}

export async function executeOperation(
  provider: string,
  resource: string,
  operation: string,
  params: Record<string, unknown>,
): Promise<OperationResult> {
  if (!isConfigured(provider)) {
    return {
      success: false,
      error: { code: 'not_configured', message: `${provider} is not configured. Set env vars.` },
      durationMs: 0,
    };
  }

  const start = Date.now();

  try {
    const adapter = await createAdapter(provider);

    // Route to the correct operation
    const result = await routeOperation(adapter, resource, operation, params);
    const durationMs = Date.now() - start;

    // Separate _meta and _raw from the result
    const data = sanitize(result);
    let meta: unknown = undefined;
    let raw: unknown = undefined;

    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const d = data as Record<string, unknown>;
      meta = d._meta;
      raw = d._raw;
      delete d._meta;
      delete d._raw;
    }

    return { success: true, data, meta, raw, durationMs };
  } catch (err) {
    const durationMs = Date.now() - start;

    if (err instanceof PaymentError) {
      return {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          provider: err.provider,
          providerCode: err.providerCode,
          suggestion: err.suggestion,
          isRetryable: err.isRetryable,
        },
        durationMs,
      };
    }

    return {
      success: false,
      error: {
        code: 'unknown',
        message: err instanceof Error ? err.message : String(err),
      },
      durationMs,
    };
  }
}

async function routeOperation(
  adapter: PaymentAdapter,
  resource: string,
  operation: string,
  params: Record<string, unknown>,
): Promise<unknown> {
  switch (`${resource}.${operation}`) {
    // Charges
    case 'charges.create':
      return adapter.charges.create({
        amount: params.amount as number,
        currency: params.currency as string,
        description: params.description as string | undefined,
        metadata: params.metadata as Record<string, string> | undefined,
      });
    case 'charges.retrieve':
      return adapter.charges.retrieve(params.id as string);
    case 'charges.capture':
      return adapter.charges.capture(params.id as string);
    case 'charges.cancel':
      return adapter.charges.cancel(params.id as string);
    case 'charges.list':
      return adapter.charges.list({ limit: params.limit as number | undefined });

    // Refunds
    case 'refunds.create':
      return adapter.refunds.create({
        chargeId: params.chargeId as string,
        amount: params.amount as number | undefined,
        reason: params.reason as string | undefined,
      });
    case 'refunds.retrieve':
      return adapter.refunds.retrieve(params.id as string);
    case 'refunds.list':
      return adapter.refunds.list({ limit: params.limit as number | undefined });

    // Customers
    case 'customers.create':
      return adapter.customers.create({
        email: params.email as string | undefined,
        name: params.name as string | undefined,
        metadata: params.metadata as Record<string, string> | undefined,
      });
    case 'customers.retrieve':
      return adapter.customers.retrieve(params.id as string);
    case 'customers.update':
      return adapter.customers.update(params.id as string, {
        email: params.email as string | undefined,
        name: params.name as string | undefined,
        metadata: params.metadata as Record<string, string> | undefined,
      });
    case 'customers.delete':
      return adapter.customers.delete(params.id as string);
    case 'customers.list':
      return adapter.customers.list({ limit: params.limit as number | undefined });

    // Subscriptions
    case 'subscriptions.create':
      if (!adapter.subscriptions) throw new Error(`${adapter.name} does not support subscriptions`);
      return adapter.subscriptions.create({
        customer: params.customer as string,
        amount: params.amount as number,
        currency: params.currency as string,
        interval: params.interval as 'day' | 'week' | 'month' | 'year',
        intervalCount: params.intervalCount as number | undefined,
        metadata: params.metadata as Record<string, string> | undefined,
      });
    case 'subscriptions.retrieve':
      if (!adapter.subscriptions) throw new Error(`${adapter.name} does not support subscriptions`);
      return adapter.subscriptions.retrieve(params.id as string);
    case 'subscriptions.cancel':
      if (!adapter.subscriptions) throw new Error(`${adapter.name} does not support subscriptions`);
      return adapter.subscriptions.cancel(params.id as string);
    case 'subscriptions.list':
      if (!adapter.subscriptions) throw new Error(`${adapter.name} does not support subscriptions`);
      return adapter.subscriptions.list({ limit: params.limit as number | undefined });

    default:
      throw new Error(`Unknown operation: ${resource}.${operation}`);
  }
}

export async function convertCurrency(
  amount: number,
  currency: string,
): Promise<CurrencyConvertResult> {
  const info = _getCurrencyInfo(currency);
  const smallestUnit = toSmallestUnit(amount, currency);
  const displayAmount = fromSmallestUnit(smallestUnit, currency);

  return {
    input: amount,
    currency: currency.toUpperCase(),
    smallestUnit,
    displayAmount,
    info: info
      ? { code: info.code, symbol: info.symbol, name: info.name, decimalPlaces: info.decimalPlaces }
      : null,
  };
}

export async function getErrorCatalog(): Promise<ErrorCatalogEntry[]> {
  return Object.entries(ERROR_SUGGESTIONS).map(([code, suggestion]) => ({
    code,
    suggestion,
  }));
}

// ---------------------------------------------------------------------------
// Retry Inspector
// ---------------------------------------------------------------------------

export interface HookEvent {
  type: 'request' | 'response' | 'error';
  timestamp: number;
  data: Record<string, unknown>;
}

export interface RetryInspectorResult {
  success: boolean;
  data?: unknown;
  error?: { code: string; message: string };
  events: HookEvent[];
  totalDurationMs: number;
}

export async function executeWithRetryInspector(
  provider: string,
  retries: number,
  retryDelay: number,
): Promise<RetryInspectorResult> {
  if (!isConfigured(provider)) {
    return {
      success: false,
      error: { code: 'not_configured', message: `${provider} is not configured` },
      events: [],
      totalDurationMs: 0,
    };
  }

  const events: HookEvent[] = [];
  const startTime = Date.now();

  try {
    const adapter = await createAdapter(provider);
    const paykit = new UnifiedPayments({
      adapter,
      options: {
        retries,
        retryDelay,
        logging: 'debug',
        onRequest: (ctx: RequestContext) => {
          events.push({
            type: 'request',
            timestamp: Date.now() - startTime,
            data: {
              operation: ctx.operation,
              provider: ctx.provider,
              requestId: ctx.requestId,
            },
          });
        },
        onResponse: (ctx: ResponseContext) => {
          events.push({
            type: 'response',
            timestamp: Date.now() - startTime,
            data: {
              operation: ctx.operation,
              provider: ctx.provider,
              durationMs: ctx.durationMs,
              requestId: ctx.requestId,
            },
          });
        },
        onError: (ctx: ErrorContext) => {
          events.push({
            type: 'error',
            timestamp: Date.now() - startTime,
            data: {
              operation: ctx.operation,
              provider: ctx.provider,
              attempt: ctx.attempt,
              willRetry: ctx.willRetry,
              durationMs: ctx.durationMs,
              error: ctx.error instanceof Error ? ctx.error.message : String(ctx.error),
            },
          });
        },
      },
    } as any);

    // Run a simple list operation — safe, read-only
    const result = await paykit.charges.list({ limit: 1 });
    const totalDurationMs = Date.now() - startTime;

    return {
      success: true,
      data: sanitize(result),
      events,
      totalDurationMs,
    };
  } catch (err) {
    const totalDurationMs = Date.now() - startTime;
    return {
      success: false,
      error: {
        code: err instanceof PaymentError ? err.code : 'unknown',
        message: err instanceof Error ? err.message : String(err),
      },
      events,
      totalDurationMs,
    };
  }
}
