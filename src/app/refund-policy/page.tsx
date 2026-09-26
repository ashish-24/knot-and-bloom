import React from 'react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import MobileNav from '@/components/store/MobileNav';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function RefundPolicyPage() {
  const storeSettings = await prisma.storeSettings.findFirst().catch(() => null);
  const contactNum = storeSettings?.contactPhone || (storeSettings?.whatsappNumber ? `+${storeSettings.whatsappNumber}` : '+91 98765 43210');

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 pb-20 lg:pb-0">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-serif text-charcoal-900">Refund & Cancellation Policy</h1>
        <div className="p-8 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-4 text-xs text-charcoal-700 leading-relaxed">
          <p>We take pride in our handcrafted quality. If an item arrives damaged or broken during transit, please contact us on WhatsApp ({contactNum}) within 48 hours of delivery with an unboxing video/photo for immediate replacement or refund.</p>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
