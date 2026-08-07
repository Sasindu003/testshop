import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import CheckoutStepper from '../epics/E3_ShoppingAndOrders/CheckoutStepper';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cartItems } = useContext(CartContext);

  if (cartItems.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-16 text-center space-y-4 border border-slate-200 bg-white max-w-2xl mx-auto my-12 shadow-sm text-slate-900">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Explore our latest streetwear, formal suits, denim jackets, and luxury accessories catalog.
        </p>
        <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-widest text-white gradient-button shadow-xl">
          EXPLORE CATALOG NOW <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return <CheckoutStepper />;
}
