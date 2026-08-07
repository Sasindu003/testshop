import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import ProductQuickViewModal from '../components/common/ProductQuickViewModal';
import { Sparkles, ArrowRight, Heart, Eye, ShoppingBag, Truck, RefreshCw, ShieldCheck, Tag, Cpu, Gem } from 'lucide-react';

const featuredProducts = [
  {
    _id: 'p1',
    title: 'Urban Cyberpunk Oversized Hoodie',
    price: 850.00,
    originalPrice: 110.00,
    category: 'Streetwear & Hoodies',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Charcoal'],
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600',
    stockCount: 14,
    rating: 4.9
  },
  {
    _id: 'p2',
    title: 'Tailored Italian Wool Suit Blazer',
    price: 240.00,
    originalPrice: 290.00,
    category: 'Formal Wear',
    sizes: ['M', 'L', 'XL'],
    colors: ['Navy Blue', 'Midnight Black'],
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
    stockCount: 6,
    rating: 5.0
  },
  {
    _id: 'p3',
    title: 'Vintage Japanese Selvedge Denim Jacket',
    price: 135.00,
    originalPrice: 160.00,
    category: 'Casual & Denim',
    sizes: ['S', 'M', 'L'],
    colors: ['Indigo Blue'],
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600',
    stockCount: 3,
    rating: 4.8
  },
  {
    _id: 'p4',
    title: 'Minimalist Matte Leather Crossbody Cap',
    price: 45.00,
    originalPrice: 60.00,
    category: 'Luxury Accessories',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Tan'],
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600',
    stockCount: 22,
    rating: 4.7
  },
  {
    _id: 'p5',
    title: 'Silk Evening Trench Coat',
    price: 195.00,
    originalPrice: 240.00,
    category: 'Formal Wear',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Cream', 'Navy'],
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600',
    stockCount: 8,
    rating: 4.9
  }
];

const categoryStories = [
  { name: 'Oversized Hoodies', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=200', tag: 'STREETWEAR' },
  { name: 'Tailored Suits', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200', tag: 'FORMAL' },
  { name: 'Denim Jackets', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=200', tag: 'CASUAL' },
  { name: 'Luxury Caps', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200', tag: 'ACCESSORIES' },
  { name: 'Footwear & Kicks', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200', tag: 'SHOES' }
];

export default function Home() {
  const { addToCart, toggleWishlist, isInWishlist } = useContext(CartContext);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  return (
    <div className="space-y-16 animate-fade-in py-4 w-full bg-[#fafafa] text-slate-900">
      
      {/* 1. Hero Dual Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        
        {/* Hero 1 */}
        <div className="relative rounded-3xl h-[500px] overflow-hidden group border border-slate-200 shadow-lg flex flex-col justify-end p-8 md:p-12">
          <img 
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200" 
            alt="New Season Streetwear" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.7]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent"></div>
          
          <div className="relative z-10 space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-slate-800 text-[#38bdf8] border border-slate-700 text-xs font-extrabold uppercase tracking-widest">
              AUTUMN / WINTER '26
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-none tracking-tight">
              STREETWEAR <br/><span className="text-sky-400">STATEMENT LOOKS</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-200 max-w-md font-light">
              Oversized hoodies, cyber cargo trousers, and vintage denim outerwear designed for modern urban fashion.
            </p>
            <div className="pt-2 flex gap-3">
              <Link to="/shop" className="px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest text-white gradient-button flex items-center gap-2 shadow-xl">
                DISCOVER COLLECTION <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Hero 2 */}
        <div className="relative rounded-3xl h-[500px] overflow-hidden group border border-slate-200 shadow-lg flex flex-col justify-end p-8 md:p-12">
          <img 
            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200" 
            alt="Tailored Suits" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.7]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent"></div>

          <div className="relative z-10 space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-slate-800 text-[#38bdf8] border border-slate-700 text-xs font-extrabold uppercase tracking-widest">
              THE SUIT & FORMAL EDIT
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-none tracking-tight">
              TAILORED <br/><span className="text-sky-400">ITALIAN SUITS</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-200 max-w-md font-light">
              Italian wool blazers, silk ties, and sharp tailored trousers designed for executive sophistication.
            </p>
            <div className="pt-2 flex gap-3">
              <Link to="/shop" className="px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest text-white bg-slate-900 border border-slate-700 hover:bg-blue-600 transition-all flex items-center gap-2">
                EXPLORE SUITS <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* 2. Trending Category Visual Circles Bar */}
      <section className="space-y-4 w-full">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Gem className="w-5 h-5 text-slate-900" /> Executive Fashion Categories
          </h3>
          <Link to="/shop" className="text-xs font-bold text-slate-900 hover:underline uppercase tracking-wider">
            VIEW ALL CATEGORIES →
          </Link>
        </div>

        <div className="flex items-center gap-8 overflow-x-auto pb-4 pt-2">
          {categoryStories.map((cat, idx) => (
            <Link key={idx} to="/shop" className="flex flex-col items-center gap-3 group shrink-0">
              <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-slate-900 to-slate-600 shadow-md group-hover:scale-105 transition-transform duration-300">
                <img src={cat.image} alt={cat.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
              </div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-slate-600 transition-colors tracking-wide">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Promo Banner */}
      <section className="glass-card rounded-3xl p-8 border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-[#0f172a] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden w-full text-white">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-sky-400 text-xs font-extrabold border border-slate-700 uppercase tracking-widest">
            <Tag className="w-3.5 h-3.5" /> EXCLUSIVE OFFER
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
            25% OFF EVERYTHING WITH CODE: <span className="text-sky-400 font-mono">STYLE25</span>
          </h3>
          <p className="text-xs text-slate-300 font-light">Applicable across new season jackets, suits, streetwear, and footwear.</p>
        </div>
        <Link to="/shop" className="px-8 py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-widest text-white gradient-button whitespace-nowrap shadow-xl z-10">
          SHOP THE SALE NOW
        </Link>
      </section>

      {/* 4. Full Screen Width 5-Column Product Grid */}
      <section className="space-y-6 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-wider">Curated Haute Couture</h2>
            <p className="text-xs text-slate-500">Hand-selected by StyleHub fashion editors</p>
          </div>
          <Link to="/shop" className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:border-slate-400 transition-all shadow-sm">
            VIEW ALL PRODUCTS
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full">
          {featuredProducts.map((product) => {
            const wishlisted = isInWishlist(product._id);
            return (
              <div key={product._id} className="glass-card glass-card-hover rounded-3xl overflow-hidden border border-slate-200 flex flex-col justify-between group bg-white">
                
                {/* 4:5 Aspect Ratio */}
                <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
                    {product.category}
                  </span>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                      wishlisted 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'bg-white/80 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
                  </button>

                  <button
                    onClick={() => setQuickViewProduct(product)}
                    className="absolute bottom-3 left-3 right-3 py-2.5 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl border border-white/10"
                  >
                    <Eye className="w-4 h-4 text-sky-400" /> QUICK VIEW
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-700 transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-lg font-extrabold text-slate-900">${product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">${product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Sizes: {product.sizes.join(', ')}</span>
                    <button
                      onClick={() => addToCart(product, product.sizes[0], product.colors[0], 1)}
                      className="px-3.5 py-1.5 rounded-xl gradient-button text-white font-bold flex items-center gap-1 shadow"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> ADD
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Service Perks */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 w-full">
        <div className="glass-card p-6 rounded-3xl border border-slate-200 flex items-center gap-4 bg-white">
          <div className="p-3 rounded-2xl bg-slate-100 text-slate-900 border border-slate-200">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Express Global Shipping</h4>
            <p className="text-xs text-slate-500">Complimentary on orders over $100</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200 flex items-center gap-4 bg-white">
          <div className="p-3 rounded-2xl bg-slate-100 text-slate-900 border border-slate-200">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">30-Day Free Returns</h4>
            <p className="text-xs text-slate-500">Hassle-free global returns</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200 flex items-center gap-4 bg-white">
          <div className="p-3 rounded-2xl bg-slate-100 text-slate-900 border border-slate-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Encrypted JWT Checkout</h4>
            <p className="text-xs text-slate-500">Protected financial transactions</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-200 flex items-center gap-4 bg-white">
          <div className="p-3 rounded-2xl bg-slate-100 text-slate-900 border border-slate-200">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">AI Outfit Stylist</h4>
            <p className="text-xs text-slate-500">Personalized recommendations</p>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickViewModal 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
        />
      )}

    </div>
  );
}
