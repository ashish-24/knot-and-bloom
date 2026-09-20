import { NextResponse } from 'next/server';
import { getCustomerFromSession, destroyCustomerSession } from '@/lib/customerAuth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  const customer = await getCustomerFromSession();
  if (!customer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.order.updateMany({
      where: { customerId: customer.id },
      data: { customerId: null },
    });

    await prisma.customerSession.deleteMany({ where: { customerId: customer.id } });
    await prisma.review.deleteMany({ where: { customerId: customer.id } });
    await prisma.customer.delete({ where: { id: customer.id } });

    await destroyCustomerSession();

    return NextResponse.json({ success: true, message: 'Customer account deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete customer account' }, { status: 500 });
  }
}
