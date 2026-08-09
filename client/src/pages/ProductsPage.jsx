import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import { getProducts, searchProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { usePagination } from '../hooks/usePagination';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Extract all params from URL
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const sizeParam = searchParams.get('size') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const hasDiscount = searchParams.get('hasDiscount') === 'true';
  const sort = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Pagination hook
  const { data: products, meta, loading, error, fetch } = usePagination(
    query ? searchProducts : getProducts,
    {},
    12
  );

  // Fetch products when URL changes
  useEffect(() => {
    const params = {
      category: categoryParam,
      size: sizeParam,
      minPrice,
      maxPrice,
      hasDiscount,
      sort,
    };
    if (query) {
      fetch(pageParam, { q: query, ...params });
    } else {
      fetch(pageParam, params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Fetch categories for sidebar
  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  // Update URL helper
  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === false || value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    // Reset to page 1 on filter changes (unless page is what we're updating)
    if (!updates.page) {
      newParams.delete('page');
    }
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Filters Sidebar Component ─────────────────────────────────────
  const FiltersContent = () => (
    <div className="space-y-8 font-sans">
      {/* Category */}
      <div>
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Category</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={!categoryParam}
              onChange={() => updateParams({ category: '' })}
              className="accent-accent"
            />
            <span className="text-sm text-secondary hover:text-primary transition-colors">All Categories</span>
          </label>
          {categories.map((cat) => (
            <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={categoryParam === cat._id}
                onChange={() => updateParams({ category: cat._id })}
                className="accent-accent"
              />
              <span className="text-sm text-secondary hover:text-primary transition-colors">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => updateParams({ size: sizeParam === s ? '' : s })}
              className={`w-10 h-10 flex items-center justify-center border text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded ${
                sizeParam === s
                  ? 'border-primary bg-primary text-surface'
                  : 'border-border bg-surface text-secondary hover:border-primary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => updateParams({ minPrice: e.target.value })}
            className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
          <span className="text-secondary">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => updateParams({ maxPrice: e.target.value })}
            className="w-full border border-border rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </div>
      </div>

      {/* Discount Only */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hasDiscount}
            onChange={(e) => updateParams({ hasDiscount: e.target.checked })}
            className="w-4 h-4 accent-accent rounded border-border focus:ring-accent"
          />
          <span className="text-sm font-medium text-primary">Sale items only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-serif text-primary">
            {query ? `Search: "${query}"` : 'All Products'}
          </h1>
          <p className="text-sm text-secondary font-sans mt-2">
            Showing {meta.total} result{meta.total !== 1 && 's'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 text-sm font-sans font-medium text-primary bg-surface border border-border px-4 py-2 rounded"
          >
            <Filter size={16} /> Filters
          </button>
          
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="border border-border rounded px-4 py-2 text-sm font-sans bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-24">
          <FiltersContent />
        </aside>

        {/* Mobile Filters Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden flex">
            <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
            <div className="relative w-full max-w-xs bg-surface h-full shadow-xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-serif text-primary">Filters</h2>
                <button onClick={() => setMobileFiltersOpen(false)} className="text-secondary hover:text-primary">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <FiltersContent />
              </div>
              <div className="p-4 border-t border-border bg-background">
                <Button fullWidth onClick={() => setMobileFiltersOpen(false)}>Show Results</Button>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1 w-full min-h-[50vh]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-error font-sans border border-dashed border-error/30 rounded bg-error/5">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-secondary font-sans border border-dashed border-border rounded">
              No products found matching your filters. Try adjusting your selection.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={meta.currentPage}
                  totalPages={meta.totalPages}
                  onPageChange={(page) => updateParams({ page })}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
