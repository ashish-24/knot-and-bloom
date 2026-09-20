import React from 'react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import MobileNav from '@/components/store/MobileNav';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 pb-20 lg:pb-0">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-serif text-charcoal-900">Privacy Policy</h1>
        <div className="p-8 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-4 text-xs text-charcoal-700 leading-relaxed">
          <p>At Knot & Bloom, we respect your personal privacy. We collect only necessary delivery information (Name, Mobile, Address, Pincode) strictly to fulfill your handmade orders.</p>
          <p><strong>Payment Screenshots:</strong> Screenshots and UTR numbers uploaded during UPI verification remain 100% private and accessible strictly by our authorized store admin team. We never share your personal data with third-party advertising networks.</p>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
