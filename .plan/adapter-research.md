# Adapter Research — Hard-to-Integrate, High-Demand Providers

> **Purpose**: Find payment providers beyond the 24 listed in `backlog.md` that are heavily used
> but have poor Node.js/React DX, lots of community complaints, and would benefit most from
> a PayKit wrapper.
>
> **Status**: NOT STARTED — research to be conducted during/after Phase 2 audit

---

## Selection Criteria

A provider qualifies for this list if it meets ALL of:

1. **High demand** — significant market share in at least one region or vertical
2. **Poor Node.js DX** — bad/missing official SDK, poor TypeScript support, confusing API design
3. **Community complaints** — GitHub issues, Reddit threads, Stack Overflow questions about integration pain
4. **Hard to integrate** — complex auth flows, poor documentation, inconsistent APIs, weird edge cases
5. **Test account available** — can get sandbox/test API keys without business verification or KYC

## Research Method

For each candidate:
- Search npm for official SDK (quality, maintenance, downloads, issues)
- Search GitHub issues for integration complaints
- Search Reddit (r/node, r/reactjs, r/webdev) for developer pain
- Check their developer docs for sandbox/test account signup
- Evaluate API design complexity (auth method, flow type, webhook format)
- Score difficulty 1-5 (5 = hardest to integrate)

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

## Candidates to Research

> Fill in during Phase 2. For each, document:
> - Provider name and region/vertical
> - npm package (if any), downloads, last update
> - Known complaints (links)
> - Auth complexity and API design issues
> - Test account signup process
> - Difficulty score (1-5)
> - Recommendation: ADD / SKIP / DEFER

### Template:

```
### [Provider Name]
- **Region/vertical**:
- **npm package**:
- **Downloads**:
- **Last updated**:
- **Known complaints**:
- **Auth method**:
- **Test account**: Easy / Requires verification / Not available
- **Difficulty**: X/5
- **Why it's hard**:
- **Recommendation**: ADD / SKIP / DEFER
```

### Candidates to investigate:

- [ ] Checkout.com — already in backlog (B4.13), but evaluate difficulty
- [ ] Klarna — already in backlog (B4.14), but evaluate difficulty
- [ ] dLocal — LatAm/emerging markets aggregator
- [ ] Rapyd (now Nuvei) — may overlap with Nuvei
- [ ] Paddle — SaaS billing, merchant of record
- [ ] Lemon Squeezy — digital products, similar to Paddle
- [ ] Billdesk — India enterprise, government payments
- [ ] Instamojo — India SMB, notoriously painful API
- [ ] PayTabs — MENA region
- [ ] Xendit — Southeast Asia
- [ ] Midtrans (Veritrans) — Indonesia, Tokopedia/GoTo ecosystem
- [ ] Paystack — Africa (acquired by Stripe but separate API)
- [ ] Yoco — South Africa
- [ ] Iyzico — Turkey
- [ ] Tap Payments — MENA
- [ ] SumUp — EU SMB
- [ ] Eway — Australia/NZ
- [ ] Braintree — PayPal subsidiary, but separate complex API
- [ ] Amazon Pay — complex OAuth + widgets
- [ ] Apple Pay (direct) — certificate-based, not via Stripe
- [ ] Google Pay (direct) — separate from processor integrations

---

## Research Output

After research, add qualified providers to `backlog.md` as Category B5 (Community-Requested Adapters) and schedule them in the daily cadence.
