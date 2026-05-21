import { createBridge } from './providers/registry.js';
import type { ProviderBridge } from './providers/provider-bridge.js';
import type { ClientAdapter, MountOptions as CoreMountOptions, ConfirmPaymentOptions } from '@squaredr/paykit';
import type {
  PayKitClientConfig,
  MountOptions,
  TokenizeResult,
  PaymentConfirmResult,
  AppearanceConfig,
  ClientEventType,
  ClientEventListener,
} from './types.js';

/**
 * Wraps a ClientAdapter to conform to the legacy ProviderBridge interface,
 * so the rest of PayKitClient doesn't need two code paths for every method.
 */
class ClientAdapterBridge implements ProviderBridge {
  get name(): string {
    return this.adapter.provider;
  }

  constructor(private adapter: ClientAdapter) {}

  loadScript(): Promise<void> {
    return this.adapter.loadScript();
  }

  isReady(): boolean {
    return this.adapter.isReady();
  }

  async mount(container: HTMLElement, options?: MountOptions & { clientSecret?: string }): Promise<void> {
    const mountOpts: CoreMountOptions = {
      clientSecret: options?.clientSecret ?? '',
      appearance: options?.appearance,
      paymentMethodTypes: options?.paymentMethodTypes,
    };
    return this.adapter.mount(container, mountOpts);
  }

  unmount(): void {
    this.adapter.unmount();
  }

  async tokenize(): Promise<TokenizeResult> {
    // Provider-hosted mode doesn't support standalone tokenize.
    throw new Error('tokenize() is not supported in provider-hosted mode. Use confirmPayment() instead.');
  }

  async confirmPayment(clientSecret: string, options?: { returnUrl?: string }): Promise<PaymentConfirmResult> {
    const confirmOpts: ConfirmPaymentOptions = {
      clientSecret,
      returnUrl: options?.returnUrl,
    };
    return this.adapter.confirmPayment(confirmOpts);
  }

  updateAppearance(appearance: AppearanceConfig): void {
    this.adapter.updateAppearance(appearance);
  }

  on(event: ClientEventType, listener: ClientEventListener): void {
    this.adapter.on(event, listener);
  }

  off(event: ClientEventType, listener: ClientEventListener): void {
    this.adapter.off(event, listener);
  }

  destroy(): void {
    this.adapter.destroy();
  }
}

export class PayKitClient {
  private bridge: ProviderBridge;

  constructor(config: PayKitClientConfig) {
    if ('clientAdapter' in config) {
      this.bridge = new ClientAdapterBridge(config.clientAdapter);
    } else {
      this.bridge = createBridge(config.provider, config.publicKey, config.appearance);
    }
  }

  /** Load the provider's script without mounting any UI */
  async loadProvider(): Promise<void> {
    await this.bridge.loadScript();
  }

  /** Whether the provider script has loaded */
  get isReady(): boolean {
    return this.bridge.isReady();
  }

  /** Mount a secure card input into the given element or selector */
  async mountCardInput(target: string | HTMLElement, options?: MountOptions & { clientSecret?: string }): Promise<void> {
    const container = typeof target === 'string'
      ? document.querySelector<HTMLElement>(target)
      : target;

    if (!container) {
      throw new Error(`Element not found: ${target}`);
    }

    await this.bridge.mount(container, options);
  }

  /** Tokenize the payment info collected from the mounted input */
  async tokenize(): Promise<TokenizeResult> {
    return this.bridge.tokenize();
  }

  /** Confirm a payment, handling 3DS/modals/redirects */
  async confirmPayment(clientSecret: string, options?: { returnUrl?: string }): Promise<PaymentConfirmResult> {
    return this.bridge.confirmPayment(clientSecret, options);
  }

  /** Update the theme/appearance */
  updateAppearance(appearance: AppearanceConfig): void {
    this.bridge.updateAppearance(appearance);
  }

  /** Register an event listener */
  on(event: ClientEventType, listener: ClientEventListener): void {
    this.bridge.on(event, listener);
  }

  /** Remove an event listener */
  off(event: ClientEventType, listener: ClientEventListener): void {
    this.bridge.off(event, listener);
  }

  /** Clean up all resources */
  destroy(): void {
    this.bridge.destroy();
  }

  /** Access the underlying provider bridge for advanced use */
  get provider(): ProviderBridge {
    return this.bridge;
  }
}
