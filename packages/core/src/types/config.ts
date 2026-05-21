/**
 * Credentials for a single provider. Shape varies per provider —
 * adapters validate their own credential shape.
 */
export type ProviderCredentials = Record<string, string>;

/**
 * Log levels for the SDK.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

/**
 * Custom logger interface — plug in your own logger.
 */
export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

/**
 * Shared options for the SDK.
 */
export interface PayKitOptions {
  timeout?: number;
  retries?: number;
  idempotencyKey?: boolean;
  logging?: LogLevel;
  logger?: Logger;
}

/**
 * Single-provider configuration.
 */
export interface SingleProviderConfig {
  provider: string;
  credentials: ProviderCredentials;
  options?: PayKitOptions;
}

/**
 * Routing rule for multi-provider setups.
 */
export interface RoutingRule {
  currency?: string;
  region?: string;
  paymentMethod?: string;
  provider: string;
}

/**
 * Routing configuration for multi-provider setups.
 */
export interface RoutingConfig {
  default: string;
  rules: RoutingRule[];
}

/**
 * Multi-provider configuration.
 */
export interface MultiProviderConfig {
  providers: Record<string, ProviderCredentials>;
  routing: RoutingConfig;
  options?: PayKitOptions;
}

/**
 * Union type — either single or multi-provider config.
 */
export type ProviderConfig = SingleProviderConfig | MultiProviderConfig;
