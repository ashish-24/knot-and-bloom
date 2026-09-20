import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createCustomerSession } from '@/lib/customerAuth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, name, mobile, password } = await request.json();

    if (!email && !mobile) {
      return NextResponse.json({ error: 'Email address or mobile number is required.' }, { status: 400 });
    }

    let customer = null;

    if (email) {
      customer = await prisma.customer.findUnique({ where: { email: email.toLowerCase().trim() } });
    }

    if (!customer && mobile) {
      customer = await prisma.customer.findUnique({ where: { mobile: mobile.trim() } });
    }

    // If customer doesn't exist, create account
    if (!customer) {
      const passwordHash = password ? await bcrypt.hash(password, 10) : await bcrypt.hash('FirebaseUser#2026', 10);
      const cleanMobile = mobile ? mobile.trim() : `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      customer = await prisma.customer.create({
        data: {
          name: name || (email ? email.split('@')[0] : 'Valued Customer'),
          email: email ? email.toLowerCase().trim() : null,
          mobile: cleanMobile,
          passwordHash,
        },
      });
    }

    await createCustomerSession(customer.id);

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        mobile: customer.mobile,
      },
    });
  } catch (err: any) {
    console.error('Firebase Auth session sync error:', err);
    return NextResponse.json({ error: 'Failed to create customer session.' }, { status: 500 });
  }
}
