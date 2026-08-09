import React from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../api/categories';
import { getProducts } from '../api/products';
import { useFetch } from '../hooks/useFetch';
import Spinner from '../components/ui/Spinner';
import ProductCard from '../components/ProductCard';
import Button from '../components/ui/Button';

export default function HomePage() {
  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useFetch(getCategories);

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useFetch(getProducts, { limit: 4, sort: 'newest' });

  const categories = categoriesData?.categories || [];
  const products = productsData?.products || productsData?.items || productsData?.docs || [];

  return (
    <div className="flex flex-col">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative bg-surface border-b border-border py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-primary mb-6 max-w-3xl leading-tight tracking-tight">
            Elevate your wardrobe with effortless style
          </h1>
          <p className="text-lg md:text-xl text-secondary max-w-2xl mb-10 font-sans">
            Discover a curated collection of premium fashion pieces designed for the modern individual.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/products"
              className="inline-flex h-12 items-center justify-center rounded px-8 font-sans font-medium bg-primary text-surface hover:bg-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Shop New Arrivals
            </Link>
            <Link
              to="/ai-stylist"
              className="inline-flex h-12 items-center justify-center rounded px-8 font-sans font-medium bg-surface text-primary border border-border hover:bg-background transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Try AI Stylist
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif text-primary mb-8 text-center">Shop by Category</h2>

          {categoriesLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : categoriesError ? (
            <div className="text-center py-12 text-error font-sans">
              Failed to load categories. Please try again later.
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-secondary font-sans border border-dashed border-border rounded">
              We haven't added any categories yet. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat._id}`}
                  className="group relative aspect-square bg-surface border border-border rounded overflow-hidden flex items-center justify-center p-4 hover:border-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span className="font-sans font-medium text-lg text-primary text-center group-hover:text-accent transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────────────────────── */}
      <section className="py-16 bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-serif text-primary">New Arrivals</h2>
            <Link
              to="/products"
              className="text-sm font-sans font-semibold text-primary hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
            >
              View All →
            </Link>
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : productsError ? (
            <div className="text-center py-12 text-error font-sans">
              Failed to load products. Please try again later.
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-secondary font-sans border border-dashed border-border rounded">
              No products found. We're restocking soon!
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
