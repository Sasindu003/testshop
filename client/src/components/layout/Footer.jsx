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
          <div className="flex items-center gap-3">
            <p>© {year} Testshop. All rights reserved.</p>
            {/* Realtime MongoDB Indicator */}
            <MongoStatusBadge />
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function MongoStatusBadge() {
  const [status, setStatus] = React.useState({ state: 'checking', text: 'MongoDB: Checking...' });

  React.useEffect(() => {
    let isMounted = true;
    const checkDb = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        if (isMounted) {
          if (data.dbState === 1) {
            setStatus({ state: 'connected', text: 'MongoDB Connected' });
          } else if (data.dbState === 2) {
            setStatus({ state: 'connecting', text: 'MongoDB Connecting...' });
          } else {
            setStatus({ state: 'disconnected', text: `MongoDB ${data.dbStatus || 'Disconnected'}` });
          }
        }
      } catch (err) {
        if (isMounted) {
          setStatus({ state: 'disconnected', text: 'MongoDB Disconnected' });
        }
      }
    };

    checkDb();
    const interval = setInterval(checkDb, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const colorMap = {
    connected: 'bg-emerald-500',
    connecting: 'bg-amber-500 animate-pulse',
    disconnected: 'bg-rose-500',
    checking: 'bg-slate-400 animate-pulse'
  };

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface border border-border text-[11px] font-medium text-secondary">
      <span className={`w-2 h-2 rounded-full ${colorMap[status.state]}`} />
      <span>{status.text}</span>
    </div>
  );
}

