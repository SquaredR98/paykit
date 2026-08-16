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

/**
 * Options for configuring the PayPal client adapter.
 */
export interface PayPalClientAdapterOptions {
  /** Currency for the checkout (ISO 4217). Default: 'USD'. */
  currency?: string;
  /** Button style overrides. */
  buttonStyle?: {
    layout?: 'vertical' | 'horizontal';
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
    shape?: 'rect' | 'pill' | 'sharp';
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay';
    height?: number;
    borderRadius?: number;
    tagline?: boolean;
  };
  /** Disable Card Fields even if eligible. Default: false. */
  disableCardFields?: boolean;
}

/** @deprecated Use {@link PayPalClientAdapterOptions} instead. */
export type PayPalCardFieldOptions = PayPalClientAdapterOptions;

/**
 * Browser-side PayPal adapter with dual-mode support:
 *
 * 1. **PayPal Buttons** (always rendered) — standard PayPal checkout via
 *    `paypal.Buttons()`. Works on every account, no special enablement needed.
 *    Opens the PayPal popup for approval.
 *
 * 2. **Advanced Card Fields** (optional) — inline card number/expiry/CVV
 *    iframes via `paypal.CardFields()`. Only rendered when the merchant has
 *    Advanced Card Processing enabled. Provides a Stripe-like inline experience.
 *
 * Flow:
 *   1. `loadScript()` — loads PayPal JS SDK with `components=buttons,card-fields`
 *   2. `mount(container, options)` — renders Buttons + (optionally) Card Fields
 *   3. `confirmPayment()` — returns the result from Buttons `onApprove`, or
 *      submits Card Fields if the user chose the card input path
 *   4. `unmount()` / `destroy()` — cleanup
 */
export class PayPalClientAdapter implements ClientAdapter {
  readonly provider = 'paypal';
  readonly inputMode: InputMode = 'provider-hosted';

  private paypal: any = null;
  private buttons: any = null;
  private cardFields: any = null;
  private numberField: any = null;
  private expiryField: any = null;
  private cvvField: any = null;
  private container: HTMLElement | null = null;
  private mounted = false;
  private cardFieldsEligible = false;
  private listeners = new Map<ClientEventType, Set<ClientEventListener>>();
  private options: PayPalClientAdapterOptions;
  private approveResult: PaymentConfirmResult | null = null;
  private approvePromise: {
    resolve: (result: PaymentConfirmResult) => void;
  } | null = null;

  constructor(private clientId: string, options?: PayPalClientAdapterOptions) {
    this.options = options ?? {};
  }

  async loadScript(): Promise<void> {
    if (this.paypal) return;

    // Check if already loaded globally
    if ((window as any).paypal?.Buttons) {
      this.paypal = (window as any).paypal;
      return;
    }

    const currency = this.options.currency ?? 'USD';
    const src =
      `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(this.clientId)}` +
      `&components=buttons,card-fields&currency=${currency}&intent=capture`;

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.namespace = 'paypal';

      const timer = setTimeout(() => {
        reject(new Error('PayPal SDK load timeout'));
      }, 15000);

      script.onload = () => {
        clearTimeout(timer);
        resolve();
      };
      script.onerror = () => {
        clearTimeout(timer);
        reject(new Error('Failed to load PayPal SDK'));
      };

      document.head.appendChild(script);
    });

    this.paypal = (window as any).paypal;
    if (!this.paypal?.Buttons) {
      throw new Error('PayPal SDK loaded but Buttons component not available');
    }
  }

  isReady(): boolean {
    return this.paypal !== null;
  }

  async mount(container: HTMLElement, options: MountOptions): Promise<void> {
    if (!this.paypal) {
      await this.loadScript();
    }

    this.container = container;
    this.approveResult = null;
    this.approvePromise = null;

    const orderId = options.clientSecret;

    // Build the wrapper DOM and attach to the live DOM immediately —
    // PayPal Buttons.render() requires the target to be in the document
    // so it can measure dimensions and inject its iframe.
    const wrapper = document.createElement('div');
    wrapper.className = 'pk-paypal';
    container.appendChild(wrapper);

    // ── PayPal Buttons (always rendered) ──────────────────────
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'pk-paypal__buttons';
    wrapper.appendChild(buttonsContainer);

    // Separate tagline from style — it's a Buttons config option, not a style property
    const { tagline, ...styleOverrides } = this.options.buttonStyle ?? {};
    const buttonStyle = {
      layout: 'vertical' as const,
      color: 'gold' as const,
      shape: 'rect' as const,
      label: 'paypal' as const,
      ...styleOverrides,
    };

    // Build Buttons config
    const buttonsConfig: Record<string, any> = {
      fundingSource: this.paypal.FUNDING?.PAYPAL,
      createOrder: () => orderId,
      onApprove: (data: any) => {
        this.approveResult = {
          status: 'succeeded',
          chargeId: data.orderID,
        };
        this.emit({ type: 'change', data: { complete: true } });
        // If confirmPayment() is waiting, resolve it
        if (this.approvePromise) {
          this.approvePromise.resolve(this.approveResult);
          this.approvePromise = null;
        }
      },
      onCancel: () => {
        const result: PaymentConfirmResult = { status: 'canceled' };
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
      style: buttonStyle,
    };

    if (tagline !== undefined) {
      buttonsConfig.style.tagline = tagline;
    }

    this.buttons = this.paypal.Buttons(buttonsConfig);

    // Render Buttons
    await this.buttons.render(buttonsContainer);

    // ── Card Fields (optional — only if eligible) ─────────────
    if (!this.options.disableCardFields && this.paypal.CardFields) {
      this.cardFields = this.paypal.CardFields({
        createOrder: () => orderId,
        onApprove: (data: any) => {
          this.approveResult = {
            status: 'succeeded',
            chargeId: data.orderID,
          };
          this.emit({ type: 'change', data: { complete: true } });
        },
        onError: (err: any) => {
          this.approveResult = {
            status: 'failed',
            error: {
              code: err.name ?? 'paypal_error',
              message: err.message ?? 'PayPal card payment failed',
              isRetryable: false,
            },
          };
          this.emit({ type: 'error', data: this.approveResult.error });
        },
        style: this.mapAppearance(options.appearance),
      });

      if (typeof this.cardFields.isEligible === 'function' && this.cardFields.isEligible()) {
        this.cardFieldsEligible = true;

        // Separator
        const separator = document.createElement('div');
        separator.className = 'pk-paypal__separator';
        separator.innerHTML = '<span>or pay with card</span>';
        wrapper.appendChild(separator);

        // Card fields DOM
        const fieldsWrapper = document.createElement('div');
        fieldsWrapper.className = 'pk-paypal__fields';

        const numberContainer = document.createElement('div');
        numberContainer.className = 'pk-paypal__fields-number';

        const row = document.createElement('div');
        row.className = 'pk-paypal__fields-row';

        const expiryContainer = document.createElement('div');
        expiryContainer.className = 'pk-paypal__fields-expiry';

        const cvvContainer = document.createElement('div');
        cvvContainer.className = 'pk-paypal__fields-cvv';

        row.appendChild(expiryContainer);
        row.appendChild(cvvContainer);
        fieldsWrapper.appendChild(numberContainer);
        fieldsWrapper.appendChild(row);
        wrapper.appendChild(fieldsWrapper);

        // Render individual fields
        this.numberField = this.cardFields.NumberField();
        this.expiryField = this.cardFields.ExpiryField();
        this.cvvField = this.cardFields.CVVField();

        await Promise.all([
          this.numberField.render(numberContainer),
          this.expiryField.render(expiryContainer),
          this.cvvField.render(cvvContainer),
        ]);

        // Forward events from card fields
        const forwardEvents = (field: any) => {
          if (typeof field.on === 'function') {
            field.on('change', (e: any) => {
              this.emit({ type: 'change', data: { complete: !!e?.isValid } });
            });
            field.on('focus', () => this.emit({ type: 'focus' }));
            field.on('blur', () => this.emit({ type: 'blur' }));
          }
        };

        forwardEvents(this.numberField);
        forwardEvents(this.expiryField);
        forwardEvents(this.cvvField);
      } else {
        // Not eligible — discard the card fields instance
        this.cardFields = null;
      }
    }

    this.mounted = true;
    this.emit({ type: 'ready' });
  }

  async confirmPayment(_options: ConfirmPaymentOptions): Promise<PaymentConfirmResult> {
    if (!this.mounted) {
      throw new Error('PayPal not initialized. Call mount() first.');
    }

    // If user already completed via Buttons (onApprove fired), return immediately
    if (this.approveResult) {
      return this.approveResult;
    }

    // If card fields are eligible and mounted, submit them
    if (this.cardFieldsEligible && this.cardFields) {
      this.emit({ type: 'loading_start' });
      try {
        await this.cardFields.submit();
        if (this.approveResult) {
          return this.approveResult;
        }
        return { status: 'pending' };
      } catch (err: any) {
        return {
          status: 'failed',
          error: {
            code: err.name ?? 'processing_error',
            message: err.message ?? 'PayPal card payment failed',
            isRetryable: false,
          },
        };
      } finally {
        this.emit({ type: 'loading_end' });
      }
    }

    // Buttons-only mode: wait for user to click the PayPal button.
    // Return a promise that resolves when onApprove/onCancel/onError fires.
    return new Promise<PaymentConfirmResult>((resolve) => {
      this.approvePromise = { resolve };
    });
  }

  updateAppearance(appearance: AppearanceConfig): void {
    // PayPal styles are set at creation time — store for future mount() calls.
    void appearance;
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

  unmount(): void {
    if (this.container && this.mounted) {
      this.container.innerHTML = '';
      this.mounted = false;
    }
    this.buttons = null;
    this.cardFields = null;
    this.numberField = null;
    this.expiryField = null;
    this.cvvField = null;
    this.cardFieldsEligible = false;
  }

  destroy(): void {
    this.unmount();
    this.container = null;
    this.approveResult = null;
    this.approvePromise = null;
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

  private mapAppearance(appearance?: AppearanceConfig): Record<string, any> {
    if (!appearance?.variables) return {};

    return {
      input: {
        'font-size': appearance.variables.fontSize ?? '15px',
        'font-family': appearance.variables.fontFamily ?? 'inherit',
        color: appearance.variables.colorText ?? '#e0e0e0',
        'background-color': appearance.variables.colorBackground ?? 'transparent',
        'border-radius': appearance.variables.borderRadius ?? '0px',
        padding: '10px 12px',
      },
      'input:focus': {
        color: appearance.variables.colorText ?? '#e0e0e0',
      },
      '.invalid': {
        color: appearance.variables.colorDanger ?? '#fa755a',
      },
    };
  }
}
