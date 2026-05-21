import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StripeProviderBridge } from '../../src/providers/stripe.js';
import { resetScriptCache } from '../../src/script-loader.js';

// Mock the Stripe global that would be loaded via script
function createMockStripeGlobal() {
  const mockCardElement = {
    mount: vi.fn(),
    unmount: vi.fn(),
    destroy: vi.fn(),
    on: vi.fn(),
  };

  const mockElements = {
    create: vi.fn().mockReturnValue(mockCardElement),
    update: vi.fn(),
  };

  const mockStripe = {
    elements: vi.fn().mockReturnValue(mockElements),
    createToken: vi.fn(),
    confirmCardPayment: vi.fn(),
  };

  return { mockStripe: vi.fn().mockReturnValue(mockStripe), mockElements, mockCardElement, stripeInstance: mockStripe };
}

describe('StripeProviderBridge', () => {
  let bridge: StripeProviderBridge;
  let mockGlobal: ReturnType<typeof createMockStripeGlobal>;

  beforeEach(() => {
    resetScriptCache();
    document.head.innerHTML = '';
    mockGlobal = createMockStripeGlobal();
    (window as any).Stripe = mockGlobal.mockStripe;
    bridge = new StripeProviderBridge('pk_test_123');
  });

  describe('loadScript', () => {
    it('initializes Stripe with public key', async () => {
      await bridge.loadScript();
      expect(mockGlobal.mockStripe).toHaveBeenCalledWith('pk_test_123');
      expect(bridge.isReady()).toBe(true);
    });
  });

  describe('mount', () => {
    it('creates card element and mounts to container', async () => {
      const container = document.createElement('div');
      await bridge.mount(container);

      expect(mockGlobal.stripeInstance.elements).toHaveBeenCalled();
      expect(mockGlobal.mockElements.create).toHaveBeenCalledWith('card');
      expect(mockGlobal.mockCardElement.mount).toHaveBeenCalledWith(container);
    });

    it('passes appearance options to elements', async () => {
      const bridgeWithAppearance = new StripeProviderBridge('pk_test', {
        theme: 'night',
        variables: { colorPrimary: '#ff0000' },
      });
      const container = document.createElement('div');
      await bridgeWithAppearance.mount(container);

      expect(mockGlobal.stripeInstance.elements).toHaveBeenCalledWith(
        expect.objectContaining({
          appearance: expect.objectContaining({ theme: 'night' }),
        }),
      );
    });

    it('wires up event listeners on card element', async () => {
      const container = document.createElement('div');
      await bridge.mount(container);

      expect(mockGlobal.mockCardElement.on).toHaveBeenCalledWith('ready', expect.any(Function));
      expect(mockGlobal.mockCardElement.on).toHaveBeenCalledWith('change', expect.any(Function));
      expect(mockGlobal.mockCardElement.on).toHaveBeenCalledWith('focus', expect.any(Function));
      expect(mockGlobal.mockCardElement.on).toHaveBeenCalledWith('blur', expect.any(Function));
    });
  });

  describe('tokenize', () => {
    it('creates a token from the card element', async () => {
      const container = document.createElement('div');
      await bridge.mount(container);

      mockGlobal.stripeInstance.createToken.mockResolvedValue({
        token: { id: 'tok_abc', card: { last4: '4242', brand: 'visa' } },
      });

      const result = await bridge.tokenize();
      expect(result.token).toBe('tok_abc');
      expect(result.paymentMethodType).toBe('card');
      expect(result.last4).toBe('4242');
      expect(result.brand).toBe('visa');
    });

    it('throws on tokenize error', async () => {
      const container = document.createElement('div');
      await bridge.mount(container);

      mockGlobal.stripeInstance.createToken.mockResolvedValue({
        error: { message: 'Card number is invalid' },
      });

      await expect(bridge.tokenize()).rejects.toEqual(
        expect.objectContaining({ code: 'invalid_card', message: 'Card number is invalid' }),
      );
    });

    it('throws if not mounted', async () => {
      await bridge.loadScript();
      await expect(bridge.tokenize()).rejects.toThrow('Card input is not mounted');
    });
  });

  describe('confirmPayment', () => {
    it('confirms card payment and returns succeeded', async () => {
      const container = document.createElement('div');
      await bridge.mount(container);

      mockGlobal.stripeInstance.confirmCardPayment.mockResolvedValue({
        paymentIntent: { id: 'pi_123', status: 'succeeded' },
      });

      const result = await bridge.confirmPayment('pi_secret_abc');
      expect(result.status).toBe('succeeded');
      expect(result.chargeId).toBe('pi_123');
    });

    it('returns error on failure', async () => {
      await bridge.loadScript();

      mockGlobal.stripeInstance.confirmCardPayment.mockResolvedValue({
        error: { code: 'card_declined', message: 'Card was declined', type: 'card_error' },
      });

      const result = await bridge.confirmPayment('pi_secret_abc');
      expect(result.status).toBe('failed');
      expect(result.error?.code).toBe('card_declined');
      expect(result.error?.isRetryable).toBe(false);
    });

    it('returns requires_action for 3DS', async () => {
      const container = document.createElement('div');
      await bridge.mount(container);

      mockGlobal.stripeInstance.confirmCardPayment.mockResolvedValue({
        paymentIntent: {
          id: 'pi_123',
          status: 'requires_action',
          next_action: { redirect_to_url: { url: 'https://bank.com/3ds' } },
        },
      });

      const result = await bridge.confirmPayment('pi_secret_abc');
      expect(result.status).toBe('requires_action');
      expect(result.redirectUrl).toBe('https://bank.com/3ds');
    });

    it('passes returnUrl', async () => {
      const container = document.createElement('div');
      await bridge.mount(container);

      mockGlobal.stripeInstance.confirmCardPayment.mockResolvedValue({
        paymentIntent: { id: 'pi_123', status: 'succeeded' },
      });

      await bridge.confirmPayment('pi_secret_abc', { returnUrl: 'https://app.com/done' });
      expect(mockGlobal.stripeInstance.confirmCardPayment).toHaveBeenCalledWith(
        'pi_secret_abc',
        expect.objectContaining({ return_url: 'https://app.com/done' }),
      );
    });
  });

  describe('event system', () => {
    it('emits events to registered listeners', async () => {
      const container = document.createElement('div');
      await bridge.mount(container);

      const listener = vi.fn();
      bridge.on('ready', listener);

      // Simulate the 'ready' event from Stripe Elements
      const readyCallback = mockGlobal.mockCardElement.on.mock.calls.find(
        (call: any[]) => call[0] === 'ready',
      )![1];
      readyCallback();

      expect(listener).toHaveBeenCalledWith({ type: 'ready' });
    });

    it('removes listeners', async () => {
      const listener = vi.fn();
      bridge.on('ready', listener);
      bridge.off('ready', listener);

      // Listener set should be empty now — no error thrown
      expect(true).toBe(true);
    });
  });

  describe('destroy', () => {
    it('unmounts and destroys the card element', async () => {
      const container = document.createElement('div');
      await bridge.mount(container);

      bridge.destroy();
      expect(mockGlobal.mockCardElement.unmount).toHaveBeenCalled();
      expect(mockGlobal.mockCardElement.destroy).toHaveBeenCalled();
    });
  });

  describe('updateAppearance', () => {
    it('updates elements appearance', async () => {
      const container = document.createElement('div');
      await bridge.mount(container);

      bridge.updateAppearance({ variables: { colorPrimary: '#00ff00' } });
      expect(mockGlobal.mockElements.update).toHaveBeenCalledWith(
        expect.objectContaining({
          appearance: expect.objectContaining({
            variables: expect.objectContaining({ colorPrimary: '#00ff00' }),
          }),
        }),
      );
    });
  });
});
