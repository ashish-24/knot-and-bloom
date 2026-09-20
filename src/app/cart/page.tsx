'use client';

import React from 'react';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import MobileNav from '@/components/store/MobileNav';
import { useCart } from '@/components/store/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, MessageCircle } from 'lucide-react';
import { generateCartWhatsAppUrl } from '@/lib/whatsapp';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  const finalDeliveryFee = subtotal >= 999 ? 0 : 49;
  const finalTotal = subtotal + finalDeliveryFee;

  const handleWhatsApp = () => {
    const whatsappUrl = generateCartWhatsAppUrl('919876543210', {
      items: items.map((i) => ({
        productName: i.name,
        sku: i.productId,
        quantity: i.quantity,
        price: i.price,
        customizationDetails: i.customizationDetails,
      })),
      totalPrice: subtotal,
    });
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900 pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-3xl font-serif font-semibold text-charcoal-900 mb-8">
          Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-cream-300 p-8 space-y-4 shadow-soft">
            <div className="w-16 h-16 bg-cream-200 rounded-full flex items-center justify-center mx-auto text-charcoal-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif text-charcoal-800">Your shopping cart is empty</h3>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
              Explore our artisanal catalog of custom resin keychains, botanical decor, and personalized hampers.
            </p>
            <Link
              href="/shop"
              className="inline-block px-8 py-3 bg-brand-800 text-cream-100 text-xs font-semibold rounded-full uppercase tracking-wider shadow-md"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white rounded-3xl border border-cream-300 shadow-soft flex gap-4 relative group"
                >
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-cream-200 shrink-0">
                    <Image src={item.thumbnail} alt={item.name} fill className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0 pr-6 space-y-1">
                    <h3 className="text-sm font-semibold text-charcoal-900 truncate">{item.name}</h3>
                    <p className="text-xs font-bold text-brand-800">
                      ₹{item.price + (item.customizationFee || 0)}
                    </p>

                    {item.customizationDetails && Object.keys(item.customizationDetails).length > 0 && (
                      <div className="text-[11px] text-charcoal-600 bg-cream-100 p-2 rounded-lg border border-cream-200">
                        {Object.entries(item.customizationDetails).map(([k, v]) => (
                          <div key={k} className="truncate">
                            <span className="font-semibold text-charcoal-800">{k}:</span> {v}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex items-center border border-cream-300 rounded-lg bg-cream-50">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 text-charcoal-600 hover:text-charcoal-900"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 text-charcoal-600 hover:text-charcoal-900"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-4 right-4 p-1.5 text-charcoal-400 hover:text-terracotta-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-4">
                <h3 className="text-base font-serif font-semibold text-charcoal-900 border-b border-cream-200 pb-2">
                  Order Summary
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-charcoal-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-charcoal-600">
                    <span>Delivery Fee</span>
                    <span>{finalDeliveryFee === 0 ? 'FREE' : `₹${finalDeliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between text-base font-serif font-bold text-charcoal-900 pt-2 border-t border-cream-300">
                    <span>Estimated Total</span>
                    <span className="text-brand-800">₹{finalTotal}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Link
                    href="/checkout"
                    className="w-full py-3.5 px-4 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>Proceed to Delivery & Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={handleWhatsApp}
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Order via WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
