import { NextResponse } from 'next/server';
import { getAdminFromSession, logAdminAction } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  const admin = await getAdminFromSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { paymentId, action, rejectionReason } = await request.json();

    if (!paymentId || !['VERIFY', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    if (action === 'VERIFY') {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'PAYMENT_VERIFIED',
            verifiedAt: new Date(),
          },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'Confirmed' },
        }),
      ]);

      await logAdminAction(
        'PAYMENT_VERIFIED',
        `Approved UTR ${payment.utrNumber} for Order ${payment.order.orderNumber} (₹${payment.order.total})`,
        admin.name
      );

      return NextResponse.json({ success: true, status: 'PAYMENT_VERIFIED' });
    } else {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'PAYMENT_REJECTED',
            rejectionReason: rejectionReason || 'Invalid UTR or screenshot mismatch',
          },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'Cancelled' },
        }),
      ]);

      await logAdminAction(
        'PAYMENT_REJECTED',
        `Rejected UTR ${payment.utrNumber} for Order ${payment.order.orderNumber}`,
        admin.name
      );

      return NextResponse.json({ success: true, status: 'PAYMENT_REJECTED' });
    }
  } catch (err: any) {
    console.error('Error verifying payment:', err);
    return NextResponse.json({ error: 'Server error processing payment verification' }, { status: 500 });
  }
}
