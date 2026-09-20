'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/store/CartContext';
import { useWishlist } from '@/components/store/WishlistContext';
import { generateProductWhatsAppUrl } from '@/lib/whatsapp';
import Product3DViewer from '@/components/three/Product3DViewer';
import {
  Sparkles,
  ShoppingBag,
  MessageCircle,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  Eye,
  Box,
  Check,
  Palette,
  Upload,
  Heart,
} from 'lucide-react';

interface ProductVariantItem {
  id?: string;
  name: string;
  colorHex?: string | null;
  imageUrl?: string | null;
  priceAdjust: number;
}

interface ProductCustomizerProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    originalPrice: number;
    discount: number;
    shortDescription: string;
    description: string;
    material?: string | null;
    dimensions?: string | null;
    color?: string | null;
    stock: number;
    thumbnail: string;
    images: Array<{ url: string; altText?: string | null }>;
    variants?: ProductVariantItem[];
    customizationOpts: Array<{
      id: string;
      label: string;
      type: string;
      placeholder?: string | null;
      optionsJson?: string | null;
      additionalFee: number;
      required: boolean;
    }>;
    asset3d?: { url: string } | null;
  };
  whatsappNumber: string;
}

export default function ProductCustomizer({ product, whatsappNumber }: ProductCustomizerProps) {
  const router = useRouter();
  const { addItem, setIsOpen: setIsCartOpen } = useCart();
  const { toggleWishlist, isLiked } = useWishlist();
  const liked = isLiked(product.id);

  const [selectedImage, setSelectedImage] = useState(product.thumbnail);
  const [userUploadedPhotoUrl, setUserUploadedPhotoUrl] = useState<string | null>(null);
  const [uploadingUserPhoto, setUploadingUserPhoto] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantItem | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [activeTab, setActiveTab] = useState<'gallery' | '3d'>('gallery');
  const [quantity, setQuantity] = useState(1);
  const [customizationInputs, setCustomizationInputs] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState('');

  let additionalFees = selectedVariant ? selectedVariant.priceAdjust : 0;
  product.customizationOpts.forEach((opt) => {
    if (customizationInputs[opt.label] && opt.additionalFee > 0) {
      additionalFees += opt.additionalFee;
    }
  });

  const unitPrice = product.price + additionalFees;
  const totalPrice = unitPrice * quantity;

  const handleVariantSelect = (variant: ProductVariantItem) => {
    setSelectedVariant(variant);
    if (variant.imageUrl) {
      setSelectedImage(variant.imageUrl);
      setActiveTab('gallery');
    }
    setCustomizationInputs((prev) => ({ ...prev, 'Selected Color': variant.name }));
  };

  const handleCustomerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, label: string) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadingUserPhoto(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUserUploadedPhotoUrl(dataUrl);
      setSelectedImage(dataUrl);
      setCustomizationInputs((prev) => ({ ...prev, [label]: `Uploaded Photo: ${file.name}` }));
      setUploadingUserPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (label: string, value: string) => {
    setCustomizationInputs((prev) => ({ ...prev, [label]: value }));
    setValidationError('');
  };

  const validateCustomizations = (): boolean => {
    for (const opt of product.customizationOpts) {
      if (opt.required && !customizationInputs[opt.label]?.trim()) {
        setValidationError(`Please fill in required field: "${opt.label}"`);
        return false;
      }
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateCustomizations()) return;

    addItem({
      productId: product.id,
      name: `${product.name} ${selectedVariant ? `(${selectedVariant.name})` : ''}`,
      price: product.price,
      originalPrice: product.originalPrice,
      thumbnail: userUploadedPhotoUrl || selectedImage,
      quantity,
      customizationDetails: customizationInputs,
      customizationFee: additionalFees,
    });
    setIsCartOpen(true);
  };

  const handleDirectBuy = () => {
    if (!validateCustomizations()) return;

    addItem({
      productId: product.id,
      name: `${product.name} ${selectedVariant ? `(${selectedVariant.name})` : ''}`,
      price: product.price,
      originalPrice: product.originalPrice,
      thumbnail: userUploadedPhotoUrl || selectedImage,
      quantity,
      customizationDetails: customizationInputs,
      customizationFee: additionalFees,
    });
    router.push('/checkout');
  };

  const handleWhatsAppOrder = () => {
    if (!validateCustomizations()) return;

    const whatsappUrl = generateProductWhatsAppUrl(whatsappNumber, {
      productName: `${product.name} ${selectedVariant ? `(${selectedVariant.name})` : ''}`,
      sku: product.sku,
      quantity,
      price: unitPrice,
      customizationDetails: customizationInputs,
    });
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* Left Media Column */}
      <div className="lg:col-span-7 space-y-4">
        {product.asset3d && (
          <div className="flex items-center gap-2 p-1 bg-cream-200 rounded-2xl w-fit border border-cream-300">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'gallery' ? 'bg-white text-charcoal-900 shadow-xs' : 'text-charcoal-600'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-brand-700" /> Photo View
            </button>
            <button
              onClick={() => setActiveTab('3d')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === '3d' ? 'bg-brand-800 text-cream-100 shadow-xs' : 'text-charcoal-600'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-terracotta-400" /> 3D Model
            </button>
          </div>
        )}

        {/* Main Display Container */}
        {activeTab === '3d' && product.asset3d ? (
          <Product3DViewer
            modelUrl={product.asset3d.url}
            fallbackImage={selectedImage}
            productName={product.name}
          />
        ) : (
          <div className="relative aspect-[4/3] min-h-[300px] sm:aspect-square w-full rounded-3xl overflow-hidden bg-cream-200 border border-cream-300 shadow-soft">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              className="object-cover transition-transform duration-500"
            />

            {/* Custom text preview overlay */}
            {(customizationInputs['His & Her Initials / Names'] ||
              customizationInputs['Name for Inscription'] ||
              customizationInputs['Initial Alphabet (A-Z)']) && (
              <div className="absolute bottom-4 left-4 right-4 bg-cream-100/90 backdrop-blur-md p-3 rounded-2xl border border-cream-300 shadow-lg text-center animate-fade-in">
                <span className="text-[10px] uppercase tracking-widest font-bold text-terracotta-600 block">
                  Live Custom Preview
                </span>
                <span className="text-lg font-serif font-bold text-charcoal-900 tracking-wider italic">
                  "{customizationInputs['His & Her Initials / Names'] ||
                    customizationInputs['Name for Inscription'] ||
                    customizationInputs['Initial Alphabet (A-Z)']}"
                </span>
              </div>
            )}
          </div>
        )}

        {/* Thumbnail Strip */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {product.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedImage(img.url);
                setActiveTab('gallery');
              }}
              className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                selectedImage === img.url && activeTab === 'gallery'
                  ? 'border-brand-700 shadow-md scale-105'
                  : 'border-cream-300 opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={img.url} alt={img.altText || product.name} fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Right Customizer & Buying Column */}
      <div className="lg:col-span-5 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-terracotta-600 uppercase tracking-widest">
            <span>Handcrafted Studio</span>
            <span>•</span>
            <span>SKU: {product.sku}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-charcoal-900 mt-1">
            {product.name}
          </h1>

          <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">{product.shortDescription}</p>
        </div>

        {/* Device Photo Upload Box for Photo Products */}
        {(product.slug.includes('photo') || product.name.toLowerCase().includes('photo')) && (
          <div className="p-5 bg-cream-200/90 rounded-2xl border-2 border-dashed border-brand-300 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-charcoal-900">
              <span className="flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-brand-700" /> Upload Your Photo from Phone / Laptop
              </span>
            </div>

            <div className="text-center space-y-2">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleCustomerPhotoUpload(e, 'Uploaded Customer Photo')}
                className="hidden"
                id="customer-photo-upload"
              />
              <label
                htmlFor="customer-photo-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl text-xs font-semibold shadow-xs"
              >
                <span>{uploadingUserPhoto ? 'Processing Photo...' : '📷 Select Photo from Device'}</span>
              </label>
              <p className="text-[11px] text-charcoal-500">
                Choose any photograph from your phone camera, gallery, or disk.
              </p>
            </div>
          </div>
        )}

        {/* Color Swatch Variants Selector (Myntra / Flipkart Style) */}
        {product.variants && product.variants.length > 0 && (
          <div className="p-4 bg-white rounded-2xl border-2 border-brand-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-charcoal-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Palette className="w-4 h-4 text-terracotta-600" /> Select Color Variant:
              </span>
              {selectedVariant && (
                <span className="font-bold text-brand-900 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200">
                  {selectedVariant.name}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.name === v.name;
                return (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => handleVariantSelect(v)}
                    className={`group relative flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl text-xs font-semibold border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-800 bg-brand-50 text-brand-900 shadow-md scale-105'
                        : 'border-cream-300 bg-cream-50 text-charcoal-700 hover:border-brand-400 hover:bg-white'
                    }`}
                  >
                    {/* Image Swatch OR Color Hex Swatch */}
                    {v.imageUrl ? (
                      <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-black/10 shrink-0 shadow-xs">
                        <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span
                        className="w-7 h-7 rounded-full border border-black/20 shrink-0 shadow-xs flex items-center justify-center"
                        style={{ backgroundColor: v.colorHex || '#7E22CE' }}
                      />
                    )}

                    <div className="text-left">
                      <span className="block text-xs font-bold leading-tight">{v.name}</span>
                      {v.priceAdjust > 0 && (
                        <span className="text-[10px] text-terracotta-600 font-semibold block">
                          +₹{v.priceAdjust}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-brand-800 text-cream-100 flex items-center justify-center shrink-0 ml-1">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Price Display */}
        <div className="p-4 bg-white rounded-2xl border border-cream-300 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-charcoal-900">₹{unitPrice}</span>
              {product.originalPrice > unitPrice && (
                <span className="text-sm text-charcoal-400 line-through">₹{product.originalPrice}</span>
              )}
            </div>
            {additionalFees > 0 && (
              <span className="text-[11px] text-terracotta-600 font-semibold">
                Includes +₹{additionalFees} customization fee
              </span>
            )}
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              In Stock ({product.stock} left)
            </span>
          </div>
        </div>

        {/* Customization Options Form */}
        {product.customizationOpts.length > 0 && (
          <div className="p-5 bg-cream-200/70 rounded-2xl border border-cream-300 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal-800">
              <Sparkles className="w-4 h-4 text-terracotta-500" />
              <span>Personalization Options</span>
            </div>

            {product.customizationOpts.map((opt) => {
              const options = opt.optionsJson ? JSON.parse(opt.optionsJson) : [];

              return (
                <div key={opt.id} className="space-y-1.5">
                  <label className="block text-xs font-semibold text-charcoal-800">
                    {opt.label} {opt.required && <span className="text-terracotta-600">*</span>}
                    {opt.additionalFee > 0 && (
                      <span className="text-[11px] font-normal text-terracotta-600 ml-1">
                        (+₹{opt.additionalFee})
                      </span>
                    )}
                  </label>

                  {opt.type === 'text' && (
                    <input
                      type="text"
                      placeholder={opt.placeholder || 'Type custom text...'}
                      value={customizationInputs[opt.label] || ''}
                      onChange={(e) => handleInputChange(opt.label, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
                    />
                  )}

                  {opt.type === 'select' && (
                    <select
                      value={customizationInputs[opt.label] || ''}
                      onChange={(e) => handleInputChange(opt.label, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
                    >
                      <option value="">-- Choose Option --</option>
                      {options.map((o: string) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}

            {validationError && (
              <p className="text-xs text-red-600 font-semibold animate-shake">{validationError}</p>
            )}
          </div>
        )}

        {/* Quantity Selector */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-charcoal-800">Quantity:</span>
          <div className="flex items-center border border-cream-300 rounded-xl bg-white p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1.5 text-charcoal-600 hover:text-charcoal-900 rounded-lg"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 text-sm font-bold text-charcoal-900">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="p-1.5 text-charcoal-600 hover:text-charcoal-900 rounded-lg"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* High-Priority WhatsApp Order & Purchase Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleWhatsAppOrder}
            className="w-full py-4 px-6 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-float transition-all"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Order Directly via WhatsApp (Instant Confirmation)</span>
          </button>

          <div className="grid grid-cols-12 gap-3">
            <button
              onClick={handleAddToCart}
              className="col-span-5 py-3.5 px-3 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleDirectBuy}
              className="col-span-5 py-3.5 px-3 bg-terracotta-600 hover:bg-terracotta-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <span>Pay via UPI</span>
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className="col-span-2 py-3.5 bg-white hover:bg-cream-50 border border-cream-300 text-charcoal-700 rounded-xl font-semibold text-xs flex items-center justify-center shadow-xs transition-all"
              title={liked ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Guarantee Badges */}
        <div className="p-4 bg-white rounded-2xl border border-cream-300 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF0ED] text-[#B85C42] flex items-center justify-center shrink-0 border border-rose-100/50">
              <Heart className="w-5 h-5 stroke-[1.75] fill-[#B85C42]/15" />
            </div>
            <div>
              <h4 className="text-xs font-serif font-bold text-charcoal-900 leading-tight">100% Handmade</h4>
              <p className="text-[11px] text-charcoal-500 font-sans mt-0.5">Made with hand with love</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEFAEC] text-[#8C6B1B] flex items-center justify-center shrink-0 border border-amber-100/50">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h4 className="text-xs font-serif font-bold text-charcoal-900 leading-tight">UPI Verified</h4>
              <p className="text-[11px] text-charcoal-500 font-sans mt-0.5">Secure manual checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
