import type {
  ClientAdapter,
  InputMode,
  MountOptions,
  ConfirmPaymentOptions,
  PaymentConfirmResult,
  ClientEventType,
  ClientEventListener,
  ClientEvent,
  AppearanceConfig,
} from '@squaredr/paykit';

const STRIPE_SCRIPT_URL = 'https://js.stripe.com/v3/';

/**
 * Browser-side Stripe adapter using the modern Payment Element.
 *
 * Uses `stripe.elements({ clientSecret })` + Payment Element + `stripe.confirmPayment()`.
 * This is the correct modern approach — the old bridge used the deprecated Card Element
 * and `confirmCardPayment()` which didn't work because it never passed `clientSecret`
 * to `elements()`.
 */
export class StripeClientAdapter implements ClientAdapter {
  readonly provider = 'stripe';
  readonly inputMode: InputMode = 'provider-hosted';

  private stripe: any = null;
  private elements: any = null;
  private paymentElement: any = null;
  private mounted = false;
  private listeners = new Map<ClientEventType, Set<ClientEventListener>>();

  constructor(private publicKey: string) {}

  async loadScript(): Promise<void> {
    if (this.stripe) return;

    // Check if already loaded globally
    if ((window as any).Stripe) {
      this.stripe = (window as any).Stripe(this.publicKey);
      return;
    }

    // Load Stripe.js
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = STRIPE_SCRIPT_URL;
      script.async = true;

      const timer = setTimeout(() => {
        reject(new Error('Stripe.js load timeout'));
      }, 15000);

      script.onload = () => {
        clearTimeout(timer);
        resolve();
      };
      script.onerror = () => {
        clearTimeout(timer);
        reject(new Error('Failed to load Stripe.js'));
      };

      document.head.appendChild(script);
    });

    this.stripe = (window as any).Stripe(this.publicKey);
  }

  isReady(): boolean {
    return this.stripe !== null;
  }

  async mount(container: HTMLElement, options: MountOptions): Promise<void> {
    if (!this.stripe) {
      await this.loadScript();
    }

    // Create Elements instance WITH clientSecret — this is the critical fix.
    // Stripe Payment Element requires clientSecret at initialization time.
    const elementsOptions: any = {
      clientSecret: options.clientSecret,
    };

    if (options.appearance) {
      elementsOptions.appearance = this.mapAppearance(options.appearance);
    }

    this.elements = this.stripe.elements(elementsOptions);

    // Create modern Payment Element (not the legacy Card Element)
    const paymentElementOptions: any = {};
    if (options.paymentMethodTypes?.length) {
      // Stripe uses 'card', 'ideal', etc. — our types map directly
      paymentElementOptions.paymentMethodOrder = options.paymentMethodTypes;
    }

    this.paymentElement = this.elements.create('payment', paymentElementOptions);
    this.paymentElement.mount(container);
    this.mounted = true;

    // Forward events
    this.paymentElement.on('ready', () => this.emit({ type: 'ready' }));
    this.paymentElement.on('change', (e: any) => {
      this.emit({
        type: 'change',
        data: { complete: e.complete, value: e.value },
      });
    });
    this.paymentElement.on('focus', () => this.emit({ type: 'focus' }));
    this.paymentElement.on('blur', () => this.emit({ type: 'blur' }));
    this.paymentElement.on('loaderstart', () => this.emit({ type: 'loading_start' }));
  }

  unmount(): void {
    if (this.paymentElement && this.mounted) {
      this.paymentElement.unmount();
      this.mounted = false;
    }
  }

  async confirmPayment(options: ConfirmPaymentOptions): Promise<PaymentConfirmResult> {
    if (!this.stripe || !this.elements) {
      throw new Error('Stripe not initialized. Call mount() first.');
    }

    this.emit({ type: 'loading_start' });

    try {
      const confirmParams: any = {};
      if (options.returnUrl) {
        confirmParams.return_url = options.returnUrl;
      }

      // Modern confirmPayment() with elements — uses the Payment Element's collected data
      const { paymentIntent, error } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams,
        redirect: options.returnUrl ? 'if_required' : 'if_required',
      });

      if (error) {
        const result: PaymentConfirmResult = {
          status: 'failed',
          error: {
            code: error.code ?? 'processing_error',
            message: error.message ?? 'Payment failed',
            isRetryable: error.type === 'api_connection_error',
          },
        };
        this.emit({ type: 'error', data: result.error });
        return result;
      }

      return {
        status: this.mapStatus(paymentIntent.status),
        chargeId: paymentIntent.id,
        redirectUrl: paymentIntent.next_action?.redirect_to_url?.url,
      };
    } finally {
      this.emit({ type: 'loading_end' });
    }
  }

  updateAppearance(appearance: AppearanceConfig): void {
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
    if (this.paymentElement) {
      this.paymentElement.destroy();
      this.paymentElement = null;
    }
    this.elements = null;
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
        spacingUnit: appearance.variables?.spacingUnit,
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
