import React from 'react';
import { Sparkles } from 'lucide-react';
import AIStylistWidget from '../components/AIStylistWidget';

export default function AiStylistPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-xs font-sans font-semibold uppercase tracking-wider mb-4">
          <Sparkles size={13} /> Powered by AI
        </div>
        <h1 className="text-4xl font-serif text-primary mb-3">Your Personal Stylist</h1>
        <p className="text-secondary font-sans max-w-lg mx-auto">
          Tell me what you're looking for — an occasion, a vibe, a budget — and I'll pull together real picks from our current collection just for you.
        </p>
      </div>

      {/* Embedded widget takes full height on the page */}
      <div style={{ height: '620px' }}>
        <AIStylistWidget embedded />
      </div>
    </div>
  );
}
