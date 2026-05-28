import type {
  ClientAdapter,
  InputMode,
  MountOptions,
  ConfirmPaymentOptions,
  PaymentConfirmResult,
  ClientEventType,
  ClientEventListener,
  ClientEvent,
} from '../../../types/client-adapter.js';
import type { AppearanceConfig } from '../../../types/appearance.js';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * Browser-side Razorpay adapter.
 *
 * Razorpay doesn't support inline payment inputs — it uses a modal checkout.
 * `mount()` renders a styled placeholder, and `confirmPayment()` opens the modal.
 */
export class RazorpayClientAdapter implements ClientAdapter {
  readonly provider = 'razorpay';
  readonly inputMode: InputMode = 'provider-hosted';

  private ready = false;
  private rzpInstance: any = null;
  private container: HTMLElement | null = null;
  private appearance?: AppearanceConfig;
  private listeners = new Map<ClientEventType, Set<ClientEventListener>>();

  constructor(private publicKey: string) {}

  async loadScript(): Promise<void> {
    if (this.ready) return;

    // Check if already loaded globally
    if ((window as any).Razorpay) {
      this.ready = true;
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;

      const timer = setTimeout(() => {
        reject(new Error('Razorpay script load timeout'));
      }, 15000);

      script.onload = () => {
        clearTimeout(timer);
        resolve();
      };
      script.onerror = () => {
        clearTimeout(timer);
        reject(new Error('Failed to load Razorpay script'));
      };

      document.head.appendChild(script);
    });

    this.ready = true;
  }

  isReady(): boolean {
    return this.ready;
  }

  async mount(container: HTMLElement, options: MountOptions): Promise<void> {
    if (!this.ready) {
      await this.loadScript();
    }

    this.container = container;
    this.appearance = options.appearance;

    // Razorpay uses a modal — no inline inputs to render.
    // Show a styled placeholder so the UI isn't empty.
    container.setAttribute('data-paykit-provider', 'razorpay');
    container.innerHTML =
      '<div data-paykit-razorpay-placeholder style="padding:12px;text-align:center;opacity:0.7;font-size:14px;">Razorpay Checkout will open when you submit</div>';

    this.emit({ type: 'ready' });
  }

  unmount(): void {
    if (this.container) {
      this.container.innerHTML = '';
      this.container.removeAttribute('data-paykit-provider');
      this.container = null;
    }
  }

  async confirmPayment(options: ConfirmPaymentOptions): Promise<PaymentConfirmResult> {
    if (!this.ready) {
      throw new Error('Razorpay not loaded. Call loadScript() first.');
    }

    // For Razorpay, clientSecret is the order_id
    return new Promise<PaymentConfirmResult>((resolve) => {
      const rzpOptions: any = {
        key: this.publicKey,
        order_id: options.clientSecret,
        handler: (response: any) => {
          this.emit({ type: 'loading_end' });
          resolve({
            status: 'succeeded',
            chargeId: response.razorpay_payment_id,
          });
        },
        modal: {
          ondismiss: () => {
            this.emit({ type: 'loading_end' });
            resolve({ status: 'canceled' });
          },
          confirm_close: true,
        },
        theme: this.mapTheme(),
      };

      if (options.returnUrl) {
        rzpOptions.callback_url = options.returnUrl;
      }

      this.rzpInstance = new (window as any).Razorpay(rzpOptions);
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

  // -- Private helpers --

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
