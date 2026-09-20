import React from 'react';
import { getAdminFromSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import LogsManager from '@/components/admin/LogsManager';

export default async function AdminLogsPage() {
  const admin = await getAdminFromSession();
  if (!admin) {
    redirect('/admin/login');
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const formattedLogs = logs.map((log) => ({
    id: log.id,
    action: log.action,
    actor: log.actor,
    details: log.details,
    createdAt: log.createdAt,
  }));

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl w-full mx-auto">
      <LogsManager initialLogs={formattedLogs} />
    </div>
  );
}
