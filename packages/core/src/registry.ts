import type { PaymentAdapter } from './adapter.js';

/**
 * Adapter constructor type — adapters are classes that can be instantiated.
 */
export type AdapterConstructor = new () => PaymentAdapter;

/**
 * Internal registry — maps provider names to adapter constructors.
 */
const adapterRegistry = new Map<string, AdapterConstructor>();

/**
 * Register a payment adapter. Called by adapter packages on import.
 *
 * @example
 * // Inside @squaredr/paykit/stripe
 * import { registerAdapter } from '@squaredr/paykit';
 * registerAdapter('stripe', StripeAdapter);
 */
export function registerAdapter(name: string, constructor: AdapterConstructor): void {
  if (adapterRegistry.has(name)) {
    throw new Error(
      `Adapter "${name}" is already registered. ` +
      `Did you import the same adapter package twice?`,
    );
  }
  adapterRegistry.set(name, constructor);
}

/**
 * Get a registered adapter by name.
 * Returns undefined if not registered.
 */
export function getAdapter(name: string): AdapterConstructor | undefined {
  return adapterRegistry.get(name);
}

/**
 * Get all registered adapter names. Useful for debugging.
 */
export function getRegisteredAdapters(): string[] {
  return [...adapterRegistry.keys()];
}

/**
 * Clear the registry. Only used in tests.
 * @internal
 */
export function _clearRegistry(): void {
  adapterRegistry.clear();
}
