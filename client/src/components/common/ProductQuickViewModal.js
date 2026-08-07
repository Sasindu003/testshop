import React, { useState, useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { X, ShoppingBag, Heart, Star, Check, Truck, RefreshCw } from 'lucide-react';

export default function ProductQuickViewModal({ product, onClose }) {
  const { addToCart, toggleWishlist, isInWishlist } = useContext(CartContext);
  const [selectedSize, setSelectedSize] = useState(product ? (product.sizes[0] || 'M') : 'M');
  const [selectedColor, setSelectedColor] = useState(product ? (product.colors[0] || 'Black') : 'Black');
  const [activeImage, setActiveImage] = useState(product ? (product.images && product.images[0] ? product.images[0] : product.image) : '');
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const isWishlisted = isInWishlist(product._id);
  const displayImage = activeImage || product.image;
  const imageGallery = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, 1);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 text-slate-900">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Image Section */}
        <div className="p-6 bg-slate-50 flex flex-col justify-between space-y-4">
          <div className="relative h-80 md:h-[420px] rounded-2xl overflow-hidden bg-white border border-slate-200">
            <img 
              src={displayImage} 
              alt={product.title} 
              className="w-full h-full object-cover"
            />
            {product.stockCount <= 5 && (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                Low Stock: Only {product.stockCount} left!
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {imageGallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {imageGallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    displayImage === img ? 'border-blue-600 scale-105' : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info Section */}
        <div className="p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                {product.category}
              </span>
              <button 
                onClick={() => toggleWishlist(product)}
                className={`p-2 rounded-full border transition-all ${
                  isWishlisted 
                    ? 'bg-pink-50 text-pink-600 border-pink-200' 
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-pink-600' : ''}`} />
              </button>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{product.title}</h2>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-base text-slate-400 line-through">${product.originalPrice.toFixed(2)}</span>
              )}
              {product.originalPrice && (
                <span className="text-xs font-bold text-blue-700 px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                  SAVE ${(product.originalPrice - product.price).toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-amber-500" />
                <span className="ml-1 text-slate-900 font-bold">{product.rating || 4.9}</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">Fits true to size</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {product.description || 'Premium modern fashion apparel. Crafted from high-durability fabric with comfortable tailoring.'}
            </p>

            {/* Size Chips */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">Select Size</label>
              <div className="flex flex-wrap gap-2">
                {(product.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL']).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedSize === size
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">Color: <span className="text-blue-600">{selectedColor}</span></label>
              <div className="flex items-center gap-3">
                {(product.colors || ['Black', 'Navy', 'White', 'Charcoal']).map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedColor === color
                        ? 'bg-slate-950 text-white border-slate-950'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Actions */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <button
              onClick={handleAddToCart}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all ${
                added 
                  ? 'bg-emerald-600 shadow-lg' 
                  : 'gradient-button shadow-xl'
              }`}
            >
              {added ? (
                <><Check className="w-5 h-5 text-white" /> Added to Shopping Bag!</>
              ) : (
                <><ShoppingBag className="w-5 h-5" /> ADD TO BAG</>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-600" /> Free Express Delivery
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" /> 30-Day Free Returns
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
