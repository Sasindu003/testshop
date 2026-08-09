import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { createOrder } from '../api/orders';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, loading: cartLoading, fetchCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const couponCode = location.state?.couponCode || null;
  const discountFromCart = location.state?.discountAmount || 0;

  // Address form
  const [address, setAddress] = useState({
    line1: user?.address?.line1 || '',
    line2: user?.address?.line2 || '',
    city: user?.address?.city || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'Sri Lanka',
  });

  // Payment slip
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [slipError, setSlipError] = useState(null);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [orderErrors, setOrderErrors] = useState(null); // out-of-stock items from API

  const handleAddressChange = (field) => (e) => {
    setAddress((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setSlipError(null);
    if (!file) { setPaymentSlip(null); return; }
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      setSlipError('File must be under 5 MB.');
      setPaymentSlip(null);
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
      setSlipError('Only JPEG, PNG, WebP, or PDF files are accepted.');
      setPaymentSlip(null);
      return;
    }
    setPaymentSlip(file);
  };

  // Subtotal from live cart data
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + computePrice(item.product) * item.quantity, 0);
  }, [items]);

  const total = Math.max(0, subtotal - discountFromCart);

  // OOS check
  const oosItems = useMemo(() => {
    return items.filter((item) => {
      const p = item.product;
      if (!p || !p.isActive) return true;
      const sv = p.sizes?.find((s) => s.size === item.size);
      return !sv || sv.stock < item.quantity;
    });
  }, [items]);

  const addressValid = address.line1.trim() && address.city.trim() && address.postalCode.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOrderErrors(null);

    if (!paymentSlip) {
      setSlipError('Payment slip is required to place an order.');
      toast('Please upload a payment slip.', 'warning');
      return;
    }
    if (!addressValid) {
      toast('Please complete the shipping address.', 'warning');
      return;
    }
    if (oosItems.length > 0) {
      toast('Remove out-of-stock items from your cart first.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('paymentSlip', paymentSlip);
    formData.append('shippingAddress', JSON.stringify(address));
    if (couponCode) formData.append('couponCode', couponCode);

    setSubmitting(true);
    try {
      const { data } = await createOrder(formData);
      toast('Order placed successfully!', 'success');
      await fetchCart(); // cart should now be empty
      navigate(`/orders/${data._id}`, { state: { justPlaced: true } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order.';
      const oosData = err.response?.data?.outOfStockItems;
      if (oosData?.length) {
        setOrderErrors(oosData);
      }
      toast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center font-sans">
        <h1 className="text-2xl font-serif text-primary mb-3">Nothing to check out</h1>
        <p className="text-secondary mb-6">Your cart is empty.</p>
        <Link
          to="/products"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded bg-primary text-surface text-sm font-sans font-medium hover:bg-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <h1 className="text-3xl font-serif text-primary mb-8">Checkout</h1>

      {/* OOS errors from server */}
      {orderErrors && (
        <div className="mb-6 p-4 bg-error/5 border border-error/20 rounded font-sans" role="alert">
          <div className="flex items-center gap-2 text-error text-sm font-medium mb-2">
            <AlertTriangle size={16} /> Some items are no longer available
          </div>
          {orderErrors.map((oos, i) => (
            <p key={i} className="text-xs text-error pl-6">
              {oos.name} ({oos.size}) — {oos.reason}
              {oos.availableStock !== undefined && ` (${oos.availableStock} available)`}
            </p>
          ))}
          <p className="text-xs text-secondary mt-2 pl-6">
            Go back to your <Link to="/cart" className="underline text-primary hover:text-accent">cart</Link> and update these items.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* ── Left: Forms ─────────────────────────────────────── */}
          <div className="flex-1 w-full space-y-8 font-sans">
            {/* Shipping address */}
            <section>
              <h2 className="text-lg font-serif text-primary mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <Input
                  label="Address Line 1"
                  placeholder="Street address"
                  value={address.line1}
                  onChange={handleAddressChange('line1')}
                  required
                  error={!address.line1.trim() ? undefined : undefined}
                />
                <Input
                  label="Address Line 2"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={address.line2}
                  onChange={handleAddressChange('line2')}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    placeholder="City"
                    value={address.city}
                    onChange={handleAddressChange('city')}
                    required
                  />
                  <Input
                    label="Postal Code"
                    placeholder="10100"
                    value={address.postalCode}
                    onChange={handleAddressChange('postalCode')}
                    required
                  />
                  <Input
                    label="Country"
                    value={address.country}
                    onChange={handleAddressChange('country')}
                  />
                </div>
              </div>
            </section>

            {/* Payment slip upload */}
            <section>
              <h2 className="text-lg font-serif text-primary mb-4">Payment Slip</h2>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
                  slipError ? 'border-error/50 bg-error/5' : paymentSlip ? 'border-success/50 bg-success/5' : 'border-border hover:border-accent/50'
                }`}
              >
                <input
                  type="file"
                  id="payment-slip"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <label
                  htmlFor="payment-slip"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {paymentSlip ? (
                    <>
                      <CheckCircle size={28} className="text-success" />
                      <span className="text-sm text-primary font-medium">{paymentSlip.name}</span>
                      <span className="text-xs text-secondary">Click to change</span>
                    </>
                  ) : (
                    <>
                      <Upload size={28} className="text-secondary" />
                      <span className="text-sm text-primary font-medium">Upload payment slip</span>
                      <span className="text-xs text-secondary">JPEG, PNG, WebP, or PDF — max 5 MB</span>
                    </>
                  )}
                </label>
              </div>
              {slipError && <p className="text-xs text-error mt-2 font-sans" role="alert">{slipError}</p>}
            </section>
          </div>

          {/* ── Right: Order summary ────────────────────────────── */}
          <div className="w-full lg:w-80 shrink-0 sticky top-24">
            <div className="border border-border rounded p-6 font-sans space-y-4 bg-surface">
              <h2 className="font-serif text-xl text-primary">Order Summary</h2>

              {/* Item list (compact) */}
              <div className="max-h-64 overflow-y-auto space-y-3 border-b border-border pb-4">
                {items.map((item) => {
                  const p = item.product;
                  if (!p) return null;
                  const price = computePrice(p);
                  const img = p.imageFileIds?.length
                    ? `${API}/products/${p._id}/images/${p.imageFileIds[0]}`
                    : null;
                  return (
                    <div key={`${p._id}-${item.size}`} className="flex gap-3 text-sm">
                      <div className="w-12 h-14 rounded overflow-hidden bg-background border border-border shrink-0">
                        {img ? (
                          <img src={img} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-secondary">—</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-primary font-medium truncate">{p.name}</p>
                        <p className="text-xs text-secondary">
                          {item.size} × {item.quantity}
                        </p>
                      </div>
                      <span className="text-primary font-medium shrink-0">
                        ${(price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between text-sm text-secondary">
                <span>Subtotal</span>
                <span className="text-primary font-medium">${subtotal.toFixed(2)}</span>
              </div>

              {discountFromCart > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Discount {couponCode && `(${couponCode})`}</span>
                  <span>−${discountFromCart.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-border pt-3 flex justify-between text-base font-semibold text-primary">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <Button
                type="submit"
                fullWidth
                loading={submitting}
                disabled={!paymentSlip || !addressValid || oosItems.length > 0}
              >
                Place Order
              </Button>

              {!paymentSlip && (
                <p className="text-xs text-error text-center" role="status">
                  Payment slip is required.
                </p>
              )}
              {oosItems.length > 0 && (
                <p className="text-xs text-error text-center" role="status">
                  Remove out-of-stock items from your cart first.
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
