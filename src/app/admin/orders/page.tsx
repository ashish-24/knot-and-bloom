import React from 'react';
import { getAdminFromSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import OrdersManager from '@/components/admin/OrdersManager';

export default async function AdminOrdersPage() {
  const admin = await getAdminFromSession();
  if (!admin) {
    redirect('/admin/login');
  }

  const rawOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const orders = rawOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerMobile: o.customerMobile,
    total: o.total,
    status: o.status,
    address: o.address,
    city: o.city,
    state: o.state,
    createdAt: o.createdAt.toISOString(),
  }));

  return <OrdersManager initialOrders={orders} />;
}
