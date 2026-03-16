import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import type { Resource, ResourceType } from '../../lib/types';
import { resourceTypeLabels } from '../../lib/types';

function navigate(to: string) {
  window.history.pushState(null, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const resourceTypes: ResourceType[] = ['datasheet', 'case-study', 'whitepaper', 'guide'];

const resourceCategories = [
  'Inverters',
  'Energy Storage',
  'Solar Panels',
  'EV Charging',
  'Smart Energy',
  'General',
];

export function AdminResourceForm() {
  const { resources, addResource, updateResource } = useStore();
  const [saving, setSaving] = useState(false);

  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const editMatch = path.match(/\/admin\/resources\/edit\/(.+)/);
  const editId = editMatch?.[1] || null;
  const existingResource = editId ? resources.find(r => r.id === editId) : null;
  const isEditing = !!existingResource;

  const [form, setForm] = useState({
    title: '',
    slug: '',
    resourceType: 'datasheet' as ResourceType,
    excerpt: '',
    content: '',
    category: resourceCategories[0],
    image: '',
    fileUrl: '',
    fileName: '',
    fileSize: '',
    author: '',
    authorRole: '',
    tags: '',
    targetKeywords: '',
    status: 'draft' as 'published' | 'draft',
    metaTitle: '',
    metaDescription: '',
    readTime: '',
  });

  useEffect(() => {
    if (existingResource) {
      setForm({
        title: existingResource.title,
        slug: existingResource.slug,
        resourceType: existingResource.resourceType,
        excerpt: existingResource.excerpt,
        content: existingResource.content,
        category: existingResource.category,
        image: existingResource.image,
        fileUrl: existingResource.fileUrl || '',
        fileName: existingResource.fileName || '',
        fileSize: existingResource.fileSize || '',
        author: existingResource.author,
        authorRole: existingResource.authorRole || '',
        tags: existingResource.tags.join(', '),
        targetKeywords: existingResource.targetKeywords || '',
        status: existingResource.status,
        metaTitle: existingResource.metaTitle || '',
        metaDescription: existingResource.metaDescription || '',
        readTime: existingResource.readTime || '',
      });
    }
  }, [existingResource]);

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
      const resourceData: Resource = {
        id: editId || `resource-${Date.now()}`,
        title: form.title.trim(),
        slug: form.slug.trim(),
        resourceType: form.resourceType,
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        category: form.category,
        image: form.image.trim(),
        fileUrl: form.fileUrl.trim() || undefined,
        fileName: form.fileName.trim() || undefined,
        fileSize: form.fileSize.trim() || undefined,
        author: form.author.trim(),
        authorRole: form.authorRole.trim() || undefined,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        targetKeywords: form.targetKeywords.trim() || undefined,
        status: form.status,
        metaTitle: form.metaTitle.trim() || undefined,
        metaDescription: form.metaDescription.trim() || undefined,
        readTime: form.readTime.trim() || undefined,
        createdAt: existingResource?.createdAt || now,
        updatedAt: now,
        publishedAt: form.status === 'published' ? (existingResource?.publishedAt || now) : undefined,
      };

      if (isEditing) {
        const { id, ...updates } = resourceData;
        await updateResource(editId!, updates);
        toast.success('Resource updated successfully');
      } else {
        await addResource(resourceData);
        toast.success('Resource created successfully');
      }

      navigate('/admin/resources');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save resource');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/resources')}
          className="text-[#5A6A7E] hover:text-[#0C2340] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-[#0C2340]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {isEditing ? 'Edit Resource' : 'New Resource'}
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
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Resource Type</label>
              <select value={form.resourceType} onChange={e => updateField('resourceType', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent bg-white" style={{ fontSize: '0.9375rem' }}>
                {resourceTypes.map(t => <option key={t} value={t}>{resourceTypeLabels[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Category</label>
              <select value={form.category} onChange={e => updateField('category', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent bg-white" style={{ fontSize: '0.9375rem' }}>
                {resourceCategories.map(c => <option key={c} value={c}>{c}</option>)}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Author</label>
              <input type="text" value={form.author} onChange={e => updateField('author', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent" style={{ fontSize: '0.9375rem' }} />
            </div>
            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Read Time</label>
              <input type="text" value={form.readTime} onChange={e => updateField('readTime', e.target.value)} placeholder="5 min read"
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
            <input type="text" value={form.tags} onChange={e => updateField('tags', e.target.value)} placeholder="solar, datasheet, inverter"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent" style={{ fontSize: '0.9375rem' }} />
          </div>
        </div>

        {/* File attachment */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
          <h2 className="text-[#0C2340]" style={{ fontSize: '1.0625rem', fontWeight: 600 }}>File Attachment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>File URL</label>
              <input type="text" value={form.fileUrl} onChange={e => updateField('fileUrl', e.target.value)} placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent" style={{ fontSize: '0.9375rem' }} />
            </div>
            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>File Name</label>
              <input type="text" value={form.fileName} onChange={e => updateField('fileName', e.target.value)} placeholder="datasheet.pdf"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent" style={{ fontSize: '0.9375rem' }} />
            </div>
            <div>
              <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>File Size</label>
              <input type="text" value={form.fileSize} onChange={e => updateField('fileSize', e.target.value)} placeholder="2.4 MB"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent" style={{ fontSize: '0.9375rem' }} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
          <h2 className="text-[#0C2340]" style={{ fontSize: '1.0625rem', fontWeight: 600 }}>Content</h2>
          <div>
            <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Excerpt</label>
            <textarea value={form.excerpt} onChange={e => updateField('excerpt', e.target.value)} rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent resize-y" style={{ fontSize: '0.9375rem' }} />
          </div>
          <div>
            <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Full Content (HTML/Markdown)</label>
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
          <div>
            <label className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Target Keywords</label>
            <input type="text" value={form.targetKeywords} onChange={e => updateField('targetKeywords', e.target.value)} placeholder="solar inverter datasheet, commercial solar"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent" style={{ fontSize: '0.9375rem' }} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button type="button" onClick={() => navigate('/admin/resources')}
            className="px-6 py-2.5 rounded-lg border border-gray-200 text-[#5A6A7E] hover:bg-gray-50 transition-colors" style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-[#009BFF] hover:bg-[#0080D9] disabled:opacity-60 text-white transition-colors" style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
            {saving ? 'Saving...' : isEditing ? 'Update Resource' : 'Create Resource'}
          </button>
        </div>
      </form>
    </div>
  );
}
