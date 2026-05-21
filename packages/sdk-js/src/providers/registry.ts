import type { ProviderBridge } from './provider-bridge.js';
import type { AppearanceConfig, SupportedProvider } from '../types.js';

export type BridgeFactory = (publicKey: string, appearance?: AppearanceConfig) => ProviderBridge;

const bridgeFactories = new Map<string, BridgeFactory>();

export function registerBridge(name: SupportedProvider, factory: BridgeFactory): void {
  bridgeFactories.set(name, factory);
}

export function createBridge(name: SupportedProvider, publicKey: string, appearance?: AppearanceConfig): ProviderBridge {
  const factory = bridgeFactories.get(name);
  if (!factory) {
    throw new Error(
      `No provider bridge registered for "${name}". ` +
      `Import "@squaredr/paykit-js/providers/${name}" to register it.`
    );
  }
  return factory(publicKey, appearance);
}
