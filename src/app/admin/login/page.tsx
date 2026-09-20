'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { Lock, ShieldAlert, KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('ashishkanhaiya7765@gmail.com');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'password' | 'otp'>('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfoMsg('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      if (data.requireOtp) {
        setStep('otp');
        setInfoMsg(data.message || `Verification OTP sent to your Gmail (${email})!`);
      } else {
        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'verify_otp', otpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid Gmail OTP code');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-cream-100 rounded-3xl p-8 shadow-2xl space-y-6 border border-cream-300">
        
        <div className="text-center space-y-2">
          <Logo variant="dark" showSubtitle={true} />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-100 text-brand-900 rounded-full text-xs font-semibold uppercase tracking-wider mt-2">
            <ShieldAlert className="w-3.5 h-3.5 text-terracotta-600" />
            <span>2FA Protected Admin Portal</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200 text-center">
            {error}
          </div>
        )}

        {infoMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-semibold border border-emerald-200 text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{infoMsg}</span>
          </div>
        )}

        {step === 'password' ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                Security Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-brand-900 hover:bg-brand-950 text-cream-100 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Lock className="w-4 h-4 text-terracotta-400" />
              <span>{loading ? 'Verifying Password...' : 'Verify Password & Request Gmail OTP'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="text-center p-3 bg-brand-50 rounded-2xl border border-brand-200 text-xs text-brand-900">
              <Mail className="w-5 h-5 text-brand-700 mx-auto mb-1" />
              <span className="font-bold block">Enter 6-Digit Gmail OTP</span>
              <span className="text-[11px] text-charcoal-600">Check your inbox for <strong>{email}</strong></span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1 text-center">
                6-Digit Verification OTP Code *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 bg-cream-50 border border-brand-400 rounded-xl text-lg font-bold text-center tracking-widest outline-none focus:border-brand-700 text-charcoal-900 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-brand-900 hover:bg-brand-950 text-cream-100 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>{loading ? 'Verifying OTP...' : 'Verify Gmail OTP & Enter Portal'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('password');
                setOtpCode('');
                setError('');
              }}
              className="w-full text-center text-xs text-charcoal-600 hover:text-charcoal-900 flex items-center justify-center gap-1 mt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Password Login</span>
            </button>
          </form>
        )}

        <p className="text-[11px] text-center text-charcoal-500">
          Public registration is disabled. Unauthorized access attempts are audited and logged.
        </p>

      </div>
    </div>
  );
}
