# @squaredr/paykit-react

## 1.0.0

### Minor Changes

- a61a4d7: Initial release of PayKit — unified payment SDK

  This is the initial v0.1.0 release of PayKit, a unified payment SDK that provides a Stripe-like developer experience across multiple payment providers.

  **Open Core Model:**
  PayKit is free and open source (MIT) for core payment acceptance. Advanced features (refunds, payouts, dashboards) are available in Pro adapters under commercial license.

  **Core features (Open Source):**

  - Unified API for payment acceptance across providers
  - Full TypeScript support with type-safe generics
  - Provider routing by currency, region, or custom rules
  - Tree-shakeable packages with separate server/client code
  - **All adapters open source** for mass adoption

  **Packages included:**

  - `@squaredr/paykit` — Core SDK with unified types and adapter system
  - `@squaredr/paykit-stripe` — Stripe adapter (charges + webhooks)
  - `@squaredr/paykit-razorpay` — Razorpay adapter (charges + webhooks)
  - `@squaredr/paykit-js` — Vanilla JS/TS frontend SDK (headless)
  - `@squaredr/paykit-react` — React components and hooks

  **What works in free version:**

  - Backend: Create payment sessions, charge customers, retrieve status
  - Frontend: Stripe Payment Element, Razorpay Checkout modal
  - React: `<PayKitProvider>`, `<CheckoutForm>`, `<CardInput>` components
  - 3D Secure redirect handling
  - Webhook signature verification and basic event handling
  - Mock adapter for testing

  **Pro features (coming soon in separate packages):**
  Advanced payment operations available in `@squaredr/paykit-{provider}-pro` packages (one-time purchase):

  - Refunds and payouts
  - Full subscription lifecycle management
  - Customer portal and payment method management
  - Transaction dashboard with analytics
  - Dispute management and reconciliation tools

  **Pro pricing (one-time payment):**

  - Single Adapter: $29
  - Starter Bundle (up to 3 adapters): $79
  - All Access (all current & future adapters): $249

  **Scope:**
  This release focuses on the core use case: accepting payments. Pro adapters with advanced features will be released separately under commercial license (one-time purchase).

### Patch Changes

- Updated dependencies [a61a4d7]
  - @squaredr/paykit@0.2.0
  - @squaredr/paykit-js@1.0.0
