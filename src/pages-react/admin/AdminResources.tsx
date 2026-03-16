import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import { resourceTypeLabels, resourceTypeColors } from '../../lib/types';
import type { ResourceType } from '../../lib/types';

function navigate(to: string) {
  window.history.pushState(null, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function AdminResources() {
  const { resources, deleteResource } = useStore();
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = resources
    .filter(r => filter === 'all' || r.status === filter)
    .filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteResource(id);
      toast.success('Resource deleted');
    } catch {
      toast.error('Failed to delete resource');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[#0C2340]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Resources
          <span className="ml-2 text-[#5A6A7E]" style={{ fontSize: '1rem', fontWeight: 400 }}>({resources.length})</span>
        </h1>
        <button
          onClick={() => navigate('/admin/resources/new')}
          className="bg-[#009BFF] hover:bg-[#0080D9] text-white px-5 py-2.5 rounded-lg transition-colors"
          style={{ fontSize: '0.875rem', fontWeight: 600 }}
        >
          + New Resource
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search resources..."
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#009BFF] focus:border-transparent"
          style={{ fontSize: '0.875rem' }}
        />
        <div className="flex gap-1 bg-white rounded-lg border border-gray-200 p-1">
          {(['all', 'published', 'draft'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-md transition-colors ${filter === s ? 'bg-[#009BFF] text-white' : 'text-[#5A6A7E] hover:bg-gray-50'}`}
              style={{ fontSize: '0.8125rem', fontWeight: 500, textTransform: 'capitalize' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#F5F7FA] rounded-xl p-8 text-center">
          <p className="text-[#5A6A7E]" style={{ fontSize: '0.9375rem' }}>
            {resources.length === 0 ? 'No resources yet. Create your first resource.' : 'No matching resources found.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-[#F5F7FA]">
                <th className="text-left px-6 py-3 text-[#5A6A7E]" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Title</th>
                <th className="text-left px-6 py-3 text-[#5A6A7E]" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Type</th>
                <th className="text-left px-6 py-3 text-[#5A6A7E]" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Category</th>
                <th className="text-left px-6 py-3 text-[#5A6A7E]" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Status</th>
                <th className="text-right px-6 py-3 text-[#5A6A7E]" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((resource) => {
                const typeColor = resourceTypeColors[resource.resourceType as ResourceType];
                return (
                  <tr key={resource.id} className="border-b border-gray-50 hover:bg-[#F9FAFB]">
                    <td className="px-6 py-4">
                      <div className="text-[#0C2340]" style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{resource.title}</div>
                      <div className="text-[#5A6A7E]" style={{ fontSize: '0.75rem' }}>{resource.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs"
                        style={{ fontWeight: 600, backgroundColor: typeColor?.bg || '#F5F7FA', color: typeColor?.text || '#5A6A7E' }}
                      >
                        {resourceTypeLabels[resource.resourceType as ResourceType] || resource.resourceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#5A6A7E]" style={{ fontSize: '0.875rem' }}>{resource.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs ${resource.status === 'published' ? 'bg-[#E8F5E9] text-[#27AE60]' : 'bg-gray-100 text-gray-500'}`} style={{ fontWeight: 600 }}>
                        {resource.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => navigate(`/admin/resources/edit/${resource.id}`)}
                          className="text-[#009BFF] hover:underline"
                          style={{ fontSize: '0.875rem', fontWeight: 500 }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(resource.id, resource.title)}
                          disabled={deleting === resource.id}
                          className="text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                          style={{ fontSize: '0.875rem', fontWeight: 500 }}
                        >
                          {deleting === resource.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
