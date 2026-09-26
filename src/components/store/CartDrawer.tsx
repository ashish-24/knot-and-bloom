'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartContext';
import { X, Trash2, Plus, Minus, ArrowRight, MessageCircle, ShoppingBag } from 'lucide-react';
import { generateCartWhatsAppUrl } from '@/lib/whatsapp';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, isOpen, setIsOpen, subtotal, itemCount } = useCart();
  const [waNumber, setWaNumber] = React.useState('919876543210');

  React.useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.whatsappNumber) setWaNumber(data.whatsappNumber);
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const handleWhatsAppCheckout = () => {
    const whatsappUrl = generateCartWhatsAppUrl(waNumber, {
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal-950/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-cream-100 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-6 bg-cream-200/80 border-b border-cream-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-800" />
              <h2 className="text-xl font-serif text-charcoal-900 font-semibold">Your Cart</h2>
              <span className="text-xs bg-brand-200 text-brand-900 px-2 py-0.5 rounded-full font-medium">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-charcoal-500 hover:text-charcoal-900 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-cream-200 rounded-full flex items-center justify-center mx-auto text-charcoal-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-serif text-charcoal-800">Your cart is empty</h3>
                <p className="text-sm text-charcoal-500 max-w-xs mx-auto">
                  Explore our handcrafted keychains, botanical decor, and personalized keepsakes.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="inline-block mt-2 px-6 py-2.5 bg-brand-800 text-cream-100 rounded-full text-xs uppercase tracking-widest font-semibold hover:bg-brand-900"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white rounded-2xl border border-cream-300 shadow-soft flex gap-4 relative group"
                >
                  {/* Product Image */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-cream-200 shrink-0">
                    <Image
                      src={item.thumbnail}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className="text-sm font-semibold text-charcoal-900 truncate">{item.name}</h4>
                    <p className="text-xs text-brand-700 font-medium mt-0.5">
                      ₹{item.price + (item.customizationFee || 0)}
                    </p>

                    {item.customizationDetails && Object.keys(item.customizationDetails).length > 0 && (
                      <div className="mt-1.5 p-1.5 bg-cream-100 rounded-md text-[11px] text-charcoal-600 space-y-0.5 border border-cream-200">
                        {Object.entries(item.customizationDetails).map(([k, v]) => (
                          <div key={k} className="truncate">
                            <span className="font-medium text-charcoal-800">{k}:</span> {v}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center border border-cream-300 rounded-lg bg-cream-50">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 text-charcoal-600 hover:text-charcoal-900"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 text-charcoal-600 hover:text-charcoal-900"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-3 right-3 p-1.5 text-charcoal-400 hover:text-terracotta-600 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-6 bg-cream-200/90 border-t border-cream-300 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-charcoal-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-charcoal-600 text-xs">
                  <span>Delivery</span>
                  <span>{subtotal >= 999 ? 'FREE' : '₹49 calculated at checkout'}</span>
                </div>
                <div className="flex justify-between text-base font-serif font-bold text-charcoal-900 pt-2 border-t border-cream-300">
                  <span>Estimated Total</span>
                  <span className="text-brand-800">₹{subtotal >= 999 ? subtotal : subtotal + 49}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3.5 px-4 bg-brand-800 text-cream-100 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-brand-900 transition-all shadow-md"
                >
                  <span>Proceed to UPI Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full py-2.5 px-4 bg-emerald-700 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 hover:bg-emerald-800 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order Directly via WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
