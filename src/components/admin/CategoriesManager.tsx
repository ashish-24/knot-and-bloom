'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderPlus,
  Edit2,
  Trash2,
  Search,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  _count?: {
    products: number;
  };
}

export default function CategoriesManager({ initialCategories }: { initialCategories: CategoryItem[] }) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (res.ok && data.categories) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.error('Failed to reload categories:', e);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('');
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCategory?.id,
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
          image: image.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save category.');

      setSuccess(editingCategory ? 'Category updated successfully!' : 'New category created successfully!');
      await fetchCategories();
      setTimeout(() => {
        setModalOpen(false);
        setSuccess('');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error saving category.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/categories?id=${cat.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete category.');

      setSuccess(`Category "${cat.name}" deleted.`);
      await fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Error deleting category.');
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl w-full mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-cream-300 shadow-soft">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-terracotta-600 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Catalog Architecture
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-charcoal-900 mt-1">
            Category Management
          </h1>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Create, update, and manage product categories across your storefront.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-md transition-all hover:scale-105"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Global Notice Messages */}
      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-cream-300 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name or slug..."
            className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none text-charcoal-900 font-medium focus:border-brand-600"
          />
        </div>

        <button
          onClick={fetchCategories}
          className="p-2 text-charcoal-600 hover:text-brand-800 rounded-xl hover:bg-cream-100 transition-colors"
          title="Refresh Catalog"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Categories Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-cream-300 p-8 space-y-3">
            <Layers className="w-8 h-8 text-charcoal-400 mx-auto" />
            <h3 className="text-base font-serif font-semibold text-charcoal-900">
              No categories found
            </h3>
            <p className="text-xs text-charcoal-500">
              Click "Add New Category" to set up your first store category.
            </p>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl p-6 border border-cream-300 shadow-soft hover:shadow-float transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-charcoal-900 leading-tight">
                      {cat.name}
                    </h3>
                    <code className="text-[11px] text-terracotta-600 font-mono bg-cream-100 px-2 py-0.5 rounded mt-1 inline-block">
                      /{cat.slug}
                    </code>
                  </div>
                  <span className="px-2.5 py-1 bg-brand-100 text-brand-900 text-[10px] font-bold rounded-full shrink-0">
                    {cat._count?.products || 0} Products
                  </span>
                </div>

                <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed">
                  {cat.description || 'No description added for this category.'}
                </p>

                {cat.image && (
                  <div className="w-full h-28 rounded-2xl overflow-hidden bg-cream-50 border border-cream-200 relative">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-cream-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(cat)}
                  className="px-3 py-1.5 bg-cream-100 hover:bg-brand-100 text-brand-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-cream-300"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 border border-cream-300 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-charcoal-400 hover:text-charcoal-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-serif font-bold text-charcoal-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-terracotta-500" />
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <p className="text-xs text-charcoal-500 mt-1">
                Enter details for your storefront product category.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Crochet Collection"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none text-charcoal-900 font-medium focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                  Category Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                  placeholder="e.g. crochet-collection"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none font-mono text-charcoal-900 focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short summary of items in this category..."
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs outline-none text-charcoal-900 font-medium focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                  Category Cover Image (Upload from Phone / Laptop)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {image && (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white border-2 border-brand-500 shadow-xs group">
                      <img src={image} alt="Category Cover" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="absolute inset-0 bg-charcoal-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={async (e) => {
                        if (!e.target.files || !e.target.files[0]) return;
                        const file = e.target.files[0];
                        if (file.size > 10 * 1024 * 1024) {
                          setError('File size must be under 10MB.');
                          return;
                        }
                        setLoading(true);
                        setError('');
                        try {
                          const uploadFormData = new FormData();
                          uploadFormData.append('file', file);
                          const res = await fetch('/api/admin/upload', {
                            method: 'POST',
                            body: uploadFormData,
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'Failed to upload category image');
                          setImage(data.imageUrl);
                        } catch (err: any) {
                          setError(err.message || 'Error uploading image.');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="hidden"
                      id="category-cover-upload"
                    />
                    <label
                      htmlFor="category-cover-upload"
                      className="w-24 h-24 rounded-2xl border-2 border-dashed border-brand-400 hover:border-brand-700 bg-cream-50 hover:bg-brand-50 cursor-pointer flex flex-col items-center justify-center text-center p-2 transition-all shadow-xs"
                    >
                      <Plus className="w-6 h-6 text-brand-800 stroke-[2.5]" />
                      <span className="text-[10px] font-bold text-charcoal-900 mt-1">
                        {image ? '+ Change' : '+ Add Image'}
                      </span>
                      <span className="text-[9px] text-charcoal-500">Phone / Laptop</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-cream-100 hover:bg-cream-200 text-charcoal-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="px-6 py-2.5 bg-brand-800 hover:bg-brand-900 text-cream-100 rounded-xl text-xs font-semibold shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
