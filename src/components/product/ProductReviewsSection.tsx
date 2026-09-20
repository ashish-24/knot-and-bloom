'use client';

import React, { useState } from 'react';
import { Star, CheckCircle, Plus, Upload, Trash2, MessageSquare, Image as ImageIcon, Sparkles, ThumbsUp } from 'lucide-react';

export interface ReviewItem {
  id: string;
  authorName: string;
  rating: number;
  title?: string | null;
  comment: string;
  imageUrl?: string | null;
  verified?: boolean;
  createdAt: string | Date;
}

export default function ProductReviewsSection({
  productId,
  productName,
  initialReviews = [],
  averageRating = 5.0,
  totalReviews = 0,
}: {
  productId: string;
  productName: string;
  initialReviews?: ReviewItem[];
  averageRating?: number;
  totalReviews?: number;
}) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [reviewPhoto, setReviewPhoto] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedEnlargedImage, setSelectedEnlargedImage] = useState<string | null>(null);

  // Handle direct device photo upload for review
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (file.size > 10 * 1024 * 1024) {
      setError('Photo size must be under 10MB.');
      return;
    }

    setUploadingPhoto(true);
    setError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload photo');

      setReviewPhoto(data.imageUrl);
    } catch (err: any) {
      setError(err.message || 'Error uploading photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/products/reviews/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          authorName: authorName || 'Verified Artisan Buyer',
          title: title || 'Handcrafted Excellence',
          comment,
          imageUrl: reviewPhoto || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');

      setReviews([data.review, ...reviews]);
      setMessage('Thank you! Your 5-star review has been published.');
      setComment('');
      setTitle('');
      setReviewPhoto('');
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Error submitting review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 bg-white rounded-3xl p-6 sm:p-10 border border-cream-300 shadow-soft">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cream-200 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-terracotta-600 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Customer Feedback & Photos
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-charcoal-900">
            Ratings & Reviews ({reviews.length})
          </h2>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-3 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-float transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Cancel Review' : 'Write a Customer Review'}</span>
        </button>
      </div>

      {/* Rating Summary Bar */}
      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-cream-50 p-6 rounded-2xl border border-cream-300">
          <div className="md:col-span-4 text-center md:text-left space-y-1">
            <div className="text-4xl sm:text-5xl font-serif font-bold text-charcoal-900">
              {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-cream-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-charcoal-500 pt-1">
              Based on {reviews.length} verified customer review{reviews.length === 1 ? '' : 's'}
            </p>
          </div>

          {/* 5-Star Breakdown */}
          <div className="md:col-span-8 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              const pct = (count / reviews.length) * 100;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-8 font-semibold text-charcoal-700">{stars} ★</span>
                  <div className="flex-1 h-2 bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-charcoal-500 font-mono">{pct.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-cream-50 rounded-2xl border border-cream-300 space-y-2">
          <div className="w-12 h-12 rounded-full bg-cream-200 text-charcoal-500 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-semibold text-charcoal-900 text-base">No Customer Reviews Yet</h3>
          <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
            Be the first customer to purchase and share your handcrafted experience with this piece!
          </p>
        </div>
      )}

      {/* Success Notification */}
      {message && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Review Submission Form */}
      {showForm && (
        <form onSubmit={handleSubmitReview} className="p-6 bg-cream-100/70 rounded-2xl border-2 border-brand-300 space-y-5">
          <h3 className="text-base font-serif font-semibold text-charcoal-900">
            Share Your Experience with {productName}
          </h3>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200">
              {error}
            </div>
          )}

          {/* 5-Star Picker */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-800 mb-1.5">
              Your Star Rating *
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 cursor-pointer ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-charcoal-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-amber-700 ml-2">{rating} out of 5 Stars</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Ananya Roy"
                className="w-full px-3.5 py-2.5 bg-white border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1">Review Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Loved the finishing & colors!"
                className="w-full px-3.5 py-2.5 bg-white border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-800 mb-1">Detailed Review *</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the texture, handmade quality, packaging, and delivery..."
              className="w-full px-3.5 py-2.5 bg-white border border-cream-300 rounded-xl text-xs outline-none focus:border-brand-600 text-charcoal-900 resize-none"
            />
          </div>

          {/* Photo Upload for Review */}
          <div className="space-y-2 p-4 bg-white rounded-xl border border-cream-300">
            <label className="block text-xs font-semibold text-charcoal-800">
              Attach Product Photo (Upload from Mobile Gallery / Laptop)
            </label>

            <div className="flex items-center gap-4">
              {reviewPhoto && (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-cream-300 shrink-0">
                  <img src={reviewPhoto} alt="Review attachment" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setReviewPhoto('')}
                    className="absolute inset-0 bg-charcoal-950/60 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
                id="review-photo-upload"
              />
              <label
                htmlFor="review-photo-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-cream-200 hover:bg-brand-100 text-brand-900 rounded-xl text-xs font-semibold transition-colors"
              >
                {uploadingPhoto ? (
                  <span>Uploading Photo...</span>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>{reviewPhoto ? '+ Change Photo' : '+ Attach Product Photo'}</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || uploadingPhoto}
            className="w-full py-3.5 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all"
          >
            {submitting ? 'Publishing Review...' : 'Submit Verified Review'}
          </button>
        </form>
      )}

      {/* Reviews Feed */}
      <div className="space-y-6 pt-4 divide-y divide-cream-200">
        {reviews.map((rev) => (
          <div key={rev.id} className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-900 font-bold text-sm flex items-center justify-center font-serif">
                  {rev.authorName.charAt(0)}
                </div>
                <div>
                  <span className="font-semibold text-charcoal-900 text-xs block">
                    {rev.authorName}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Verified Buyer
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-cream-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {rev.title && (
              <h4 className="font-serif font-semibold text-charcoal-900 text-sm">
                "{rev.title}"
              </h4>
            )}

            <p className="text-xs text-charcoal-600 leading-relaxed font-sans">
              {rev.comment}
            </p>

            {/* Uploaded Customer Review Photo Thumbnail */}
            {rev.imageUrl && (
              <div className="pt-1">
                <button
                  onClick={() => setSelectedEnlargedImage(rev.imageUrl || null)}
                  className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-cream-300 shadow-xs hover:scale-105 transition-transform group cursor-pointer block"
                >
                  <img
                    src={rev.imageUrl}
                    alt="Customer uploaded review photo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-charcoal-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                </button>
              </div>
            )}

            <div className="text-[10px] text-charcoal-400 pt-1">
              Reviewed on {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        ))}
      </div>

      {/* Enlarged Photo Lightbox Modal */}
      {selectedEnlargedImage && (
        <div
          onClick={() => setSelectedEnlargedImage(null)}
          className="fixed inset-0 z-50 bg-charcoal-950/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-xl w-full bg-white rounded-3xl p-3 shadow-2xl overflow-hidden">
            <img
              src={selectedEnlargedImage}
              alt="Enlarged Customer Review Photo"
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
            <p className="text-center text-xs text-charcoal-500 mt-2">
              Customer Uploaded Review Photo • Tap anywhere to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
