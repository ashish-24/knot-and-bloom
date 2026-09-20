import { NextResponse } from 'next/server';
import { getAdminFromSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const admin = await getAdminFromSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error fetching audit logs' }, { status: 500 });
  }
}
