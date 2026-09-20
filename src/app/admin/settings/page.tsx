'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, QrCode, Lock, HardDrive, Trash2, AlertTriangle, CheckCircle, Store, Mail, Phone, MapPin, Upload, Sparkles } from 'lucide-react';

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    announcementText: 'Handcrafted Crochet & Botanical Gifts — Free Delivery Over ₹999',
    announcementEnabled: true,
    upiId: 'knotandbloom@upi',
    upiDisplayName: 'Knot & Bloom Handmade',
    upiQrUrl: '',
    whatsappNumber: '919876543210',
    contactPhone: '+91 98765 43210',
    supportEmail: 'hello@knotandbloom.com',
    gmailAppPassword: '',
    studioAddress: 'Handmade Studio, India',
    footerTagline: 'Knot & Bloom creates handmade decoration items, custom resin keychains, personalized couple plaques, and artisan hampers.',
    deliveryFee: '49',
    freeDeliveryOver: '999',
    currentPassword: '',
    newPassword: '',
  });

  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Storage & Cleanup State
  const [storageStats, setStorageStats] = useState<any>(null);
  const [cleaningUp, setCleaningUp] = useState(false);
  const [cleanupMsg, setCleanupMsg] = useState('');

  const fetchStoreSettings = async () => {
    try {
      const res = await fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          announcementText: data.announcementText !== undefined ? data.announcementText : prev.announcementText,
          announcementEnabled: data.announcementEnabled !== undefined ? Boolean(data.announcementEnabled) : prev.announcementEnabled,
          upiId: data.upiId || prev.upiId,
          upiDisplayName: data.upiDisplayName || prev.upiDisplayName,
          upiQrUrl: data.upiQrUrl || prev.upiQrUrl,
          whatsappNumber: data.whatsappNumber || prev.whatsappNumber,
          contactPhone: data.contactPhone || prev.contactPhone,
          supportEmail: data.supportEmail || prev.supportEmail,
          studioAddress: data.studioAddress || prev.studioAddress,
          footerTagline: data.footerTagline || prev.footerTagline,
          deliveryFee: data.deliveryFee !== undefined ? String(data.deliveryFee) : prev.deliveryFee,
          freeDeliveryOver: data.freeDeliveryOver !== undefined ? String(data.freeDeliveryOver) : prev.freeDeliveryOver,
        }));
      }
    } catch (e) {
      console.error('Failed to fetch settings:', e);
    }
  };

  const fetchStorageStatus = async () => {
    try {
      const res = await fetch('/api/admin/cleanup');
      const data = await res.json();
      if (res.ok) {
        setStorageStats(data.stats);
      }
    } catch (e) {
      console.error('Failed to fetch storage stats:', e);
    }
  };

  useEffect(() => {
    fetchStoreSettings();
    fetchStorageStatus();
  }, []);

  const handleOneClickCleanup = async (clearOrders = false, clearCustomers = false) => {
    if (clearOrders || clearCustomers) {
      const target = clearOrders && clearCustomers ? 'Order History AND Customer Users' : clearOrders ? 'Order History' : 'Customer Users';
      if (!confirm(`⚠️ ARE YOU SURE? You are about to permanently delete all ${target} from database.`)) return;
    }

    setCleaningUp(true);
    setCleanupMsg('');
    try {
      const res = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearOrders, clearCustomers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cleanup failed');
      setCleanupMsg(data.message);
      fetchStorageStatus();
    } catch (err: any) {
      setCleanupMsg(`Error: ${err.message}`);
    } finally {
      setCleaningUp(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }

    setUploadingQr(true);
    setError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload QR Code image');

      setFormData((prev) => ({ ...prev, upiQrUrl: data.imageUrl }));
      setMsg('Official Merchant UPI QR Scanner uploaded successfully!');
    } catch (err: any) {
      setError(err.message || 'Error uploading QR Code image');
    } finally {
      setUploadingQr(false);
    }
  };

  const [savingSection, setSavingSection] = useState<string | null>(null);

  const saveSettings = async (sectionName?: string) => {
    setSaving(true);
    if (sectionName) setSavingSection(sectionName);
    setMsg('');
    setError('');

    try {
      const res = await fetch('/api/admin/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      setMsg(sectionName ? `✓ ${sectionName} saved & published live to storefront!` : 'Store settings, footer details, and security updated successfully!');
      setFormData((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('store-settings-updated'));
        localStorage.setItem('knot_bloom_settings_updated', String(Date.now()));
      }
      fetchStoreSettings();
    } catch (err: any) {
      setError(err.message || 'Error updating settings');
    } finally {
      setSaving(false);
      setSavingSection(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings();
  };

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-4xl w-full mx-auto">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-cream-300 shadow-soft flex-wrap gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600">
            System & Storage Manager
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-charcoal-900 mt-1">
            Store, Storage & Cloud Settings
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> System Hardened & Protected
          </span>
        </div>
      </div>

      {/* Cloud & Storage Health Monitor */}
      <div className="p-6 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-cream-200 pb-3">
          <h3 className="text-sm font-serif font-semibold text-charcoal-900 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-brand-700" /> Storage & Cloud Capacity Health
          </h3>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded-full flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> 100% Free Cloud Ready
          </span>
        </div>

        {cleanupMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{cleanupMsg}</span>
          </div>
        )}

        {storageStats?.requiresAlert && (
          <div className="p-4 bg-amber-50 text-amber-900 rounded-2xl text-xs border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Storage Capacity Alert to Admin</p>
              <p className="mt-0.5 text-amber-800">
                Storage volume has grown! You have {storageStats.expiredCarts} abandoned carts and {storageStats.uploadFilesCount} uploaded media files ({storageStats.uploadTotalMB}). Click <strong>"1-Click Remove Unwanted Data"</strong> above to instantly reclaim space.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div className="p-4 bg-cream-50 rounded-2xl border border-cream-300 text-center">
            <span className="block text-lg font-bold text-charcoal-900">{storageStats?.uploadTotalMB || '0 MB'}</span>
            <span className="text-[11px] font-medium text-charcoal-500">Local Uploads Size</span>
          </div>
          <div className="p-4 bg-cream-50 rounded-2xl border border-cream-300 text-center">
            <span className="block text-lg font-bold text-charcoal-900">{storageStats?.uploadFilesCount || 0}</span>
            <span className="text-[11px] font-medium text-charcoal-500">Stored Files</span>
          </div>
          <div className="p-4 bg-cream-50 rounded-2xl border border-cream-300 text-center">
            <span className="block text-lg font-bold text-amber-700">{storageStats?.expiredCarts || 0}</span>
            <span className="text-[11px] font-medium text-charcoal-500">Abandoned Carts</span>
          </div>
          <div className="p-4 bg-cream-50 rounded-2xl border border-cream-300 text-center">
            <span className="block text-lg font-bold text-brand-800">{storageStats?.totalCustomers || 0}</span>
            <span className="text-[11px] font-medium text-charcoal-500">Active Customers</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 bg-white rounded-3xl border border-cream-300 shadow-soft space-y-6">
        {msg && <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">{msg}</div>}
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200">{error}</div>}

        {/* Header Top Announcement Banner */}
        <div className="space-y-4 pb-6 border-b border-cream-200">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-cream-200">
            <h3 className="text-sm font-serif font-semibold text-charcoal-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" /> Header Top Announcement & Offer Banner
            </h3>
            <button
              type="button"
              onClick={() => saveSettings('Announcement Banner')}
              disabled={saving}
              className="py-2 px-4 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingSection === 'Announcement Banner' ? 'Saving...' : 'Save Announcement Banner'}</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-cream-50 rounded-2xl border border-cream-300">
              <div>
                <span className="text-xs font-bold text-charcoal-900 block">Show Announcement Banner</span>
                <span className="text-[11px] text-charcoal-500">Enable or disable the top offer/announcement bar on your website header.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.announcementEnabled}
                  onChange={(e) => setFormData((prev) => ({ ...prev, announcementEnabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-cream-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-cream-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-800"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                Announcement Banner Text *
              </label>
              <input
                type="text"
                name="announcementText"
                value={formData.announcementText}
                onChange={handleChange}
                placeholder="Handcrafted Crochet & Botanical Gifts — Free Delivery Over ₹999"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900 font-medium"
              />
            </div>

            {/* Live Banner Preview */}
            <div className="p-3 bg-cream-100 rounded-2xl border border-cream-300 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500 block">Live Preview on Storefront Top Header:</span>
              {formData.announcementEnabled ? (
                <div className="bg-brand-900 text-cream-100 text-xs py-2 px-4 rounded-xl text-center tracking-wide flex items-center justify-center gap-2 shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-terracotta-300 animate-pulse" />
                  <span>{formData.announcementText || 'Your announcement message will appear here'}</span>
                  <Sparkles className="w-3.5 h-3.5 text-terracotta-300 animate-pulse hidden sm:inline-block" />
                </div>
              ) : (
                <div className="p-2 text-center text-xs italic text-charcoal-400 bg-white rounded-xl border border-cream-200">
                  Banner is currently disabled and hidden on storefront
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Storefront & Footer Details */}
        <div className="space-y-4 pb-6 border-b border-cream-200">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-cream-200">
            <h3 className="text-sm font-serif font-semibold text-charcoal-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-brand-700" /> Storefront Contact & Customizable Footer Details
            </h3>
            <button
              type="button"
              onClick={() => saveSettings('Footer & Contact Info')}
              disabled={saving}
              className="py-2 px-4 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingSection === 'Footer & Contact Info' ? 'Saving...' : 'Save Footer Details'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">Customer Support Phone *</label>
              <input
                type="text"
                required
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">Support Email Address *</label>
              <input
                type="email"
                required
                name="supportEmail"
                value={formData.supportEmail}
                onChange={handleChange}
                placeholder="hello@knotandbloom.com"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">Workshop / Studio Address *</label>
              <input
                type="text"
                required
                name="studioAddress"
                value={formData.studioAddress}
                onChange={handleChange}
                placeholder="Handmade Studio, India"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">Footer Tagline & Description *</label>
              <textarea
                required
                rows={2}
                name="footerTagline"
                value={formData.footerTagline}
                onChange={handleChange}
                placeholder="Handcrafted decoration items, custom keychains & keepsakes."
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>
          </div>
        </div>

        {/* Gmail OTP Email Dispatch Configuration */}
        <div className="space-y-4 pb-6 border-b border-cream-200 pt-2">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-cream-200">
            <h3 className="text-sm font-serif font-semibold text-charcoal-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-700" /> Gmail OTP & Customer Sign-in Email Service
            </h3>
            <button
              type="button"
              onClick={() => saveSettings('Gmail OTP Service')}
              disabled={saving}
              className="py-2 px-4 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingSection === 'Gmail OTP Service' ? 'Saving...' : 'Save Gmail OTP Settings'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                Sender Gmail Address *
              </label>
              <input
                type="email"
                name="supportEmail"
                value={formData.supportEmail}
                onChange={handleChange}
                placeholder="yourbusiness@gmail.com"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                Gmail App Password (16 Characters)
              </label>
              <input
                type="password"
                name="gmailAppPassword"
                value={formData.gmailAppPassword || ''}
                onChange={handleChange}
                placeholder="xxxx xxxx xxxx xxxx"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900 font-mono"
              />
            </div>
          </div>

          <div className="p-3.5 bg-cream-50 rounded-2xl border border-cream-300 text-xs text-charcoal-600 space-y-1">
            <span className="font-bold text-charcoal-900 block">💡 How to enable Live Gmail OTP Email Dispatch:</span>
            <p className="text-[11px] leading-relaxed text-charcoal-500">
              1. Go to your Google Account (<a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-brand-800 underline">myaccount.google.com/apppasswords</a>).<br />
              2. Enable 2-Step Verification and generate a 16-character <strong>App Password</strong> for Mail.<br />
              3. Enter the 16-character App Password above to automatically send OTP verification emails directly to customer Gmail inboxes when they sign in!
            </p>
          </div>
        </div>

        {/* UPI Merchant Payment Config */}
        <div className="space-y-4 pb-6 border-b border-cream-200 pt-2">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-cream-200">
            <h3 className="text-sm font-serif font-semibold text-charcoal-900 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-terracotta-600" /> UPI Merchant Payment Configuration
            </h3>
            <button
              type="button"
              onClick={() => saveSettings('UPI Payment Settings')}
              disabled={saving}
              className="py-2 px-4 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingSection === 'UPI Payment Settings' ? 'Saving...' : 'Save UPI & QR Settings'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">Official Business UPI ID *</label>
              <input
                type="text"
                required
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                placeholder="knotandbloom@upi"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-mono outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">UPI Account Display Name *</label>
              <input
                type="text"
                required
                name="upiDisplayName"
                value={formData.upiDisplayName}
                onChange={handleChange}
                placeholder="Knot & Bloom Handmade"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>

            {/* Custom Merchant UPI QR Scanner Upload */}
            <div className="sm:col-span-2 p-4 bg-cream-50 rounded-2xl border border-cream-300 space-y-3">
              <div>
                <span className="text-xs font-bold text-charcoal-900 block">
                  📷 Upload Official Merchant UPI QR Scanner Image (PhonePe / GPay / Paytm / BHIM)
                </span>
                <span className="text-[11px] text-charcoal-500">
                  Upload your merchant QR code scanner photo directly from your Phone Camera / Gallery or Laptop so customers can scan and pay!
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                {formData.upiQrUrl ? (
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-white border-2 border-brand-500 shadow-sm group">
                    <img src={formData.upiQrUrl} alt="UPI QR Scanner" className="w-full h-full object-contain p-1" />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, upiQrUrl: '' }))}
                      className="absolute inset-0 bg-charcoal-950/60 text-white font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4 text-red-300" />
                      <span>Remove</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleQrUpload}
                      className="hidden"
                      id="upi-qr-scanner-upload"
                    />
                    <label
                      htmlFor="upi-qr-scanner-upload"
                      className="px-4 py-3 bg-white hover:bg-brand-50 border-2 border-dashed border-brand-400 hover:border-brand-700 rounded-2xl cursor-pointer flex items-center gap-2 text-brand-900 text-xs font-semibold shadow-xs transition-all"
                    >
                      {uploadingQr ? (
                        <span>Uploading QR Code...</span>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-terracotta-600" />
                          <span>+ Upload QR Scanner Photo from Phone / Laptop</span>
                        </>
                      )}
                    </label>
                  </div>
                )}

                {formData.upiQrUrl && (
                  <div className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                    ✅ Official Merchant QR Scanner active!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp & Delivery Rules */}
        <div className="space-y-4 pb-6 border-b border-cream-200 pt-2">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-cream-200">
            <h3 className="text-sm font-serif font-semibold text-charcoal-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-brand-700" /> WhatsApp & Delivery Rules
            </h3>
            <button
              type="button"
              onClick={() => saveSettings('Delivery & WhatsApp Rules')}
              disabled={saving}
              className="py-2 px-4 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingSection === 'Delivery & WhatsApp Rules' ? 'Saving...' : 'Save Delivery Rules'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">WhatsApp Phone Number *</label>
              <input
                type="text"
                required
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="919876543210"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">Base Delivery Fee (₹)</label>
              <input
                type="number"
                name="deliveryFee"
                value={formData.deliveryFee}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">Free Delivery Above (₹)</label>
              <input
                type="number"
                name="freeDeliveryOver"
                value={formData.freeDeliveryOver}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>
          </div>
        </div>

        {/* Admin Credentials */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-serif font-semibold text-charcoal-900 border-b border-cream-200 pb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-terracotta-600" /> Admin Security Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">Current Admin Password</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Required only to change password"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">New Admin Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new strong password"
                className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 px-6 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-float transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save All Settings & Security Changes'}</span>
        </button>
      </form>
    </div>
  );
}
