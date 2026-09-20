import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          id: 'default',
          storeName: 'Romi & Knot',
          tagline: 'bespoke by nature',
          announcementText: 'Handcrafted Crochet & Botanical Gifts — Free Delivery Over ₹999',
          announcementEnabled: true,
          contactPhone: '+91 98765 43210',
          supportEmail: 'hello@romiandknot.com',
          studioAddress: 'Handmade Studio, India',
          footerTagline: 'Handcrafted decoration items, custom keychains & keepsakes.',
          whatsappNumber: '919876543210',
          upiId: 'romiandknot@upi',
          upiDisplayName: 'Romi & Knot Handmade',
          upiQrUrl: null,
          deliveryFee: 49,
          freeDeliveryOver: 999,
        },
      });
    }

    return NextResponse.json(settings, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (err: any) {
    console.error('Error fetching store settings:', err);
    return NextResponse.json(
      {
        storeName: 'Romi & Knot',
        tagline: 'bespoke by nature',
        announcementText: 'Handcrafted Crochet & Botanical Gifts — Free Delivery Over ₹999',
        announcementEnabled: true,
        contactPhone: '+91 98765 43210',
        supportEmail: 'hello@romiandknot.com',
        studioAddress: 'Handmade Studio, India',
        footerTagline: 'Handcrafted decoration items, custom keychains & keepsakes.',
        whatsappNumber: '919876543210',
        upiId: 'romiandknot@upi',
        upiDisplayName: 'Romi & Knot Handmade',
        deliveryFee: 49,
        freeDeliveryOver: 999,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  }
}
