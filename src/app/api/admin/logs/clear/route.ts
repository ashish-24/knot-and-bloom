import { NextResponse } from 'next/server';
import { getAdminFromSession, logAdminAction } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  const admin = await getAdminFromSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { daysToKeep } = body;

    let deletedCount = 0;

    if (daysToKeep && typeof daysToKeep === 'number' && daysToKeep > 0) {
      // Delete logs older than X days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const res = await prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });
      deletedCount = res.count;
      await logAdminAction(
        'LOGS_PURGED',
        `Purged ${deletedCount} audit logs older than ${daysToKeep} days`,
        admin.name
      );
    } else {
      // Clear ALL audit logs
      const res = await prisma.auditLog.deleteMany();
      deletedCount = res.count;
      await logAdminAction('LOGS_CLEARED', `Cleared all ${deletedCount} audit logs`, admin.name);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully purged ${deletedCount} audit log entries.`,
      deletedCount,
    });
  } catch (error: any) {
    console.error('Error clearing audit logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to clear security audit logs.' },
      { status: 500 }
    );
  }
}
