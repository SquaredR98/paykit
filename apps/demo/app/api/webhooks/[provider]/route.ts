import { NextResponse } from 'next/server';
import { getPayments, getWebhookSecret } from '@/lib/payments';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await params;

    if (!['stripe', 'razorpay', 'mock'].includes(provider)) {
      return NextResponse.json({ error: 'Unknown provider' }, { status: 400 });
    }

    // Read raw body for signature verification
    const rawBody = await request.text();
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const secret = getWebhookSecret(provider);
    const payments = getPayments(provider as 'stripe' | 'razorpay');

    // Verify webhook signature first
    const isValid = payments.webhooks.verify(rawBody, headers, secret);
    if (!isValid) {
      console.warn(`[webhook] Invalid signature from ${provider}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the event
    const event = payments.webhooks.parse(rawBody, headers, secret);
    console.log(`[webhook] ${provider} event: ${event.type} (${event.id})`);

    // In production you'd update your database here
    // For the demo, just log it
    return NextResponse.json({ received: true, eventId: event.id });
  } catch (err) {
    console.error('[webhook] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Webhook processing failed' },
      { status: 500 },
    );
  }
}
