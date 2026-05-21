export interface RedirectResult {
  status: 'succeeded' | 'failed' | 'pending';
  paymentIntentId?: string;
}

/**
 * Call this on the return URL page after a 3DS/payment redirect.
 * Reads query parameters to determine payment outcome.
 * Returns null if this page was not a redirect return.
 */
export function handleRedirectReturn(): RedirectResult | null {
  const params = new URLSearchParams(window.location.search);
  const paymentIntent = params.get('payment_intent');
  const redirectStatus = params.get('redirect_status');

  if (!paymentIntent) return null;

  let status: RedirectResult['status'] = 'pending';
  if (redirectStatus === 'succeeded') status = 'succeeded';
  else if (redirectStatus === 'failed') status = 'failed';

  return { status, paymentIntentId: paymentIntent };
}
