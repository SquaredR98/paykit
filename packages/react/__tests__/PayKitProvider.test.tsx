import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { PayKitProvider } from '../src/context/PayKitProvider.js';
import { PayKitContext } from '../src/context/PayKitContext.js';

// Mock @squaredr/paykit-js
vi.mock('@squaredr/paykit-js', () => {
  const mockClient = {
    loadProvider: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn(),
    isReady: true,
  };
  return {
    PayKitClient: vi.fn().mockImplementation(() => mockClient),
    __mockClient: mockClient,
  };
});

import { PayKitClient } from '@squaredr/paykit-js';
const mockClient = (await import('@squaredr/paykit-js') as any).__mockClient;

// Helper component to read context
function ContextReader() {
  const ctx = useContext(PayKitContext);
  return (
    <div>
      <span data-testid="ready">{String(ctx.isReady)}</span>
      <span data-testid="error">{ctx.error?.message ?? 'none'}</span>
      <span data-testid="has-client">{String(ctx.client !== null)}</span>
    </div>
  );
}

describe('PayKitProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient.loadProvider.mockResolvedValue(undefined);
  });

  it('provides client to children', async () => {
    render(
      <PayKitProvider config={{ provider: 'stripe', publicKey: 'pk_test' }}>
        <ContextReader />
      </PayKitProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('has-client').textContent).toBe('true');
    });
  });

  it('sets isReady to true after loadProvider resolves', async () => {
    render(
      <PayKitProvider config={{ provider: 'stripe', publicKey: 'pk_test' }}>
        <ContextReader />
      </PayKitProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('ready').textContent).toBe('true');
    });
  });

  it('sets error when loadProvider rejects', async () => {
    mockClient.loadProvider.mockRejectedValueOnce(new Error('Script load failed'));

    render(
      <PayKitProvider config={{ provider: 'stripe', publicKey: 'pk_test' }}>
        <ContextReader />
      </PayKitProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Script load failed');
    });
  });

  it('creates PayKitClient with config', () => {
    render(
      <PayKitProvider config={{ provider: 'stripe', publicKey: 'pk_live_xxx' }}>
        <div />
      </PayKitProvider>,
    );

    expect(PayKitClient).toHaveBeenCalledWith({ provider: 'stripe', publicKey: 'pk_live_xxx' });
  });

  it('renders children', () => {
    render(
      <PayKitProvider config={{ provider: 'stripe', publicKey: 'pk_test' }}>
        <span data-testid="child">Hello</span>
      </PayKitProvider>,
    );

    expect(screen.getByTestId('child').textContent).toBe('Hello');
  });
});
