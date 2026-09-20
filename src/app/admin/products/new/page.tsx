'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Sparkles,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Palette,
  Check,
} from 'lucide-react';

interface VariantFormItem {
  name: string;
  colorHex: string;
  imageUrl: string;
  priceAdjust: string;
  uploading?: boolean;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    originalPrice: '',
    stock: '15',
    thumbnail: '',
    shortDescription: '',
    description: '',
    material: 'Resin & Teak Wood',
    dimensions: '5cm x 4cm',
    weight: '35 grams',
    careInstructions: 'Hand wash gently with lukewarm water if yarn craft. Wipe resin pieces with soft dry cloth.',
    color: 'Amber Gold',
    customizable: true,
    bestseller: false,
    trending: true,
    giftPick: true,
  });

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
          setFormData((prev) => ({ ...prev, categoryId: data.categories[0].id }));
        }
      })
      .catch((e) => console.error('Failed to load categories', e));
  }, []);

  const [variants, setVariants] = useState<VariantFormItem[]>([
    {
      name: 'Royal Velvet Purple',
      colorHex: '#7E22CE',
      imageUrl: '',
      priceAdjust: '0',
    },
  ]);

  const [customizations, setCustomizations] = useState<
    Array<{ label: string; type: string; required: boolean; additionalFee: string }>
  >([{ label: 'His & Her Initials / Names', type: 'text', required: true, additionalFee: '0' }]);

  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  // Upload main thumbnail image from device
  const handleMainDeviceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }

    setUploadingMainImage(true);
    setError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');

      setFormData((prev) => ({ ...prev, thumbnail: data.imageUrl }));
    } catch (err: any) {
      setError(err.message || 'Error uploading file from device.');
    } finally {
      setUploadingMainImage(false);
    }
  };

  // Upload variant image from device for a specific color option
  const handleVariantImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    variantIdx: number
  ) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (file.size > 10 * 1024 * 1024) {
      setError('Variant file size must be under 10MB.');
      return;
    }

    const updatedVariants = [...variants];
    updatedVariants[variantIdx].uploading = true;
    setVariants(updatedVariants);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload variant image');

      const doneVariants = [...variants];
      doneVariants[variantIdx].imageUrl = data.imageUrl;
      doneVariants[variantIdx].uploading = false;
      setVariants(doneVariants);
    } catch (err: any) {
      setError(err.message || 'Error uploading variant image.');
      const doneVariants = [...variants];
      doneVariants[variantIdx].uploading = false;
      setVariants(doneVariants);
    }
  };

  const COLOR_PRESETS = [
    { name: 'Royal Purple', hex: '#7E22CE', emoji: '🟣' },
    { name: 'Pastel Pink', hex: '#F472B6', emoji: '🌸' },
    { name: 'Mint Green', hex: '#10B981', emoji: '🌿' },
    { name: 'Ocean Blue', hex: '#3B82F6', emoji: '🌊' },
    { name: 'Amber Gold', hex: '#F59E0B', emoji: '✨' },
    { name: 'Crimson Red', hex: '#EF4444', emoji: '🔴' },
    { name: 'Cream Peach', hex: '#FFEDD5', emoji: '🍑' },
    { name: 'Midnight Black', hex: '#1F2937', emoji: '🖤' },
    { name: 'Lavender', hex: '#A855F7', emoji: '🪻' },
    { name: 'Pure White', hex: '#FFFFFF', emoji: '🤍' },
  ];

  const addPresetVariant = (preset: { name: string; hex: string }) => {
    setVariants((prev) => [
      ...prev,
      {
        name: preset.name,
        colorHex: preset.hex,
        imageUrl: '',
        priceAdjust: '0',
      },
    ]);
  };

  const addVariantField = () => {
    setVariants([
      ...variants,
      { name: 'Sunshine Orange', colorHex: '#FF6B00', imageUrl: '', priceAdjust: '0' },
    ]);
  };

  const removeVariantField = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleGenerateAIDescription = async () => {
    if (!formData.name) {
      alert('Please enter a Product Name first.');
      return;
    }

    setAiGenerating(true);
    try {
      const res = await fetch('/api/ai/product-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, category: 'Handmade Craft' }),
      });
      const data = await res.json();
      if (data.description) {
        setFormData((prev) => ({
          ...prev,
          shortDescription: data.description,
          description: `${data.description} Handcrafted with love in small studio batches.`,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiGenerating(false);
    }
  };

  const addCustomizationField = () => {
    setCustomizations([
      ...customizations,
      { label: '', type: 'text', required: false, additionalFee: '0' },
    ]);
  };

  const removeCustomizationField = (idx: number) => {
    setCustomizations(customizations.filter((_, i) => i !== idx));
  };

  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploadingGalleryImages, setUploadingGalleryImages] = useState(false);

  // Upload multiple additional gallery photos from device
  const handleGalleryDeviceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setUploadingGalleryImages(true);
    setError('');

    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) continue;
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const data = await res.json();
        if (res.ok && data.imageUrl) {
          uploadedUrls.push(data.imageUrl);
        }
      }
      setGalleryImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setError('Error uploading additional gallery photos.');
    } finally {
      setUploadingGalleryImages(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/admin/products/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          categoryId: formData.categoryId || 'c838e1b1-seed-keychains',
          variants,
          customizations,
          galleryImages,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Error saving product');
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-4xl w-full mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-xl border border-cream-300">
          <ArrowLeft className="w-4 h-4 text-charcoal-700" />
        </button>
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
            Catalog Wizard
          </span>
          <h1 className="text-2xl font-serif text-charcoal-900">Add New Handmade Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        {/* Product Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-8">
            <label className="block text-xs font-semibold text-charcoal-800 mb-1">Product Title *</label>
            <input
              type="text"
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Handmade Crochet Scrunchie / Resin Bar"
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-charcoal-800 mb-1">Category *</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900 font-medium cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Photos Upload - Cover Photo & Additional Gallery Photos */}
        <div className="space-y-4 p-6 bg-cream-100/70 rounded-2xl border border-cream-300">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-900 block">
              📷 Product Photos (Upload from Phone Camera / Gallery / Laptop) *
            </span>
            <p className="text-[11px] text-charcoal-500 mt-0.5">
              Upload main cover photo first, then tap <strong className="text-brand-900">+ Add More Photos</strong> to upload different angle photos, closeups, and packaging shots!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {/* Main Cover Photo Tile */}
            {formData.thumbnail ? (
              <div className="relative w-36 h-36 rounded-2xl overflow-hidden bg-white border-2 border-brand-500 shadow-md group">
                <img
                  src={formData.thumbnail}
                  alt="Main Product Photo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-charcoal-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, thumbnail: '' }))}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <span className="absolute bottom-1.5 left-1.5 bg-brand-800 text-cream-100 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                  Main Cover
                </span>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleMainDeviceImageUpload}
                  className="hidden"
                  id="product-image-file-upload"
                />
                <label
                  htmlFor="product-image-file-upload"
                  className="w-36 h-36 rounded-2xl border-2 border-dashed border-brand-500 hover:border-brand-700 bg-white hover:bg-brand-50/50 cursor-pointer flex flex-col items-center justify-center text-center p-3 transition-all group shadow-xs"
                >
                  {uploadingMainImage ? (
                    <div className="flex flex-col items-center gap-2 text-brand-800">
                      <div className="w-7 h-7 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-11 h-11 rounded-full bg-brand-100 group-hover:bg-brand-200 text-brand-800 flex items-center justify-center mb-2 transition-colors shadow-xs">
                        <Plus className="w-7 h-7 stroke-[2.5]" />
                      </div>
                      <span className="text-xs font-bold text-charcoal-900 group-hover:text-brand-900">
                        + Cover Photo
                      </span>
                      <span className="text-[10px] text-charcoal-500 mt-0.5">Phone / Laptop</span>
                    </>
                  )}
                </label>
              </div>
            )}

            {/* Additional Gallery Photos Tiles */}
            {galleryImages.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative w-36 h-36 rounded-2xl overflow-hidden bg-white border border-cream-300 shadow-xs group"
              >
                <img src={imgUrl} alt={`Product Angle ${idx + 2}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-charcoal-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <span className="absolute bottom-1.5 left-1.5 bg-charcoal-800 text-cream-100 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                  Photo #{idx + 2}
                </span>
              </div>
            ))}

            {/* Tile for Adding More Product Photos */}
            <div className="relative">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleGalleryDeviceImageUpload}
                className="hidden"
                id="product-gallery-file-upload"
              />
              <label
                htmlFor="product-gallery-file-upload"
                className="w-36 h-36 rounded-2xl border-2 border-dashed border-cream-400 hover:border-brand-600 bg-white hover:bg-cream-50 cursor-pointer flex flex-col items-center justify-center text-center p-3 transition-all group shadow-xs"
              >
                {uploadingGalleryImages ? (
                  <div className="flex flex-col items-center gap-2 text-brand-800">
                    <div className="w-7 h-7 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-cream-200 group-hover:bg-brand-100 text-charcoal-800 group-hover:text-brand-900 flex items-center justify-center mb-1.5 transition-colors">
                      <Plus className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-bold text-charcoal-900 group-hover:text-brand-900">
                      + Add More Photos
                    </span>
                    <span className="text-[10px] text-charcoal-500 mt-0.5">Different Angles</span>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Color & Style Variants Builder with Quick Presets & Upload Tile per Variant */}
        <div className="p-5 bg-white rounded-2xl border-2 border-brand-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-terracotta-600" /> Multi-Color Variants (Myntra / Flipkart Style)
              </span>
              <p className="text-[11px] text-charcoal-500 mt-0.5">
                Add color swatches & upload matching product photos so shoppers can pick colors directly!
              </p>
            </div>
            <button
              type="button"
              onClick={addVariantField}
              className="px-3.5 py-1.5 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-terracotta-600" /> Custom Color
            </button>
          </div>

          {/* Quick Color Preset Pills */}
          <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-700 block">
              ⚡ Quick Add Color Swatches:
            </span>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => addPresetVariant(preset)}
                  className="px-2.5 py-1 bg-white hover:bg-brand-50 border border-cream-300 rounded-lg text-xs font-medium text-charcoal-800 flex items-center gap-1.5 transition-all shadow-xs hover:border-brand-400"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: preset.hex }}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {variants.map((v, idx) => (
              <div
                key={idx}
                className="p-4 bg-cream-50 rounded-2xl border border-cream-300 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  {/* Variant Image Preview & Device Upload Button */}
                  <div className="sm:col-span-5 flex items-center gap-3">
                    <div className="relative shrink-0">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleVariantImageUpload(e, idx)}
                        className="hidden"
                        id={`variant-upload-${idx}`}
                      />
                      {v.imageUrl ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border-2 border-brand-500 group shadow-xs">
                          <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover" />
                          <label
                            htmlFor={`variant-upload-${idx}`}
                            className="absolute inset-0 bg-charcoal-950/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity flex items-center justify-center text-white text-[10px] font-bold"
                            title="Change Photo"
                          >
                            Change
                          </label>
                        </div>
                      ) : (
                        <label
                          htmlFor={`variant-upload-${idx}`}
                          className="w-16 h-16 rounded-xl border-2 border-dashed border-brand-400 hover:border-brand-700 bg-white hover:bg-brand-50 cursor-pointer flex flex-col items-center justify-center transition-all text-brand-800 shadow-xs"
                          title="Upload Variant Photo"
                        >
                          {v.uploading ? (
                            <div className="w-4 h-4 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-5 h-5 stroke-[2.5]" />
                              <span className="text-[9px] font-bold mt-0.5">+ Photo</span>
                            </>
                          )}
                        </label>
                      )}
                    </div>

                    <div className="text-xs">
                      <span className="font-semibold text-charcoal-900 block">
                        {v.imageUrl ? 'Photo Attached ✅' : 'No Color Photo Yet'}
                      </span>
                      <label
                        htmlFor={`variant-upload-${idx}`}
                        className="cursor-pointer text-[11px] font-bold text-brand-800 hover:underline inline-block mt-0.5"
                      >
                        {v.imageUrl ? '📷 Change Photo' : '📷 Upload Photo from Device'}
                      </label>
                    </div>
                  </div>

                  {/* Variant Name & Swatch Hex */}
                  <div className="sm:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-charcoal-600 mb-0.5">Color Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Royal Purple"
                        value={v.name}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].name = e.target.value;
                          setVariants(updated);
                        }}
                        className="w-full px-3 py-2 bg-white border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-charcoal-600 mb-0.5">Color Swatch Hex</label>
                      <div className="flex items-center gap-2 bg-white border border-cream-300 p-1.5 rounded-xl">
                        <input
                          type="color"
                          value={v.colorHex || '#7E22CE'}
                          onChange={(e) => {
                            const updated = [...variants];
                            updated[idx].colorHex = e.target.value;
                            setVariants(updated);
                          }}
                          className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0"
                          title="Pick Color Swatch Hex"
                        />
                        <span className="text-[11px] font-mono font-semibold text-charcoal-700">{v.colorHex || '#7E22CE'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Variant Button */}
                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => removeVariantField(idx)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Color Option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-800 mb-1">Price (₹) *</label>
            <input
              type="number"
              required
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="199"
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-800 mb-1">Original Price (₹)</label>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              placeholder="249"
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-800 mb-1">Initial Stock *</label>
            <input
              type="number"
              required
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
            />
          </div>
        </div>

        {/* AI Description Generator Button & Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-charcoal-800">Short Description</label>
            <button
              type="button"
              onClick={handleGenerateAIDescription}
              disabled={aiGenerating}
              className="px-3 py-1 bg-brand-100 text-brand-900 hover:bg-brand-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
              <span>{aiGenerating ? 'AI Writing Copy...' : 'Generate AI Copy'}</span>
            </button>
          </div>
          <textarea
            rows={2}
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="Short engaging tagline..."
            className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900 resize-none"
          />
        </div>

        {/* Handcrafted Details & Care Instructions Editor */}
        <div className="p-5 bg-white rounded-2xl border border-cream-300 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-charcoal-900 block border-b border-cream-200 pb-2">
            ✨ Handcrafted Specifications & Care Instructions (Shown on Storefront Product Page)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">Artisanal Material</label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                placeholder="e.g. Resin & Teak Wood"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">Dimensions & Size</label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                placeholder="e.g. 5cm x 4cm"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">Weight (e.g. 35 grams)</label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 35 grams"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900 font-medium"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">Care & Longevity Instructions</label>
              <textarea
                rows={2}
                name="careInstructions"
                value={formData.careInstructions}
                onChange={handleChange}
                placeholder="e.g. Hand wash gently with lukewarm water if yarn craft. Wipe resin pieces with soft dry cloth."
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>
          </div>
        </div>

        {/* Customization Fields Builder */}
        <div className="p-4 bg-cream-100/70 rounded-2xl border border-cream-300 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-800">
              Personalization Inputs Builder
            </span>
            <button
              type="button"
              onClick={addCustomizationField}
              className="px-3 py-1 bg-cream-200 hover:bg-cream-300 text-charcoal-800 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Field
            </button>
          </div>

          {customizations.map((c, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Field Label e.g. Custom Name"
                value={c.label}
                onChange={(e) => {
                  const updated = [...customizations];
                  updated[idx].label = e.target.value;
                  setCustomizations(updated);
                }}
                className="flex-1 px-3 py-2 bg-white border border-cream-300 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={() => removeCustomizationField(idx)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving || uploadingMainImage}
          className="w-full py-4 px-6 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-float"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Publishing Product...' : 'Publish Product to Storefront'}</span>
        </button>
      </form>
    </div>
  );
}
