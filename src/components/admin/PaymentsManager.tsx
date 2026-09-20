'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CreditCard, CheckCircle2, XCircle, Eye, ShieldCheck, Search, FileText } from 'lucide-react';

interface PaymentItem {
  id: string;
  utrNumber: string;
  screenshotUrl: string;
  status: string;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerMobile: string;
    total: number;
    address: string;
    city: string;
  };
}

export default function PaymentsManager({ initialPayments }: { initialPayments: PaymentItem[] }) {
  const [payments, setPayments] = useState<PaymentItem[]>(initialPayments);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (paymentId: string, action: 'VERIFY' | 'REJECT') => {
    setProcessingId(paymentId);
    try {
      const res = await fetch('/api/admin/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action }),
      });

      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) => (p.id === paymentId ? { ...p, status: action === 'VERIFY' ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED' } : p))
        );
        setSelectedPayment(null);
      }
    } catch (err) {
      alert('Failed to update payment status');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl w-full mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-cream-300 shadow-soft">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
            Manual Verification Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-charcoal-900 mt-1">
            UPI Payment Approvals Queue
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Compare customer submitted UTR numbers and screenshots against your bank statement.
          </p>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-soft p-6 overflow-hidden">
        {payments.length === 0 ? (
          <div className="text-center py-12 text-sm text-charcoal-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
            <p className="font-serif text-charcoal-800">No payment verification requests in queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-charcoal-700">
              <thead className="bg-cream-100 text-charcoal-900 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Order Total</th>
                  <th className="p-4">Submitted UTR</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-cream-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-brand-900">{pay.order.orderNumber}</td>
                    <td className="p-4">
                      <span className="font-semibold text-charcoal-900 block">{pay.order.customerName}</span>
                      <span className="text-charcoal-500 text-[11px]">{pay.order.customerMobile}</span>
                    </td>
                    <td className="p-4 font-bold text-charcoal-900">₹{pay.order.total}</td>
                    <td className="p-4 font-mono text-terracotta-700 font-bold">{pay.utrNumber}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          pay.status === 'PAYMENT_VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pay.status === 'PAYMENT_REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {pay.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedPayment(pay)}
                        className="px-3 py-1.5 bg-cream-200 hover:bg-brand-100 text-brand-900 rounded-lg text-xs font-semibold border border-cream-300"
                      >
                        Inspect Screenshot
                      </button>

                      {pay.status === 'PAYMENT_SUBMITTED' && (
                        <>
                          <button
                            onClick={() => handleAction(pay.id, 'VERIFY')}
                            disabled={processingId === pay.id}
                            className="px-3 py-1.5 bg-brand-800 hover:bg-brand-900 text-white rounded-lg text-xs font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(pay.id, 'REJECT')}
                            disabled={processingId === pay.id}
                            className="px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-semibold"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Private Screenshot Inspection Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-charcoal-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-cream-300">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="text-base font-serif font-semibold text-charcoal-900">
                Inspect Payment Proof — {selectedPayment.order.orderNumber}
              </h3>
              <button onClick={() => setSelectedPayment(null)} className="text-charcoal-400 hover:text-charcoal-900">
                ✕
              </button>
            </div>

            <div className="text-xs space-y-1 bg-cream-100 p-3 rounded-xl">
              <p><strong>Customer:</strong> {selectedPayment.order.customerName} ({selectedPayment.order.customerMobile})</p>
              <p><strong>Order Total:</strong> ₹{selectedPayment.order.total}</p>
              <p className="font-mono text-terracotta-700"><strong>UTR / Txn ID:</strong> {selectedPayment.utrNumber}</p>
            </div>

            <div className="relative aspect-[4/3] min-h-[240px] w-full rounded-2xl overflow-hidden bg-cream-200 border border-cream-300">
              <img
                src={selectedPayment.screenshotUrl}
                alt="Uploaded Payment Screenshot Proof"
                className="w-full h-full object-contain"
              />
            </div>

            {selectedPayment.status === 'PAYMENT_SUBMITTED' && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleAction(selectedPayment.id, 'VERIFY')}
                  className="flex-1 py-3 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Payment & Confirm Order</span>
                </button>

                <button
                  onClick={() => handleAction(selectedPayment.id, 'REJECT')}
                  className="flex-1 py-3 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Submission</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
