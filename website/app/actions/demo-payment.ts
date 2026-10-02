'use server';

import { StripeAdapter } from '@squaredr/paykit/stripe';
import { RazorpayAdapter } from '@squaredr/paykit/razorpay';
import { PayPalAdapter } from '@squaredr/paykit/paypal';

/**
 * Creates a Stripe PaymentIntent using PayKit StripeAdapter
 */
export async function createStripePaymentIntent(): Promise<{
  clientSecret: string | null;
  error?: string;
}> {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return { clientSecret: null, error: 'Stripe not configured' };
  }

  try {
    const adapter = new StripeAdapter();
    await adapter.initialize({ secretKey });

    const charge = await adapter.charges.create({
      amount: 4900, // $49.00
      currency: 'USD',
      description: 'PayKit Demo Payment',
      metadata: { demo: 'true', source: 'paykit-website-demo' },
    });

    return { clientSecret: charge.clientSecret ?? null };
  } catch (err) {
    console.error('Stripe PaymentIntent error:', err);
    return {
      clientSecret: null,
      error: err instanceof Error ? err.message : 'Failed to create payment intent',
    };
  }
}

/**
 * Creates a Razorpay Order using PayKit RazorpayAdapter
 */
export async function createRazorpayOrder(): Promise<{
  clientSecret: string | null;
  error?: string;
}> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return { clientSecret: null, error: 'Razorpay not configured' };
  }

  try {
    const adapter = new RazorpayAdapter();
    await adapter.initialize({ keyId, keySecret });

    const charge = await adapter.charges.create({
      amount: 410000, // ₹4,100 in paise
      currency: 'INR',
      description: `demo_${Date.now()}`,
      metadata: { demo: 'true', source: 'paykit-website-demo' },
    });

    return { clientSecret: charge.clientSecret ?? charge.id };
  } catch (err) {
    console.error('Razorpay Order error:', err);
    return {
      clientSecret: null,
      error: err instanceof Error ? err.message : 'Failed to create order',
    };
  }
}

/**
 * Creates a PayPal Order using PayKit PayPalAdapter
 */
export async function createPayPalOrder(): Promise<{
  clientSecret: string | null;
  error?: string;
}> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return { clientSecret: null, error: 'PayPal not configured' };
  }

  try {
    const adapter = new PayPalAdapter();
    const sandbox = process.env.PAYPAL_SANDBOX !== 'false' ? 'true' : 'false';
    await adapter.initialize({ clientId, clientSecret, sandbox });

    const charge = await adapter.charges.create({
      amount: 4900, // $49.00
      currency: 'USD',
      description: 'PayKit Demo Payment',
      metadata: { demo: 'true', source: 'paykit-website-demo' },
    });

    return { clientSecret: charge.clientSecret ?? null };
  } catch (err) {
    console.error('PayPal Order error:', err);
    return {
      clientSecret: null,
      error: err instanceof Error ? err.message : 'Failed to create order',
    };
  }
}

/**
 * Card-only Stripe PaymentIntent for the v2 demo.
 *
 * `charges.create()` sets `automatic_payment_methods: { enabled: true }`, which
 * surfaces every method enabled in the Stripe dashboard — Amazon Pay, Cash App
 * Pay and so on. That turns the demo's single card form into a method picker,
 * so this variant pins `payment_method_types: ['card']` instead.
 *
 * It talks to Stripe directly rather than through the adapter because
 * CreateChargeParams has no field for restricting payment methods. If one is
 * added later, this should go back to using the adapter.
 */
export async function createStripeCardIntent(): Promise<{
  clientSecret: string | null;
  error?: string;
}> {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return { clientSecret: null, error: 'Stripe not configured' };
  }

  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(secretKey);

    const intent = await stripe.paymentIntents.create({
      amount: 4900, // $49.00
      currency: 'usd',
      payment_method_types: ['card'],
      description: 'PayKit Demo Payment',
      metadata: { demo: 'true', source: 'paykit-website-demo-v2' },
    });

    return { clientSecret: intent.client_secret };
  } catch (err) {
    console.error('Stripe PaymentIntent error:', err);
    return {
      clientSecret: null,
      error: err instanceof Error ? err.message : 'Failed to create payment intent',
    };
  }
}
