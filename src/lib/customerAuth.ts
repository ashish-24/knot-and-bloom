import { cookies } from 'next/headers';
import { prisma } from './db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const CUSTOMER_COOKIE = 'kb_customer_session';

export async function createCustomerSession(customerId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.customerSession.create({
    data: {
      customerId,
      token,
      expiresAt,
    },
  });

  const cookieStore = cookies();
  cookieStore.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return token;
}

export async function getCustomerFromSession() {
  const cookieStore = cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE)?.value;

  if (!token) return null;

  const session = await prisma.customerSession.findUnique({
    where: { token },
    include: {
      customer: {
        include: {
          orders: {
            orderBy: { createdAt: 'desc' },
            include: { items: { include: { product: true } } },
          },
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.customerSession.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }

  return session.customer;
}

export async function destroyCustomerSession() {
  const cookieStore = cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE)?.value;

  if (token) {
    await prisma.customerSession.deleteMany({ where: { token } }).catch(() => {});
    cookieStore.delete(CUSTOMER_COOKIE);
  }
}
