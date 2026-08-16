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
  private mounted = false;
  private mounting = false;
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
    if (this.mounted) this.unmount();
    if (this.mounting) throw new Error('Mount already in progress');
    this.mounting = true;
    try {
      if (!this.ready) {
        await this.loadScript();
      }

      this.container = container;
      // Razorpay uses a modal, not an inline iframe.
      // We render a placeholder indicating the modal will open on submit.
      container.setAttribute('data-paykit-provider', 'razorpay');
      const placeholder = document.createElement('div');
      placeholder.dataset.paykitRazorpayPlaceholder = '';
      placeholder.textContent = 'Razorpay Checkout will open on submit';
      container.appendChild(placeholder);

      this.mounted = true;
      this.emit({ type: 'ready' });
    } finally {
      this.mounting = false;
    }
  }

  unmount(): void {
    if (this.container) {
      this.container.replaceChildren();
      this.container.removeAttribute('data-paykit-provider');
      this.container = null;
    }
    this.mounted = false;
  }

  private assertMounted(): void {
    if (!this.mounted) {
      throw new Error('Not mounted. Call mount() first.');
    }
  }

  async tokenize(): Promise<TokenizeResult> {
    this.assertMounted();
    if (!this.ready) {
      throw new Error('Razorpay not loaded. Call loadScript() first.');
    }

    return new Promise<TokenizeResult>((resolve, reject) => {
      const options = {
        key: this.publicKey,
        handler: (response: any) => {
          this.rzpInstance = null;
          resolve({
            token: response.razorpay_payment_id,
            paymentMethodType: 'card' as const,
          });
        },
        modal: {
          ondismiss: () => {
            this.rzpInstance = null;
            reject({ code: 'user_cancelled', message: 'Payment cancelled by user', isRetryable: false });
          },
        },
        theme: this.mapTheme(),
      };

      if (!(window as any).Razorpay) {
        reject(new Error('Razorpay SDK not available. Ensure loadScript() completed successfully.'));
        return;
      }
      this.rzpInstance = new (window as any).Razorpay(options);
      this.emit({ type: 'loading_start' });
      this.rzpInstance.open();
    });
  }

  async confirmPayment(clientSecret: string, _options?: { returnUrl?: string }): Promise<PaymentConfirmResult> {
    this.assertMounted();
    if (!this.ready) {
      throw new Error('Razorpay not loaded. Call loadScript() first.');
    }
    if (!(window as any).Razorpay) {
      throw new Error('Razorpay SDK not available. Ensure loadScript() completed successfully.');
    }

    // For Razorpay, clientSecret is the order_id
    return new Promise<PaymentConfirmResult>((resolve) => {
      const options = {
        key: this.publicKey,
        order_id: clientSecret,
        handler: (response: any) => {
          this.rzpInstance = null;
          this.emit({ type: 'loading_end' });
          resolve({
            status: 'succeeded' as const,
            chargeId: response.razorpay_payment_id,
          });
        },
        modal: {
          ondismiss: () => {
            this.rzpInstance = null;
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
