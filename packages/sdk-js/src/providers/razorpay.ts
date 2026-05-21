import { loadScript } from '../script-loader.js';
import { registerBridge } from './registry.js';
import type { ProviderBridge } from './provider-bridge.js';
import type {
  MountOptions,
  TokenizeResult,
  PaymentConfirmResult,
  AppearanceConfig,
  ClientEventType,
  ClientEventListener,
  ClientEvent,
} from '../types.js';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export class RazorpayProviderBridge implements ProviderBridge {
  readonly name = 'razorpay';

  private ready = false;
  private rzpInstance: any = null;
  private container: HTMLElement | null = null;
  private listeners = new Map<ClientEventType, Set<ClientEventListener>>();

  constructor(
    private publicKey: string,
    private appearance?: AppearanceConfig,
  ) {}

  async loadScript(): Promise<void> {
    await loadScript({ src: RAZORPAY_SCRIPT_URL, globalName: 'Razorpay' });
    this.ready = true;
  }

  isReady(): boolean {
    return this.ready;
  }

  async mount(container: HTMLElement, _options?: MountOptions): Promise<void> {
    if (!this.ready) {
      await this.loadScript();
    }

    this.container = container;
    // Razorpay uses a modal, not an inline iframe.
    // We render a placeholder indicating the modal will open on submit.
    container.setAttribute('data-paykit-provider', 'razorpay');
    container.innerHTML = '<div data-paykit-razorpay-placeholder>Razorpay Checkout will open on submit</div>';

    this.emit({ type: 'ready' });
  }

  unmount(): void {
    if (this.container) {
      this.container.innerHTML = '';
      this.container.removeAttribute('data-paykit-provider');
      this.container = null;
    }
  }

  async tokenize(): Promise<TokenizeResult> {
    if (!this.ready) {
      throw new Error('Razorpay not loaded. Call loadScript() first.');
    }

    return new Promise<TokenizeResult>((resolve, reject) => {
      const options = {
        key: this.publicKey,
        handler: (response: any) => {
          resolve({
            token: response.razorpay_payment_id,
            paymentMethodType: 'card' as const,
          });
        },
        modal: {
          ondismiss: () => {
            reject({ code: 'user_cancelled', message: 'Payment cancelled by user', isRetryable: false });
          },
        },
        theme: this.mapTheme(),
      };

      this.rzpInstance = new (window as any).Razorpay(options);
      this.emit({ type: 'loading_start' });
      this.rzpInstance.open();
    });
  }

  async confirmPayment(clientSecret: string, _options?: { returnUrl?: string }): Promise<PaymentConfirmResult> {
    if (!this.ready) {
      throw new Error('Razorpay not loaded. Call loadScript() first.');
    }

    // For Razorpay, clientSecret is the order_id
    return new Promise<PaymentConfirmResult>((resolve) => {
      const options = {
        key: this.publicKey,
        order_id: clientSecret,
        handler: (response: any) => {
          this.emit({ type: 'loading_end' });
          resolve({
            status: 'succeeded' as const,
            chargeId: response.razorpay_payment_id,
          });
        },
        modal: {
          ondismiss: () => {
            this.emit({ type: 'loading_end' });
            resolve({ status: 'canceled' as const });
          },
          confirm_close: true,
        },
        theme: this.mapTheme(),
      };

      this.rzpInstance = new (window as any).Razorpay(options);
      this.emit({ type: 'loading_start' });
      this.rzpInstance.open();
    });
  }

  updateAppearance(appearance: AppearanceConfig): void {
    this.appearance = appearance;
  }

  on(event: ClientEventType, listener: ClientEventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: ClientEventType, listener: ClientEventListener): void {
    this.listeners.get(event)?.delete(listener);
  }

  destroy(): void {
    this.unmount();
    if (this.rzpInstance) {
      this.rzpInstance.close?.();
      this.rzpInstance = null;
    }
    this.listeners.clear();
  }

  private emit(event: ClientEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }

  private mapTheme(): any {
    if (!this.appearance?.variables) return {};
    return {
      color: this.appearance.variables.colorPrimary,
      backdrop_color: this.appearance.variables.colorBackground,
    };
  }
}

// Self-register the bridge
registerBridge('razorpay', (publicKey, appearance) => new RazorpayProviderBridge(publicKey, appearance));

export { RazorpayProviderBridge as default };
