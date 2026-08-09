import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook } from 'lucide-react';

/**
 * Footer props:
 *   links: [{ label, to }]      — nav link groups from parent/CMS, never hardcoded
 *   socialLinks: [{ icon, href, label }]
 */
export default function Footer({ links = [], socialLinks = [] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand column */}
          <div>
            <Link
              to="/"
              className="font-serif text-2xl text-primary hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
            >
              Testshop
            </Link>
            <p className="mt-3 text-sm text-secondary leading-relaxed font-sans">
              Curated fashion crafted for the discerning wardrobe.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-4 mt-4">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-secondary hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic link columns */}
          {links.map((group) => (
            <div key={group.heading}>
              <h3 className="text-xs font-sans font-semibold uppercase tracking-widest text-primary mb-4">
                {group.heading}
              </h3>
              <ul className="space-y-2">
                {group.items.map(({ label, to, href }) => (
                  <li key={label}>
                    {to ? (
                      <Link
                        to={to}
                        className="text-sm text-secondary hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                      >
                        {label}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        className="text-sm text-secondary hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                      >
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-secondary font-sans">
          <p>© {year} Testshop. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
