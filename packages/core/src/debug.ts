import type { PaymentAdapter, HealthStatus } from './adapter.js';
import type { ProviderCapabilities } from './capabilities.js';

/**
 * Provider info returned by getProviderInfo() and debug().
 */
export interface ProviderInfo {
  name: string;
  capabilities: ProviderCapabilities;
  health?: HealthStatus;
}

/**
 * Get structured info about an adapter — name, capabilities, and optional health status.
 */
export async function getProviderInfo(adapter: PaymentAdapter): Promise<ProviderInfo> {
  let health: HealthStatus | undefined;
  try {
    health = await adapter.healthCheck();
  } catch {
    health = { healthy: false, message: 'healthCheck() threw an error' };
  }
  return {
    name: adapter.name,
    capabilities: adapter.capabilities,
    health,
  };
}

/**
 * Print a human-readable debug summary of an adapter to the console.
 *
 * @example
 * import { debug } from '@squaredr/paykit';
 * await debug(stripeAdapter);
 * // Provider: stripe
 * // Health: healthy (42ms)
 * // Capabilities: charges, refunds, subscriptions, ...
 */
export async function debug(adapter: PaymentAdapter): Promise<string> {
  const info = await getProviderInfo(adapter);

  const healthStr = info.health
    ? info.health.healthy
      ? `healthy${info.health.latencyMs ? ` (${info.health.latencyMs}ms)` : ''}`
      : `unhealthy${info.health.message ? ` — ${info.health.message}` : ''}`
    : 'unknown';

  const caps = Object.entries(info.capabilities)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(', ');

  const output = [
    `Provider: ${info.name}`,
    `Health: ${healthStr}`,
    `Capabilities: ${caps}`,
  ].join('\n');

  return output;
}
