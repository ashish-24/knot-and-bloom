'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, Leaf, CheckCircle2 } from 'lucide-react';
import ThreadUnderline from '@/components/ui/ThreadUnderline';
import { motion } from 'framer-motion';

export default function HandmadeStorySection() {
  return (
    <section className="py-16 sm:py-24 bg-cream-200/60 border-b border-cream-300 relative overflow-hidden">
      {/* Background Soft Glow Accents */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-terracotta-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Seamless Remix Illustration with Multiply Blend (No White Box!) */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative w-full max-w-md sm:max-w-lg flex items-center justify-center p-4 sm:p-6"
            >
              {/* Soft Organic Organic Background Blobs */}
              <div className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-amber-100/80 rounded-full blur-2xl -z-10" />
              <div className="absolute w-56 h-56 bg-rose-100/70 rounded-full blur-xl translate-x-8 translate-y-6 -z-10" />

              {/* Illustration framed seamlessly with mix-blend-multiply to remove white box background */}
              <div className="relative w-full aspect-square max-w-[420px] flex items-center justify-center">
                <motion.img
                  src="/images/crochet-craft-new.jpg"
                  alt="Handmade Crochet Artisan Hands at Work"
                  className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              {/* Floating Badge Top Left */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-cream-300 shadow-md flex items-center gap-2 text-xs font-bold text-charcoal-900"
              >
                <div className="w-7 h-7 rounded-xl bg-terracotta-100 text-terracotta-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] text-charcoal-500 uppercase font-semibold">100% Authentic</span>
                  <span className="text-xs font-serif font-bold text-brand-900">Handcrafted by Hand</span>
                </div>
              </motion.div>

              {/* Floating Badge Bottom Right */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-cream-300 shadow-md flex items-center gap-2 text-xs font-bold text-charcoal-900"
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 fill-emerald-600/20" />
                </div>
                <div>
                  <span className="block text-[10px] text-charcoal-500 uppercase font-semibold">Boutique Studio</span>
                  <span className="text-xs font-serif font-bold text-brand-900">Romi.ka Handcraft With Love</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column: Story Text Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-100 text-brand-900 rounded-full text-xs font-semibold uppercase tracking-widest border border-brand-200/50">
              <Leaf className="w-3.5 h-3.5 text-brand-700" />
              <span>Our Artisanal Philosophy</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-serif text-charcoal-950 leading-tight block relative font-semibold">
              <span>“It’s not just a hobby — it is my passion, my therapy, and my way of bringing imagination to life.”</span>
              <ThreadUnderline />
            </h2>

            <p className="text-sm sm:text-base text-charcoal-800 leading-relaxed font-sans font-medium">
              Knot & Bloom was born from a simple belief: in a world filled with mass-produced gifts, handmade creations carry a warmth and personality that machines can never replicate. Every crochet stitch, yarn bow, and handcrafted bloom is made with patience, care, and love.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { title: 'Handmade Quality', desc: 'Small studio in India creating crochet & floral crafts' },
                { title: 'Made Just for You', desc: 'Custom colors, names, initials, dates, and designs' },
                { title: 'Direct-to-Customer', desc: 'Manual UPI & WhatsApp with zero extra platform fees' },
                { title: 'Carefully Packed', desc: 'Dispatched with thorough quality inspection & love' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-cream-300/80 shadow-xs space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-charcoal-900">
                    <CheckCircle2 className="w-4 h-4 text-brand-700 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] text-charcoal-500 pl-6 leading-normal">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-2xl text-xs uppercase tracking-widest font-semibold transition-all shadow-float"
              >
                <span>Read Our Full Story</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
