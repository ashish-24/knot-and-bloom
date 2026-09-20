import React from 'react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import MobileNav from '@/components/store/MobileNav';
import Logo from '@/components/ui/Logo';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-center space-y-3">
          <Logo variant="dark" showSubtitle={true} />
          <h1 className="text-3xl sm:text-4xl font-serif text-charcoal-900 mt-4">
            Our Story — Romi.ka handcraft With love
          </h1>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-6 text-sm text-charcoal-700 leading-relaxed font-sans">
          <blockquote className="text-xl sm:text-2xl font-serif italic text-brand-950 font-semibold border-l-4 border-brand-600 pl-4 py-1 my-2">
            “It’s not just a hobby — it is my passion, my therapy, and my way of bringing imagination to life.”
          </blockquote>

          <p className="text-base text-charcoal-800 leading-relaxed">
            Romi & Knot was born from a simple belief: in a world filled with mass-produced gifts, handmade creations carry a warmth and personality that machines can never truly replicate. Every crochet stitch, flower, and handcrafted detail is made with care, patience, and love.
          </p>

          <div className="space-y-2">
            <h3 className="text-lg font-serif font-semibold text-charcoal-900 border-b border-cream-200 pb-2">
              Handmade Quality
            </h3>
            <p>
              Based in India, our small studio creates handmade crochet gifts, floral crafts, and personalized keepsakes using carefully selected materials. Every piece — whether it's a crochet heart, flower, bow, custom name, or special gift — is carefully handmade and checked before dispatch.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-serif font-semibold text-charcoal-900 border-b border-cream-200 pb-2">
              Made Just for You
            </h3>
            <p>
              We believe gifts become more meaningful when they are personal. That's why we offer custom colors, names, initials, dates, and designs to make each creation special for you or someone you love.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-serif font-semibold text-charcoal-900 border-b border-cream-200 pb-2">
              Direct-to-Customer Philosophy
            </h3>
            <p>
              By offering direct manual UPI payments and WhatsApp ordering, we keep transaction costs low, allowing us to focus more on quality materials and careful craftsmanship. Every order is made by hand, packed with care, and sent with love.
            </p>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
