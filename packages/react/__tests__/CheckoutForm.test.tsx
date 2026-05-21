import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PayKitContext, type PayKitContextValue } from '../src/context/PayKitContext.js';
import { CheckoutForm } from '../src/components/CheckoutForm.js';

const mockClient = {
  mountCardInput: vi.fn().mockResolvedValue(undefined),
  confirmPayment: vi.fn().mockResolvedValue({ status: 'succeeded', chargeId: 'pi_123' }),
  on: vi.fn(),
  off: vi.fn(),
  destroy: vi.fn(),
} as any;

function renderWithContext(ui: React.ReactElement, contextValue?: Partial<PayKitContextValue>) {
  const value: PayKitContextValue = {
    client: mockClient,
    isReady: true,
    error: null,
    ...contextValue,
  };
  return render(
    <PayKitContext.Provider value={value}>
      {ui}
    </PayKitContext.Provider>,
  );
}

describe('CheckoutForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClient.confirmPayment.mockResolvedValue({ status: 'succeeded', chargeId: 'pi_123' });
  });

  it('renders a form with a submit button', () => {
    renderWithContext(<CheckoutForm clientSecret="pi_secret_abc" />);
    expect(screen.getByRole('button')).toHaveTextContent('Pay');
  });

  it('renders custom submit label', () => {
    renderWithContext(<CheckoutForm clientSecret="pi_secret_abc" submitLabel="Confirm $50" />);
    expect(screen.getByRole('button')).toHaveTextContent('Confirm $50');
  });

  it('disables submit button when not ready', () => {
    renderWithContext(<CheckoutForm clientSecret="pi_secret_abc" />, { isReady: false });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders data-paykit-form attribute', () => {
    const { container } = renderWithContext(<CheckoutForm clientSecret="pi_secret_abc" />);
    expect(container.querySelector('[data-paykit-form]')).not.toBeNull();
  });

  it('renders children inside the form', () => {
    renderWithContext(
      <CheckoutForm clientSecret="pi_secret_abc">
        <p data-testid="extra">Extra content</p>
      </CheckoutForm>,
    );
    expect(screen.getByTestId('extra')).toHaveTextContent('Extra content');
  });

  it('applies theme variables as inline styles', () => {
    const { container } = renderWithContext(
      <CheckoutForm
        clientSecret="pi_secret_abc"
        appearance={{ variables: { colorPrimary: '#ff0000' } }}
      />,
    );
    const form = container.querySelector('form') as HTMLFormElement;
    expect(form.style.getPropertyValue('--paykit-color-primary')).toBe('#ff0000');
  });

  it('calls onSuccess after successful confirmation', async () => {
    const onSuccess = vi.fn();
    renderWithContext(
      <CheckoutForm clientSecret="pi_secret_abc" onSuccess={onSuccess} />,
    );

    // Simulate card becoming ready
    // The CardInput inside calls onReady which enables the button
    // For this test we'll directly submit since button might be disabled due to cardReady
    // Let's just test the confirmPayment flow directly via form submit
    const form = screen.getByRole('button').closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({ status: 'succeeded', chargeId: 'pi_123' });
    });
  });

  it('calls onError when confirmation fails', async () => {
    mockClient.confirmPayment.mockRejectedValueOnce(new Error('Network error'));
    const onError = vi.fn();

    renderWithContext(
      <CheckoutForm clientSecret="pi_secret_abc" onError={onError} />,
    );

    const form = screen.getByRole('button').closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Network error' }));
    });
  });

  it('calls onError when result contains error', async () => {
    mockClient.confirmPayment.mockResolvedValueOnce({
      status: 'failed',
      error: { code: 'card_declined', message: 'Card was declined', isRetryable: false },
    });
    const onError = vi.fn();

    renderWithContext(
      <CheckoutForm clientSecret="pi_secret_abc" onError={onError} />,
    );

    const form = screen.getByRole('button').closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Card was declined' }));
    });
  });
});
