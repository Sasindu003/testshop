import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

export default function ProductCard({ product }) {
  const imageUrl = product.imageFileIds?.length
    ? `${import.meta.env.VITE_API_URL}/products/${product._id}/images/${product.imageFileIds[0]}`
    : null;

  // Simplistic client-side price logic for display (assumes basePrice for thumbnail)
  // Real app might compute final price including discounts on the backend and return it
  const isDiscountActive =
    product.discount &&
    new Date(product.discount.activeFrom) <= new Date() &&
    new Date(product.discount.activeUntil) >= new Date();

  let displayPrice = product.basePrice;
  if (isDiscountActive) {
    if (product.discount.type === 'percentage') {
      displayPrice = displayPrice * (1 - product.discount.value / 100);
    } else {
      displayPrice = Math.max(0, displayPrice - product.discount.value);
    }
  }

  const hasDiscount = isDiscountActive && displayPrice < product.basePrice;

  return (
    <div className="group flex flex-col font-sans">
      <Link
        to={`/products/${product._id}`}
        className="block relative aspect-[3/4] bg-background rounded overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-secondary bg-surface border border-border">
            No Image
          </div>
        )}

        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-accent text-surface text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded">
            Sale
          </div>
        )}
      </Link>

      <div className="mt-4 flex flex-col flex-1">
        <Link
          to={`/products/${product._id}`}
          className="text-primary hover:text-accent font-medium text-sm line-clamp-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold text-primary">
            ${displayPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-secondary line-through">
              ${product.basePrice.toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs text-secondary">
          <Star size={12} className={product.ratingAverage > 0 ? "fill-accent text-accent" : "text-secondary"} />
          <span>
            {product.ratingAverage.toFixed(1)} ({product.ratingCount})
          </span>
        </div>
      </div>
    </div>
  );
}
