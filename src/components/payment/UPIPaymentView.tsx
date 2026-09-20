'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Copy, Check, ShieldCheck, ArrowRight, Upload, AlertCircle, Sparkles } from 'lucide-react';

interface UPIPaymentViewProps {
  orderId: string;
  orderNumber: string;
  amount: number;
  upiSettings: {
    upiId: string;
    upiDisplayName: string;
    upiQrUrl?: string | null;
  };
}

export default function UPIPaymentView({ orderId, orderNumber, amount, upiSettings }: UPIPaymentViewProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'pay' | 'confirm'>('pay');

  // Form inputs for UTR & Screenshot
  const [utrNumber, setUtrNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiSettings.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.');
        return;
      }
      setScreenshotFile(file);
      setError('');
    }
  };

  const handlePaymentSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim() || utrNumber.length < 6) {
      setError('Please enter a valid 12-digit UPI Transaction ID / UTR.');
      return;
    }

    if (!screenshotFile) {
      setError('Please attach your payment confirmation screenshot.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('utrNumber', utrNumber);
      formData.append('customerName', customerName);
      formData.append('customerMobile', customerMobile);
      formData.append('screenshot', screenshotFile);

      const res = await fetch('/api/payments/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payment details');
      }

      // Redirect to Order Tracking page
      router.push(`/order/${orderId}?status=submitted`);
    } catch (err: any) {
      setError(err.message || 'Payment submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="p-6 bg-white rounded-3xl border border-cream-300 shadow-soft text-center space-y-2">
        <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
          Order {orderNumber}
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif text-charcoal-900">
          Pay via UPI (GPay / PhonePe / Paytm / BHIM)
        </h1>
        <div className="pt-1">
          <span className="text-xs text-charcoal-500 block">Total Amount to Pay:</span>
          <span className="text-3xl font-bold text-brand-800">₹{amount}</span>
        </div>
      </div>

      {step === 'pay' ? (
        /* STEP 1: SCAN QR OR COPY UPI ID */
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-6">
          <div className="space-y-2 text-center">
            <h3 className="text-lg font-serif font-semibold text-charcoal-900">
              Scan QR Code or Copy UPI ID
            </h3>
            <p className="text-xs text-charcoal-500 max-w-md mx-auto">
              Open any UPI app on your phone, scan the QR code below or enter the official business UPI ID to pay exactly <strong className="text-charcoal-900">₹{amount}</strong>.
            </p>
          </div>

          {/* QR Code Container */}
          <div className="w-60 h-60 mx-auto bg-white rounded-2xl p-3 border-2 border-brand-500 shadow-md flex flex-col items-center justify-center relative group">
            {upiSettings.upiQrUrl ? (
              <img
                src={upiSettings.upiQrUrl}
                alt="Official Merchant UPI QR Code"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiSettings.upiId}&pn=${encodeURIComponent(upiSettings.upiDisplayName)}&am=${amount}&cu=INR`}
                alt="UPI QR Code"
                className="w-full h-full object-contain rounded-lg"
              />
            )}
          </div>

          {/* 1-Tap Direct Mobile UPI Launch Buttons */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-600 block text-center">
              ⚡ Mobile Quick Pay — Tap to open UPI App on Phone:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href={`upi://pay?pa=${upiSettings.upiId}&pn=${encodeURIComponent(upiSettings.upiDisplayName)}&am=${amount}&cu=INR`}
                className="py-2.5 px-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
              >
                <span>💜 PhonePe</span>
              </a>
              <a
                href={`upi://pay?pa=${upiSettings.upiId}&pn=${encodeURIComponent(upiSettings.upiDisplayName)}&am=${amount}&cu=INR`}
                className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
              >
                <span>🌐 GPay</span>
              </a>
              <a
                href={`upi://pay?pa=${upiSettings.upiId}&pn=${encodeURIComponent(upiSettings.upiDisplayName)}&am=${amount}&cu=INR`}
                className="py-2.5 px-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
              >
                <span>🔹 Paytm</span>
              </a>
              <a
                href={`upi://pay?pa=${upiSettings.upiId}&pn=${encodeURIComponent(upiSettings.upiDisplayName)}&am=${amount}&cu=INR`}
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
              >
                <span>⚡ Any UPI App</span>
              </a>
            </div>
          </div>

          {/* Copy UPI ID Box */}
          <div className="p-4 bg-cream-200/80 rounded-2xl border border-cream-300 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-charcoal-500 block uppercase font-semibold">Official Business UPI ID</span>
              <span className="text-sm font-mono font-bold text-charcoal-900">{upiSettings.upiId}</span>
              <span className="text-xs text-brand-700 block font-serif">({upiSettings.upiDisplayName})</span>
            </div>

            <button
              onClick={handleCopyUPI}
              className="px-4 py-2 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy UPI ID'}</span>
            </button>
          </div>

          {/* Trigger Step 2 Button */}
          <div className="pt-2">
            <button
              onClick={() => setStep('confirm')}
              className="w-full py-4 px-6 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-float transition-all"
            >
              <span>I HAVE PAID ₹{amount} — SUBMIT UTR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl text-amber-900 text-xs text-center border border-amber-200">
            <strong>Note:</strong> Please pay the exact amount ₹{amount}. After paying, click "I HAVE PAID" to submit your 12-digit UTR number for manual verification.
          </div>
        </div>
      ) : (
        /* STEP 2: SUBMIT PAYMENT UTR & SCREENSHOT FORM */
        <form onSubmit={handlePaymentSubmission} className="p-6 sm:p-8 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-6">
          <div className="border-b border-cream-200 pb-3 flex items-center justify-between">
            <h3 className="text-lg font-serif font-semibold text-charcoal-900">
              Payment Confirmation Details
            </h3>
            <button
              type="button"
              onClick={() => setStep('pay')}
              className="text-xs text-brand-700 hover:underline font-semibold"
            >
              ← Back to QR
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                Order Amount (Non-Editable)
              </label>
              <input
                type="text"
                disabled
                value={`₹${amount}`}
                className="w-full px-3.5 py-2.5 bg-cream-200 font-bold text-brand-900 border border-cream-300 rounded-xl text-xs cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                Your Name <span className="text-terracotta-600">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                UPI Transaction ID / UTR (12 Digits) <span className="text-terracotta-600">*</span>
              </label>
              <input
                type="text"
                required
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. 123456789012"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                Upload Payment Screenshot <span className="text-terracotta-600">*</span>
              </label>
              <div className="p-4 border-2 border-dashed border-cream-300 rounded-2xl bg-cream-50 text-center space-y-2">
                <Upload className="w-6 h-6 text-brand-700 mx-auto" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  onChange={handleFileChange}
                  className="hidden"
                  id="payment-screenshot"
                />
                <label
                  htmlFor="payment-screenshot"
                  className="cursor-pointer inline-block px-4 py-2 bg-cream-200 hover:bg-brand-100 text-brand-900 rounded-xl text-xs font-semibold border border-cream-300 transition-colors"
                >
                  {screenshotFile ? screenshotFile.name : 'Choose File (PNG/JPG < 5MB)'}
                </label>
                <p className="text-[11px] text-charcoal-500">
                  Screenshots remain 100% private and are only viewable by our admin team for verification.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-float transition-all"
          >
            <span>{submitting ? 'Submitting Payment Proof...' : 'Submit Payment for Verification'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
