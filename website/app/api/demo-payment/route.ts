import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import Razorpay from 'razorpay';

export async function POST(request: NextRequest) {
  try {
    const { provider, amount, currency } = await request.json();

    // Validate environment variables
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!stripeKey && !razorpayKeyId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment providers not configured. Please set up environment variables.',
        },
        { status: 500 }
      );
    }

    let clientSecret: string;
    let publicKey: string;
    let selectedProvider = provider;

    // Smart routing: use Razorpay for INR, Stripe for everything else
    if (provider === 'auto') {
      selectedProvider = currency === 'INR' ? 'razorpay' : 'stripe';
    }

    // Create PaymentIntent/Order using native SDKs
    if (selectedProvider === 'stripe') {
      if (!stripeKey || !process.env.STRIPE_PUBLISHABLE_KEY) {
        return NextResponse.json(
          { success: false, error: 'Stripe not configured' },
          { status: 500 }
        );
      }

      const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' });

      // Create PaymentIntent
      const intent = await stripe.paymentIntents.create({
        amount,
        currency: currency.toLowerCase(),
        description: 'PayKit Demo Payment',
        automatic_payment_methods: { enabled: true },
        metadata: { demo: 'true' },
      });

      clientSecret = intent.client_secret!;
      publicKey = process.env.STRIPE_PUBLISHABLE_KEY;

    } else if (selectedProvider === 'razorpay') {
      if (!razorpayKeyId || !razorpayKeySecret) {
        return NextResponse.json(
          { success: false, error: 'Razorpay not configured' },
          { status: 500 }
        );
      }

      const razorpay = new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      });

      // Create Order
      const order = await razorpay.orders.create({
        amount,
        currency: currency.toUpperCase(),
        notes: { demo: 'true', product: 'PayKit Demo' },
      });

      // For Razorpay, clientSecret is the order_id
      clientSecret = order.id;
      publicKey = razorpayKeyId;

    } else {
      return NextResponse.json(
        { success: false, error: `Provider ${selectedProvider} not supported` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      provider: selectedProvider,
      clientSecret,
      publicKey,
      amount,
      currency,
    });

  } catch (error) {
    console.error('Demo payment error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment',
      },
      { status: 500 }
    );
  }
}
