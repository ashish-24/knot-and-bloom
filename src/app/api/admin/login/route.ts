import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminPassword, createAdminSession, logAdminAction } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = await prisma.admin.findUnique({ where: { email: cleanEmail } });

    if (!admin) {
      await logAdminAction('LOGIN_FAILED', `Unknown admin login attempt: ${cleanEmail}`, 'Guest');
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    const isValidPassword = await verifyAdminPassword(password);
    if (!isValidPassword) {
      await logAdminAction('LOGIN_FAILED', `Incorrect password attempt for ${cleanEmail}`, admin.name);
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    // Direct Login Success -> Create Session
    await createAdminSession(admin.id);
    await logAdminAction('LOGIN_SUCCESS', `Admin logged in successfully`, admin.name);

    return NextResponse.json({
      success: true,
      admin: { email: admin.email, name: admin.name },
    });
  } catch (error: any) {
    console.error('Admin Login error:', error);
    return NextResponse.json({ error: error.message || 'Server error during admin login.' }, { status: 500 });
  }
}
