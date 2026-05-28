# Contributing to PayKit

Thank you for your interest in contributing to PayKit! This guide will help you get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Building a Custom Adapter](#building-a-custom-adapter)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Commit Guidelines](#commit-guidelines)
- [Publishing](#publishing)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please:

- Be welcoming and inclusive
- Respect differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20.0.0
- **npm** ≥ 11.0.0
- **Git**

### Fork and clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/paykit.git
cd paykit

# Add upstream remote
git remote add upstream https://github.com/SquaredR98/paykit.git

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

### Development setup

```bash
# Run all tests in watch mode
npm run test:watch

# Type check all packages
npm run typecheck

# Lint code
npm run lint

# Format code
npm run format

# Clean build artifacts
npm run clean
```

---

## Development Workflow

### Making changes

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in the relevant package(s)

3. **Add tests** for any new functionality

4. **Run tests** to ensure nothing broke:
   ```bash
   npm test
   npm run typecheck
   ```

5. **Commit your changes** following our [commit guidelines](#commit-guidelines)

6. **Push and create a PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Testing your changes locally

To test your changes in a local project:

```bash
# In the paykit repo
npm run build

# In your test project
npm link ../path/to/paykit/packages/core
npm link ../path/to/paykit/packages/adapter/stripe
# etc.
```

Or use npm workspaces and test in the demo app:

```bash
cd apps/demo
npm run dev
```

---

## Project Structure

```
paykit/
├── packages/
│   ├── core/                     # @squaredr/paykit
│   │   ├── src/
│   │   │   ├── adapter.ts        # PaymentAdapter interface
│   │   │   ├── client.ts         # PayKit class
│   │   │   ├── registry.ts       # Provider registry
│   │   │   ├── router.ts         # Multi-provider routing
│   │   │   ├── types/            # Unified types
│   │   │   └── utils/            # Utilities (currency, etc.)
│   │   └── __tests__/            # Tests
│   │
│   ├── adapter/
│   │   ├── stripe/               # @squaredr/paykit/stripe
│   │   │   ├── src/
│   │   │   │   ├── adapter.ts    # StripeAdapter (server-side)
│   │   │   │   ├── client/       # StripeClientAdapter (browser)
│   │   │   │   └── mappers/      # Stripe → Unified type mappers
│   │   │   └── __tests__/
│   │   │
│   │   └── razorpay/             # @squaredr/paykit/razorpay
│   │       └── ...               # Same structure as Stripe
│   │
│   ├── sdk-js/                   # @squaredr/paykit-js
│   │   ├── src/
│   │   │   ├── client.ts         # PayKitClient (browser SDK)
│   │   │   ├── script-loader.ts  # Dynamic script loading
│   │   │   └── providers/        # Provider bridge implementations
│   │   └── __tests__/
│   │
│   └── react/                    # @squaredr/paykit-react
│       ├── src/
│       │   ├── context/          # PayKitProvider
│       │   ├── components/       # CheckoutForm, CardInput
│       │   └── hooks/            # usePayKit, usePaymentStatus
│       └── __tests__/
│
├── apps/
│   └── demo/                     # Next.js demo app
│
├── turbo.json                    # Turborepo configuration
├── tsconfig.base.json            # Shared TypeScript config
└── biome.json                    # Linter/formatter config
```

---

## Building a Custom Adapter

Want to add support for a new payment provider? Here's how:

### 1. Create adapter structure

```bash
mkdir -p packages/adapter/your-provider/src
cd packages/adapter/your-provider
```

### 2. Set up package.json

```json
{
  "name": "@squaredr/paykit-your-provider",
  "version": "0.1.0",
  "description": "YourProvider adapter for @squaredr/paykit",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./client": {
      "types": "./dist/client/index.d.ts",
      "import": "./dist/client/index.js",
      "require": "./dist/client/index.cjs"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "keywords": ["payments", "your-provider", "paykit", "payment-gateway"],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/SquaredR98/paykit.git",
    "directory": "packages/adapter/your-provider"
  },
  "peerDependencies": {
    "@squaredr/paykit": ">=0.1.0"
  },
  "dependencies": {
    "your-provider-sdk": "^1.0.0"
  }
}
```

### 3. Implement PaymentAdapter (server-side)

```ts
// src/adapter.ts
import type { PaymentAdapter, AdapterConfig, UnifiedCharge } from '@squaredr/paykit';
import YourProviderSDK from 'your-provider-sdk';

export interface YourProviderConfig extends AdapterConfig {
  secretKey: string;
  // ... other config options
}

export class YourProviderAdapter implements PaymentAdapter {
  readonly provider = 'your-provider';
  private client: YourProviderSDK;

  constructor(config: YourProviderConfig) {
    this.client = new YourProviderSDK({ apiKey: config.secretKey });
  }

  async charges.create(params: ChargeCreateParams): Promise<UnifiedCharge> {
    const charge = await this.client.charges.create({
      amount: params.amount,
      currency: params.currency,
      // ... map parameters
    });

    return mapChargeToUnified(charge); // Implement mapper
  }

  async charges.retrieve(id: string): Promise<UnifiedCharge> {
    // ... implement
  }

  async charges.cancel(id: string): Promise<UnifiedCharge> {
    // ... implement
  }

  // For free adapters, stub out Pro methods that throw errors
  refunds = {
    create() {
      throw new Error('Refunds require @squaredr/paykit-your-provider-pro');
    },
    retrieve() {
      throw new Error('Refunds require @squaredr/paykit-your-provider-pro');
    },
  };

  payouts = {
    create() {
      throw new Error('Payouts require @squaredr/paykit-your-provider-pro');
    },
  };

  // Implement basic webhook handling (free)
  webhooks = {
    construct(options) {
      // Verify signature and parse events
      // ... implement
    },
  };
}
```

### 4. Implement ClientAdapter (browser-side)

```ts
// src/client/your-provider-hosted.ts
import type { ClientAdapter, MountOptions, ConfirmPaymentOptions } from '@squaredr/paykit';

export class YourProviderClientAdapter implements ClientAdapter {
  readonly provider = 'your-provider';
  readonly inputMode = 'hosted-fields'; // or 'hosted-page' or 'redirect'

  private sdk: any;

  constructor(private publicKey: string) {}

  async loadScript(): Promise<void> {
    // Load provider's JavaScript SDK
  }

  isReady(): boolean {
    return !!this.sdk;
  }

  async mount(container: HTMLElement, options: MountOptions): Promise<void> {
    // Mount payment form/fields
  }

  unmount(): void {
    // Clean up mounted elements
  }

  async confirmPayment(options: ConfirmPaymentOptions): Promise<PaymentConfirmResult> {
    // Confirm payment with provider
  }

  updateAppearance(appearance: AppearanceConfig): void {
    // Update styling
  }

  on(event: ClientEventType, listener: ClientEventListener): void {
    // Register event listener
  }

  off(event: ClientEventType, listener: ClientEventListener): void {
    // Remove event listener
  }

  destroy(): void {
    this.unmount();
    // Clean up SDK instance
  }
}
```

### 5. Add mappers

```ts
// src/mappers/charge.ts
import type { UnifiedCharge } from '@squaredr/paykit';

export function mapChargeToUnified(charge: YourProviderCharge): UnifiedCharge {
  return {
    id: charge.id,
    amount: charge.amount,
    currency: charge.currency,
    status: mapStatus(charge.status),
    paymentMethod: charge.payment_method_id,
    clientSecret: charge.client_secret,
    metadata: charge.metadata,
    createdAt: new Date(charge.created * 1000),
    _raw: charge, // Include raw object for provider-specific access
  };
}

function mapStatus(status: string): ChargeStatus {
  switch (status) {
    case 'succeeded': return 'succeeded';
    case 'pending': return 'pending';
    case 'failed': return 'failed';
    default: return 'pending';
  }
}
```

### 6. Write tests

```ts
// __tests__/adapter.test.ts
import { describe, it, expect, vi } from 'vitest';
import { YourProviderAdapter } from '../src/adapter';

describe('YourProviderAdapter', () => {
  it('should create a charge', async () => {
    const adapter = new YourProviderAdapter({ secretKey: 'test_key' });
    const charge = await adapter.charges.create({
      amount: 5000,
      currency: 'usd',
    });

    expect(charge.amount).toBe(5000);
    expect(charge.currency).toBe('usd');
    expect(charge.status).toBeDefined();
  });

  // Add more tests...
});
```

### 7. Add tsup.config.ts

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'client/index': 'src/client/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['@squaredr/paykit'],
});
```

### 8. Export from index files

```ts
// src/index.ts (server-side exports)
export { YourProviderAdapter } from './adapter';
export type { YourProviderConfig } from './adapter';

// src/client/index.ts (browser exports)
export { YourProviderClientAdapter } from './your-provider-hosted';
```

### 9. Add README

Document your adapter's capabilities, configuration, and usage. See existing adapter READMEs for reference.

---

## Building Pro Adapters

Pro adapters extend free base adapters with advanced features. This section is for contributors building commercial Pro packages.

### Pro Adapter Architecture

Pro adapters follow this structure:

```
packages/adapter/your-provider-pro/
├── src/
│   ├── adapter.ts              # YourProviderProAdapter extends base
│   ├── refunds.ts              # Refund operations
│   ├── payouts.ts              # Payout operations
│   ├── subscriptions.ts        # Full subscription lifecycle
│   ├── customers.ts            # Full CRUD customer operations
│   ├── payment-methods.ts      # Payment method management
│   ├── license.ts              # License validation
│   │
│   └── dashboard/              # React dashboard components
│       ├── TransactionList.tsx
│       ├── RefundForm.tsx
│       ├── SubscriptionTable.tsx
│       ├── Analytics.tsx
│       └── index.ts
│
└── package.json
```

### Pro Adapter Implementation

```ts
// packages/adapter/your-provider-pro/src/adapter.ts
import { YourProviderAdapter } from '@squaredr/paykit-your-provider';
import { validateLicense } from './license';

export interface YourProviderProConfig {
  secretKey: string;
  licenseKey: string;
}

export class YourProviderProAdapter extends YourProviderAdapter {
  constructor(config: YourProviderProConfig) {
    super({ secretKey: config.secretKey });
    validateLicense(config.licenseKey); // Validates against licensing API
  }

  // Override with real implementations
  refunds = {
    async create(params) {
      const refund = await this.client.refunds.create({
        charge: params.chargeId,
        amount: params.amount,
        reason: params.reason,
      });
      return mapToUnifiedRefund(refund);
    },

    async retrieve(id) {
      const refund = await this.client.refunds.retrieve(id);
      return mapToUnifiedRefund(refund);
    },

    async list(params) {
      const refunds = await this.client.refunds.list(params);
      return refunds.map(mapToUnifiedRefund);
    },
  };

  payouts = {
    async create(params) {
      // Implement payout creation
    },

    async retrieve(id) {
      // Implement payout retrieval
    },

    async list(params) {
      // Implement payout listing
    },
  };

  subscriptions = {
    async create(params) { /* ... */ },
    async retrieve(id) { /* ... */ },
    async update(id, params) { /* ... */ },
    async cancel(id) { /* ... */ },
    async list(params) { /* ... */ },
  };
}
```

### License Validation

```ts
// packages/adapter/your-provider-pro/src/license.ts
interface LicenseValidationResponse {
  valid: boolean;
  expiresAt: string;
  features: string[];
}

const LICENSE_CACHE = new Map<string, { valid: boolean; expiresAt: Date }>();

export async function validateLicense(licenseKey: string): Promise<void> {
  // Check cache first (24h TTL)
  const cached = LICENSE_CACHE.get(licenseKey);
  if (cached && cached.expiresAt > new Date()) {
    if (!cached.valid) {
      throw new Error('PayKit Pro license invalid or expired');
    }
    return;
  }

  // Validate with licensing API
  const response = await fetch('https://api.squaredr.com/paykit/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ licenseKey }),
  });

  if (!response.ok) {
    throw new Error(
      'Failed to validate PayKit Pro license. Visit https://squaredr.tech/products/paykit/pro'
    );
  }

  const data: LicenseValidationResponse = await response.json();

  if (!data.valid) {
    throw new Error(
      'PayKit Pro license invalid or expired. Renew at https://squaredr.tech/products/paykit/pro'
    );
  }

  // Cache for 24 hours
  LICENSE_CACHE.set(licenseKey, {
    valid: data.valid,
    expiresAt: new Date(data.expiresAt),
  });
}
```

### Dashboard Components

Pro adapters include React dashboard components:

```tsx
// packages/adapter/your-provider-pro/src/dashboard/TransactionList.tsx
'use client';

import { useState, useEffect } from 'react';
import type { YourProviderProAdapter } from '../adapter';

interface TransactionListProps {
  adapter: YourProviderProAdapter;
}

export function TransactionList({ adapter }: TransactionListProps) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adapter.charges.list({ limit: 100 })
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, [adapter]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="paykit-dashboard">
      <h2>Transactions</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.id}</td>
              <td>${(tx.amount / 100).toFixed(2)}</td>
              <td>{tx.status}</td>
              <td>
                {tx.status === 'succeeded' && (
                  <button onClick={() => handleRefund(tx.id)}>
                    Refund
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Pro Package Configuration

```json
// packages/adapter/your-provider-pro/package.json
{
  "name": "@squaredr/paykit-your-provider-pro",
  "version": "0.1.0",
  "description": "Pro features for YourProvider adapter",
  "license": "Commercial",
  "peerDependencies": {
    "@squaredr/paykit": ">=0.1.0",
    "@squaredr/paykit-your-provider": ">=0.1.0",
    "react": "^18.0.0 || ^19.0.0"
  },
  "dependencies": {
    "your-provider-sdk": "^1.0.0"
  }
}
```

### Pro Adapter Guidelines

1. **Extend, don't replace** — Pro adapters extend base adapters, reusing core functionality
2. **License validation** — Always validate license keys on initialization
3. **Graceful degradation** — If license fails, provide clear error messages with purchase links
4. **Dashboard styling** — Use consistent CSS classes (`paykit-dashboard-*`) for theming
5. **Documentation** — Document all Pro-only features clearly with `🔥 PRO` badges
6. **Testing** — Include tests for Pro features, mock license validation in tests

---

## Testing

### Running tests

```bash
# All tests
npm test

# Specific package
npm test --workspace=packages/core

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage
```

### Writing tests

- Place tests in `__tests__/` directory or colocate as `*.test.ts`
- Use Vitest's `describe`, `it`, `expect` syntax
- Mock external SDKs using `vi.mock()`
- Test both success and error paths
- Aim for high coverage on core logic

Example:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayKit } from '../src/client';
import { MockAdapter } from './mocks';

describe('PayKit', () => {
  let paykit: PayKit;

  beforeEach(() => {
    paykit = new PayKit({ adapter: new MockAdapter() });
  });

  it('should create a charge', async () => {
    const charge = await paykit.charges.create({
      amount: 5000,
      currency: 'usd',
    });

    expect(charge.id).toBeDefined();
    expect(charge.amount).toBe(5000);
  });
});
```

---

## Pull Request Process

### Before submitting

1. ✅ All tests pass (`npm test`)
2. ✅ TypeScript compiles (`npm run typecheck`)
3. ✅ Code is formatted (`npm run format`)
4. ✅ Linter passes (`npm run lint`)
5. ✅ New features have tests
6. ✅ Breaking changes are documented

### PR checklist

- [ ] PR title follows [Conventional Commits](#commit-guidelines)
- [ ] Description explains what/why (not just how)
- [ ] Tests added/updated for new features
- [ ] Documentation updated (README, TSDoc comments)
- [ ] Changeset added (if applicable): `npx changeset`
- [ ] No unrelated changes
- [ ] CI checks pass

### Review process

1. A maintainer will review your PR within 3-5 business days
2. Address feedback by pushing new commits
3. Once approved, a maintainer will merge your PR
4. Your changes will be included in the next release

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

### Types

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Formatting, missing semicolons, etc. (no code change)
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `perf:` Performance improvement
- `test:` Adding or updating tests
- `chore:` Maintenance tasks (deps, build config, etc.)

### Examples

```bash
feat(stripe): add subscription support
fix(core): handle null currency in router
docs(readme): update installation instructions
test(razorpay): add webhook verification tests
chore(deps): upgrade vitest to v3.2.1
```

### Scope

Use package names as scope:
- `core` — @squaredr/paykit
- `stripe` — @squaredr/paykit/stripe
- `razorpay` — @squaredr/paykit/razorpay
- `sdk-js` — @squaredr/paykit-js
- `react` — @squaredr/paykit-react
- `demo` — demo app

---

## Publishing

### For maintainers only

1. **Create changesets** for each PR:
   ```bash
   npx changeset
   ```

2. **Version packages** (updates package.json + CHANGELOG):
   ```bash
   npx changeset version
   git commit -am "chore: version packages"
   ```

3. **Build and publish** to npm:
   ```bash
   npm run build
   npx changeset publish
   git push --follow-tags
   ```

### Changeset types

- **patch** — Bug fixes, minor improvements (0.1.0 → 0.1.1)
- **minor** — New features, non-breaking changes (0.1.0 → 0.2.0)
- **major** — Breaking changes (0.1.0 → 1.0.0)

---

## Questions?

- **Bug reports**: [GitHub Issues](https://github.com/SquaredR98/paykit/issues)
- **Feature requests**: [GitHub Discussions](https://github.com/SquaredR98/paykit/discussions)
- **General questions**: [GitHub Discussions](https://github.com/SquaredR98/paykit/discussions)

---

Thank you for contributing to PayKit! 🎉
