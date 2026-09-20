import React from 'react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import MobileNav from '@/components/store/MobileNav';
import UPIPaymentView from '@/components/payment/UPIPaymentView';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

interface PaymentPageProps {
  searchParams: {
    orderId?: string;
    orderNumber?: string;
    amount?: string;
  };
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const { orderId, orderNumber, amount } = searchParams;

  if (!orderId || !orderNumber || !amount) {
    notFound();
  }

  const storeSettings = await prisma.storeSettings.findFirst();
  const upiSettings = {
    upiId: storeSettings?.upiId || 'romiandknot@upi',
    upiDisplayName: storeSettings?.upiDisplayName || 'Romi & Knot Handmade',
    upiQrUrl: storeSettings?.upiQrUrl || null,
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <UPIPaymentView
          orderId={orderId}
          orderNumber={orderNumber}
          amount={parseFloat(amount)}
          upiSettings={upiSettings}
        />
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
