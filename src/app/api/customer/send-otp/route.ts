import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendRealtimeOtpSms } from '@/lib/sms';
import { sendGmailOtp } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { mobile, purpose, name, email } = await request.json();

    if (!mobile) {
      return NextResponse.json({ error: 'Mobile number is required.' }, { status: 400 });
    }

    const cleanMobile = mobile.trim();
    const cleanEmail = email && typeof email === 'string' && email.trim() !== '' ? email.trim() : null;

    // Check if email is already taken by another account
    if (cleanEmail) {
      const existingEmail = await prisma.customer.findFirst({
        where: {
          email: cleanEmail,
          NOT: { mobile: cleanMobile },
        },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: 'This email address is already associated with another account.' },
          { status: 400 }
        );
      }
    }

    // Generate 6-digit random OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    let customer = await prisma.customer.findUnique({ where: { mobile: cleanMobile } });

    if (purpose === 'login') {
      if (!customer) {
        return NextResponse.json(
          { error: 'No account found with this mobile number. Please click "Create New Account" below.' },
          { status: 404 }
        );
      }

      // Update OTP for existing customer
      await prisma.customer.update({
        where: { id: customer.id },
        data: { otpCode, otpExpiresAt },
      });
    } else if (purpose === 'register') {
      if (customer && !customer.passwordHash.includes('UnverifiedTemp')) {
        return NextResponse.json(
          { error: 'An account with this mobile number already exists. Please sign in instead.' },
          { status: 400 }
        );
      }

      if (!customer) {
        // Create temporary customer record for OTP challenge
        const tempPasswordHash = '$2a$10$UnverifiedTempPasswordHashForOtpRegister';
        customer = await prisma.customer.create({
          data: {
            name: name || 'Valued Customer',
            mobile: cleanMobile,
            email: cleanEmail,
            passwordHash: tempPasswordHash,
            otpCode,
            otpExpiresAt,
          },
        });
      } else {
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            name: name || customer.name,
            email: cleanEmail !== null ? cleanEmail : customer.email,
            otpCode,
            otpExpiresAt,
          },
        });
      }
    } else {
      // General OTP dispatch
      if (customer) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: { otpCode, otpExpiresAt },
        });
      }
    }

    // 1. Dispatch Real-time SMS to user's phone
    const smsResult = await sendRealtimeOtpSms(cleanMobile, otpCode);

    // 2. Dispatch Real-time Gmail OTP to user's Gmail/Email if available
    const targetEmail = cleanEmail || customer?.email;
    let gmailResult = null;
    if (targetEmail) {
      gmailResult = await sendGmailOtp(targetEmail, otpCode, customer?.name || name || 'Customer');
    }

    // 3. Direct WhatsApp OTP Link for 1-click WhatsApp phone delivery
    const rawDigits = cleanMobile.replace(/[^0-9]/g, '');
    const waMobile = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;
    const whatsappOtpUrl = `https://api.whatsapp.com/send?phone=${waMobile}&text=Your%20Knot%20%26%20Bloom%20Verification%20OTP%20code%20is%20${otpCode}`;

    return NextResponse.json({
      success: true,
      message: targetEmail
        ? `OTP sent to your mobile (+91 ${cleanMobile}) and Gmail (${targetEmail})`
        : `OTP generated for +91 ${cleanMobile}`,
      provider: smsResult.provider,
      gmailSent: !!targetEmail,
      gmailRecipient: targetEmail || null,
      whatsappOtpUrl,
    });
  } catch (err: any) {
    console.error('Error sending OTP:', err);

    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'mobile or email';
      return NextResponse.json(
        { error: `An account with this ${field} already exists.` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err.message || 'Failed to dispatch verification OTP.' },
      { status: 500 }
    );
  }
}
