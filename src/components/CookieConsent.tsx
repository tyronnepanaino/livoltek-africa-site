import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import {
  hasAnalyticsConsent,
  grantAnalyticsConsent,
  revokeAnalyticsConsent,
} from '../lib/analytics';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('livoltek_analytics_consent');
    if (stored === null) {
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    grantAnalyticsConsent();
    setVisible(false);
  };

  const handleDecline = () => {
    revokeAnalyticsConsent();
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-gray-200 shadow-2xl px-4 py-4 md:py-5 animate-in slide-in-from-bottom duration-500"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-9 h-9 rounded-lg bg-[#E6F3FF] flex items-center justify-center shrink-0 mt-0.5">
            <Shield className="w-5 h-5 text-[#009BFF]" />
          </div>
          <div>
            <p className="text-[#0C2340]" style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
              We value your privacy
            </p>
            <p className="text-[#5A6A7E] mt-0.5" style={{ fontSize: '0.8125rem', lineHeight: 1.6 }}>
              We use cookies and analytics to understand how visitors interact with our website and improve our services.
              Your data is processed in accordance with the Protection of Personal Information Act (POPIA).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-12 md:ml-0">
          <button
            onClick={handleDecline}
            className="px-5 py-2 rounded-lg border border-gray-200 text-[#5A6A7E] hover:bg-gray-50 transition-colors"
            style={{ fontSize: '0.875rem', fontWeight: 500 }}
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2 rounded-lg bg-[#009BFF] hover:bg-[#0080D9] text-white transition-colors"
            style={{ fontSize: '0.875rem', fontWeight: 600 }}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;
