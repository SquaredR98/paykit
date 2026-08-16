---
title: FAQ
description: >-
  Frequently asked questions about PayKit — licensing, provider support, security, performance, and more.
---

Frequently asked questions about PayKit.

## General

### What is PayKit?

PayKit is a unified, type-safe payment SDK for Node.js and the browser. It provides a single API that works across multiple payment providers (Stripe, Razorpay, PayPal, and more). You write your payment logic once and swap providers by changing a single import.

### Is PayKit free?

Yes. The entire SDK is MIT-licensed and free — the core package, all provider adapters (Stripe, Razorpay, PayPal), React components, and the vanilla JS SDK. No paid tiers, no license keys.

### Does PayKit add any fees on top of provider fees?

No. PayKit is a client-side library that runs in your application. It does not proxy payments or add any transaction fees. You pay only what your provider charges.

### Does PayKit collect telemetry or analytics?

No. PayKit does not include any telemetry, analytics, or phone-home functionality. Your payment data stays between your application and your provider.

## Providers

### Which providers are supported?

Currently: **Stripe**, **Razorpay**, and **PayPal**. If your provider isn't on the list, you can [build a custom adapter](/docs/guides/custom-adapter) — the `PaymentAdapter` interface is documented and all built-in adapters serve as reference implementations.

### Can I use multiple providers at the same time?

Yes. Use the `PaymentRouter` to route transactions to different providers based on currency, region, or custom rules. See the [Multi-Provider Guide](/docs/guides/multi-provider) for details.

### Can I build my own adapter?

Yes. Implement the `PaymentAdapter` interface and pass it to the `PayKit` constructor. The [API Reference](/docs/reference/api-reference) documents the full interface, and the [Custom Adapters Guide](/docs/guides/custom-adapter) walks through the process step by step.

## Architecture

### How are adapters packaged?

All adapters are subpath exports of `@squaredr/paykit`. For example, import the Stripe adapter from `@squaredr/paykit/stripe`. The provider SDKs (`stripe`, `razorpay`) are optional peer dependencies — install only the ones you use.

### What's the difference between server and client adapters?

Server adapters (`@squaredr/paykit/stripe`) hold your secret key and handle charge creation, refunds, and webhook verification. Client adapters (`@squaredr/paykit/stripe/client`) contain only browser-safe code for confirming payments and rendering checkout UIs. They are separate entry points so your bundler tree-shakes them independently.

### What happens if an adapter doesn't support an operation?

It throws a `NotSupportedError`. You can check `paykit.capabilities` before calling an operation to see what the current adapter supports. There are 13 capability flags covering charges, refunds, subscriptions, payouts, webhooks, and more.

## Security

### Does PayKit handle PCI compliance?

PayKit does not handle or store card numbers. Card data is tokenised by the provider's own SDK (e.g. Stripe Elements, Razorpay Checkout). PayKit's client adapters wrap these SDKs and never touch raw card data. Your PCI scope is the same as if you used the provider SDK directly.

### Are webhook signatures verified?

Yes. Every adapter verifies webhook signatures using the provider's official verification method before parsing the event. Invalid signatures throw an error.

## Performance

### Does PayKit add overhead?

Negligible. PayKit is a thin mapping layer — it calls the provider SDK directly and maps the response into unified types. The overhead is a few microseconds of object mapping per call.

### How big is the bundle?

The core package is under 11 KB minified (ESM). Each adapter adds 15-16 KB. Client adapters are 4-6 KB. Tree-shaking ensures you only bundle what you import.

## Compatibility

### What Node.js versions are supported?

Node.js 20 and above. PayKit uses ES2022 features and ESM modules.

### Does PayKit work with Deno or Bun?

PayKit's core and adapters use standard Node.js APIs and should work with Deno and Bun. However, we only test against Node.js currently.

### Which frameworks are supported?

PayKit is framework-agnostic on the server side. It works with Next.js, Express, Fastify, Hono, Koa, and any other Node.js framework. On the frontend, we provide React components (`@squaredr/paykit-react`) and a headless vanilla JS SDK (`@squaredr/paykit-js`).
