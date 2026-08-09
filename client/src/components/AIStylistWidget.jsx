import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Send, X, Star, ShoppingCart } from 'lucide-react';
import { getRecommendation } from '../api/aiStylist';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ui/ToastProvider';
import Spinner from './ui/Spinner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ProductCard({ product }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const img = product.imageFileIds?.length
    ? `${API}/products/${product._id}/images/${product.imageFileIds[0]}`
    : null;

  // Discounted price
  let price = product.basePrice;
  if (product.discount) {
    const now = new Date();
    if (new Date(product.discount.activeFrom) <= now && now <= new Date(product.discount.activeUntil)) {
      price = product.discount.type === 'percentage'
        ? price * (1 - product.discount.value / 100)
        : Math.max(0, price - product.discount.value);
    }
  }
  price = Math.round(price * 100) / 100;

  const handleCart = async (e) => {
    e.preventDefault();
    const available = product.sizes?.find((s) => s.stock > 0);
    if (!available) { toast(`${product.name} is out of stock.`, 'warning'); return; }
    const multiSizes = product.sizes?.filter((s) => s.stock > 0).length > 1;
    if (multiSizes) { toast('Select a size on the product page.', 'info'); return; }
    try {
      await addItem(product._id, available.size, 1);
      toast(`${product.name} added to cart!`, 'success');
    } catch { toast('Failed to add to cart.', 'error'); }
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="flex gap-3 p-3 rounded border border-border bg-surface hover:border-primary transition-colors group focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      {/* Thumbnail */}
      <div className="w-14 h-16 shrink-0 rounded overflow-hidden bg-background border border-border">
        {img ? (
          <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-secondary">—</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 font-sans">
        <p className="text-xs font-medium text-primary line-clamp-2 leading-tight">{product.name}</p>
        <div className="flex items-center gap-1 mt-1">
          {product.ratingAverage > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-secondary">
              <Star size={9} className="fill-accent text-accent" /> {product.ratingAverage.toFixed(1)}
            </span>
          )}
        </div>
        <p className="text-xs font-semibold text-primary mt-1">${price.toFixed(2)}</p>
      </div>

      {/* Cart button */}
      <button
        onClick={handleCart}
        aria-label={`Add ${product.name} to cart`}
        className="self-center shrink-0 w-7 h-7 flex items-center justify-center rounded border border-border text-secondary hover:text-primary hover:border-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <ShoppingCart size={13} />
      </button>
    </Link>
  );
}

// ── Message types ──────────────────────────────────────────────────────────────
function UserMessage({ text }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] bg-primary text-surface text-sm font-sans px-3 py-2 rounded-lg rounded-tr-none">
        {text}
      </div>
    </div>
  );
}

function AssistantMessage({ rationale, products = [] }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Rationale bubble */}
      <div className="bg-background border border-border text-sm font-sans text-primary px-3 py-2 rounded-lg rounded-tl-none max-w-[90%]">
        {rationale}
      </div>

      {/* Product cards */}
      {products.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] text-secondary font-sans uppercase tracking-wider font-semibold pl-1">
            Recommended for you
          </p>
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ErrorMessage({ text }) {
  return (
    <div className="text-xs text-error font-sans bg-error/5 border border-error/20 rounded px-3 py-2">
      {text}
    </div>
  );
}

// ── Main widget ────────────────────────────────────────────────────────────────
/**
 * AIStylistWidget
 * Props:
 *   embedded: bool — if true, renders inline (no floating button/panel shell)
 */
export default function AIStylistWidget({ embedded = false }) {
  const [open, setOpen] = useState(embedded);
  const [messages, setMessages] = useState([]); // { type: 'user'|'assistant'|'error', ... }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((m) => [...m, { type: 'user', text }]);
    setLoading(true);

    try {
      const { data } = await getRecommendation({ query: text });
      const result = data?.recommendation || data;
      setMessages((m) => [
        ...m,
        {
          type: 'assistant',
          rationale: result?.rationale || "Here are some pieces I think you'd love.",
          products: result?.recommendedProducts || [],
        },
      ]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setMessages((m) => [...m, { type: 'error', text: msg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const panelContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            <span className="text-sm font-sans font-semibold text-primary">AI Stylist</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close AI Stylist"
            className="text-secondary hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 font-sans">
            <Sparkles size={28} className="mx-auto text-accent mb-3" />
            <p className="text-sm font-medium text-primary">What's your style today?</p>
            <p className="text-xs text-secondary mt-1">
              Describe what you're looking for — occasion, budget, vibe — and I'll find the right pieces for you.
            </p>
            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {[
                'Casual weekend look under $80',
                'Smart office outfit for summer',
                'Evening dress for a wedding',
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="text-xs px-3 py-1.5 rounded-full border border-border text-secondary hover:border-primary hover:text-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent font-sans"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i}>
            {msg.type === 'user' && <UserMessage text={msg.text} />}
            {msg.type === 'assistant' && (
              <AssistantMessage rationale={msg.rationale} products={msg.products} />
            )}
            {msg.type === 'error' && <ErrorMessage text={msg.text} />}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-secondary font-sans text-xs">
            <Spinner size="sm" /> Styling your look…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-surface rounded-b-2xl">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your style request…"
            rows={1}
            aria-label="Style request"
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm font-sans bg-background text-primary placeholder-secondary resize-none max-h-28 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
            style={{ minHeight: '38px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-surface hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-[10px] text-secondary mt-1.5 font-sans text-center">
          AI suggestions are based on current inventory.
        </p>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <div className="flex flex-col h-full min-h-[500px] border border-border rounded-2xl overflow-hidden bg-background">
        {panelContent}
      </div>
    );
  }

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI Stylist"
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-surface shadow-lg hover:bg-accent transition-colors flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Sparkles size={22} />
        </button>
      )}

      {/* Floating panel */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-40 w-[360px] max-h-[600px] rounded-2xl shadow-2xl border border-border bg-background flex flex-col overflow-hidden"
          role="dialog"
          aria-label="AI Stylist"
          aria-modal="false"
        >
          {panelContent}
        </div>
      )}
    </>
  );
}
