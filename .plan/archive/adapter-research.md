# Adapter Research — Hard-to-Integrate, High-Demand Providers

> **Purpose**: Find payment providers beyond the 24 listed in `backlog.md` that are heavily used
> but have poor Node.js/React DX, lots of community complaints, and would benefit most from
> a PayKit wrapper.
>
> **Status**: COMPLETE — research conducted August 23, 2026

---

## Selection Criteria

A provider qualifies for this list if it meets ALL of:

1. **High demand** — significant market share in at least one region or vertical
2. **Poor Node.js DX** — bad/missing official SDK, poor TypeScript support, confusing API design
3. **Community complaints** — GitHub issues, Reddit threads, SO questions about integration pain
4. **Hard to integrate** — complex auth flows, poor documentation, inconsistent APIs, weird edge cases
5. **Test account available** — can get sandbox/test API keys without business verification or KYC

---

## Already Listed (24 adapters in backlog.md — DO NOT duplicate)

These are confirmed and will be built regardless:
- Stripe, Razorpay, PayPal (done)
- PhonePe, Cashfree, Paytm, CCAvenue (India)
- Square, Adyen (global)
- Mollie, MercadoPago, Flutterwave (regional)
- PayU, Airwallex, GoCardless (enterprise)
- Worldpay, Authorize.net, Nuvei (enterprise)
- Alipay, WeChat Pay, UnionPay (China)
- 2Checkout, Payoneer, Worldline (misc)

---

## Research Results

### QUALIFIED — ADD to adapter list

---

### 1. CCAvenue (already listed but scored for difficulty)
- **Region/vertical**: India, 200+ banks, all card networks
- **npm package**: `ccavenue` (community) — 89 weekly downloads
- **Last updated**: 2 years ago
- **Known complaints**: Documentation is "very vague", developers report days/weeks wasted on first integration. Error "10001 Invalid Request" is extremely common with no clear fix guidance.
- **Auth method**: Encrypted POST redirect with workingKey + accessCode — requires IP/domain whitelisting
- **Test account**: Requires merchant registration + manual approval
- **Difficulty**: 5/5
- **Why it's hard**: No official Node.js SDK. Requires manual AES-128 encryption of request params. Redirect-based flow (not API). Documentation is minimal and confusing. IP whitelisting required.
- **Recommendation**: ALREADY LISTED — highest priority India adapter due to difficulty

---

### 2. Braintree
- **Region/vertical**: Global (PayPal subsidiary), US/EU heavy
- **npm package**: `braintree` (official) — ~120K weekly downloads
- **Last updated**: Active
- **Known complaints**: "Long setup timelines", "API configuration issues", "slow support for lower-volume merchants", documentation lacks depth compared to Stripe
- **Auth method**: Client token + server-side nonce, separate Drop-In UI SDK
- **Test account**: Easy (sandbox)
- **Difficulty**: 4/5
- **Why it's hard**: Separate client/server SDK split is confusing. Drop-In UI has different API than Hosted Fields. PayPal/Venmo/Apple Pay each require separate configuration paths. Three.js 3D Secure flow is complex. Vault vs. transact flows are different.
- **Recommendation**: **ADD** — huge user base, PayKit can unify the fragmented client/server split

---

### 3. Amazon Pay
- **Region/vertical**: Global, Amazon ecosystem merchants
- **npm package**: `@amazonpay/amazon-pay-api-sdk-nodejs` (official) — ~2K weekly downloads
- **Last updated**: Active
- **Known complaints**: Developers expected it to work like Google/Apple Pay via Stripe but "found it quite different and confusing". Asymmetric encryption (public/private key pair) required for all API calls. Signature generation is a critical failure point.
- **Auth method**: RSA key pair + Public Key ID, checkout session flow
- **Test account**: Available via Amazon Pay Integration Central
- **Difficulty**: 5/5
- **Why it's hard**: Asymmetric encryption for API auth (not just API keys). Multi-step checkout session flow. Requires button rendering with valid signature or redirect fails silently. Completely different model from other gateways. OAuth-based buyer authentication.
- **Recommendation**: **ADD** — massive demand, genuinely difficult, PayKit wrapping adds huge value

---

### 4. Instamojo
- **Region/vertical**: India SMB, freelancers, small businesses
- **npm package**: `instamojo-nodejs` (community) — ~200 weekly downloads
- **Last updated**: 3+ years ago
- **Known complaints**: No official Node.js SDK. Community wrappers are unmaintained. Webhooks are "asynchronous and deferred" so you can't get transaction details immediately. API v1.1 is dated.
- **Auth method**: API key + auth token, redirect-based payment links
- **Test account**: Available (test mode)
- **Difficulty**: 3/5
- **Why it's hard**: No official SDK. Payment links model (not direct API charges). Webhook delays. Limited payment method support. API design is dated.
- **Recommendation**: **ADD** — widely used by Indian SMBs, terrible DX, PayKit wrapper adds real value

---

### 5. Xendit
- **Region/vertical**: Southeast Asia (Indonesia, Philippines, Thailand, Vietnam, Malaysia)
- **npm package**: `xendit-node` (official) — ~5K weekly downloads
- **Last updated**: Active
- **Known complaints**: GitHub issues show various integration problems. SDK requires Node 18+. Regional payment methods (e-wallets, bank transfers, QR codes) each have different flows.
- **Auth method**: Secret API key, webhook callbacks
- **Test account**: Available (test mode)
- **Difficulty**: 3/5
- **Why it's hard**: Each Southeast Asian country has different payment methods with different flows. E-wallets (GoPay, OVO, Dana, ShopeePay) each have unique redirect/callback patterns. Invoice vs. direct charge vs. QR code are separate APIs.
- **Recommendation**: **ADD** — PayKit can unify the fragmented SEA payment landscape into one interface

---

### 6. Midtrans
- **Region/vertical**: Indonesia (GoTo/Tokopedia ecosystem), Southeast Asia
- **npm package**: `midtrans-client` (official) — ~3K weekly downloads
- **Last updated**: Active
- **Known complaints**: Three separate products (Snap, Snap Redirect, Core API/VT-Direct) with different integration patterns. Documentation split across products.
- **Auth method**: Server key + client key, multiple product APIs
- **Test account**: Available (sandbox)
- **Difficulty**: 3/5
- **Why it's hard**: Three separate product lines with different integration approaches. Snap (popup), Snap Redirect (redirect), Core API (direct) — developer must choose and implement differently for each. GoPay, ShopeePay, bank transfers all have separate flows.
- **Recommendation**: **ADD** — dominant in Indonesia, multiple confusing products, PayKit unifies them

---

### 7. Billdesk
- **Region/vertical**: India enterprise, government payments, utility bills
- **npm package**: None — no official or community Node.js SDK
- **Last updated**: N/A
- **Known complaints**: No Node.js SDK at all. Integration requires manual HTTP requests with HMAC-SHA256 signing. Documentation is behind a merchant portal login.
- **Auth method**: HMAC-SHA256 message signing, merchant ID + security ID
- **Test account**: Requires merchant application (enterprise only)
- **Difficulty**: 5/5
- **Why it's hard**: Zero SDK support for Node.js. Must hand-craft every API call. Message signing is manual. Documentation not publicly accessible. Enterprise-only onboarding.
- **Recommendation**: **DEFER** — no test account without business verification, can't develop without merchant access

---

### 8. PayTabs
- **Region/vertical**: MENA region (Saudi Arabia, UAE, Egypt, Jordan)
- **npm package**: `paytabs_pt2` (official) — ~100 weekly downloads
- **Last updated**: 1+ year ago
- **Known complaints**: SDK integration issues reported in GitHub. React Native package has "pod file not found" problems. Developer community discussions show recurring setup problems.
- **Auth method**: Server key + profile ID, hosted payment page or managed form
- **Test account**: Available (demo account)
- **Difficulty**: 3/5
- **Why it's hard**: Low npm downloads suggest low adoption. MENA-specific payment methods (SADAD, MADA, Fawry). Documentation is adequate but SDK is lightly maintained.
- **Recommendation**: **ADD** — underserved MENA market, PayKit can provide better DX than their SDK

---

### 9. Iyzico
- **Region/vertical**: Turkey (often called "Stripe of Turkey")
- **npm package**: `iyzipay` (official) — ~1.5K weekly downloads
- **Last updated**: Active
- **Known complaints**: Documentation primarily in Turkish. Some Shopify integration issues reported.
- **Auth method**: API key + secret key, hosted checkout or direct API
- **Test account**: Available (sandbox)
- **Difficulty**: 2/5
- **Why it's hard**: Documentation quality varies (some only in Turkish). Turkey-specific payment methods (BKM Express). Lower difficulty than most on this list.
- **Recommendation**: **DEFER** — decent SDK already exists, moderate difficulty, lower priority

---

### 10. Worldpay (already listed but scored for difficulty)
- **Region/vertical**: Global enterprise, 175+ countries
- **npm package**: `node-worldpay` — 1 weekly download (!)
- **Last updated**: 12+ months ago, considered discontinued
- **Known complaints**: npm package gets literally 1 download per week. Effectively abandoned.
- **Auth method**: XML-based API or REST API with credentials
- **Test account**: Available (test environment)
- **Difficulty**: 5/5
- **Why it's hard**: No maintained Node.js SDK. Legacy XML-based API still in use alongside newer REST API. Enterprise-only documentation. Complex multi-step auth flows.
- **Recommendation**: ALREADY LISTED — extremely difficult, abandoned Node.js ecosystem

---

### 11. Paddle
- **Region/vertical**: Global SaaS, digital products (merchant of record)
- **npm package**: `@paddle/paddle-node-sdk` (official) — active, v1.0
- **Last updated**: Active, v1 stable
- **Known complaints**: Merchant-of-record model means different integration paradigm. Subscription management is complex.
- **Auth method**: API key, webhook signatures
- **Test account**: Available (sandbox)
- **Difficulty**: 2/5
- **Why it's hard**: Not actually that hard anymore — official SDK is v1 stable with TypeScript. Different paradigm (MoR) but well-documented.
- **Recommendation**: **SKIP** — good official SDK, low difficulty, MoR model is fundamentally different from gateway pattern

---

### 12. eWay
- **Region/vertical**: Australia/New Zealand
- **npm package**: `eway-rapid-node` (official) — limited downloads
- **Last updated**: Sporadically maintained
- **Known complaints**: Limited documentation, small community
- **Auth method**: API key + password, Rapid API
- **Test account**: Available (sandbox)
- **Difficulty**: 3/5
- **Why it's hard**: Small community means limited help. AU/NZ specific payment methods. SDK is lightly maintained.
- **Recommendation**: **ADD** — underserved AU/NZ market, PayKit can provide better DX

---

### 13. Paystack
- **Region/vertical**: Africa (Nigeria, Ghana, South Africa, Kenya) — acquired by Stripe but separate API
- **npm package**: `paystack-node` (community) — ~1K weekly downloads
- **Last updated**: Community maintained
- **Known complaints**: Despite Stripe acquisition, API is completely separate from Stripe. Community SDK, not official.
- **Auth method**: Secret key, webhook signatures
- **Test account**: Available (test mode)
- **Difficulty**: 2/5
- **Why it's hard**: Not very hard — API is actually clean. But separate from Stripe ecosystem despite being owned by them. Mobile money, bank transfers, USSD all have different flows.
- **Recommendation**: **ADD** — dominant in Africa, separate from Stripe, PayKit unifies with Stripe adapter

---

### 14. SumUp
- **Region/vertical**: EU SMB, in-person + online payments
- **npm package**: `@sumup/sdk` (official) — TypeScript, active
- **Last updated**: Active
- **Known complaints**: Primarily known for card readers, online API is secondary. Some initialization issues reported.
- **Auth method**: OAuth 2.0, access tokens
- **Test account**: Available
- **Difficulty**: 2/5
- **Why it's hard**: Not very hard for online payments. More focused on POS/terminal.
- **Recommendation**: **SKIP** — primarily POS/terminal, online API is secondary use case

---

## Summary

### ADD to adapter list (Track B — 8 new adapters)

| # | Provider | Region | Difficulty | Why PayKit adds value |
|---|----------|--------|-----------|----------------------|
| 1 | **Braintree** | Global | 4/5 | Fragmented client/server SDK, multiple payment method configs |
| 2 | **Amazon Pay** | Global | 5/5 | RSA key auth, checkout sessions, completely different model |
| 3 | **Instamojo** | India SMB | 3/5 | No official SDK, payment links model, webhook delays |
| 4 | **Xendit** | Southeast Asia | 3/5 | Fragmented regional payment methods, per-country differences |
| 5 | **Midtrans** | Indonesia | 3/5 | Three separate products with different integration approaches |
| 6 | **PayTabs** | MENA | 3/5 | Lightly maintained SDK, underserved region |
| 7 | **eWay** | AU/NZ | 3/5 | Small community, lightly maintained SDK |
| 8 | **Paystack** | Africa | 2/5 | Separate from Stripe despite acquisition, unifies African payments |

### SKIP (good SDK or wrong fit)

| Provider | Reason |
|----------|--------|
| Paddle | Good official SDK v1 stable, MoR model is different paradigm |
| SumUp | Primarily POS/terminal, not online payments |
| Iyzico | Decent SDK, moderate difficulty, lower priority |

### DEFER (can't develop without business verification)

| Provider | Reason |
|----------|--------|
| Billdesk | No test account without merchant application, no SDK at all |

### Already scored (in existing backlog)

| Provider | Difficulty | Notes |
|----------|-----------|-------|
| CCAvenue | 5/5 | No official SDK, AES encryption, redirect-only |
| Worldpay | 5/5 | 1 npm download/week, effectively abandoned |
| Authorize.net | 3/5 | Official SDK exists but version lag |

---

## Updated Adapter Count

- **Already built**: 3 (Stripe, Razorpay, PayPal)
- **Listed in backlog (Track A)**: 21 remaining
- **New from research (Track B)**: 8
- **Grand total**: 32 adapters

## Recommended Build Order for Track B

Interleave with Track A schedule. Priority based on market size and difficulty:

1. **Braintree** — huge user base, high difficulty, massive value-add
2. **Amazon Pay** — huge demand, highest difficulty, biggest DX improvement
3. **Xendit** — growing SEA market, fragments badly without wrapper
4. **Midtrans** — dominant Indonesia, three confusing product lines
5. **Paystack** — dominant Africa, unifies with Stripe adapter
6. **Instamojo** — India SMB coverage gap
7. **PayTabs** — MENA coverage
8. **eWay** — AU/NZ coverage
