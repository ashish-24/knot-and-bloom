'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import MobileNav from '@/components/store/MobileNav';
import Logo from '@/components/ui/Logo';
import { UserPlus, CheckCircle, Smartphone, User, Mail, Lock } from 'lucide-react';
import { registerWithEmailPassword, isFirebaseConfigured } from '@/lib/firebase';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Email + Password Registration
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.mobile.trim() || !formData.password.trim()) {
      setError('Please fill in all mandatory fields: Name, Email, Mobile Number, and Password.');
      setLoading(false);
      return;
    }

    try {
      // 1. Register with Firebase Email/Password if configured
      if (isFirebaseConfigured()) {
        try {
          await registerWithEmailPassword(formData.email, formData.password);
        } catch (fbErr: any) {
          console.warn('Firebase Auth notice:', fbErr);
        }
      }

      // 2. Sync session & save customer in database
      const res = await fetch('/api/customer/firebase-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create account.');

      setMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        router.push('/account');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Error creating account.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="bg-white rounded-3xl p-8 border border-cream-300 shadow-soft space-y-6">
          <div className="text-center space-y-2">
            <Logo variant="dark" showSubtitle={true} />
            <h1 className="text-2xl font-serif text-charcoal-900 mt-2">
              Create Account
            </h1>
            <p className="text-xs text-charcoal-500">
              Join Romi & Knot to save custom gifts and track artisan orders.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleEmailRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Rahul Sharma"
                  className="w-full pl-10 pr-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rahul@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                Mobile Phone Number *
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full pl-10 pr-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">Create Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                !formData.name.trim() ||
                !formData.email.trim() ||
                !formData.mobile.trim() ||
                !formData.password.trim()
              }
              className="w-full py-3.5 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-float transition-all disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-cream-200 text-xs text-charcoal-500">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-800 font-bold hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
