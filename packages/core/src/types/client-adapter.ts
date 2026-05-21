/**
 * Client-side adapter interface for browser payment UIs.
 *
 * Each provider adapter package exports a ClientAdapter implementation
 * from its `./client` sub-entry, keeping server and browser code
 * in separate tree-shakable bundles.
 */

import type { AppearanceConfig } from './appearance.js';
import type { PaymentMethodType } from './payment-method.js';
import type { ChargeStatus } from './charge.js';

// ---------------------------------------------------------------------------
// Input mode
// ---------------------------------------------------------------------------

/** For now only provider-hosted elements are supported. */
export type InputMode = 'provider-hosted';

// ---------------------------------------------------------------------------
// Event system
// ---------------------------------------------------------------------------

export type ClientEventType =
  | 'ready'
  | 'change'
  | 'error'
  | 'focus'
  | 'blur'
  | 'loading_start'
  | 'loading_end';

export interface ClientEvent {
  type: ClientEventType;
  data?: unknown;
}

export type ClientEventListener = (event: ClientEvent) => void;

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

export interface TokenizeResult {
  token: string;
  paymentMethodType: PaymentMethodType;
  last4?: string;
  brand?: string;
}

export interface PaymentConfirmResult {
  status: ChargeStatus;
  chargeId?: string;
  redirectUrl?: string;
  error?: ClientAdapterError;
}

export interface ClientAdapterError {
  code: string;
  message: string;
  isRetryable: boolean;
}

// ---------------------------------------------------------------------------
// Mount options
// ---------------------------------------------------------------------------

export interface MountOptions {
  clientSecret: string;
  appearance?: AppearanceConfig;
  paymentMethodTypes?: PaymentMethodType[];
}

// ---------------------------------------------------------------------------
// Confirm options
// ---------------------------------------------------------------------------

export interface ConfirmPaymentOptions {
  clientSecret: string;
  returnUrl?: string;
}

// ---------------------------------------------------------------------------
// Redirect return helpers
// ---------------------------------------------------------------------------

export interface RedirectResult {
  status: ChargeStatus;
  paymentIntentId?: string;
}

// ---------------------------------------------------------------------------
// ClientAdapter interface
// ---------------------------------------------------------------------------

/**
 * Contract for browser-side payment UI adapters.
 *
 * Lifecycle:
 *   1. `loadScript()` — load the provider's JS SDK (Stripe.js, Razorpay.js, etc.)
 *   2. `mount(container, options)` — render payment input into a DOM element
 *   3. `confirmPayment(options)` — tokenize + confirm in one step (provider-hosted)
 *   4. `unmount()` / `destroy()` — cleanup
 */
export interface ClientAdapter {
  /** Provider name (e.g. 'stripe', 'razorpay'). */
  readonly provider: string;

  /** Input mode this adapter implements. */
  readonly inputMode: InputMode;

  /** Load the provider's browser SDK script. Resolves when ready. */
  loadScript(): Promise<void>;

  /** Whether the provider SDK is loaded and ready. */
  isReady(): boolean;

  /** Mount provider-hosted payment inputs into the given container. */
  mount(container: HTMLElement, options: MountOptions): Promise<void>;

  /** Remove mounted elements from the DOM without destroying the adapter. */
  unmount(): void;

  /**
   * Confirm a payment using the mounted element.
   * For Stripe this calls `stripe.confirmPayment()`.
   * For Razorpay this opens the Checkout modal.
   */
  confirmPayment(options: ConfirmPaymentOptions): Promise<PaymentConfirmResult>;

  /** Update the appearance of mounted elements. */
  updateAppearance(appearance: AppearanceConfig): void;

  /** Subscribe to client events. */
  on(event: ClientEventType, listener: ClientEventListener): void;

  /** Unsubscribe from client events. */
  off(event: ClientEventType, listener: ClientEventListener): void;

  /** Tear down the adapter and release all resources. */
  destroy(): void;
}
