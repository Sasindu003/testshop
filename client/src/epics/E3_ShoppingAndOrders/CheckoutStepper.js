import React, { useState, useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { createOrderApi } from '../../api/orderApi';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, Tag, CreditCard, Check, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CheckoutStepper() {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    street: user?.addresses?.[0]?.street || '45 Galle Road',
    city: user?.addresses?.[0]?.city || 'Colombo 03',
    state: user?.addresses?.[0]?.state || 'Western Province',
    zipCode: user?.addresses?.[0]?.zipCode || '00300',
    country: user?.addresses?.[0]?.country || 'Sri Lanka'
  });
  const [couponCode, setCouponCode] = useState('STYLE25');
  const [discountPercent, setDiscountPercent] = useState(25);
  const [couponApplied, setCouponApplied] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const discountAmount = (cartTotal * discountPercent) / 100;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'STYLE25' || couponCode.toUpperCase() === 'LUXURY25') {
      setDiscountPercent(25);
      setCouponApplied(true);
    } else {
      alert('Invalid coupon code');
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    const orderItems = cartItems.map(item => ({
      product: item._id,
      title: item.title,
      quantity: item.quantity,
      price: item.price,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      image: item.image
    }));

    const payload = {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount: finalTotal
    };

    try {
      const res = await createOrderApi(token, payload);
      if (res.success) {
        clearCart();
        navigate('/profile', { state: { newOrder: res.order } });
      } else {
        alert(res.message || 'Order failed');
      }
    } catch (e) {
      alert('Error connecting to backend');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in py-4 text-slate-900">
      
      {/* Stepper Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 flex justify-between items-center bg-white shadow-sm">
        {[
          { id: 1, label: 'Shopping Bag', icon: ShoppingBag },
          { id: 2, label: 'Delivery Address', icon: MapPin },
          { id: 3, label: 'Payment & Coupon', icon: CreditCard }
        ].map((st) => (
          <div key={st.id} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
              step >= st.id ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-400'
            }`}>
              <st.icon className="w-5 h-5" />
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${step >= st.id ? 'text-slate-900' : 'text-slate-400'}`}>
              {st.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Cart Items Summary */}
      {step === 1 && (
        <div className="glass-card p-8 rounded-3xl border border-slate-200 space-y-6 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-3">
            Review Bag Items ({cartItems.length})
          </h2>

          <div className="space-y-4">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover border border-slate-200" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                    <p className="text-[11px] text-slate-500">Size: {item.selectedSize} | Color: {item.selectedColor}</p>
                    <p className="text-xs font-extrabold text-slate-900 mt-1">${item.price.toFixed(2)} × {item.quantity}</p>
                  </div>
                </div>
                <div className="font-extrabold text-sm text-slate-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Subtotal</span>
            <span className="text-xl font-extrabold text-slate-900">${cartTotal.toFixed(2)}</span>
          </div>

          <button 
            onClick={() => setStep(2)}
            className="w-full py-4 rounded-2xl gradient-button text-xs uppercase font-extrabold tracking-widest text-white flex items-center justify-center gap-2 shadow-xl"
          >
            PROCEED TO SHIPPING <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Delivery Address Selector */}
      {step === 2 && (
        <div className="glass-card p-8 rounded-3xl border border-slate-200 space-y-6 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-3">
            Delivery Shipping Address
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Street Address</label>
              <input 
                type="text" value={shippingAddress.street} 
                onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">City</label>
                <input 
                  type="text" value={shippingAddress.city} 
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Postal / Zip Code</label>
                <input 
                  type="text" value={shippingAddress.zipCode} 
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Country</label>
              <input 
                type="text" value={shippingAddress.country} 
                onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-200">
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-2xl bg-slate-100 text-xs font-bold text-slate-700">
              Back
            </button>
            <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-2xl gradient-button text-xs uppercase font-bold text-white shadow">
              Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Payment & Coupon */}
      {step === 3 && (
        <div className="glass-card p-8 rounded-3xl border border-slate-200 space-y-6 bg-white shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-3">
            Payment & Discount Confirmation
          </h2>

          {/* Coupon Code Engine */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
            <label className="block text-xs font-bold text-blue-900">Promo Code Discount</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="STYLE25"
                className="flex-1 bg-white border border-blue-200 rounded-xl py-2 px-3 text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none"
              />
              <button onClick={handleApplyCoupon} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">
                Apply Code
              </button>
            </div>
            {couponApplied && (
              <p className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Code STYLE25 Applied: 25% OFF Saved!
              </p>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">Payment Gateway</label>
            <div className="grid grid-cols-2 gap-3">
              {['Credit Card', 'Cash on Delivery'].map((pm) => (
                <button
                  key={pm}
                  onClick={() => setPaymentMethod(pm)}
                  className={`p-4 rounded-2xl border text-xs font-bold text-left transition-all ${
                    paymentMethod === pm ? 'bg-slate-900 text-white border-slate-900 shadow' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {/* Final Summary Calculation */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Cart Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-blue-700 font-bold">
              <span>25% Promo Discount</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span className="text-emerald-600 font-bold">FREE</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Final Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(2)} className="px-6 py-3 rounded-2xl bg-slate-100 text-xs font-bold text-slate-700">
              Back
            </button>
            <button 
              disabled={isSubmitting}
              onClick={handlePlaceOrder} 
              className="flex-1 py-4 rounded-2xl gradient-button text-xs uppercase font-extrabold tracking-widest text-white shadow-xl flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" /> {isSubmitting ? 'PLACING ORDER...' : 'PLACE ORDER NOW'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
