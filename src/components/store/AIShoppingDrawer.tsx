'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, X, Send, ShoppingBag, ArrowRight } from 'lucide-react';

interface AIShoppingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIShoppingDrawer({ isOpen, onClose }: AIShoppingDrawerProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  if (!isOpen) return null;

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error('AI assistant error:', err);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Cute custom gift under ₹500',
    'Personalized keychain for my best friend',
    'Handmade anniversary gift for couple',
    'Desk decor under ₹400',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-charcoal-950/40 backdrop-blur-xs" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-cream-100 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-brand-900 to-brand-800 text-cream-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cream-100/10 rounded-full">
                <Sparkles className="w-5 h-5 text-terracotta-300 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-semibold">Knot & Bloom AI Assistant</h3>
                <p className="text-xs text-cream-300">Intelligent Gift Finder & Shopping Concierge</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-cream-300 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body / Chat Experience */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!response && (
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl border border-cream-300 text-sm text-charcoal-700 space-y-2">
                  <p className="font-semibold text-brand-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-terracotta-500" />
                    How can I help you find the perfect piece today?
                  </p>
                  <p className="text-xs text-charcoal-500">
                    Tell me your budget, recipient, color preference, or occasion. I search our real workshop inventory live!
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-charcoal-500">
                    Try Asking:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {samplePrompts.map((sp) => (
                      <button
                        key={sp}
                        onClick={() => {
                          setPrompt(sp);
                        }}
                        className="text-left p-3 bg-white hover:bg-brand-50 border border-cream-300 hover:border-brand-300 rounded-xl text-xs text-charcoal-800 transition-colors"
                      >
                        "{sp}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="p-8 text-center space-y-3">
                <div className="inline-block p-3 bg-brand-100 rounded-full animate-bounce">
                  <Sparkles className="w-6 h-6 text-brand-800" />
                </div>
                <p className="text-sm font-serif text-charcoal-800">Searching workshop database...</p>
              </div>
            )}

            {response && (
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl border border-brand-200 text-sm text-charcoal-800 space-y-2 shadow-soft">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-800 uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-terracotta-500" /> AI Concierge Recommendation
                  </div>
                  <p className="text-sm leading-relaxed">{response.aiCommentary}</p>
                </div>

                {response.recommendations?.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-xs uppercase tracking-wider font-semibold text-charcoal-500">
                      Curated Workshop Matches:
                    </span>
                    <div className="space-y-3">
                      {response.recommendations.map((prod: any) => (
                        <div
                          key={prod.id}
                          className="p-3 bg-white rounded-xl border border-cream-300 flex items-center gap-3 hover:border-brand-400 transition-all shadow-xs"
                        >
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-cream-200 shrink-0">
                            <Image src={prod.thumbnail} alt={prod.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-charcoal-900 truncate">
                              {prod.name}
                            </h4>
                            <p className="text-xs text-charcoal-500 line-clamp-1">{prod.shortDescription}</p>
                            <p className="text-xs font-bold text-brand-800 mt-1">₹{prod.price}</p>
                          </div>
                          <Link
                            href={`/product/${prod.slug}`}
                            onClick={onClose}
                            className="p-2 text-brand-800 hover:bg-brand-100 rounded-lg transition-colors"
                          >
                            <ArrowRight className="w-5 h-5" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Footer */}
          <form onSubmit={handleAskAI} className="p-4 bg-white border-t border-cream-300 flex gap-2">
            <input
              type="text"
              placeholder="Ask AI... e.g. Black keychain under ₹300"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-sm outline-none focus:border-brand-600 text-charcoal-900"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl text-sm font-semibold flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
