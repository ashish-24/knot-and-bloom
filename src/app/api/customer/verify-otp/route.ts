import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createCustomerSession } from '@/lib/customerAuth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { mobile, otpCode, password, purpose } = await request.json();

    if (!mobile || !otpCode) {
      return NextResponse.json({ error: 'Mobile number and 6-digit OTP code are required.' }, { status: 400 });
    }

    const cleanMobile = mobile.trim();
    const cleanOtp = otpCode.trim();

    const customer = await prisma.customer.findUnique({ where: { mobile: cleanMobile } });

    if (!customer || !customer.otpCode) {
      return NextResponse.json({ error: 'No active OTP verification session found. Please click "Resend OTP".' }, { status: 400 });
    }

    // Check expiration
    if (customer.otpExpiresAt && new Date() > customer.otpExpiresAt) {
      return NextResponse.json({ error: 'Verification OTP has expired. Please request a new code.' }, { status: 400 });
    }

    // Check code match
    if (customer.otpCode !== cleanOtp) {
      return NextResponse.json({ error: 'Incorrect 6-digit OTP code. Please check and try again.' }, { status: 400 });
    }

    // If password provided during register, hash and set real password
    let finalPasswordHash = customer.passwordHash;
    if (password && (purpose === 'register' || customer.passwordHash.includes('UnverifiedTemp'))) {
      finalPasswordHash = await bcrypt.hash(password, 10);
    }

    // Clear OTP fields & update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        otpCode: null,
        otpExpiresAt: null,
        passwordHash: finalPasswordHash,
      },
    });

    // Create session cookie
    await createCustomerSession(updatedCustomer.id);

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully!',
      customer: {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        mobile: updatedCustomer.mobile,
        email: updatedCustomer.email,
      },
    });
  } catch (err: any) {
    console.error('Error verifying OTP:', err);
    return NextResponse.json({ error: err.message || 'Server error during OTP verification.' }, { status: 500 });
  }
}
