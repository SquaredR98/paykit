// @squaredr/paykit — Core package
// Unified payment SDK

// Types
export type {
	PaginatedList,
	ListParams,
	RequestOptions,
	ResponseMeta,
} from './types/common.js';
export type {
	ProviderConfig,
	ProviderCredentials,
	StripeCredentials,
	RazorpayCredentials,
	PayPalCredentials,
	SingleProviderConfig,
	MultiProviderConfig,
	RoutingConfig,
	RoutingRule,
	PayKitOptions,
	Logger,
	LogLevel,
	RequestContext,
	ResponseContext,
	ErrorContext,
} from './types/config.js';
export type {
	UnifiedCharge,
	CreateChargeParams,
	CaptureParams,
	ChargeStatus,
} from './types/charge.js';
export type {
	UnifiedRefund,
	CreateRefundParams,
	RefundStatus,
} from './types/refund.js';
export type {
	UnifiedCustomer,
	CreateCustomerParams,
	UpdateCustomerParams,
} from './types/customer.js';
export type {
	UnifiedPaymentMethod,
	CreatePaymentMethodParams,
	PaymentMethodType,
	PaymentMethodSummary,
} from './types/payment-method.js';
export type {
	UnifiedSubscription,
	CreateSubscriptionParams,
	UpdateSubscriptionParams,
	CancelSubscriptionParams,
	SubscriptionStatus,
	BillingInterval,
} from './types/subscription.js';
export type {
	UnifiedPayout,
	CreatePayoutParams,
	PayoutStatus,
} from './types/payout.js';
export type { UnifiedWebhookEvent, WebhookEventType } from './types/webhook.js';
export { WEBHOOK_EVENTS } from './types/webhook.js';
export type { ProviderName } from './types/provider.js';
export type { PaymentErrorCode } from './types/error.js';
export { ERROR_SUGGESTIONS } from './types/error.js';
export type { AppearanceConfig, ThemeVariables } from './types/appearance.js';
export type {
	ClientAdapter,
	InputMode,
	ClientEventType,
	ClientEvent,
	ClientEventListener,
	TokenizeResult,
	PaymentConfirmResult,
	ClientAdapterError,
	MountOptions,
	ConfirmPaymentOptions,
	RedirectResult,
} from './types/client-adapter.js';

// Interfaces
export type {
	PaymentAdapter,
	HealthStatus,
	ChargeOperations,
	RefundOperations,
	CustomerOperations,
	PaymentMethodOperations,
	WebhookOperations,
	SubscriptionOperations,
	PayoutOperations,
} from './adapter.js';
export type { ProviderCapabilities } from './capabilities.js';

// Classes
export {
  PaymentError,
  NotSupportedError,
  ValidationError,
  PaymentTimeoutError,
  ProviderUnavailableError,
} from './errors.js';
export { UnifiedPayments, UnifiedPayments as PayKit } from './client.js';
export type {
	AdapterConfig,
	PayKitConfig,
	ConstructWebhookParams,
	ExtendedWebhookOperations,
} from './client.js';
export { PaymentRouter } from './payment-router.js';
export type { PaymentRouterConfig, PaymentRoute, InferProviders } from './payment-router.js';

// Debug & introspection
export type { ProviderInfo } from './debug.js';
export { debug, getProviderInfo } from './debug.js';

// Utilities
export type { CurrencyCode, CurrencyInfo, CurrencyConverter } from './currency.js';
export {
	toSmallestUnit,
	fromSmallestUnit,
	getCurrencyInfo,
	formatAmount,
	isSupportedCurrency,
	getDecimalPlaces,
	getProviderCurrencies,
} from './currency.js';

// Retry & logging
export { withRetry, defaultShouldRetry } from './retry.js';
export type { RetryOptions, RetryResult, RetryHook } from './retry.js';
export { createDefaultLogger, createOperationLogger, redact } from './logger.js';
export type { OperationLogger } from './logger.js';

// Adapter registration
export { registerAdapter, getAdapter } from './registry.js';
