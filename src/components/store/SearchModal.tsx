'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, Tag, Sparkles, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
        }
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-950/50 backdrop-blur-xs p-4 sm:p-6 md:p-20">
      <div className="max-w-2xl mx-auto bg-cream-100 rounded-3xl shadow-2xl overflow-hidden border border-cream-300">
        
        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 bg-white border-b border-cream-300 flex items-center gap-3">
          <Search className="w-6 h-6 text-brand-700 shrink-0" />
          <input
            type="text"
            placeholder="Search keychains, floral resin, custom gifts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-base sm:text-lg bg-transparent border-none outline-none text-charcoal-900 placeholder:text-charcoal-400 font-sans"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-2 text-charcoal-400 hover:text-charcoal-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tag Recommendations */}
        {!query && (
          <div className="p-6 space-y-4">
            <div className="text-xs uppercase tracking-wider font-semibold text-charcoal-500">
              Popular Searches
            </div>
            <div className="flex flex-wrap gap-2">
              {['Couple Keychain', 'Floral Name Bar', 'Resin Letters', 'Gift Hampers', 'Custom Plaque', 'Desk Decor'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3.5 py-1.5 bg-cream-200 hover:bg-brand-100 text-charcoal-800 hover:text-brand-900 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Tag className="w-3 h-3 text-terracotta-500" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        {loading && (
          <div className="p-12 text-center text-sm text-charcoal-500">
            Searching workshop catalog...
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="p-12 text-center space-y-2">
            <p className="text-base font-serif text-charcoal-800">No products found for "{query}"</p>
            <p className="text-xs text-charcoal-500">Try searching for keychains, hampers, resin, or photo gifts.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="max-h-96 overflow-y-auto p-4 divide-y divide-cream-200">
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="py-3 px-4 flex items-center gap-4 rounded-xl hover:bg-cream-200/60 transition-colors group"
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-cream-200 shrink-0">
                  <Image
                    src={product.thumbnail}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-charcoal-900 group-hover:text-brand-700 transition-colors truncate">
                    {product.name}
                  </h4>
                  <p className="text-xs text-charcoal-500 line-clamp-1">{product.shortDescription}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-brand-800">₹{product.price}</span>
                    {product.customizable && (
                      <span className="text-[10px] bg-terracotta-100 text-terracotta-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Customizable
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-brand-800 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
