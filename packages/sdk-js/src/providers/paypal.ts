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

/**
 * PayPal provider bridge for the SDK-JS layer.
 *
 * Renders PayPal Buttons (always) and Card Fields (when eligible).
 * The Buttons flow is popup-driven — user clicks button → PayPal popup → approves.
 * Card Fields provide inline card entry for merchants with Advanced Card Processing.
 */
export class PayPalProviderBridge implements ProviderBridge {
  readonly name = 'paypal';

  private paypal: any = null;
  private buttons: any = null;
  private cardFields: any = null;
  private cardFieldsEligible = false;
  private container: HTMLElement | null = null;
  private mounted = false;
  private mounting = false;
  private listeners = new Map<ClientEventType, Set<ClientEventListener>>();
  private approveResult: PaymentConfirmResult | null = null;
  private approvePromise: {
    resolve: (result: PaymentConfirmResult) => void;
  } | null = null;

  constructor(
    private publicKey: string,
    private appearance?: AppearanceConfig,
  ) {}

  async loadScript(): Promise<void> {
    const src =
      `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(this.publicKey)}` +
      `&components=buttons,card-fields&currency=USD&intent=capture`;

    await loadScript({ src, globalName: 'paypal', timeout: 15000 });
    this.paypal = (window as any).paypal;
  }

  isReady(): boolean {
    return this.paypal !== null;
  }

  async mount(container: HTMLElement, options?: MountOptions & { clientSecret?: string }): Promise<void> {
    if (this.mounted) this.unmount();
    if (this.mounting) throw new Error('Mount already in progress');
    this.mounting = true;
    try {
    if (!this.paypal) {
      await this.loadScript();
    }

    this.container = container;
    this.approveResult = null;
    this.approvePromise = null;

    const orderId = options?.clientSecret ?? '';

    const wrapper = document.createElement('div');
    wrapper.className = 'pk-paypal';

    // ── PayPal Buttons ────────────────────────────────────────
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'pk-paypal__buttons';
    wrapper.appendChild(buttonsContainer);

    this.buttons = this.paypal.Buttons({
      createOrder: () => orderId,
      onApprove: (data: any) => {
        this.approveResult = {
          status: 'succeeded',
          chargeId: data.orderID,
        };
        this.emit({ type: 'change', data: { complete: true } });
        if (this.approvePromise) {
          this.approvePromise.resolve(this.approveResult);
          this.approvePromise = null;
        }
      },
      onCancel: () => {
        const result: PaymentConfirmResult = { status: 'canceled' };
        this.approveResult = result;
        if (this.approvePromise) {
          this.approvePromise.resolve(result);
          this.approvePromise = null;
        }
      },
      onError: (err: any) => {
        this.approveResult = {
          status: 'failed',
          error: {
            code: err.name ?? 'paypal_error',
            message: err.message ?? 'PayPal payment failed',
            isRetryable: false,
          },
        };
        this.emit({ type: 'error', data: this.approveResult.error });
        if (this.approvePromise) {
          this.approvePromise.resolve(this.approveResult);
          this.approvePromise = null;
        }
      },
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
    });

    await this.buttons.render(buttonsContainer);

    // ── Card Fields (if eligible) ─────────────────────────────
    if (this.paypal.CardFields) {
      const cf = this.paypal.CardFields({
        createOrder: () => orderId,
        onApprove: (data: any) => {
          this.approveResult = { status: 'succeeded', chargeId: data.orderID };
          this.emit({ type: 'change', data: { complete: true } });
        },
        onError: (err: any) => {
          this.approveResult = {
            status: 'failed',
            error: {
              code: err.name ?? 'paypal_error',
              message: err.message ?? 'Card payment failed',
              isRetryable: false,
            },
          };
          this.emit({ type: 'error', data: this.approveResult.error });
        },
        style: this.mapCardStyle(),
      });

      if (typeof cf.isEligible === 'function' && cf.isEligible()) {
        this.cardFields = cf;
        this.cardFieldsEligible = true;

        const separator = document.createElement('div');
        separator.className = 'pk-paypal__separator';
        const span = document.createElement('span');
        span.textContent = 'or pay with card';
        separator.appendChild(span);
        wrapper.appendChild(separator);

        const fieldsWrapper = document.createElement('div');
        fieldsWrapper.className = 'pk-paypal__fields';

        const numberEl = document.createElement('div');
        numberEl.className = 'pk-paypal__fields-number';

        const rowEl = document.createElement('div');
        rowEl.className = 'pk-paypal__fields-row';

        const expiryEl = document.createElement('div');
        expiryEl.className = 'pk-paypal__fields-expiry';

        const cvvEl = document.createElement('div');
        cvvEl.className = 'pk-paypal__fields-cvv';

        rowEl.appendChild(expiryEl);
        rowEl.appendChild(cvvEl);
        fieldsWrapper.appendChild(numberEl);
        fieldsWrapper.appendChild(rowEl);
        wrapper.appendChild(fieldsWrapper);

        await Promise.all([
          cf.NumberField().render(numberEl),
          cf.ExpiryField().render(expiryEl),
          cf.CVVField().render(cvvEl),
        ]);
      }
    }

    container.appendChild(wrapper);
    this.mounted = true;
    this.emit({ type: 'ready' });
    } finally {
      this.mounting = false;
    }
  }

  unmount(): void {
    if (this.container && this.mounted) {
      this.container.replaceChildren();
      this.mounted = false;
    }
    this.buttons = null;
    this.cardFields = null;
    this.cardFieldsEligible = false;
  }

  private assertMounted(): void {
    if (!this.mounted) {
      throw new Error('Not mounted. Call mount() first.');
    }
  }

  async tokenize(): Promise<TokenizeResult> {
    throw new Error('tokenize() is not supported in provider-hosted mode. Use confirmPayment() instead.');
  }

  async confirmPayment(clientSecret: string, _options?: { returnUrl?: string }): Promise<PaymentConfirmResult> {
    this.assertMounted();
    void clientSecret;

    // If Buttons flow already completed, return immediately
    if (this.approveResult) {
      return this.approveResult;
    }

    // If card fields are eligible, submit them
    if (this.cardFieldsEligible && this.cardFields) {
      try {
        this.emit({ type: 'loading_start' });
        await this.cardFields.submit();
        return this.approveResult ?? { status: 'pending' };
      } catch (err: any) {
        return {
          status: 'failed',
          error: {
            code: err.name ?? 'processing_error',
            message: err.message ?? 'Card payment failed',
            isRetryable: false,
          },
        };
      } finally {
        this.emit({ type: 'loading_end' });
      }
    }

    // Buttons-only: wait for the user to click the PayPal button
    return new Promise<PaymentConfirmResult>((resolve) => {
      this.approvePromise = { resolve };
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
    this.container = null;
    this.approveResult = null;
    if (this.approvePromise) {
      this.approvePromise.resolve({ status: 'canceled' });
      this.approvePromise = null;
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

  private mapCardStyle(): Record<string, any> {
    if (!this.appearance?.variables) return {};
    return {
      input: {
        'font-size': this.appearance.variables.fontSize ?? '15px',
        'font-family': this.appearance.variables.fontFamily ?? 'inherit',
        color: this.appearance.variables.colorText ?? '#e0e0e0',
        'background-color': this.appearance.variables.colorBackground ?? 'transparent',
        'border-radius': this.appearance.variables.borderRadius ?? '0px',
        padding: '10px 12px',
      },
      'input:focus': {
        color: this.appearance.variables.colorText ?? '#e0e0e0',
      },
      '.invalid': {
        color: this.appearance.variables.colorDanger ?? '#fa755a',
      },
    };
  }
}

// Self-register the bridge
registerBridge('paypal', (publicKey, appearance) => new PayPalProviderBridge(publicKey, appearance));

export { PayPalProviderBridge as default };
