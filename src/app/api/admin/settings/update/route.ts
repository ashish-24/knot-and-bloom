import { NextResponse } from 'next/server';
import { getAdminFromSession, logAdminAction, verifyAdminPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  const admin = await getAdminFromSession();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      announcementText,
      announcementEnabled,
      upiId,
      upiDisplayName,
      upiQrUrl,
      whatsappNumber,
      deliveryFee,
      freeDeliveryOver,
      contactPhone,
      supportEmail,
      studioAddress,
      footerTagline,
      currentPassword,
      newPassword,
    } = body;

    // Handle Password Change if requested
    if (newPassword && currentPassword) {
      const isCurrentValid = await verifyAdminPassword(currentPassword);
      if (!isCurrentValid) {
        return NextResponse.json({ error: 'Current admin password incorrect.' }, { status: 400 });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await prisma.admin.update({
        where: { id: admin.id },
        data: { passwordHash: newHash },
      });

      await logAdminAction('PASSWORD_CHANGED', 'Admin updated login password', admin.name);
    }

    const isAnnouncementOn = announcementEnabled === true || announcementEnabled === 'true' || announcementEnabled === 1;

    // Update Store Settings
    await prisma.storeSettings.upsert({
      where: { id: 'default' },
      update: {
        announcementText: announcementText !== undefined ? announcementText : 'Handcrafted Crochet & Botanical Gifts — Free Delivery Over ₹999',
        announcementEnabled: isAnnouncementOn,
        upiId: upiId || 'romiandknot@upi',
        upiDisplayName: upiDisplayName || 'Romi & Knot Handmade',
        upiQrUrl: upiQrUrl || null,
        whatsappNumber: whatsappNumber || '919876543210',
        contactPhone: contactPhone || '+91 98765 43210',
        supportEmail: supportEmail || 'hello@romiandknot.com',
        gmailSenderEmail: body.gmailSenderEmail !== undefined ? body.gmailSenderEmail : 'ashishkanhaiya7765@gmail.com',
        studioAddress: studioAddress || 'Handmade Studio, India',
        footerTagline: footerTagline || 'Handcrafted decoration items, custom keychains & keepsakes.',
        deliveryFee: parseFloat(deliveryFee || '49'),
        freeDeliveryOver: parseFloat(freeDeliveryOver || '999'),
      },
      create: {
        id: 'default',
        announcementText: announcementText || 'Handcrafted Crochet & Botanical Gifts — Free Delivery Over ₹999',
        announcementEnabled: isAnnouncementOn,
        upiId: upiId || 'romiandknot@upi',
        upiDisplayName: upiDisplayName || 'Romi & Knot Handmade',
        upiQrUrl: upiQrUrl || null,
        whatsappNumber: whatsappNumber || '919876543210',
        contactPhone: contactPhone || '+91 98765 43210',
        supportEmail: supportEmail || 'hello@romiandknot.com',
        gmailSenderEmail: body.gmailSenderEmail || 'ashishkanhaiya7765@gmail.com',
        studioAddress: studioAddress || 'Handmade Studio, India',
        footerTagline: footerTagline || 'Handcrafted decoration items, custom keychains & keepsakes.',
        deliveryFee: parseFloat(deliveryFee || '49'),
        freeDeliveryOver: parseFloat(freeDeliveryOver || '999'),
      },
    });

    await logAdminAction('SETTINGS_UPDATED', 'Updated Header Announcement & Store settings', admin.name);

    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  } catch (err: any) {
    console.error('Error updating settings:', err);
    return NextResponse.json({ error: 'Server error updating settings' }, { status: 500 });
  }
}
