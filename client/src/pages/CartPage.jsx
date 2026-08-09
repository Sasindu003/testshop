import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, Tag, AlertTriangle, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { validateCoupon } from '../api/coupons';
import { useToast } from '../components/ui/ToastProvider';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function imageUrl(item) {
  const p = item.product;
  if (!p || !p.imageFileIds?.length) return null;
  return `${API}/products/${p._id}/images/${p.imageFileIds[0]}`;
}

function computePrice(product) {
  if (!product) return 0;
  let price = product.basePrice;
  if (product.discount) {
    const now = new Date();
    if (new Date(product.discount.activeFrom) <= now && now <= new Date(product.discount.activeUntil)) {
      if (product.discount.type === 'percentage') price *= 1 - product.discount.value / 100;
      else price = Math.max(0, price - product.discount.value);
    }
  }
  return Math.round(price * 100) / 100;
}

export default function CartPage() {
  const { items, loading, fetchCart, updateItem, removeItem, clear } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState(null); // { discountAmount, coupon }
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  // Compute subtotal from live product data
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = computePrice(item.product);
      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  // Detect stale / OOS items
  const warnings = useMemo(() => {
    const w = [];
    items.forEach((item) => {
      const p = item.product;
      if (!p || !p.isActive) {
        w.push({ item, msg: `"${p?.name || 'Unknown'}" is no longer available.` });
        return;
      }
      const sv = p.sizes?.find((s) => s.size === item.size);
      if (!sv) {
        w.push({ item, msg: `Size "${item.size}" is no longer available for "${p.name}".` });
      } else if (sv.stock <= 0) {
        w.push({ item, msg: `"${p.name}" (${item.size}) is out of stock.` });
      } else if (sv.stock < item.quantity) {
        w.push({ item, msg: `Only ${sv.stock} left for "${p.name}" (${item.size}). You have ${item.quantity} in your cart.` });
      }
    });
    return w;
  }, [items]);

  const handleQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    try {
      await updateItem(item.product._id, { quantity: newQty, oldSize: item.size });
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update quantity.', 'error');
    }
  };

  const handleRemove = async (item) => {
    try {
      await removeItem(item.product._id);
      toast('Item removed.', 'info');
    } catch {
      toast('Failed to remove item.', 'error');
    }
  };

  const handleClearCart = async () => {
    try {
      await clear();
      setCouponResult(null);
      setCouponCode('');
      toast('Cart cleared.', 'info');
    } catch {
      toast('Failed to clear cart.', 'error');
    }
  };

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    setCouponResult(null);
    try {
      const { data } = await validateCoupon({ code: couponCode.trim(), cartTotal: subtotal });
      setCouponResult(data);
      toast('Coupon applied!', 'success');
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon.');
      toast(err.response?.data?.message || 'Invalid coupon.', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  // Reset coupon when cart contents change
  useEffect(() => {
    setCouponResult(null);
  }, [items.length]);

  const discountAmount = couponResult?.discountAmount || 0;
  const total = Math.max(0, subtotal - discountAmount);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center font-sans">
        <ShoppingBag size={48} className="mx-auto text-border mb-4" />
        <h1 className="text-2xl font-serif text-primary mb-3">Your cart is empty</h1>
        <p className="text-secondary mb-6">Looks like you haven't added anything yet.</p>
        <Link
          to="/products"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded bg-primary text-surface text-sm font-sans font-medium hover:bg-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <h1 className="text-3xl font-serif text-primary mb-8">Shopping Cart</h1>

      {/* Warnings banner */}
      {warnings.length > 0 && (
        <div className="mb-6 p-4 bg-error/5 border border-error/20 rounded space-y-1" role="alert">
          <div className="flex items-center gap-2 text-error text-sm font-sans font-medium mb-1">
            <AlertTriangle size={16} /> Some items need attention
          </div>
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-error font-sans pl-6">{w.msg}</p>
          ))}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* ── Items list ─────────────────────────────────────────── */}
        <div className="flex-1 w-full space-y-4">
          {items.map((item) => {
            const p = item.product;
            if (!p) return null;
            const unitPrice = computePrice(p);
            const img = imageUrl(item);
            const sv = p.sizes?.find((s) => s.size === item.size);
            const oos = !sv || sv.stock <= 0;

            return (
              <div
                key={`${p._id}-${item.size}`}
                className={`flex gap-4 border rounded p-4 font-sans ${oos ? 'border-error/30 bg-error/5' : 'border-border'}`}
              >
                {/* Thumbnail */}
                <Link
                  to={`/products/${p._id}`}
                  className="shrink-0 w-20 h-24 sm:w-28 sm:h-36 rounded overflow-hidden bg-background border border-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {img ? (
                    <img src={img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-secondary">No img</div>
                  )}
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link to={`/products/${p._id}`} className="text-sm font-medium text-primary hover:text-accent transition-colors line-clamp-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">
                      {p.name}
                    </Link>
                    <p className="text-xs text-secondary mt-0.5">Size: {item.size}</p>
                    {oos && <p className="text-xs text-error mt-1 font-medium">Out of stock</p>}
                  </div>

                  <div className="flex items-center justify-between mt-3 gap-3">
                    {/* Qty stepper */}
                    <div className="flex items-center border border-border rounded">
                      <button
                        onClick={() => handleQty(item, -1)}
                        disabled={item.quantity <= 1 || oos}
                        aria-label="Decrease quantity"
                        className="w-8 h-8 flex items-center justify-center text-secondary hover:text-primary disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-l"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-primary select-none">{item.quantity}</span>
                      <button
                        onClick={() => handleQty(item, 1)}
                        disabled={oos || (sv && item.quantity >= sv.stock)}
                        aria-label="Increase quantity"
                        className="w-8 h-8 flex items-center justify-center text-secondary hover:text-primary disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-r"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <span className="text-sm font-semibold text-primary whitespace-nowrap">
                      ${(unitPrice * item.quantity).toFixed(2)}
                    </span>

                    <button
                      onClick={() => handleRemove(item)}
                      aria-label={`Remove ${p.name}`}
                      className="text-secondary hover:text-error transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={handleClearCart}
            className="text-xs text-secondary hover:text-error transition-colors font-sans mt-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
          >
            Clear entire cart
          </button>
        </div>

        {/* ── Order summary sidebar ──────────────────────────────── */}
        <div className="w-full lg:w-80 shrink-0 sticky top-24">
          <div className="border border-border rounded p-6 font-sans space-y-5 bg-surface">
            <h2 className="font-serif text-xl text-primary">Order Summary</h2>

            <div className="flex justify-between text-sm text-secondary">
              <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span className="text-primary font-medium">${subtotal.toFixed(2)}</span>
            </div>

            {/* Coupon */}
            <div>
              <label htmlFor="coupon-code" className="text-xs font-semibold text-primary uppercase tracking-wider block mb-2">
                Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  id="coupon-code"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 border border-border rounded px-3 py-2 text-sm bg-background text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                />
                <Button size="sm" variant="secondary" onClick={handleCoupon} loading={couponLoading} disabled={!couponCode.trim()}>
                  <Tag size={14} /> Apply
                </Button>
              </div>
              {couponError && <p className="text-xs text-error mt-1">{couponError}</p>}
              {couponResult && (
                <p className="text-xs text-success mt-1">
                  Discount: −${discountAmount.toFixed(2)}
                </p>
              )}
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Discount</span>
                <span>−${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-border pt-4 flex justify-between text-base font-semibold text-primary">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <Button
              fullWidth
              onClick={() => navigate('/checkout', {
                state: { couponCode: couponResult ? couponCode : null, discountAmount },
              })}
              disabled={warnings.some((w) => {
                const p = w.item.product;
                const sv = p?.sizes?.find((s) => s.size === w.item.size);
                return !p || !p.isActive || !sv || sv.stock <= 0;
              })}
            >
              Proceed to Checkout
            </Button>
            {warnings.some((w) => {
              const p = w.item.product;
              const sv = p?.sizes?.find((s) => s.size === w.item.size);
              return !p || !p.isActive || !sv || sv.stock <= 0;
            }) && (
              <p className="text-xs text-error text-center">Remove out-of-stock items before checking out.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
