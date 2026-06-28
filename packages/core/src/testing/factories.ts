import type { UnifiedCharge } from '../types/charge.js';
import type { UnifiedRefund } from '../types/refund.js';
import type { UnifiedCustomer } from '../types/customer.js';
import type { UnifiedWebhookEvent } from '../types/webhook.js';

/**
 * Create a mock UnifiedCharge with sensible defaults. Override any field.
 *
 * @example
 * const charge = createMockCharge({ amount: 5000, currency: 'EUR' });
 */
export function createMockCharge(overrides?: Partial<UnifiedCharge>): UnifiedCharge {
  const now = new Date();
  return {
    id: 'ch_mock_1',
    providerId: 'pi_mock_1',
    provider: 'mock',
    amount: 1000,
    currency: 'USD',
    status: 'succeeded',
    createdAt: now,
    updatedAt: now,
    _raw: {},
    ...overrides,
  };
}

/**
 * Create a mock UnifiedRefund with sensible defaults. Override any field.
 *
 * @example
 * const refund = createMockRefund({ chargeId: 'ch_123', amount: 500 });
 */
export function createMockRefund(overrides?: Partial<UnifiedRefund>): UnifiedRefund {
  return {
    id: 're_mock_1',
    providerId: 're_mock_1',
    provider: 'mock',
    chargeId: 'ch_mock_1',
    amount: 1000,
    currency: 'USD',
    status: 'succeeded',
    createdAt: new Date(),
    _raw: {},
    ...overrides,
  };
}

/**
 * Create a mock UnifiedCustomer with sensible defaults. Override any field.
 *
 * @example
 * const customer = createMockCustomer({ email: 'test@example.com' });
 */
export function createMockCustomer(overrides?: Partial<UnifiedCustomer>): UnifiedCustomer {
  return {
    id: 'cus_mock_1',
    providerId: 'cus_mock_1',
    provider: 'mock',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    _raw: {},
    ...overrides,
  };
}

/**
 * Create a mock UnifiedWebhookEvent with sensible defaults. Override any field.
 *
 * @example
 * const event = createMockWebhookEvent({ type: 'refund.succeeded' });
 */
export function createMockWebhookEvent(overrides?: Partial<UnifiedWebhookEvent>): UnifiedWebhookEvent {
  return {
    id: 'evt_mock_1',
    provider: 'mock',
    type: 'charge.succeeded',
    providerType: 'mock.charge.succeeded',
    data: {},
    createdAt: new Date(),
    _raw: {},
    ...overrides,
  };
}
