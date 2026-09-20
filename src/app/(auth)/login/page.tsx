'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import MobileNav from '@/components/store/MobileNav';
import Logo from '@/components/ui/Logo';
import { Mail, Lock, LogIn, CheckCircle, HelpCircle, X } from 'lucide-react';
import { loginWithEmailPassword, resetCustomerPassword, isFirebaseConfigured } from '@/lib/firebase';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Email + Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // 1. Authenticate with Firebase Email/Password if API key is configured
      if (isFirebaseConfigured()) {
        try {
          await loginWithEmailPassword(email, password);
        } catch (fbErr: any) {
          console.warn('Firebase Email Auth Notice:', fbErr);
        }
      }

      // 2. Sync session with backend
      const res = await fetch('/api/customer/firebase-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Incorrect email address or password.');

      setMessage('Sign in successful! Redirecting...');
      setTimeout(() => {
        router.push('/account');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Incorrect email or password.');
      setLoading(false);
    }
  };

  // Password Reset Email Trigger
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setError('');

    try {
      if (!isFirebaseConfigured()) {
        throw new Error('Password reset emails require your Firebase API key in .env file.');
      }

      await resetCustomerPassword(forgotEmail);
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
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
              Customer Sign In
            </h1>
            <p className="text-xs text-charcoal-500">
              Sign in with your Email Address & Password.
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

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-charcoal-800">
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotModalOpen(true);
                    setResetSent(false);
                  }}
                  className="text-[11px] text-brand-800 hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full py-3.5 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-float transition-all disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Signing In...' : 'Sign In with Email'}</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-cream-200 text-xs text-charcoal-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-800 font-bold hover:underline">
              Create New Account
            </Link>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 border border-cream-300 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-4 right-4 text-charcoal-400 hover:text-charcoal-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-charcoal-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-terracotta-600" />
                Reset Password
              </h3>
              <p className="text-xs text-charcoal-500">
                Enter your email address to receive a secure password reset link.
              </p>
            </div>

            {resetSent ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold space-y-2 text-center border border-emerald-200">
                <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" />
                <p>Password reset link sent to <strong>{forgotEmail}</strong>!</p>
                <p className="text-[11px] text-charcoal-500 font-normal">Check your inbox or spam folder.</p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="yourname@example.com"
                    className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none text-charcoal-900 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl font-bold text-xs shadow-xs"
                >
                  Send Password Reset Link ✉️
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
      <MobileNav />
    </div>
  );
}
