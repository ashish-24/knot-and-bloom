import React from 'react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import MobileNav from '@/components/store/MobileNav';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { CheckCircle2, Clock, PackageCheck, Truck, MapPin, Sparkles, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface OrderTrackingPageProps {
  params: {
    id: string;
  };
}

const statusSteps = [
  { label: 'Order Placed', key: 'Pending Payment' },
  { label: 'Payment Submitted', key: 'Payment Submitted' },
  { label: 'Payment Verified', key: 'Payment Verified' },
  { label: 'Confirmed', key: 'Confirmed' },
  { label: 'Preparing', key: 'Preparing' },
  { label: 'Shipped', key: 'Shipped' },
  { label: 'Out for Delivery', key: 'Out for Delivery' },
  { label: 'Delivered', key: 'Delivered' },
];

export default async function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: params.id }, { orderNumber: params.id }],
    },
    include: {
      items: { include: { product: true } },
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Determine current active step index
  const currentStepIdx = statusSteps.findIndex((s) => s.key === order.status);
  const activeIdx = currentStepIdx === -1 ? 1 : currentStepIdx;

  const storeSettings = await prisma.storeSettings.findFirst();
  const whatsappNumber = storeSettings?.whatsappNumber || '919876543210';

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        
        {/* Header Summary */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
                Order Tracking Status
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif text-charcoal-900 mt-1">
                Order {order.orderNumber}
              </h1>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-xs text-charcoal-500 block">Total Amount:</span>
              <span className="text-2xl font-bold text-brand-800">₹{order.total}</span>
              <span className="inline-block mt-1 px-3 py-1 bg-brand-100 text-brand-900 rounded-full text-xs font-semibold">
                {order.status}
              </span>
            </div>
          </div>

          {/* Timeline Bar */}
          <div className="pt-4">
            <h3 className="text-sm font-serif font-semibold text-charcoal-900 mb-6">
              Handmade Fulfillment Timeline
            </h3>

            <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-4 lg:grid-cols-8 gap-2 relative">
              {statusSteps.map((step, idx) => {
                const isCompleted = idx <= activeIdx;
                const isCurrent = idx === activeIdx;

                return (
                  <div key={step.key} className="flex sm:flex-col items-center gap-3 sm:gap-2 text-center group">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                        isCompleted
                          ? 'bg-brand-800 text-cream-100 shadow-sm'
                          : 'bg-cream-200 text-charcoal-400 border border-cream-300'
                      } ${isCurrent ? 'ring-4 ring-brand-200 scale-110' : ''}`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <span
                      className={`text-[11px] font-medium leading-tight ${
                        isCompleted ? 'text-charcoal-900 font-semibold' : 'text-charcoal-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Details & Items */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 p-6 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-4">
            <h3 className="text-base font-serif font-semibold text-charcoal-900 border-b border-cream-200 pb-2">
              Ordered Items ({order.items.length})
            </h3>

            <div className="space-y-3 divide-y divide-cream-200">
              {order.items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex justify-between text-xs">
                  <div>
                    <h4 className="font-semibold text-charcoal-900">{item.product.name}</h4>
                    <span className="text-charcoal-500 block">Qty: {item.quantity} × ₹{item.price}</span>
                    {item.customizationDetails && (
                      <span className="text-[11px] text-brand-700 block mt-0.5">
                        {item.customizationDetails}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-charcoal-900">
                    ₹{(item.price + item.customizationFee) * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-5 p-6 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-4">
            <h3 className="text-base font-serif font-semibold text-charcoal-900 border-b border-cream-200 pb-2">
              Delivery Details
            </h3>

            <div className="text-xs text-charcoal-700 space-y-1.5">
              <p className="font-bold text-charcoal-900 text-sm">{order.customerName}</p>
              <p>{order.customerMobile}</p>
              <p className="text-charcoal-600 leading-relaxed mt-2">{order.address}, {order.city}, {order.state} - {order.pincode}</p>
              {order.landmark && <p className="text-charcoal-500">Landmark: {order.landmark}</p>}
            </div>

            <div className="pt-3 border-t border-cream-200">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello Knot & Bloom! Checking status for Order ${order.orderNumber}`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Ask Update on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
