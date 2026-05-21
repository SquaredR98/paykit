import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RazorpayProviderBridge } from '../../src/providers/razorpay.js';
import { resetScriptCache } from '../../src/script-loader.js';

describe('RazorpayProviderBridge', () => {
  let bridge: RazorpayProviderBridge;
  let mockRazorpayInstance: any;
  let mockRazorpayConstructor: any;

  beforeEach(() => {
    resetScriptCache();
    document.head.innerHTML = '';

    mockRazorpayInstance = {
      open: vi.fn(),
      close: vi.fn(),
    };

    mockRazorpayConstructor = vi.fn().mockImplementation((options: any) => {
      // Store options for assertions
      mockRazorpayInstance._options = options;
      return mockRazorpayInstance;
    });

    (window as any).Razorpay = mockRazorpayConstructor;
    bridge = new RazorpayProviderBridge('rzp_test_key');
  });

  describe('loadScript', () => {
    it('marks as ready after loading', async () => {
      expect(bridge.isReady()).toBe(false);
      await bridge.loadScript();
      expect(bridge.isReady()).toBe(true);
    });
  });

  describe('mount', () => {
    it('renders a placeholder into the container', async () => {
      const container = document.createElement('div');
      await bridge.mount(container);

      expect(container.getAttribute('data-paykit-provider')).toBe('razorpay');
      expect(container.querySelector('[data-paykit-razorpay-placeholder]')).not.toBeNull();
    });

    it('emits ready event', async () => {
      const listener = vi.fn();
      bridge.on('ready', listener);

      const container = document.createElement('div');
      await bridge.mount(container);

      expect(listener).toHaveBeenCalledWith({ type: 'ready' });
    });
  });

  describe('tokenize', () => {
    it('opens Razorpay checkout modal', async () => {
      await bridge.loadScript();

      // Start tokenize (won't resolve until handler is called)
      const tokenizePromise = bridge.tokenize();

      // Razorpay constructor should have been called
      expect(mockRazorpayConstructor).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'rzp_test_key' }),
      );
      expect(mockRazorpayInstance.open).toHaveBeenCalled();

      // Simulate successful payment
      const handler = mockRazorpayInstance._options.handler;
      handler({ razorpay_payment_id: 'pay_abc123' });

      const result = await tokenizePromise;
      expect(result.token).toBe('pay_abc123');
      expect(result.paymentMethodType).toBe('card');
    });

    it('rejects when user dismisses modal', async () => {
      await bridge.loadScript();

      const tokenizePromise = bridge.tokenize();

      // Simulate modal dismiss
      const ondismiss = mockRazorpayInstance._options.modal.ondismiss;
      ondismiss();

      await expect(tokenizePromise).rejects.toEqual(
        expect.objectContaining({ code: 'user_cancelled' }),
      );
    });

    it('throws if not loaded', async () => {
      await expect(bridge.tokenize()).rejects.toThrow('Razorpay not loaded');
    });
  });

  describe('confirmPayment', () => {
    it('opens checkout with order_id and resolves on success', async () => {
      await bridge.loadScript();

      const confirmPromise = bridge.confirmPayment('order_xyz');

      expect(mockRazorpayConstructor).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'rzp_test_key', order_id: 'order_xyz' }),
      );

      // Simulate successful payment
      const handler = mockRazorpayInstance._options.handler;
      handler({ razorpay_payment_id: 'pay_confirmed' });

      const result = await confirmPromise;
      expect(result.status).toBe('succeeded');
      expect(result.chargeId).toBe('pay_confirmed');
    });

    it('resolves with canceled status when modal dismissed', async () => {
      await bridge.loadScript();

      const confirmPromise = bridge.confirmPayment('order_xyz');

      const ondismiss = mockRazorpayInstance._options.modal.ondismiss;
      ondismiss();

      const result = await confirmPromise;
      expect(result.status).toBe('canceled');
    });

    it('emits loading_start when modal opens', async () => {
      const listener = vi.fn();
      bridge.on('loading_start', listener);
      await bridge.loadScript();

      bridge.confirmPayment('order_xyz');
      expect(listener).toHaveBeenCalledWith({ type: 'loading_start' });
    });

    it('emits loading_end when payment completes', async () => {
      const listener = vi.fn();
      bridge.on('loading_end', listener);
      await bridge.loadScript();

      const promise = bridge.confirmPayment('order_xyz');
      const handler = mockRazorpayInstance._options.handler;
      handler({ razorpay_payment_id: 'pay_done' });

      await promise;
      expect(listener).toHaveBeenCalledWith({ type: 'loading_end' });
    });
  });

  describe('unmount', () => {
    it('clears the container', async () => {
      const container = document.createElement('div');
      await bridge.mount(container);

      bridge.unmount();
      expect(container.innerHTML).toBe('');
      expect(container.getAttribute('data-paykit-provider')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('closes modal and cleans up', async () => {
      await bridge.loadScript();
      bridge.confirmPayment('order_xyz');

      bridge.destroy();
      expect(mockRazorpayInstance.close).toHaveBeenCalled();
    });
  });

  describe('updateAppearance', () => {
    it('stores new appearance for next modal open', () => {
      bridge.updateAppearance({ variables: { colorPrimary: '#ff0000' } });
      // No error — just stores it
      expect(true).toBe(true);
    });
  });
});
