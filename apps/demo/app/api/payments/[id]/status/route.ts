import { NextResponse } from 'next/server';
import { getPayments } from '@/lib/payments';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payments = getPayments();
    const charge = await payments.charges.retrieve(id);

    return NextResponse.json({
      status: charge.status,
      chargeId: charge.id,
      amount: charge.amount,
      currency: charge.currency,
    });
  } catch (err) {
    console.error('[charge-status] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Charge not found' },
      { status: 404 },
    );
  }
}
