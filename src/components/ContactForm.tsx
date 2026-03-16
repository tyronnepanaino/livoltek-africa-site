/**
 * CONTACT FORM — React Island
 * ===============================
 * Handles form state, validation, submission, and success/reset UI.
 * Mounted with client:visible in contact/index.astro.
 *
 * Copied from ContactPage.tsx with react-router imports removed.
 */
import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { trackContactSubmission } from '../lib/analytics';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', subject: '', message: '', projectType: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    trackContactSubmission(formData.subject);
    toast.success('Your message has been sent successfully! Our team will respond within 24 hours.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-[#27AE60]" />
        </div>
        <h3 className="text-[#0C2340] mb-2" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Thank You!</h3>
        <p className="text-[#5A6A7E] max-w-md mx-auto" style={{ fontSize: '1rem', lineHeight: 1.7 }}>
          Your message has been received. Our team will review your inquiry and get back to you within 24 business hours.
        </p>
        <button
          onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', company: '', subject: '', message: '', projectType: '' }); }}
          className="mt-6 text-[#009BFF] hover:underline cursor-pointer"
          style={{ fontWeight: 600 }}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name" name="name" type="text" required
            value={formData.name} onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#F5F7FA] focus:border-[#009BFF] focus:ring-2 focus:ring-[#009BFF]/20 outline-none transition-all"
            placeholder="John Smith"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="email" name="email" type="email" required
            value={formData.email} onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#F5F7FA] focus:border-[#009BFF] focus:ring-2 focus:ring-[#009BFF]/20 outline-none transition-all"
            placeholder="john@company.co.za"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="phone" className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Phone Number
          </label>
          <input
            id="phone" name="phone" type="tel"
            value={formData.phone} onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#F5F7FA] focus:border-[#009BFF] focus:ring-2 focus:ring-[#009BFF]/20 outline-none transition-all"
            placeholder="+27 XX XXX XXXX"
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Company Name
          </label>
          <input
            id="company" name="company" type="text"
            value={formData.company} onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#F5F7FA] focus:border-[#009BFF] focus:ring-2 focus:ring-[#009BFF]/20 outline-none transition-all"
            placeholder="Company Name"
          />
        </div>
      </div>

      <div>
        <label htmlFor="projectType" className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
          Project Type
        </label>
        <select
          id="projectType" name="projectType"
          value={formData.projectType} onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#F5F7FA] focus:border-[#009BFF] focus:ring-2 focus:ring-[#009BFF]/20 outline-none transition-all"
          style={{ fontSize: '0.9375rem' }}
        >
          <option value="">Select a project type</option>
          <option value="rooftop-solar">Commercial Rooftop Solar</option>
          <option value="ground-mount">Ground Mount Solar</option>
          <option value="energy-storage">Energy Storage / BESS</option>
          <option value="ev-charging">EV Charging Infrastructure</option>
          <option value="hybrid">Hybrid / Microgrid</option>
          <option value="product-inquiry">Product Inquiry</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="subject" className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          id="subject" name="subject" type="text" required
          value={formData.subject} onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#F5F7FA] focus:border-[#009BFF] focus:ring-2 focus:ring-[#009BFF]/20 outline-none transition-all"
          placeholder="How can we help?"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-[#0C2340] mb-1.5" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message" name="message" required rows={5}
          value={formData.message} onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[#F5F7FA] focus:border-[#009BFF] focus:ring-2 focus:ring-[#009BFF]/20 outline-none transition-all resize-none"
          placeholder="Tell us about your project, facility size, current energy consumption, and goals..."
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center gap-2 bg-[#009BFF] hover:bg-[#0080D9] text-white px-8 py-3 rounded-lg transition-colors cursor-pointer"
        style={{ fontWeight: 600 }}
      >
        <Send className="w-4 h-4" /> Send Message
      </button>
    </form>
  );
}
