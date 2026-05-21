import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayKitClient } from '../src/client.js';
import { registerBridge } from '../src/providers/registry.js';
import type { ProviderBridge } from '../src/providers/provider-bridge.js';

// ─── Mock Bridge ───────────────────────────────────────────

function createMockBridge(): ProviderBridge {
  return {
    name: 'mock',
    loadScript: vi.fn().mockResolvedValue(undefined),
    isReady: vi.fn().mockReturnValue(true),
    mount: vi.fn().mockResolvedValue(undefined),
    unmount: vi.fn(),
    tokenize: vi.fn().mockResolvedValue({
      token: 'tok_test',
      paymentMethodType: 'card',
      last4: '4242',
      brand: 'visa',
    }),
    confirmPayment: vi.fn().mockResolvedValue({
      status: 'succeeded',
      chargeId: 'pi_test',
    }),
    updateAppearance: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
  };
}

let mockBridge: ProviderBridge;

beforeEach(() => {
  mockBridge = createMockBridge();
  // Register the mock bridge under 'stripe' for testing
  registerBridge('stripe', () => mockBridge);
});

// ─── Tests ─────────────────────────────────────────────────

describe('PayKitClient', () => {
  it('creates a client with a provider', () => {
    const client = new PayKitClient({ provider: 'stripe', publicKey: 'pk_test' });
    expect(client).toBeDefined();
  });

  it('throws when provider bridge is not registered', () => {
    expect(() => new PayKitClient({ provider: 'razorpay', publicKey: 'key' })).toThrow(
      'No provider bridge registered for "razorpay"',
    );
  });

  describe('loadProvider', () => {
    it('calls bridge.loadScript', async () => {
      const client = new PayKitClient({ provider: 'stripe', publicKey: 'pk_test' });
      await client.loadProvider();
      expect(mockBridge.loadScript).toHaveBeenCalled();
    });
  });

  describe('isReady', () => {
    it('delegates to bridge.isReady', () => {
      const client = new PayKitClient({ provider: 'stripe', publicKey: 'pk_test' });
      expect(client.isReady).toBe(true);
    });
  });

  describe('mountCardInput', () => {
    it('mounts to an HTMLElement', async () => {
      const client = new PayKitClient({ provider: 'stripe', publicKey: 'pk_test' });
      const el = document.createElement('div');
      await client.mountCardInput(el);
      expect(mockBridge.mount).toHaveBeenCalledWith(el, undefined);
    });

    it('mounts using a CSS selector', async () => {
      const client = new PayKitClient({ provider: 'stripe', publicKey: 'pk_test' });
      const el = document.createElement('div');
      el.id = 'card-element';
      document.body.appendChild(el);

      await client.mountCardInput('#card-element');
      expect(mockBridge.mount).toHaveBeenCalledWith(el, undefined);

      document.body.removeChild(el);
    });

    it('throws if selector does not match any element', async () => {
      const client = new PayKitClient({ provider: 'stripe', publicKey: 'pk_test' });
      await expect(client.mountCardInput('#nonexistent')).rejects.toThrow('Element not found');
    });
  });

  describe('tokenize', () => {
    it('returns a TokenizeResult', async () => {
      const client = new PayKitClient({ provider: 'stripe', publicKey: 'pk_test' });
      const result = await client.tokenize();
      expect(result.token).toBe('tok_test');
      expect(result.paymentMethodType).toBe('card');
      expect(result.last4).toBe('4242');
    });
  });

  describe('confirmPayment', () => {
    it('confirms with client secret', async () => {
      const client = new PayKitClient({ provider: 'stripe', publicKey: 'pk_test' });
      const result = await client.confirmPayment('pi_secret_xxx');
      expect(result.status).toBe('succeeded');
      expect(result.chargeId).toBe('pi_test');
      expect(mockBridge.confirmPayment).toHaveBeenCalledWith('pi_secret_xxx', undefined);
    });

    it('passes returnUrl option', async () => {
      const client = new PayKitClient({ provider: 'stripe', publicKey: 'pk_test' });
      await client.confirmPayment('pi_secret_xxx', { returnUrl: 'https://example.com/return' });
      expect(mockBridge.confirmPayment).toHaveBeenCalledWith('pi_secret_xxx', {
        returnUrl: 'https://example.com/return',
      });
    });
  });

  describe('updateAppearance', () => {
    it('delegates to bridge', () => {
      const client = new PayKitClient({ provider: 'stripe', publicKey: 'pk_test' });
      const appearance = { variables: { colorPrimary: '#ff0000' } };
      client.updateAppearance(appearance);
      expect(mockBridge.updateAppearance).toHaveBeenCalledWith(appearance);
    });
  });

  describe('event listeners', () => {
    it('registers and removes listeners via bridge', () => {
      const client = new PayKitClient({ provider: 'stripe', publicKey: 'pk_test' });
      const listener = vi.fn();
      client.on('ready', listener);
      expect(mockBridge.on).toHaveBeenCalledWith('ready', listener);

      client.off('ready', listener);
      expect(mockBridge.off).toHaveBeenCalledWith('ready', listener);
    });
  });

  describe('destroy', () => {
    it('delegates to bridge', () => {
      const client = new PayKitClient({ provider: 'stripe', publicKey: 'pk_test' });
      client.destroy();
      expect(mockBridge.destroy).toHaveBeenCalled();
    });
  });

  describe('provider getter', () => {
    it('returns the bridge', () => {
      const client = new PayKitClient({ provider: 'stripe', publicKey: 'pk_test' });
      expect(client.provider).toBe(mockBridge);
    });
  });
});
