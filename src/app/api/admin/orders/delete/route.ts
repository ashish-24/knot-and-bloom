import { NextResponse } from 'next/server';
import { getAdminFromSession, logAdminAction } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const admin = await getAdminFromSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orderId, clearAll } = body;

    if (clearAll) {
      // Delete all payments, order items, and orders
      await prisma.payment.deleteMany();
      await prisma.orderItem.deleteMany();
      const count = await prisma.order.deleteMany();

      await logAdminAction(
        'ALL_ORDERS_DELETED',
        `Cleared all ${count.count} orders from order history`,
        admin.name
      );

      return NextResponse.json({ success: true, count: count.count, message: 'All order history deleted successfully!' });
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    // Delete single order
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await prisma.payment.deleteMany({ where: { orderId } });
    await prisma.orderItem.deleteMany({ where: { orderId } });
    await prisma.order.delete({ where: { id: orderId } });

    await logAdminAction(
      'ORDER_DELETED',
      `Deleted Order #${order.orderNumber}`,
      admin.name
    );

    return NextResponse.json({ success: true, message: `Order #${order.orderNumber} deleted successfully!` });
  } catch (err: any) {
    console.error('Error deleting order:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete order' }, { status: 500 });
  }
}
