import 'server-only';
import { UnifiedPayments } from '@squaredr/paykit';
import '@squaredr/paykit/stripe';
import '@squaredr/paykit/razorpay';
import { registerMockAdapter } from './mock-adapter';

const isMock = process.env.MOCK_PAYMENTS === 'true';

if (isMock) {
  try { registerMockAdapter(); } catch { /* already registered */ }
}

export function getPayments(provider: 'stripe' | 'razorpay' | 'mock' = 'stripe'): UnifiedPayments {
  if (isMock) {
    return new UnifiedPayments({
      provider: 'mock',
      credentials: {},
    });
  }

  if (provider === 'stripe') {
    return new UnifiedPayments({
      provider: 'stripe',
      credentials: {
        secretKey: process.env.STRIPE_SECRET_KEY!,
      },
    });
  }

  if (provider === 'razorpay') {
    return new UnifiedPayments({
      provider: 'razorpay',
      credentials: {
        keyId: process.env.RAZORPAY_KEY_ID!,
        keySecret: process.env.RAZORPAY_KEY_SECRET!,
      },
    });
  }

  throw new Error(`Unknown provider: ${provider}`);
}

export function getWebhookSecret(provider: string): string {
  if (isMock) return 'mock_webhook_secret';
  if (provider === 'stripe') return process.env.STRIPE_WEBHOOK_SECRET!;
  if (provider === 'razorpay') return process.env.RAZORPAY_WEBHOOK_SECRET!;
  throw new Error(`Unknown provider: ${provider}`);
}
