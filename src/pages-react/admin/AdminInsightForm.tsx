import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import type { Insight } from '../../lib/types';

function navigate(to: string) {
  window.history.pushState(null, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const insightCategories = [
  'Industry Trends',
  'Product Updates',
  'Case Studies',
  'Technical Guides',
  'Company News',
  'Sustainability',
];

export function AdminInsightForm() {
  const { insights, addInsight, updateInsight } = useStore();
  const [saving, setSaving] = useState(false);

  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const editMatch = path.match(/\/admin\/insights\/edit\/(.+)/);
  const editId = editMatch?.[1] || null;
  const existingInsight = editId ? insights.find(i => i.id === editId) : null;
  const isEditing = !!existingInsight;

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: insightCategories[0],
    image: '',
    author: '',
    authorRole: '',
    tags: '',
    status: 'draft' as 'published' | 'draft',
    readTime: '',
    metaTitle: '',
    metaDescription: '',
  });

  useEffect(() => {
    if (existingInsight) {
      setForm({
        title: existingInsight.title,
        slug: existingInsight.slug,
        excerpt: existingInsight.excerpt,
        content: existingInsight.content,
        category: existingInsight.category,
        image: existingInsight.image,
        author: existingInsight.author,
        authorRole: existingInsight.authorRole || '',
        tags: existingInsight.tags.join(', '),
        status: existingInsight.status,
        readTime: existingInsight.readTime || '',
        metaTitle: existingInsight.metaTitle || '',
        metaDescription: existingInsight.metaDescription || '',
      });
    }
  }, [existingInsight]);

  const updateField = (field: string, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !isEditing) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error('Title and slug are required');
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const insightData: Insight = {
        id: editId || `insight-${Date.now()}`,
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        category: form.category,
        image: form.image.trim(),
        author: form.author.trim(),
        authorRole: form.authorRole.trim() || undefined,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: form.status,
        readTime: form.readTime.trim() || undefined,
        metaTitle: form.metaTitle.trim() || undefined,
        metaDescription: form.metaDescription.trim() || undefined,
        createdAt: existingInsight?.createdAt || now,
        updatedAt: now,
        publishedAt: form.status === 'published' ? (existingInsight?.publishedAt || now) : undefined,
      };

      if (isEditing) {
        const { id, ...updates } = insightData;
        await updateInsight(editId!, updates);
        toast.success('Insight updated successfully');
      } else {
        await addInsight(insightData);
        toast.success('Insight created successfully');
      }

      navigate('/admin/insights');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save insight');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/insights')}
          className="text-[#5A6A7E] hover:text-[#0C2340] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-[#0C2340]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {isEditing ? 'Edit Insight' : 'New Insight'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
          <h2 className="text-[#0C2340]" style={{ fontSize: '1.0625rem', fontWeight: 600 }}>Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Title *</label>
              <input type="text" value={form.title} onChange={e => updateField('title', e.target.value)} required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent" style={{ fontSize: '0.9375rem' }} />
            </div>
            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Slug *</label>
              <input type="text" value={form.slug} onChange={e => updateField('slug', e.target.value)} required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent" style={{ fontSize: '0.9375rem' }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Category</label>
              <select value={form.category} onChange={e => updateField('category', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent bg-white" style={{ fontSize: '0.9375rem' }}>
                {insightCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Status</label>
              <select value={form.status} onChange={e => updateField('status', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent bg-white" style={{ fontSize: '0.9375rem' }}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Read Time</label>
              <input type="text" value={form.readTime} onChange={e => updateField('readTime', e.target.value)} placeholder="5 min read"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent" style={{ fontSize: '0.9375rem' }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Author</label>
              <input type="text" value={form.author} onChange={e => updateField('author', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent" style={{ fontSize: '0.9375rem' }} />
            </div>
            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Author Role</label>
              <input type="text" value={form.authorRole} onChange={e => updateField('authorRole', e.target.value)} placeholder="e.g. Head of Engineering"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent" style={{ fontSize: '0.9375rem' }} />
            </div>
          </div>

          <div>
            <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Image URL</label>
            <input type="text" value={form.image} onChange={e => updateField('image', e.target.value)} placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent" style={{ fontSize: '0.9375rem' }} />
          </div>

          <div>
            <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Tags (comma separated)</label>
            <input type="text" value={form.tags} onChange={e => updateField('tags', e.target.value)} placeholder="solar, inverter, africa"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent" style={{ fontSize: '0.9375rem' }} />
          </div>

          <div>
            <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Excerpt</label>
            <textarea value={form.excerpt} onChange={e => updateField('excerpt', e.target.value)} rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent resize-y" style={{ fontSize: '0.9375rem' }} />
          </div>

          <div>
            <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Content (HTML/Markdown)</label>
            <textarea value={form.content} onChange={e => updateField('content', e.target.value)} rows={12}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent resize-y font-mono" style={{ fontSize: '0.875rem' }} />
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
          <h2 className="text-[#0C2340]" style={{ fontSize: '1.0625rem', fontWeight: 600 }}>SEO (Optional)</h2>
          <div>
            <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Meta Title</label>
            <input type="text" value={form.metaTitle} onChange={e => updateField('metaTitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent" style={{ fontSize: '0.9375rem' }} />
          </div>
          <div>
            <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Meta Description</label>
            <textarea value={form.metaDescription} onChange={e => updateField('metaDescription', e.target.value)} rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent resize-y" style={{ fontSize: '0.9375rem' }} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button type="button" onClick={() => navigate('/admin/insights')}
            className="px-6 py-2.5 rounded-lg border border-gray-200 text-[#5A6A7E] hover:bg-gray-50 transition-colors" style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-[#009BFF] hover:bg-[#0080D9] disabled:opacity-60 text-white transition-colors" style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
            {saving ? 'Saving...' : isEditing ? 'Update Insight' : 'Create Insight'}
          </button>
        </div>
      </form>
    </div>
  );
}
