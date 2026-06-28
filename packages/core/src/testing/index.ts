// @squaredr/paykit/testing — Mock adapter, factories, and test utilities

export { MockAdapter } from './mock-adapter.js';
export {
  createMockCharge,
  createMockRefund,
  createMockCustomer,
  createMockWebhookEvent,
} from './factories.js';

export function runAdapterConformanceTests(
  _adapterClass: unknown,
  _config: unknown,
): void {
  throw new Error('Conformance test suite not yet implemented');
}
