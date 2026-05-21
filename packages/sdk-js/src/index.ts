// @squaredr/paykit-js — Frontend SDK

export { PayKitClient } from './client.js';
export { loadScript, resetScriptCache } from './script-loader.js';
export { applyThemeToElement, themeVariablesToStyle } from './theme.js';
export { handleRedirectReturn } from './redirect/redirect-handler.js';

// Provider bridge types and registry
export type { ProviderBridge } from './providers/provider-bridge.js';
export { registerBridge, createBridge } from './providers/registry.js';

// Types
export type {
  PayKitClientConfig,
  AppearanceConfig,
  ThemeVariables,
  MountOptions,
  TokenizeResult,
  PaymentConfirmResult,
  PayKitClientError,
  ClientEventType,
  ClientEvent,
  ClientEventListener,
  SupportedProvider,
} from './types.js';

export type { RedirectResult } from './redirect/redirect-handler.js';
