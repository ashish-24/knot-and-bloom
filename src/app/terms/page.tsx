import React from 'react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import MobileNav from '@/components/store/MobileNav';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 pb-20 lg:pb-0">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-serif text-charcoal-900">Terms of Service</h1>
        <div className="p-8 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-4 text-xs text-charcoal-700 leading-relaxed">
          <p>Welcome to Romi & Knot. By accessing our platform and placing orders, you agree to our terms.</p>
          <p><strong>Handmade Variations:</strong> Because every product is handcrafted using real dried botanicals and resin, subtle natural variations in flower placement and wood grain are characteristic of bespoke handmade artistry.</p>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
