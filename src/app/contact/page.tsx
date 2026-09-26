'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import MobileNav from '@/components/store/MobileNav';
import { MessageCircle, Phone, Mail, MapPin } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [settings, setSettings] = useState<{
    contactPhone?: string;
    supportEmail?: string;
    studioAddress?: string;
    whatsappNumber?: string;
  }>({
    contactPhone: '+91 98765 43210',
    supportEmail: 'hello@romiandknot.com',
    studioAddress: 'Handcrafted Studio, India',
    whatsappNumber: '919876543210',
  });

  useEffect(() => {
    fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setSettings({
            contactPhone: data.contactPhone || '+91 98765 43210',
            supportEmail: data.supportEmail || 'hello@romiandknot.com',
            studioAddress: data.studioAddress || 'Handcrafted Studio, India',
            whatsappNumber: data.whatsappNumber || '919876543210',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const cleanWhatsapp = (settings.whatsappNumber || '919876543210').replace(/\D/g, '');

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 pb-20 lg:pb-0">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif text-charcoal-900">Get in Touch with Our Workshop</h1>
          <p className="text-xs text-charcoal-500">Have a custom order inquiry or question? We are here to help!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-4">
            <h3 className="text-lg font-serif font-semibold text-charcoal-900">Direct Contact</h3>
            <div className="space-y-3 text-xs text-charcoal-700">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-terracotta-500 shrink-0" />
                <span>{settings.studioAddress}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-terracotta-500 shrink-0" />
                <span>{settings.contactPhone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-terracotta-500 shrink-0" />
                <span>{settings.supportEmail}</span>
              </div>
            </div>

            <div className="pt-4">
              <a
                href={`https://wa.me/${cleanWhatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open Instant WhatsApp Chat</span>
              </a>
            </div>
          </div>

          <div className="p-8 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-4">
            <h3 className="text-lg font-serif font-semibold text-charcoal-900">Send a Message</h3>
            {submitted ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold text-center border border-emerald-200">
                Thank you! Your message has been received. Our studio team will reply shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <input type="text" required placeholder="Your Name" className="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl outline-none" />
                <input type="email" required placeholder="Your Email or Mobile" className="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl outline-none" />
                <textarea rows={3} required placeholder="How can we help?" className="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl outline-none resize-none" />
                <button type="submit" className="w-full py-3 bg-brand-800 text-cream-100 font-semibold rounded-xl">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
