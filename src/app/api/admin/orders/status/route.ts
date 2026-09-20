import { NextResponse } from 'next/server';
import { getAdminFromSession, logAdminAction } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  const admin = await getAdminFromSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    await logAdminAction(
      'ORDER_STATUS_UPDATED',
      `Updated Order ${order.orderNumber} status to "${status}"`,
      admin.name
    );

    return NextResponse.json({ success: true, status: order.status });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
