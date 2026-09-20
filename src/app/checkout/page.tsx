import React from 'react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import MobileNav from '@/components/store/MobileNav';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function CheckoutPage() {
  const storeSettings = await prisma.storeSettings.findFirst();
  const deliveryFee = storeSettings?.deliveryFee || 49;

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-terracotta-600">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/cart" className="hover:underline">Cart</Link>
          <span>/</span>
          <span className="text-charcoal-500">Checkout Delivery</span>
        </div>

        <CheckoutForm deliveryFee={deliveryFee} />
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
