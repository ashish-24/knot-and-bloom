import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createCustomerSession } from '@/lib/customerAuth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { mobile, password } = await request.json();

    if (!mobile || !mobile.trim()) {
      return NextResponse.json({ error: 'Mobile phone number is required.' }, { status: 400 });
    }

    const cleanMobile = mobile.trim();

    let customer = await prisma.customer.findUnique({ where: { mobile: cleanMobile } });

    if (customer && password && customer.passwordHash) {
      const isValid = await bcrypt.compare(password, customer.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
      }
    } else if (!customer) {
      // Auto-create customer record for new mobile sign in
      const defaultPasswordHash = await bcrypt.hash('KnotBloom#2026', 10);
      customer = await prisma.customer.create({
        data: {
          name: `Customer ${cleanMobile.slice(-4)}`,
          mobile: cleanMobile,
          email: null,
          passwordHash: defaultPasswordHash,
        },
      });
    }

    await createCustomerSession(customer.id);

    return NextResponse.json({
      success: true,
      message: 'Sign in successful!',
      customer: { id: customer.id, name: customer.name, mobile: customer.mobile },
    });
  } catch (err: any) {
    console.error('Customer login error:', err);
    return NextResponse.json({ error: 'Server error during sign in.' }, { status: 500 });
  }
}
