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
    const { customerId, clearAll } = body;

    if (clearAll) {
      await prisma.order.updateMany({
        data: { customerId: null },
      });
      await prisma.customerSession.deleteMany();
      await prisma.review.deleteMany();
      const count = await prisma.customer.deleteMany();

      await logAdminAction(
        'ALL_CUSTOMERS_DELETED',
        `Cleared all ${count.count} customer user accounts`,
        admin.name
      );

      return NextResponse.json({ success: true, count: count.count, message: 'All customer user accounts deleted successfully!' });
    }

    if (!customerId) {
      return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return NextResponse.json({ error: 'Customer user not found' }, { status: 404 });
    }

    await prisma.order.updateMany({
      where: { customerId },
      data: { customerId: null },
    });
    await prisma.customerSession.deleteMany({ where: { customerId } });
    await prisma.review.deleteMany({ where: { customerId } });
    await prisma.customer.delete({ where: { id: customerId } });

    await logAdminAction(
      'CUSTOMER_DELETED',
      `Deleted Customer user ${customer.name} (${customer.mobile})`,
      admin.name
    );

    return NextResponse.json({ success: true, message: `Customer user ${customer.name} deleted successfully!` });
  } catch (err: any) {
    console.error('Error deleting customer:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete customer user' }, { status: 500 });
  }
}
