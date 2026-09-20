'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Heart, HeartHandshake } from 'lucide-react';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Scroll-Driven Thread Motion (window scroll fallback to prevent null ref hydration errors)
  const { scrollYProgress } = useScroll();

  const scrollThreadY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // 2. Interactive Cursor Parallax Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 140 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const textParallaxX = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const textParallaxY = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden bg-gradient-to-b from-[#FDE8D3]/45 via-[#DAEBE3]/35 to-[#FDE8D3]/45 py-16 sm:py-24 lg:py-28 border-b border-[#CFD6C4]/40 select-none min-h-[80vh] flex items-center"
    >
      {/* Soft Ambient Studio Palette Glows */}
      <div className="absolute top-0 right-1/4 w-[650px] h-[650px] bg-[#99CDD8]/20 rounded-full blur-3xl -z-20 pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#F3C3B2]/25 rounded-full blur-3xl -z-20 pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-[#DAEBE3]/40 rounded-full blur-3xl -z-20 pointer-events-none" />

      {/* Dynamic Animated Organic Thread Wave Paths in Background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="threadGradientPalette" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F3C3B2" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#99CDD8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#CFD6C4" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="threadGradientSage" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#657166" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#99CDD8" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Floating Woven Thread Line 1 */}
        <motion.path
          d="M -50 180 Q 400 40, 800 240 T 1600 320"
          fill="none"
          stroke="url(#threadGradientPalette)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="8 6"
          style={{ y: scrollThreadY }}
        />

        {/* Floating Woven Thread Line 2 */}
        <motion.path
          d="M -100 360 C 350 490, 850 190, 1500 440"
          fill="none"
          stroke="url(#threadGradientSage)"
          strokeWidth="2.5"
          strokeDasharray="6 6"
        />
      </svg>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center relative z-10">
        <motion.div
          style={{ x: textParallaxX, y: textParallaxY }}
          className="space-y-8"
        >
          {/* Studio Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/95 backdrop-blur-md border border-brand-300 text-brand-950 text-xs font-semibold uppercase tracking-widest shadow-xs hover:scale-105 transition-transform cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-ping" />
            <span className="text-base leading-none">🧶</span>
            <span>Organic Yarn, Thread & Botanical Craft Studio</span>
          </motion.div>

          {/* Pill Photo Container with Connecting Thread Line (Reference: media_1789486981611.png) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative inline-flex items-center justify-center my-3"
          >
            <div className="relative z-10 overflow-hidden rounded-full border-2 border-white shadow-md bg-white/95 backdrop-blur-sm px-4 py-2 flex items-center gap-3 hover:scale-105 transition-transform">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-cream-200 bg-cream-50 p-0.5">
                <img
                  src="/images/crochet-craft.png"
                  alt="Crochet Hands Yarn Crafting"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs font-serif italic text-charcoal-800 pr-2 font-medium">
                Hand-Woven Yarn & Crochet Artistry
              </span>
            </div>

            {/* Connecting Thread Line */}
            <div className="absolute right-[-120px] sm:right-[-200px] top-1/2 -translate-y-1/2 w-32 sm:w-52 h-[2px] bg-gradient-to-r from-[#F3C3B2] to-[#99CDD8] pointer-events-none hidden sm:block" />
          </motion.div>

          {/* Main Headline with Handwritten Double-Thread Stitched Underline */}
          <div className="relative">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-charcoal-900 leading-[1.15] tracking-tight">
              Handcrafted Treasures, <br />
              <span className="relative inline-block italic font-light text-brand-800">
                Woven by Hand & Heart.

                {/* Double Thread Stitched Underline */}
                <svg
                  className="absolute -bottom-3 left-0 w-full h-6 overflow-visible"
                  viewBox="0 0 340 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <motion.path
                    d="M 4 12 C 95 22, 220 4, 335 14"
                    stroke="#F3C3B2"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="8 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.8, ease: 'easeOut' }}
                  />
                  <motion.path
                    d="M 15 16 C 115 6, 205 18, 325 8"
                    stroke="#99CDD8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2.2, delay: 0.3, ease: 'easeOut' }}
                  />
                </svg>
              </span>
            </h1>
          </div>

          {/* Soulful Artisan Quote & Subtitle */}
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-xl sm:text-3xl font-serif italic text-brand-950 leading-relaxed font-semibold tracking-tight">
              “It’s not just a hobby — it is my passion, my therapy, and my way of bringing imagination to life.”
            </p>
            <p className="text-sm sm:text-lg text-charcoal-800 font-sans leading-relaxed max-w-2xl mx-auto font-medium">
              From soft milk-cotton scrunchies and amigurumi keepsakes to botanical resin keychains and custom memory plaques — every piece is handcrafted with pure artisan love.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-9 py-4 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-2xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-float transition-all hover:-translate-y-0.5"
            >
              <span>Explore Full Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/shop?filter=customizable"
              className="w-full sm:w-auto px-9 py-4 bg-white hover:bg-cream-50 text-charcoal-900 border border-cream-300 rounded-2xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all hover:border-brand-400 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-terracotta-500" />
              <span>Create Your Custom Piece</span>
            </Link>
          </div>

          {/* Feature Badges */}
          <div className="pt-8 border-t border-cream-300/80 flex flex-wrap items-center justify-center gap-8 text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF0ED] text-[#B85C42] flex items-center justify-center shrink-0 shadow-xs border border-rose-100/50">
                <Heart className="w-6 h-6 stroke-[1.75] fill-[#B85C42]/15" />
              </div>
              <div>
                <h4 className="text-base font-serif font-bold text-charcoal-900 leading-tight">100% Handmade</h4>
                <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5 font-sans">Made with hand with love</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FEFAEC] text-[#8C6B1B] flex items-center justify-center shrink-0 shadow-xs border border-amber-100/50">
                <ShieldCheck className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div>
                <h4 className="text-base font-serif font-bold text-charcoal-900 leading-tight">UPI Verified</h4>
                <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5 font-sans leading-snug">Secure manual checkout</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 shadow-xs border border-amber-200/50">
                <HeartHandshake className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div>
                <h4 className="text-base font-serif font-bold text-charcoal-900 leading-tight">Artisan Studio</h4>
                <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5 font-sans">Crafted & Dispatched with Love</p>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
