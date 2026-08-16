# @squaredr/paykit

## 0.10.0

### Minor Changes

- PayPal client adapter — dual-mode Buttons + Advanced Card Fields
- PayPal webhook verification via postback API
- PayPal partial capture support
- PayPal subscription auto-create catalog product

### Patch Changes

- Fixed PayPal refund currency extraction
- Fixed PayPal charges.cancel error type

## 0.9.0

### Minor Changes

- PayPal adapter — OAuth 2.0, Order → Capture flow
- PayPal mappers: charge, refund, customer, subscription, webhook, error
- PayPal added to SupportedProvider type

## 0.7.0

### Minor Changes

- Validation module — charges.create param validation with ValidationError
- Currency utilities and WEBHOOK_EVENTS constants
- ProviderName type export
- 19 unified error codes with human-readable suggestions and retryable flag
- Debug logging support
- Mock adapter for testing

## 0.5.0

### Minor Changes

- Package consolidation — all adapters as subpath exports of @squaredr/paykit
- Constructor sugar on adapters — `new StripeAdapter({ secretKey })`
- `PayKit` class alias for `UnifiedPayments`
- `AdapterConfig` — `new PayKit({ adapter })` pattern
- `webhooks.construct({ payload, signature, secret })` API
- `PaymentRouter` class for multi-provider routing

## 0.4.0

### Minor Changes

- Finalized public API surface
- Stripe adapter — charges, refunds, customers, subscriptions, webhooks
- Razorpay adapter — charges, refunds, customers, subscriptions, webhooks

## 0.2.0

### Minor Changes

- Initial release — unified payment SDK
- Core types: UnifiedCharge, UnifiedRefund, UnifiedCustomer
- PaymentAdapter interface
- Stripe adapter (basic charges + webhooks)
- Razorpay adapter (basic charges + webhooks)
- Tree-shakeable packages with separate server/client entry points

**License:** MIT — free and open source. No paid tiers, no license keys.
