import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import ProductQuickViewModal from '../components/common/ProductQuickViewModal';
import { Search, Heart, Eye, ShoppingBag, Check, SlidersHorizontal } from 'lucide-react';

const mockCatalog = [
  {
    _id: 'p1',
    title: 'Urban Cyberpunk Oversized Hoodie',
    price: 85.00,
    originalPrice: 110.00,
    category: 'Streetwear & Hoodies',
    gender: 'MEN',
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
    gender: 'MEN',
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
    gender: 'WOMEN',
    sizes: ['XS', 'S', 'M', 'L'],
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
    gender: 'UNISEX',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Tan'],
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600',
    stockCount: 22,
    rating: 4.7
  },
  {
    _id: 'p5',
    title: 'StyleHub Edition Silk Evening Trench Coat',
    price: 195.00,
    originalPrice: 240.00,
    category: 'Formal Wear',
    gender: 'WOMEN',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Cream', 'Beige'],
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600',
    stockCount: 8,
    rating: 4.9
  },
  {
    _id: 'p6',
    title: 'Street Culture Graphic Heavyweight Tee',
    price: 38.00,
    originalPrice: 50.00,
    category: 'Streetwear & Hoodies',
    gender: 'MEN',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Black'],
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600',
    stockCount: 30,
    rating: 4.6
  }
];

export default function Shop() {
  const { addToCart, toggleWishlist, isInWishlist, selectedDepartment, setSelectedDepartment } = useContext(CartContext);
  const location = useLocation();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [maxPrice, setMaxPrice] = useState(300);
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  const categories = ['All', 'Streetwear & Hoodies', 'Formal Wear', 'Casual & Denim', 'Luxury Accessories'];
  const colors = ['All', 'Black', 'White', 'Charcoal', 'Navy Blue', 'Indigo Blue', 'Cream'];
  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const filtered = mockCatalog.filter(p => {
    const matchesDept = selectedDepartment === 'ALL' || p.gender === selectedDepartment || p.gender === 'UNISEX';
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesColor = selectedColor === 'All' || p.colors.includes(selectedColor);
    const matchesSize = selectedSize === 'All' || p.sizes.includes(selectedSize);
    const matchesPrice = p.price <= maxPrice;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWishlist = !showWishlistOnly || isInWishlist(p._id);

    return matchesDept && matchesCat && matchesColor && matchesSize && matchesPrice && matchesSearch && matchesWishlist;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  return (
    <div className="space-y-8 animate-fade-in py-4 w-full bg-[#fafafa] text-slate-900">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 w-full">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest">
              Executive Fashion Catalog
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">Apparel Catalog</h1>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog clothes, suits, hoodies..."
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full">
        
        {/* Multi-Filter Sidebar */}
        <div className="bg-[#f8fafc] p-6 rounded-3xl border border-slate-200 space-y-6 h-fit lg:col-span-1 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-900" /> Refine & Filter
            </h3>
            <button 
              onClick={() => {
                setSelectedCategory('All');
                setSelectedColor('All');
                setSelectedSize('All');
                setMaxPrice(300);
                setSearchQuery('');
                setShowWishlistOnly(false);
              }}
              className="text-[11px] text-slate-900 hover:underline font-semibold uppercase tracking-wider"
            >
              Reset
            </button>
          </div>

          {/* Department Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">Department</label>
            <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
              {['ALL', 'WOMEN', 'MEN'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`py-1.5 rounded-lg transition-all ${
                    selectedDepartment === dept ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">Category</label>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === cat ? 'bg-slate-900 text-white font-bold border border-slate-900' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-900">
              <span>Max Price</span>
              <span className="text-slate-900">${maxPrice}</span>
            </div>
            <input 
              type="range" 
              min="20" 
              max="300" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))} 
              className="w-full accent-slate-900 cursor-pointer"
            />
          </div>

          {/* Size Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">Size</label>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                    selectedSize === sz ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">Color</label>
            <select 
              value={selectedColor} 
              onChange={(e) => setSelectedColor(e.target.value)} 
              className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900 shadow-sm"
            >
              {colors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Wishlist Filter Toggle */}
          <button
            onClick={() => setShowWishlistOnly(!showWishlistOnly)}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
              showWishlistOnly 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-white text-slate-700 border-slate-200 hover:text-slate-900'
            }`}
          >
            <Heart className={`w-4 h-4 ${showWishlistOnly ? 'fill-white' : ''}`} />
            {showWishlistOnly ? 'Showing Saved Wishlist' : 'Filter Saved Wishlist'}
          </button>

        </div>

        {/* Full Width Product Grid */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Sorting Bar */}
          <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span>Showing <strong className="text-slate-900">{filtered.length}</strong> fashion items</span>

            <div className="flex items-center gap-2">
              <span>Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              >
                <option value="featured">Featured Looks</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 text-xs shadow-sm">
              No clothing items matched your selected filters. Try resetting your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              {filtered.map((product) => {
                const wishlisted = isInWishlist(product._id);
                return (
                  <div key={product._id} className="glass-card glass-card-hover rounded-3xl overflow-hidden border border-slate-200 flex flex-col justify-between group bg-white">
                    
                    {/* 4:5 Image Container */}
                    <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white uppercase">
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
          )}

        </div>

      </div>

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
