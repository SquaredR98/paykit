import type {
  MountOptions,
  TokenizeResult,
  PaymentConfirmResult,
  AppearanceConfig,
  ClientEventType,
  ClientEventListener,
} from '../types.js';

/**
 * A ProviderBridge wraps a specific payment provider's client-side SDK
 * behind a common interface. Each provider (Stripe, Razorpay) implements this.
 */
export interface ProviderBridge {
  readonly name: string;

  /** Load the provider's client-side script from CDN */
  loadScript(): Promise<void>;

  /** Whether the provider script is loaded and ready */
  isReady(): boolean;

  /** Mount a secure payment input into a DOM element */
  mount(container: HTMLElement, options?: MountOptions): Promise<void>;

  /** Unmount the secure input and clean up */
  unmount(): void;

  /** Tokenize payment info collected via the mounted element */
  tokenize(): Promise<TokenizeResult>;

  /** Confirm a payment (handles 3DS, modals, redirects) */
  confirmPayment(clientSecret: string, options?: { returnUrl?: string }): Promise<PaymentConfirmResult>;

  /** Update appearance */
  updateAppearance(appearance: AppearanceConfig): void;

  /** Register an event listener */
  on(event: ClientEventType, listener: ClientEventListener): void;

  /** Remove an event listener */
  off(event: ClientEventType, listener: ClientEventListener): void;

  /** Destroy all resources */
  destroy(): void;
}
