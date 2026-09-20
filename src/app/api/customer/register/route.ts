import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createCustomerSession } from '@/lib/customerAuth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, mobile, email, password } = await request.json();

    if (!name || !mobile || !password) {
      return NextResponse.json({ error: 'Name, mobile number, and password are required.' }, { status: 400 });
    }

    const existingMobile = await prisma.customer.findUnique({ where: { mobile } });
    if (existingMobile) {
      return NextResponse.json({ error: 'An account with this mobile number already exists. Please log in.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customer = await prisma.customer.create({
      data: {
        name,
        mobile,
        email: email || null,
        passwordHash,
      },
    });

    await createCustomerSession(customer.id);

    return NextResponse.json({
      success: true,
      customer: { id: customer.id, name: customer.name, mobile: customer.mobile },
    });
  } catch (err: any) {
    console.error('Customer register error:', err);
    return NextResponse.json({ error: 'Server error during registration.' }, { status: 500 });
  }
}
