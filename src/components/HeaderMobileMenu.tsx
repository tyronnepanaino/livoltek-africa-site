/**
 * HEADER MOBILE MENU — React Island
 * ====================================
 *
 * This is the only interactive part of the header. It manages:
 *   - Hamburger toggle state
 *   - Mobile slide-out nav panel
 *   - Body scroll lock when open
 *
 * Mounted with client:idle in Header.astro so the desktop experience
 * is 100% static HTML with zero JS.
 */
import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

interface NavChild {
  label: string;
  href: string;
  description?: string;
}

interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

interface Props {
  navItems: NavItem[];
  currentPath: string;
  phone: string;
}

export default function HeaderMobileMenu({ navItems, currentPath, phone }: Props) {
  const [open, setOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <div className="lg:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-[#0C2340] hover:bg-[#F5F7FA] transition-colors"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile panel overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
          />
          <nav
            className="fixed top-[72px] left-0 right-0 bottom-0 z-50 bg-white overflow-y-auto"
            aria-label="Mobile navigation"
          >
            <div className="px-4 py-6 space-y-1">
              {navItems.map((item) => {
                const isActive = currentPath === item.href ||
                  (item.href !== '/' && currentPath.startsWith(item.href));

                if (item.children) {
                  const isExpanded = expandedItem === item.label;
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => setExpandedItem(isExpanded ? null : item.label)}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'text-[#009BFF] bg-[#E6F3FF]'
                            : 'text-[#0C2340] hover:bg-[#F5F7FA]'
                        }`}
                        style={{ fontSize: '1rem', fontWeight: 500 }}
                      >
                        {item.label}
                        <ChevronDown
                          className={`w-4 h-4 opacity-60 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
                          {item.children.map((child) => (
                            <a
                              key={child.href + child.label}
                              href={child.href}
                              className={`block px-4 py-2.5 rounded-lg transition-colors ${
                                currentPath === child.href
                                  ? 'text-[#009BFF] bg-[#E6F3FF]'
                                  : 'text-[#0C2340] hover:bg-[#F5F7FA]'
                              }`}
                              style={{ fontSize: '0.9375rem', fontWeight: 500 }}
                              onClick={() => setOpen(false)}
                            >
                              {child.label}
                              {child.description && (
                                <span className="block text-xs mt-0.5" style={{ color: '#5A6A7E' }}>
                                  {child.description}
                                </span>
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'text-[#009BFF] bg-[#E6F3FF]'
                        : 'text-[#0C2340] hover:bg-[#F5F7FA]'
                    }`}
                    style={{ fontSize: '1rem', fontWeight: 500 }}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </a>
                );
              })}

              <div className="border-t border-gray-100 mt-4 pt-4 space-y-3">
                <a
                  href={`tel:${phone}`}
                  className="block px-4 py-3 text-[#0C2340] hover:bg-[#F5F7FA] rounded-lg"
                  style={{ fontSize: '0.9375rem', fontWeight: 500 }}
                >
                  Call: {phone}
                </a>
                <a
                  href="/contact/quote-request"
                  className="block text-center bg-[#009BFF] hover:bg-[#0080D9] text-white px-5 py-3 rounded-lg transition-colors"
                  style={{ fontSize: '0.9375rem', fontWeight: 600 }}
                  onClick={() => setOpen(false)}
                >
                  Get a Quote
                </a>
              </div>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
