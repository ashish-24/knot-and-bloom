import { cookies } from 'next/headers';
import { prisma } from './db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const ADMIN_SESSION_COOKIE = 'kb_admin_session';

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const admin = await prisma.admin.findFirst();
  if (!admin) return false;
  return bcrypt.compare(password, admin.passwordHash);
}

export async function createAdminSession(adminId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.adminSession.create({
    data: {
      adminId,
      token,
      expiresAt,
    },
  });

  const cookieStore = cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return token;
}

export async function getAdminFromSession() {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { token },
    include: { admin: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }

  return session.admin;
}

export async function destroyAdminSession() {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (token) {
    await prisma.adminSession.deleteMany({ where: { token } }).catch(() => {});
    cookieStore.delete(ADMIN_SESSION_COOKIE);
  }
}

export async function logAdminAction(action: string, details: string, actor = 'Admin') {
  await prisma.auditLog.create({
    data: {
      action,
      actor,
      details,
    },
  }).catch((e) => console.error('Failed to write audit log:', e));
}
