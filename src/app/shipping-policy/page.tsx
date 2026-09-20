import React from 'react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import MobileNav from '@/components/store/MobileNav';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 pb-20 lg:pb-0">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-serif text-charcoal-900">Shipping & Delivery Policy</h1>
        <div className="p-8 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-4 text-xs text-charcoal-700 leading-relaxed">
          <p>Orders are dispatched within 24-48 hours following UPI payment verification. Standard shipping across India takes 3-6 business days depending on location.</p>
          <p><strong>Free Delivery:</strong> All orders over ₹999 qualify for free shipping. Orders below ₹999 carry a flat ₹49 delivery charge.</p>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
