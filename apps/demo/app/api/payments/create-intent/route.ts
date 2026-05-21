import { NextResponse } from 'next/server';
import { getPayments } from '@/lib/payments';

const ALLOWED_CURRENCIES = ['usd', 'eur', 'gbp', 'inr', 'aud', 'cad'];
const ALLOWED_PROVIDERS = ['stripe', 'razorpay'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, provider, description } = body;

    // Input validation
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'amount must be a positive number' },
        { status: 400 },
      );
    }
    if (!currency || !ALLOWED_CURRENCIES.includes(currency.toLowerCase())) {
      return NextResponse.json(
        { error: `currency must be one of: ${ALLOWED_CURRENCIES.join(', ')}` },
        { status: 400 },
      );
    }
    if (!provider || !ALLOWED_PROVIDERS.includes(provider)) {
      return NextResponse.json(
        { error: `provider must be one of: ${ALLOWED_PROVIDERS.join(', ')}` },
        { status: 400 },
      );
    }

    const payments = getPayments(provider);
    const charge = await payments.charges.create({
      amount,
      currency: currency.toLowerCase(),
      description: description ?? 'PayKit Demo Payment',
    });

    return NextResponse.json({
      clientSecret: charge.clientSecret ?? charge.id,
      chargeId: charge.id,
      provider,
      status: charge.status,
    });
  } catch (err) {
    console.error('[create-intent] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
