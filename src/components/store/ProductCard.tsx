'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Star, ShoppingBag, MessageCircle, Heart } from 'lucide-react';
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';
import { generateProductWhatsAppUrl } from '@/lib/whatsapp';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku?: string;
    shortDescription: string;
    price: number;
    originalPrice: number;
    discount: number;
    thumbnail: string;
    bestseller?: boolean;
    trending?: boolean;
    giftPick?: boolean;
    customizable?: boolean;
    rating?: number;
    reviewCount?: number;
    salesCount?: number;
    stock: number;
    variants?: Array<{
      id?: string;
      name: string;
      colorHex?: string | null;
      imageUrl?: string | null;
      priceAdjust?: number;
    }>;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleWishlist, isLiked } = useWishlist();
  const [currentImage, setCurrentImage] = React.useState(product.thumbnail);
  const [selectedColorName, setSelectedColorName] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCurrentImage(product.thumbnail);
  }, [product.thumbnail]);

  const liked = isLiked(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: selectedColorName ? `${product.name} (${selectedColorName})` : product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      thumbnail: currentImage,
      quantity: 1,
    });
  };

  const [waNumber, setWaNumber] = React.useState('919876543210');

  React.useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.whatsappNumber) setWaNumber(data.whatsappNumber);
      })
      .catch(() => {});
  }, []);

  const handleWhatsAppQuickOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = generateProductWhatsAppUrl(waNumber, {
      productName: selectedColorName ? `${product.name} (${selectedColorName})` : product.name,
      sku: product.sku || product.id,
      quantity: 1,
      price: product.price,
    });
    window.open(url, '_blank');
  };

  const getBadge = () => {
    if (product.bestseller) return { label: 'Bestseller', bg: 'bg-terracotta-500 text-white' };
    if (product.trending) return { label: 'Trending', bg: 'bg-brand-700 text-white' };
    if (product.giftPick) return { label: 'Gift Pick', bg: 'bg-amber-700 text-white' };
    return null;
  };

  const badge = getBadge();

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden border border-cream-300 shadow-soft hover:shadow-float transition-all duration-300 flex flex-col h-full">
      {/* Product Image Area */}
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/3] min-h-[220px] w-full overflow-hidden bg-cream-200 block">
        {currentImage ? (
          <img
            src={currentImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-charcoal-400 font-serif italic text-xs">
            Romi & Knot Handcraft
          </div>
        )}

        {/* Top Badges & Heart Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {badge && (
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase shadow-xs ${badge.bg}`}
              >
                {badge.label}
              </span>
            )}
            {product.customizable && (
              <span className="bg-cream-100/90 backdrop-blur-md text-terracotta-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-cream-300">
                <Sparkles className="w-3 h-3" /> Custom
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleWishlistToggle}
            className="pointer-events-auto w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-cream-300 flex items-center justify-center text-charcoal-700 hover:text-red-500 hover:bg-white shadow-xs transition-all active:scale-95"
            title={liked ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </Link>

      {/* Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Swatch dots if product has multi-color variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex items-center justify-between gap-1 pb-1">
              <div className="flex items-center gap-1.5 overflow-hidden">
                {product.variants.slice(0, 5).map((v) => {
                  const isSelected = (selectedColorName || product.variants![0].name) === v.name;
                  return (
                    <button
                      key={v.name}
                      type="button"
                      title={`${v.name}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (v.imageUrl) setCurrentImage(v.imageUrl);
                        setSelectedColorName(v.name);
                      }}
                      className={`relative w-5 h-5 rounded-full border border-black/20 shrink-0 transition-transform ${
                        isSelected ? 'ring-2 ring-brand-800 scale-110 shadow-xs' : 'hover:scale-105 opacity-80'
                      }`}
                      style={{ backgroundColor: v.colorHex || '#7E22CE' }}
                    >
                      {v.imageUrl && (
                        <img src={v.imageUrl} alt={v.name} className="w-full h-full rounded-full object-cover" />
                      )}
                    </button>
                  );
                })}
                {product.variants.length > 5 && (
                  <span className="text-[10px] font-semibold text-charcoal-500">
                    +{product.variants.length - 5} colors
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold text-brand-800 truncate max-w-[100px]">
                {selectedColorName || `${product.variants.length} colors`}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-charcoal-500">
            {Boolean(product.reviewCount && product.reviewCount > 0 && product.rating && product.rating > 0) && (
              <div className="flex items-center gap-1 font-semibold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{product.rating!.toFixed(1)}</span>
                <span className="text-charcoal-400 font-normal">({product.reviewCount})</span>
              </div>
            )}
            {product.salesCount && product.salesCount > 0 ? (
              <span className="text-[11px] font-medium text-brand-700">{product.salesCount}+ bought</span>
            ) : null}
          </div>

          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="text-base font-serif font-semibold text-charcoal-900 group-hover:text-brand-800 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-charcoal-500 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-cream-200 space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-charcoal-900">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-charcoal-400 line-through">₹{product.originalPrice}</span>
              )}
            </div>
            {product.discount > 0 && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {product.discount}% OFF
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleWhatsAppQuickOrder}
              className="py-2 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
              title="Quick WhatsApp Order"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </button>

            {product.customizable ? (
              <Link
                href={`/product/${product.slug}`}
                className="py-2 px-2 bg-cream-200 hover:bg-brand-100 text-brand-900 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-all border border-cream-300"
              >
                <Sparkles className="w-3 h-3 text-terracotta-500" />
                <span>Customize</span>
              </Link>
            ) : (
              <button
                onClick={handleQuickAdd}
                className="py-2 px-2 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
