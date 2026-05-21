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

const STRIPE_SCRIPT_URL = 'https://js.stripe.com/v3/';

export class StripeProviderBridge implements ProviderBridge {
  readonly name = 'stripe';

  private stripe: any = null;
  private elements: any = null;
  private cardElement: any = null;
  private mounted = false;
  private listeners = new Map<ClientEventType, Set<ClientEventListener>>();

  constructor(
    private publicKey: string,
    private appearance?: AppearanceConfig,
  ) {}

  async loadScript(): Promise<void> {
    await loadScript({ src: STRIPE_SCRIPT_URL, globalName: 'Stripe' });
    this.stripe = (window as any).Stripe(this.publicKey);
  }

  isReady(): boolean {
    return this.stripe !== null;
  }

  async mount(container: HTMLElement, options?: MountOptions): Promise<void> {
    if (!this.stripe) {
      await this.loadScript();
    }

    const elementsOptions: any = {};
    const mergedAppearance = options?.appearance ?? this.appearance;
    if (mergedAppearance) {
      elementsOptions.appearance = this.mapAppearance(mergedAppearance);
    }

    this.elements = this.stripe.elements(elementsOptions);
    this.cardElement = this.elements.create('card');
    this.cardElement.mount(container);
    this.mounted = true;

    this.cardElement.on('ready', () => this.emit({ type: 'ready' }));
    this.cardElement.on('change', (e: any) => {
      this.emit({ type: 'change', data: { complete: e.complete, error: e.error?.message } });
    });
    this.cardElement.on('focus', () => this.emit({ type: 'focus' }));
    this.cardElement.on('blur', () => this.emit({ type: 'blur' }));
  }

  unmount(): void {
    if (this.cardElement && this.mounted) {
      this.cardElement.unmount();
      this.mounted = false;
    }
  }

  async tokenize(): Promise<TokenizeResult> {
    if (!this.stripe || !this.cardElement) {
      throw new Error('Card input is not mounted. Call mount() first.');
    }

    const { token, error } = await this.stripe.createToken(this.cardElement);
    if (error) {
      throw { code: 'invalid_card', message: error.message, isRetryable: false };
    }

    return {
      token: token.id,
      paymentMethodType: 'card',
      last4: token.card?.last4,
      brand: token.card?.brand,
    };
  }

  async confirmPayment(clientSecret: string, options?: { returnUrl?: string }): Promise<PaymentConfirmResult> {
    if (!this.stripe) {
      throw new Error('Stripe not loaded. Call loadScript() first.');
    }

    const confirmOptions: any = {};
    if (this.cardElement) {
      confirmOptions.payment_method = { card: this.cardElement };
    }
    if (options?.returnUrl) {
      confirmOptions.return_url = options.returnUrl;
    }

    const { paymentIntent, error } = await this.stripe.confirmCardPayment(clientSecret, confirmOptions);

    if (error) {
      return {
        status: 'failed',
        error: {
          code: error.code ?? 'processing_error',
          message: error.message,
          isRetryable: error.type === 'api_connection_error',
        },
      };
    }

    return {
      status: this.mapStatus(paymentIntent.status),
      chargeId: paymentIntent.id,
      redirectUrl: paymentIntent.next_action?.redirect_to_url?.url,
    };
  }

  updateAppearance(appearance: AppearanceConfig): void {
    this.appearance = appearance;
    if (this.elements) {
      this.elements.update({ appearance: this.mapAppearance(appearance) });
    }
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
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
    this.elements = null;
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

  private mapAppearance(appearance: AppearanceConfig): any {
    return {
      theme: appearance.theme === 'night' ? 'night' : appearance.theme === 'flat' ? 'flat' : 'stripe',
      variables: {
        colorPrimary: appearance.variables?.colorPrimary,
        colorBackground: appearance.variables?.colorBackground,
        colorText: appearance.variables?.colorText,
        colorDanger: appearance.variables?.colorDanger,
        borderRadius: appearance.variables?.borderRadius,
        fontFamily: appearance.variables?.fontFamily,
        fontSizeBase: appearance.variables?.fontSize,
      },
    };
  }

  private mapStatus(stripeStatus: string): PaymentConfirmResult['status'] {
    switch (stripeStatus) {
      case 'succeeded': return 'succeeded';
      case 'processing': return 'processing';
      case 'requires_action': return 'requires_action';
      case 'canceled': return 'canceled';
      default: return 'pending';
    }
  }
}

// Self-register the bridge
registerBridge('stripe', (publicKey, appearance) => new StripeProviderBridge(publicKey, appearance));

export { StripeProviderBridge as default };
