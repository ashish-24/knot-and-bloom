import nodemailer from 'nodemailer';

export interface SendEmailOtpResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

export async function sendGmailOtp(
  recipientEmail: string,
  otpCode: string,
  customerName: string = 'Valued Customer'
): Promise<SendEmailOtpResult> {
  const cleanEmail = recipientEmail.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, provider: 'Gmail', error: 'Invalid recipient email address' };
  }

  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER || process.env.SUPPORT_EMAIL || 'hello@knotandbloom.com';
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (!gmailPass) {
    console.log(`[Gmail OTP Service] OTP ${otpCode} generated for Gmail: ${cleanEmail}. (Add GMAIL_APP_PASSWORD in .env for live Gmail SMTP email delivery)`);
    return {
      success: true,
      provider: 'Local Mailer (Set GMAIL_APP_PASSWORD in .env for Live Gmail Delivery)',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #FAF7F2; padding: 32px 24px; border-radius: 24px; border: 1px solid #EFEAE1;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #2D3E33; font-size: 26px; margin: 0; font-family: Georgia, serif;">Knot & Bloom</h1>
          <p style="color: #8C5A4C; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">bespoke by nature • artisan studio</p>
        </div>

        <div style="background-color: #FFFFFF; padding: 28px 24px; border-radius: 20px; border: 1px solid #EFEAE1; text-align: center;">
          <p style="color: #3D3D3D; font-size: 14px; margin-bottom: 16px;">Hello <strong>${customerName}</strong>,</p>
          <p style="color: #666666; font-size: 13px; margin-bottom: 24px;">Here is your 6-digit verification OTP code to complete your sign in on <strong>Knot & Bloom</strong>:</p>

          <div style="background-color: #2D3E33; color: #FAF7F2; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px 24px; border-radius: 16px; display: inline-block; margin-bottom: 20px;">
            ${otpCode}
          </div>

          <p style="color: #8C5A4C; font-size: 12px; font-weight: bold; margin-bottom: 8px;">⏳ Valid for 5 minutes</p>
          <p style="color: #999999; font-size: 11px; margin: 0;">Do not share this OTP code with anyone for account security.</p>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #999999; font-size: 11px;">
          <p style="margin-bottom: 4px;">© ${new Date().getFullYear()} Knot & Bloom Studio. Handcrafted with love.</p>
          <p style="margin: 0;">If you did not request this OTP code, please ignore this email.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Knot & Bloom Handmade" <${gmailUser}>`,
      to: cleanEmail,
      subject: `✨ Your Knot & Bloom Verification OTP Code: ${otpCode}`,
      html: htmlContent,
    });

    console.log(`[Gmail OTP Service] OTP delivered successfully to ${cleanEmail}: ${info.messageId}`);
    return { success: true, provider: 'Gmail SMTP', messageId: info.messageId };
  } catch (err: any) {
    console.error('[Gmail OTP Service] Failed to send Gmail OTP:', err);
    return { success: false, provider: 'Gmail SMTP', error: err.message || 'Failed to dispatch Gmail OTP' };
  }
}
