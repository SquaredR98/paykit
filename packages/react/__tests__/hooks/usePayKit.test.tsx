import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { PayKitContext, type PayKitContextValue } from '../../src/context/PayKitContext.js';
import { usePayKit } from '../../src/hooks/usePayKit.js';

const mockClient = {
  tokenize: vi.fn().mockResolvedValue({ token: 'tok_test', paymentMethodType: 'card' }),
  confirmPayment: vi.fn().mockResolvedValue({ status: 'succeeded', chargeId: 'pi_test' }),
  loadProvider: vi.fn(),
  isReady: true,
  destroy: vi.fn(),
  mountCardInput: vi.fn(),
  updateAppearance: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  provider: {} as any,
} as any;

function createWrapper(contextValue: PayKitContextValue) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <PayKitContext.Provider value={contextValue}>
        {children}
      </PayKitContext.Provider>
    );
  };
}

describe('usePayKit', () => {
  it('throws when used outside PayKitProvider', () => {
    // Context has null client by default
    expect(() => {
      renderHook(() => usePayKit());
    }).toThrow('usePayKit must be used within a <PayKitProvider>');
  });

  it('returns client and state', () => {
    const wrapper = createWrapper({ client: mockClient, isReady: true, error: null });
    const { result } = renderHook(() => usePayKit(), { wrapper });

    expect(result.current.client).toBe(mockClient);
    expect(result.current.isReady).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('provides tokenize shortcut', async () => {
    const wrapper = createWrapper({ client: mockClient, isReady: true, error: null });
    const { result } = renderHook(() => usePayKit(), { wrapper });

    const tokenResult = await result.current.tokenize();
    expect(tokenResult.token).toBe('tok_test');
    expect(mockClient.tokenize).toHaveBeenCalled();
  });

  it('provides confirmPayment shortcut', async () => {
    const wrapper = createWrapper({ client: mockClient, isReady: true, error: null });
    const { result } = renderHook(() => usePayKit(), { wrapper });

    const confirmResult = await result.current.confirmPayment('pi_secret_abc');
    expect(confirmResult.status).toBe('succeeded');
    expect(mockClient.confirmPayment).toHaveBeenCalledWith('pi_secret_abc', undefined);
  });

  it('passes error from context', () => {
    const wrapper = createWrapper({
      client: mockClient,
      isReady: false,
      error: new Error('Load failed'),
    });
    const { result } = renderHook(() => usePayKit(), { wrapper });

    expect(result.current.error?.message).toBe('Load failed');
    expect(result.current.isReady).toBe(false);
  });
});
