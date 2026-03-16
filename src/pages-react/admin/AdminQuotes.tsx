import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { toast } from 'sonner';
import type { QuoteRequest } from '../../lib/types';

const statusColors: Record<QuoteRequest['status'], { bg: string; text: string; label: string }> = {
  new: { bg: '#E6F3FF', text: '#009BFF', label: 'New' },
  contacted: { bg: '#FFF3E0', text: '#E67E22', label: 'Contacted' },
  proposal_sent: { bg: '#F3E5F5', text: '#8E24AA', label: 'Proposal Sent' },
  closed: { bg: '#E8F5E9', text: '#27AE60', label: 'Closed' },
};

const statusOptions: QuoteRequest['status'][] = ['new', 'contacted', 'proposal_sent', 'closed'];

export function AdminQuotes() {
  const { quoteRequests, updateQuoteStatus } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = filterStatus === 'all'
    ? quoteRequests
    : quoteRequests.filter(q => q.status === filterStatus);

  const handleStatusChange = async (id: string, status: QuoteRequest['status']) => {
    try {
      await updateQuoteStatus(id, status);
      toast.success(`Status updated to "${statusColors[status].label}"`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[#0C2340]" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Quote Requests
          <span className="ml-2 text-[#5A6A7E]" style={{ fontSize: '1rem', fontWeight: 400 }}>
            ({quoteRequests.length})
          </span>
        </h1>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#009BFF]"
          style={{ fontSize: '0.875rem' }}
        >
          <option value="all">All Statuses</option>
          {statusOptions.map(s => (
            <option key={s} value={s}>{statusColors[s].label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#F5F7FA] rounded-xl p-8 text-center">
          <p className="text-[#5A6A7E]" style={{ fontSize: '0.9375rem' }}>
            {filterStatus === 'all' ? 'No quote requests yet.' : `No "${statusColors[filterStatus as QuoteRequest['status']].label}" quotes.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((q) => {
            const status = statusColors[q.status];
            const isExpanded = expandedId === q.id;

            return (
              <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Summary row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className="min-w-0">
                      <div className="text-[#0C2340] truncate" style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{q.name}</div>
                      <div className="text-[#5A6A7E] truncate" style={{ fontSize: '0.8125rem' }}>{q.company}</div>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full shrink-0"
                      style={{ fontSize: '0.75rem', fontWeight: 600, backgroundColor: status.bg, color: status.text }}
                    >
                      {status.label}
                    </span>
                    <div className="text-[#5A6A7E] shrink-0" style={{ fontSize: '0.8125rem' }}>
                      {q.lineItems.length} item{q.lineItems.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-[#5A6A7E] shrink-0" style={{ fontSize: '0.8125rem' }}>
                      {new Date(q.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-[#5A6A7E] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <div className="text-[#5A6A7E] mb-1" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</div>
                        <div className="text-[#0C2340]" style={{ fontSize: '0.875rem' }}>{q.name}</div>
                        <div className="text-[#5A6A7E]" style={{ fontSize: '0.8125rem' }}>{q.email}</div>
                        <div className="text-[#5A6A7E]" style={{ fontSize: '0.8125rem' }}>{q.phone}</div>
                        {q.jobTitle && <div className="text-[#5A6A7E]" style={{ fontSize: '0.8125rem' }}>{q.jobTitle}</div>}
                      </div>
                      <div>
                        <div className="text-[#5A6A7E] mb-1" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project</div>
                        <div className="text-[#0C2340]" style={{ fontSize: '0.875rem' }}>{q.company}</div>
                        <div className="text-[#5A6A7E]" style={{ fontSize: '0.8125rem' }}>{q.projectLocation}</div>
                        {q.projectType && <div className="text-[#5A6A7E]" style={{ fontSize: '0.8125rem' }}>Type: {q.projectType}</div>}
                        {q.timeline && <div className="text-[#5A6A7E]" style={{ fontSize: '0.8125rem' }}>Timeline: {q.timeline}</div>}
                      </div>
                      <div>
                        <div className="text-[#5A6A7E] mb-1" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Update Status</div>
                        <select
                          value={q.status}
                          onChange={e => handleStatusChange(q.id, e.target.value as QuoteRequest['status'])}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#009BFF]"
                          style={{ fontSize: '0.875rem' }}
                        >
                          {statusOptions.map(s => (
                            <option key={s} value={s}>{statusColors[s].label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Line items */}
                    {q.lineItems.length > 0 && (
                      <div>
                        <div className="text-[#5A6A7E] mb-2" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requested Products</div>
                        <div className="bg-[#F5F7FA] rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left px-4 py-2 text-[#5A6A7E]" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Product</th>
                                <th className="text-left px-4 py-2 text-[#5A6A7E]" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Category</th>
                                <th className="text-right px-4 py-2 text-[#5A6A7E]" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Qty</th>
                              </tr>
                            </thead>
                            <tbody>
                              {q.lineItems.map((item, i) => (
                                <tr key={i} className="border-b border-gray-100 last:border-0">
                                  <td className="px-4 py-2 text-[#0C2340]" style={{ fontSize: '0.8125rem' }}>{item.productTitle}</td>
                                  <td className="px-4 py-2 text-[#5A6A7E]" style={{ fontSize: '0.8125rem' }}>{item.productCategory}</td>
                                  <td className="px-4 py-2 text-right text-[#0C2340]" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{item.quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {q.additionalNotes && (
                      <div className="mt-4">
                        <div className="text-[#5A6A7E] mb-1" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Additional Notes</div>
                        <p className="text-[#0C2340] bg-[#F5F7FA] rounded-lg px-4 py-3" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{q.additionalNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
