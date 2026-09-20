'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { MessageCircle, ShieldAlert, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const [settings, setSettings] = useState<{
    contactPhone?: string;
    supportEmail?: string;
    studioAddress?: string;
    footerTagline?: string;
    whatsappNumber?: string;
  }>({
    contactPhone: '+91 98765 43210',
    supportEmail: 'hello@knotandbloom.com',
    studioAddress: 'Handmade Studio, India',
    footerTagline: 'Knot & Bloom creates handmade decoration items, custom resin keychains, personalized couple plaques, and artisan hampers. Handcrafted with love.',
    whatsappNumber: '919876543210',
  });

  useEffect(() => {
    const fetchFooterSettings = () => {
      fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setSettings((prev) => ({
              ...prev,
              contactPhone: data.contactPhone || prev.contactPhone,
              supportEmail: data.supportEmail || prev.supportEmail,
              studioAddress: data.studioAddress || prev.studioAddress,
              footerTagline: data.footerTagline || prev.footerTagline,
              whatsappNumber: data.whatsappNumber || prev.whatsappNumber,
            }));
          }
        })
        .catch(() => {});
    };

    fetchFooterSettings();

    window.addEventListener('store-settings-updated', fetchFooterSettings);
    window.addEventListener('storage', fetchFooterSettings);
    return () => {
      window.removeEventListener('store-settings-updated', fetchFooterSettings);
      window.removeEventListener('storage', fetchFooterSettings);
    };
  }, []);

  const whatsappClean = (settings.whatsappNumber || '919876543210').replace(/\D/g, '');

  return (
    <footer className="bg-charcoal-950 text-cream-200 pt-16 pb-24 lg:pb-12 border-t border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-charcoal-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="light" showSubtitle={true} />
            <p className="text-xs text-charcoal-400 max-w-sm leading-relaxed mt-2">
              {settings.footerTagline}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={`https://wa.me/${whatsappClean}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-cream-100">Quick Shop</h4>
            <ul className="space-y-2 text-xs text-charcoal-400">
              <li>
                <Link href="/shop" className="hover:text-cream-100 transition-colors">All Handmade Gifts</Link>
              </li>
              <li>
                <Link href="/shop?filter=customizable" className="hover:text-cream-100 transition-colors">Custom Keychains</Link>
              </li>
              <li>
                <Link href="/shop?category=home-decor" className="hover:text-cream-100 transition-colors">Botanical Home Decor</Link>
              </li>
              <li>
                <Link href="/shop?category=gift-hampers" className="hover:text-cream-100 transition-colors">Gift Hampers</Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-cream-100 transition-colors">Track Order Timeline</Link>
              </li>
            </ul>
          </div>

          {/* Customer Care / Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-cream-100">Boutique Policies</h4>
            <ul className="space-y-2 text-xs text-charcoal-400">
              <li>
                <Link href="/privacy" className="hover:text-cream-100 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-cream-100 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-cream-100 transition-colors">Refund & Cancellation</Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-cream-100 transition-colors">Shipping & Delivery Policy</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-cream-100 transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-cream-100">Workshop Studio</h4>
            <ul className="space-y-2.5 text-xs text-charcoal-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-terracotta-400 shrink-0" />
                <span>{settings.studioAddress}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-terracotta-400 shrink-0" />
                <span>{settings.contactPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-terracotta-400 shrink-0" />
                <span>{settings.supportEmail}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & admin access */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-500">
          <div className="space-y-1 text-center sm:text-left">
            <p>© {new Date().getFullYear()} Knot & Bloom Studio. All rights reserved. Handcrafted with love.</p>
            <p className="text-[11px] text-charcoal-400">
              Website created by{' '}
              <a
                href="https://www.linkedin.com/in/ashish-ranjan24/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream-200 hover:text-white font-medium underline underline-offset-2 transition-colors"
              >
                Ashish Ranjan
              </a>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="hover:text-cream-200 transition-colors flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-terracotta-400" />
              <span>Admin Portal Login</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
