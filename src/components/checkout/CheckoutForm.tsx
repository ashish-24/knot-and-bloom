'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/store/CartContext';
import { MapPin, ShieldCheck, ArrowRight, Lock, Sparkles, Navigation } from 'lucide-react';

export default function CheckoutForm({ deliveryFee }: { deliveryFee: number }) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    customerName: '',
    customerMobile: '',
    customerEmail: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const finalDeliveryFee = subtotal >= 999 ? 0 : deliveryFee;
  const finalTotal = subtotal + finalDeliveryFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Optional Location Detection (Section 18: Location must NEVER be mandatory. If denied, manual entry works)
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please enter your address manually.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Reverse geocode via free Nominatim API
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            setFormData((prev) => ({
              ...prev,
              address: data.display_name || prev.address,
              city: addr.city || addr.town || addr.village || prev.city,
              state: addr.state || prev.state,
              pincode: addr.postcode || prev.pincode,
            }));
          }
        } catch (e) {
          console.error('Reverse geocoding error:', e);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation permission denied or timed out:', err);
        setLocating(false);
        alert('Location access was denied or unavailable. Please fill in your address manually.');
      },
      { timeout: 8000 }
    );
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.customerMobile.trim() || !formData.address.trim() || !formData.pincode.trim()) {
      setError('Please fill in all mandatory delivery fields marked with *');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cartItems: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            customizationDetails: i.customizationDetails,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Order created successfully -> redirect to UPI Payment page
      router.push(`/payment?orderId=${data.orderId}&orderNumber=${data.orderNumber}&amount=${data.total}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* Left Column: Delivery Details Form */}
      <div className="lg:col-span-7 space-y-6">
        <div className="p-6 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-5">
          <div className="flex items-center justify-between border-b border-cream-200 pb-3">
            <h2 className="text-xl font-serif font-semibold text-charcoal-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-700" /> Delivery Address
            </h2>

            {/* Optional Location Detection Button */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={locating}
              className="px-3 py-1.5 bg-cream-200 hover:bg-brand-100 text-brand-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-cream-300"
            >
              <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
              <span>{locating ? 'Locating...' : 'Use My Location'}</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                Full Name <span className="text-terracotta-600">*</span>
              </label>
              <input
                type="text"
                name="customerName"
                required
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Rahul Sharma"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                Mobile Number <span className="text-terracotta-600">*</span>
              </label>
              <input
                type="tel"
                name="customerMobile"
                required
                value={formData.customerMobile}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-800 mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              placeholder="rahul@example.com (For order receipt copy)"
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-800 mb-1">
              Complete Address (House/Flat, Street, Area) <span className="text-terracotta-600">*</span>
            </label>
            <textarea
              name="address"
              required
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="Flat 302, Royal Gardens, Civil Lines..."
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                City <span className="text-terracotta-600">*</span>
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="Jaipur"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                State <span className="text-terracotta-600">*</span>
              </label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                placeholder="Rajasthan"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                Pincode <span className="text-terracotta-600">*</span>
              </label>
              <input
                type="text"
                name="pincode"
                required
                value={formData.pincode}
                onChange={handleChange}
                placeholder="302001"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-800 mb-1">
              Landmark (Optional)
            </label>
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
              placeholder="Near Central Park Water Tank"
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
            />
          </div>
        </div>
      </div>

      {/* Right Column: Order Summary & Action */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-6 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-4">
          <h3 className="text-lg font-serif font-semibold text-charcoal-900 border-b border-cream-200 pb-3">
            Order Summary ({items.length} items)
          </h3>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-cream-200">
            {items.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex justify-between text-xs">
                <div>
                  <span className="font-semibold text-charcoal-900">{item.name}</span>
                  <span className="text-charcoal-500 block">Qty: {item.quantity}</span>
                  {item.customizationDetails && (
                    <span className="text-[10px] text-brand-700 block truncate max-w-48">
                      {Object.values(item.customizationDetails).join(', ')}
                    </span>
                  )}
                </div>
                <span className="font-bold text-charcoal-900">
                  ₹{(item.price + (item.customizationFee || 0)) * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-cream-300 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-charcoal-600">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-charcoal-600">
              <span>Delivery Fee</span>
              <span>{finalDeliveryFee === 0 ? 'FREE' : `₹${finalDeliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-base font-serif font-bold text-charcoal-900 pt-2 border-t border-cream-300">
              <span>Grand Total</span>
              <span className="text-brand-800">₹{finalTotal}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-float transition-all"
          >
            <Lock className="w-4 h-4 text-terracotta-400" />
            <span>{submitting ? 'Creating Order...' : `Proceed to UPI Payment (₹${finalTotal})`}</span>
          </button>

          <p className="text-[11px] text-center text-charcoal-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>No payment gateway charges. Pay directly via UPI App.</span>
          </p>
        </div>
      </div>
    </form>
  );
}
