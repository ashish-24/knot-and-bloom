'use client';

import React, { useState } from 'react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import MobileNav from '@/components/store/MobileNav';
import { Search, PackageCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TrackSearchPage() {
  const [orderInput, setOrderInput] = useState('');
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderInput.trim()) {
      router.push(`/order/${orderInput.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto text-brand-800">
          <PackageCheck className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-serif font-semibold text-charcoal-900">
          Track Your Artisanal Order
        </h1>

        <p className="text-xs sm:text-sm text-charcoal-600">
          Enter your Order Number (e.g. ORD-1024) or Order ID to view real-time payment verification and fulfillment timeline.
        </p>

        <form onSubmit={handleTrack} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Order Number e.g. ORD-1024"
            value={orderInput}
            onChange={(e) => setOrderInput(e.target.value)}
            className="flex-1 px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm outline-none focus:border-brand-600 text-charcoal-900 shadow-soft"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-float"
          >
            <Search className="w-4 h-4" />
            <span>Track</span>
          </button>
        </form>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
