import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import type { Product } from '../../lib/types';

function navigate(to: string) {
  window.history.pushState(null, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const productCategories = [
  'Hybrid Inverters',
  'String Inverters',
  'Energy Storage Systems',
  'Solar Panels',
  'EV Chargers',
  'Smart Energy Management',
  'Accessories',
];

export function AdminProductForm() {
  const { products, addProduct, updateProduct } = useStore();
  const [saving, setSaving] = useState(false);

  // Determine if editing
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const editMatch = path.match(/\/admin\/products\/edit\/(.+)/);
  const editId = editMatch?.[1] || null;
  const existingProduct = editId ? products.find(p => p.id === editId) : null;
  const isEditing = !!existingProduct;

  const [form, setForm] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    category: productCategories[0],
    image: '',
    features: [''],
    specifications: [{ key: '', value: '' }],
    status: 'draft' as 'published' | 'draft',
    metaTitle: '',
    metaDescription: '',
  });

  useEffect(() => {
    if (existingProduct) {
      setForm({
        title: existingProduct.title,
        slug: existingProduct.slug,
        shortDescription: existingProduct.shortDescription,
        description: existingProduct.description,
        category: existingProduct.category,
        image: existingProduct.image,
        features: existingProduct.features.length > 0 ? existingProduct.features : [''],
        specifications: Object.entries(existingProduct.specifications).length > 0
          ? Object.entries(existingProduct.specifications).map(([key, value]) => ({ key, value }))
          : [{ key: '', value: '' }],
        status: existingProduct.status,
        metaTitle: existingProduct.metaTitle || '',
        metaDescription: existingProduct.metaDescription || '',
      });
    }
  }, [existingProduct]);

  const updateField = (field: string, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !isEditing) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const updateFeature = (index: number, value: string) => {
    setForm(prev => {
      const features = [...prev.features];
      features[index] = value;
      return { ...prev, features };
    });
  };

  const addFeature = () => setForm(prev => ({ ...prev, features: [...prev.features, ''] }));
  const removeFeature = (index: number) => setForm(prev => ({
    ...prev,
    features: prev.features.filter((_, i) => i !== index),
  }));

  const updateSpec = (index: number, field: 'key' | 'value', value: string) => {
    setForm(prev => {
      const specifications = [...prev.specifications];
      specifications[index] = { ...specifications[index], [field]: value };
      return { ...prev, specifications };
    });
  };

  const addSpec = () => setForm(prev => ({
    ...prev,
    specifications: [...prev.specifications, { key: '', value: '' }],
  }));
  const removeSpec = (index: number) => setForm(prev => ({
    ...prev,
    specifications: prev.specifications.filter((_, i) => i !== index),
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error('Title and slug are required');
      return;
    }

    setSaving(true);
    try {
      const specs: Record<string, string> = {};
      form.specifications.forEach(s => {
        if (s.key.trim()) specs[s.key.trim()] = s.value.trim();
      });

      const now = new Date().toISOString();
      const productData: Product = {
        id: editId || `product-${Date.now()}`,
        title: form.title.trim(),
        slug: form.slug.trim(),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        category: form.category,
        image: form.image.trim(),
        features: form.features.filter(f => f.trim()),
        specifications: specs,
        status: form.status,
        metaTitle: form.metaTitle.trim() || undefined,
        metaDescription: form.metaDescription.trim() || undefined,
        createdAt: existingProduct?.createdAt || now,
        updatedAt: now,
      };

      if (isEditing) {
        const { id, ...updates } = productData;
        await updateProduct(editId!, updates);
        toast.success('Product updated successfully');
      } else {
        await addProduct(productData);
        toast.success('Product created successfully');
      }

      navigate('/admin/products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="text-[#5A6A7E] hover:text-[#0C2340] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-[#0C2340]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {isEditing ? 'Edit Product' : 'New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
          <h2 className="text-[#0C2340]" style={{ fontSize: '1.0625rem', fontWeight: 600 }}>Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => updateField('title', e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent"
                style={{ fontSize: '0.9375rem' }}
              />
            </div>
            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => updateField('slug', e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent"
                style={{ fontSize: '0.9375rem' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Category</label>
              <select
                value={form.category}
                onChange={e => updateField('category', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent bg-white"
                style={{ fontSize: '0.9375rem' }}
              >
                {productCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Status</label>
              <select
                value={form.status}
                onChange={e => updateField('status', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent bg-white"
                style={{ fontSize: '0.9375rem' }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Image URL</label>
            <input
              type="text"
              value={form.image}
              onChange={e => updateField('image', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent"
              style={{ fontSize: '0.9375rem' }}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Short Description</label>
            <textarea
              value={form.shortDescription}
              onChange={e => updateField('shortDescription', e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent resize-y"
              style={{ fontSize: '0.9375rem' }}
            />
          </div>

          <div>
            <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Full Description</label>
            <textarea
              value={form.description}
              onChange={e => updateField('description', e.target.value)}
              rows={5}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent resize-y"
              style={{ fontSize: '0.9375rem' }}
            />
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[#0C2340]" style={{ fontSize: '1.0625rem', fontWeight: 600 }}>Features</h2>
            <button type="button" onClick={addFeature} className="text-[#009BFF] hover:underline" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              + Add Feature
            </button>
          </div>
          {form.features.map((feature, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={feature}
                onChange={e => updateFeature(i, e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent"
                style={{ fontSize: '0.9375rem' }}
                placeholder={`Feature ${i + 1}`}
              />
              {form.features.length > 1 && (
                <button type="button" onClick={() => removeFeature(i)} className="px-3 text-red-400 hover:text-red-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[#0C2340]" style={{ fontSize: '1.0625rem', fontWeight: 600 }}>Specifications</h2>
            <button type="button" onClick={addSpec} className="text-[#009BFF] hover:underline" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              + Add Specification
            </button>
          </div>
          {form.specifications.map((spec, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={spec.key}
                onChange={e => updateSpec(i, 'key', e.target.value)}
                className="w-1/3 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent"
                style={{ fontSize: '0.9375rem' }}
                placeholder="Spec name"
              />
              <input
                type="text"
                value={spec.value}
                onChange={e => updateSpec(i, 'value', e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent"
                style={{ fontSize: '0.9375rem' }}
                placeholder="Spec value"
              />
              {form.specifications.length > 1 && (
                <button type="button" onClick={() => removeSpec(i)} className="px-3 text-red-400 hover:text-red-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* SEO */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
          <h2 className="text-[#0C2340]" style={{ fontSize: '1.0625rem', fontWeight: 600 }}>SEO (Optional)</h2>
          <div>
            <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Meta Title</label>
            <input
              type="text"
              value={form.metaTitle}
              onChange={e => updateField('metaTitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent"
              style={{ fontSize: '0.9375rem' }}
            />
          </div>
          <div>
            <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Meta Description</label>
            <textarea
              value={form.metaDescription}
              onChange={e => updateField('metaDescription', e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent resize-y"
              style={{ fontSize: '0.9375rem' }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2.5 rounded-lg border border-gray-200 text-[#5A6A7E] hover:bg-gray-50 transition-colors"
            style={{ fontSize: '0.9375rem', fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-[#009BFF] hover:bg-[#0080D9] disabled:opacity-60 text-white transition-colors"
            style={{ fontSize: '0.9375rem', fontWeight: 600 }}
          >
            {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
