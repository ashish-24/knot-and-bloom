import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminPassword, createAdminSession, logAdminAction } from '@/lib/auth';
import { sendGmailOtp } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, otpCode, action } = body;

    if (!email) {
      return NextResponse.json({ error: 'Missing admin email address.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = await prisma.admin.findUnique({ where: { email: cleanEmail } });

    if (!admin) {
      await logAdminAction('LOGIN_FAILED', `Unknown admin login attempt: ${cleanEmail}`, 'Guest');
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    // STEP 2: Verify 6-digit Gmail OTP
    if (action === 'verify_otp' || (otpCode && !password)) {
      if (!otpCode || typeof otpCode !== 'string') {
        return NextResponse.json({ error: 'Please enter the 6-digit OTP code sent to your Gmail.' }, { status: 400 });
      }

      const cleanOtp = otpCode.trim();

      if (!admin.otpCode || admin.otpCode !== cleanOtp) {
        await logAdminAction('LOGIN_2FA_FAILED', `Invalid Gmail OTP code for ${cleanEmail}`, admin.name);
        return NextResponse.json({ error: 'Invalid 6-digit Gmail OTP code. Please check your inbox and try again.' }, { status: 400 });
      }

      if (!admin.otpExpiresAt || admin.otpExpiresAt < new Date()) {
        await logAdminAction('LOGIN_2FA_EXPIRED', `Expired Gmail OTP code for ${cleanEmail}`, admin.name);
        return NextResponse.json({ error: 'Gmail OTP code has expired. Please enter your password to get a new OTP.' }, { status: 400 });
      }

      // Clear OTP & Create Session
      await prisma.admin.update({
        where: { id: admin.id },
        data: { otpCode: null, otpExpiresAt: null },
      });

      await createAdminSession(admin.id);
      await logAdminAction('LOGIN_SUCCESS', `Admin logged in successfully via Gmail 2FA OTP`, admin.name);

      return NextResponse.json({
        success: true,
        admin: { email: admin.email, name: admin.name },
      });
    }

    // STEP 1: Verify Password & Dispatch Gmail OTP
    if (!password) {
      return NextResponse.json({ error: 'Password is required to request 2FA OTP.' }, { status: 400 });
    }

    const isValidPassword = await verifyAdminPassword(password);
    if (!isValidPassword) {
      await logAdminAction('LOGIN_FAILED', `Incorrect password attempt for ${cleanEmail}`, admin.name);
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    // Password valid -> Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        otpCode: generatedOtp,
        otpExpiresAt,
      },
    });

    // Send OTP to Admin's Gmail Inbox
    const emailResult = await sendGmailOtp(admin.email, generatedOtp, admin.name);

    await logAdminAction('LOGIN_2FA_OTP_SENT', `Generated 2FA Gmail OTP for ${cleanEmail}`, admin.name);

    const isLiveMailer = emailResult.success && emailResult.provider === 'Gmail SMTP';

    return NextResponse.json({
      requireOtp: true,
      email: admin.email,
      message: isLiveMailer
        ? `2FA Verification OTP code sent to your Gmail inbox (${admin.email}). Please check your inbox.`
        : `2FA OTP Generated: [ ${generatedOtp} ] (Enter this 6-digit code to log in. To send real emails directly to ${admin.email}, add GMAIL_APP_PASSWORD in Vercel settings).`,
      provider: emailResult.provider,
    });
  } catch (error: any) {
    console.error('Admin 2FA Login error:', error);
    return NextResponse.json({ error: error.message || 'Server error during admin login.' }, { status: 500 });
  }
}
