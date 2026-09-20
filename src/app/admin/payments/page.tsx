import React from 'react';
import { getAdminFromSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import PaymentsManager from '@/components/admin/PaymentsManager';

export default async function AdminPaymentsPage() {
  const admin = await getAdminFromSession();
  if (!admin) {
    redirect('/admin/login');
  }

  const rawPayments = await prisma.payment.findMany({
    include: { order: true },
    orderBy: { createdAt: 'desc' },
  });

  const payments = rawPayments.map((p) => ({
    id: p.id,
    utrNumber: p.utrNumber,
    screenshotUrl: p.screenshotUrl,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    order: {
      id: p.order.id,
      orderNumber: p.order.orderNumber,
      customerName: p.order.customerName,
      customerMobile: p.order.customerMobile,
      total: p.order.total,
      address: p.order.address,
      city: p.order.city,
    },
  }));

  return <PaymentsManager initialPayments={payments} />;
}
