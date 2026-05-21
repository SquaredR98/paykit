import type { RoutingConfig, RoutingRule } from './types/config.js';

/**
 * Context passed to the router to determine which provider to use.
 */
export interface RoutingContext {
  currency?: string;
  region?: string;
  paymentMethod?: string;
  _provider?: string;
}

/**
 * Resolve which provider to use based on routing rules.
 *
 * Priority:
 * 1. Explicit `_provider` override (developer forced a specific provider)
 * 2. First matching routing rule (checked in order)
 * 3. Default provider
 */
export function resolveProvider(config: RoutingConfig, context: RoutingContext): string {
  // Explicit override takes highest priority
  if (context._provider) {
    return context._provider;
  }

  // Check rules in order — first match wins
  for (const rule of config.rules) {
    if (matchesRule(rule, context)) {
      return rule.provider;
    }
  }

  // Fall back to default
  return config.default;
}

function matchesRule(rule: RoutingRule, context: RoutingContext): boolean {
  if (rule.currency && context.currency) {
    if (rule.currency.toUpperCase() !== context.currency.toUpperCase()) {
      return false;
    }
  } else if (rule.currency && !context.currency) {
    return false;
  }

  if (rule.region && context.region) {
    if (rule.region.toLowerCase() !== context.region.toLowerCase()) {
      return false;
    }
  } else if (rule.region && !context.region) {
    return false;
  }

  if (rule.paymentMethod && context.paymentMethod) {
    if (rule.paymentMethod.toLowerCase() !== context.paymentMethod.toLowerCase()) {
      return false;
    }
  } else if (rule.paymentMethod && !context.paymentMethod) {
    return false;
  }

  // At least one field must have matched (not an empty rule)
  return Boolean(rule.currency || rule.region || rule.paymentMethod);
}
