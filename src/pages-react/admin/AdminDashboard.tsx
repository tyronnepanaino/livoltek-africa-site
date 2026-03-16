import React from 'react';
import { useStore } from '../../lib/store';

function navigate(to: string) {
  window.history.pushState(null, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function AdminDashboard() {
  const { products, insights, quoteRequests, resources, dataLoading } = useStore();

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-3 border-[#009BFF] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-[#5A6A7E]" style={{ fontSize: '0.875rem' }}>Loading data...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Products', value: products.length, color: '#009BFF', href: '/admin/products' },
    { label: 'Insights', value: insights.length, color: '#27AE60', href: '/admin/insights' },
    { label: 'Resources', value: resources.length, color: '#E67E22', href: '/admin/resources' },
    { label: 'Quote Requests', value: quoteRequests.length, color: '#8E24AA', href: '/admin/quotes' },
  ];

  const newQuotes = quoteRequests.filter(q => q.status === 'new');
  const draftProducts = products.filter(p => p.status === 'draft');
  const draftInsights = insights.filter(i => i.status === 'draft');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-[#0C2340] mb-6" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
        Admin Dashboard
      </h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => navigate(stat.href)}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left"
          >
            <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div className="text-[#5A6A7E] mt-1" style={{ fontSize: '0.875rem' }}>{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-[#0C2340] mb-4" style={{ fontSize: '1.0625rem', fontWeight: 600 }}>Quick Actions</h2>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/admin/products/new')}
              className="w-full text-left px-4 py-2.5 rounded-lg bg-[#E6F3FF] text-[#009BFF] hover:bg-[#D0EBFF] transition-colors"
              style={{ fontSize: '0.875rem', fontWeight: 500 }}
            >
              + New Product
            </button>
            <button
              onClick={() => navigate('/admin/insights/new')}
              className="w-full text-left px-4 py-2.5 rounded-lg bg-[#E8F5E9] text-[#27AE60] hover:bg-[#D4EDDA] transition-colors"
              style={{ fontSize: '0.875rem', fontWeight: 500 }}
            >
              + New Insight
            </button>
            <button
              onClick={() => navigate('/admin/resources/new')}
              className="w-full text-left px-4 py-2.5 rounded-lg bg-[#FFF3E0] text-[#E67E22] hover:bg-[#FFE8CC] transition-colors"
              style={{ fontSize: '0.875rem', fontWeight: 500 }}
            >
              + New Resource
            </button>
          </div>
        </div>

        {/* New quotes alert */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-[#0C2340] mb-4" style={{ fontSize: '1.0625rem', fontWeight: 600 }}>
            New Quotes
            {newQuotes.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-[#8E24AA] text-white" style={{ fontSize: '0.75rem' }}>
                {newQuotes.length}
              </span>
            )}
          </h2>
          {newQuotes.length === 0 ? (
            <p className="text-[#5A6A7E]" style={{ fontSize: '0.875rem' }}>No new quote requests</p>
          ) : (
            <div className="space-y-2">
              {newQuotes.slice(0, 3).map(q => (
                <div key={q.id} className="px-3 py-2 rounded-lg bg-[#F5F7FA]">
                  <div className="text-[#0C2340]" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{q.name}</div>
                  <div className="text-[#5A6A7E]" style={{ fontSize: '0.75rem' }}>{q.company}</div>
                </div>
              ))}
              {newQuotes.length > 3 && (
                <button
                  onClick={() => navigate('/admin/quotes')}
                  className="text-[#009BFF] hover:underline"
                  style={{ fontSize: '0.8125rem' }}
                >
                  View all {newQuotes.length} new quotes
                </button>
              )}
            </div>
          )}
        </div>

        {/* Drafts */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-[#0C2340] mb-4" style={{ fontSize: '1.0625rem', fontWeight: 600 }}>Drafts</h2>
          <div className="space-y-2">
            {draftProducts.length > 0 && (
              <button
                onClick={() => navigate('/admin/products')}
                className="w-full text-left px-3 py-2 rounded-lg bg-[#F5F7FA] hover:bg-gray-100 transition-colors"
                style={{ fontSize: '0.875rem' }}
              >
                <span className="text-[#009BFF]" style={{ fontWeight: 600 }}>{draftProducts.length}</span>
                <span className="text-[#5A6A7E] ml-1.5">draft product{draftProducts.length !== 1 ? 's' : ''}</span>
              </button>
            )}
            {draftInsights.length > 0 && (
              <button
                onClick={() => navigate('/admin/insights')}
                className="w-full text-left px-3 py-2 rounded-lg bg-[#F5F7FA] hover:bg-gray-100 transition-colors"
                style={{ fontSize: '0.875rem' }}
              >
                <span className="text-[#27AE60]" style={{ fontWeight: 600 }}>{draftInsights.length}</span>
                <span className="text-[#5A6A7E] ml-1.5">draft insight{draftInsights.length !== 1 ? 's' : ''}</span>
              </button>
            )}
            {draftProducts.length === 0 && draftInsights.length === 0 && (
              <p className="text-[#5A6A7E]" style={{ fontSize: '0.875rem' }}>All content is published</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
