import type { PaymentMethodType, ChargeStatus, ClientAdapter } from '@squaredr/paykit';

export type SupportedProvider = 'stripe' | 'razorpay';

/**
 * Configuration for PayKitClient.
 *
 * New path (recommended): pass `clientAdapter` directly.
 * Legacy path: pass `provider` + `publicKey` to use the bridge registry.
 */
export type PayKitClientConfig =
  | { clientAdapter: ClientAdapter; locale?: string; appearance?: AppearanceConfig }
  | { provider: SupportedProvider; publicKey: string; locale?: string; appearance?: AppearanceConfig };

export interface AppearanceConfig {
  theme?: 'default' | 'night' | 'flat';
  variables?: ThemeVariables;
}

export interface ThemeVariables {
  colorPrimary?: string;
  colorBackground?: string;
  colorText?: string;
  colorDanger?: string;
  colorSuccess?: string;
  borderRadius?: string;
  fontFamily?: string;
  fontSize?: string;
  spacingUnit?: string;
}

export interface MountOptions {
  paymentMethodTypes?: PaymentMethodType[];
  appearance?: AppearanceConfig;
}

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
  error?: PayKitClientError;
}

export interface PayKitClientError {
  code: string;
  message: string;
  isRetryable: boolean;
}

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
