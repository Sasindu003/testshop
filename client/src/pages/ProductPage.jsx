import React, { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProductById } from '../api/products';
import { getProductReviews, createReview, updateReview, deleteReview } from '../api/reviews';
import { addToWishlist, removeFromWishlist } from '../api/wishlist';
import { useFetch } from '../hooks/useFetch';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ui/ToastProvider';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Helpers ──────────────────────────────────────────────────────────────────
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

function hasActiveDiscount(product) {
  if (!product?.discount) return false;
  const now = new Date();
  return new Date(product.discount.activeFrom) <= now && now <= new Date(product.discount.activeUntil);
}

// ── Image Gallery ─────────────────────────────────────────────────────────────
function Gallery({ productId, imageFileIds = [] }) {
  const [current, setCurrent] = useState(0);
  if (!imageFileIds.length) {
    return (
      <div className="aspect-[3/4] bg-background border border-border rounded-lg flex items-center justify-center text-secondary font-sans text-sm">
        No images available
      </div>
    );
  }
  const url = (id) => `${API}/products/${productId}/images/${id}`;
  const prev = () => setCurrent((i) => (i === 0 ? imageFileIds.length - 1 : i - 1));
  const next = () => setCurrent((i) => (i === imageFileIds.length - 1 ? 0 : i + 1));

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-[3/4] bg-background rounded-lg overflow-hidden border border-border">
        <img
          src={url(imageFileIds[current])}
          alt={`Product image ${current + 1}`}
          className="w-full h-full object-cover"
          loading="eager"
        />
        {imageFileIds.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-surface/80 hover:bg-surface p-1.5 rounded shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent transition"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface/80 hover:bg-surface p-1.5 rounded shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent transition"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>
      {/* Thumbnails */}
      {imageFileIds.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imageFileIds.map((id, i) => (
            <button
              key={id.toString()}
              onClick={() => setCurrent(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === current ? 'true' : undefined}
              className={`shrink-0 w-16 h-20 rounded overflow-hidden border-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                i === current ? 'border-primary' : 'border-transparent hover:border-border'
              }`}
            >
              <img src={url(id)} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Star Rating Input ─────────────────────────────────────────────────────────
function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          aria-pressed={n === value}
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
        >
          <Star
            size={22}
            className={
              n <= (hovered || value) ? 'fill-accent text-accent' : 'text-border'
            }
          />
        </button>
      ))}
    </div>
  );
}

// ── Reviews Section ───────────────────────────────────────────────────────────
function ReviewsSection({ product }) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [page, setPage] = useState(1);

  const fetchReviews = useCallback(
    (params) => getProductReviews(product._id, params),
    [product._id]
  );
  const { data: reviewsData, loading: reviewsLoading, refetch } = useFetch(
    fetchReviews,
    { page, limit: 5 },
  );

  const reviews = reviewsData?.reviews || [];
  const meta = reviewsData?.pagination || { currentPage: 1, totalPages: 1, total: 0 };
  const myReview = reviews.find((r) => r.customer?._id === user?._id);

  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editingId, setEditingId] = useState(null);

  const { execute: submitCreate, loading: creating } = useAsync(
    useCallback((data) => createReview(product._id, data), [product._id])
  );
  const { execute: submitUpdate, loading: updating } = useAsync(
    useCallback((data) => updateReview(product._id, editingId, data), [product._id, editingId])
  );
  const { execute: submitDelete, loading: deleting } = useAsync(
    useCallback((reviewId) => deleteReview(product._id, reviewId), [product._id])
  );

  const startEdit = (review) => {
    setEditingId(review._id);
    setRating(review.rating);
    setComment(review.comment);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRating(0);
    setComment('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { toast('Please select a rating.', 'warning'); return; }
    try {
      if (editingId) {
        await submitUpdate({ rating, comment });
        toast('Review updated.', 'success');
      } else {
        await submitCreate({ rating, comment });
        toast('Review submitted.', 'success');
      }
      cancelEdit();
      refetch({ page: 1, limit: 5 });
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to submit review.', 'error');
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await submitDelete(reviewId);
      toast('Review deleted.', 'success');
      refetch({ page: 1, limit: 5 });
    } catch {
      toast('Failed to delete review.', 'error');
    }
  };

  // Whether user can write a new review (eligible = purchased + delivered)
  const canReview = isAuthenticated && !myReview && !editingId;

  return (
    <section className="mt-12 pt-10 border-t border-border font-sans">
      <h2 className="text-2xl font-serif text-primary mb-6">
        Customer Reviews
        {meta.total > 0 && (
          <span className="ml-2 text-base text-secondary font-sans font-normal">
            ({meta.total})
          </span>
        )}
      </h2>

      {/* Review form */}
      {isAuthenticated ? (
        (canReview || editingId) && (
          <form onSubmit={handleSubmit} className="mb-8 p-5 bg-background rounded-lg border border-border space-y-4">
            <h3 className="font-medium text-primary text-sm uppercase tracking-wider">
              {editingId ? 'Edit your review' : 'Write a review'}
            </h3>
            <StarInput value={rating} onChange={setRating} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this product…"
              rows={3}
              className="w-full border border-border rounded px-3 py-2 text-sm bg-surface text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-none"
            />
            <div className="flex gap-3">
              <Button type="submit" size="sm" loading={creating || updating}>
                {editingId ? 'Update Review' : 'Submit Review'}
              </Button>
              {editingId && (
                <Button type="button" variant="secondary" size="sm" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
            <p className="text-xs text-secondary">
              You can only review a product you've purchased and received.
            </p>
          </form>
        )
      ) : (
        <p className="mb-6 text-sm text-secondary">
          <Link to="/login" className="text-primary underline hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">
            Sign in
          </Link>{' '}
          to write a review.
        </p>
      )}

      {/* Reviews list */}
      {reviewsLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : reviews.length === 0 ? (
        <p className="text-secondary text-sm py-8 text-center border border-dashed border-border rounded">
          No reviews yet. Be the first to share your experience!
        </p>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-border pb-5 last:border-b-0">
              <div className="flex items-center justify-between mb-2 gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={14} className={n <= review.rating ? 'fill-accent text-accent' : 'text-border'} />
                    ))}
                  </div>
                  <span className="text-xs text-secondary">
                    {review.customer?.name || 'Anonymous'} · {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {user?._id === review.customer?._id && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(review)}
                      className="text-xs text-secondary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(review._id)}
                      disabled={deleting}
                      className="text-xs text-error hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              {review.comment && <p className="text-sm text-primary leading-relaxed">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={meta.currentPage}
            totalPages={meta.totalPages}
            onPageChange={(p) => {
              setPage(p);
              refetch({ page: p, limit: 5 });
            }}
          />
        </div>
      )}
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();

  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  const { data, loading, error } = useFetch(
    useCallback(() => getProductById(id), [id])
  );
  const product = data?.product || null;

  // Determine stock for the selected size
  const sizeVariant = product?.sizes?.find((s) => s.size === selectedSize);
  const stock = sizeVariant?.stock ?? null;
  const outOfStock = stock !== null && stock <= 0;

  const finalPrice = computePrice(product);
  const discounted = product && hasActiveDiscount(product);

  const handleAddToCart = async () => {
    if (!selectedSize) { toast('Please select a size.', 'warning'); return; }
    if (outOfStock) return;
    try {
      await addItem(product._id, selectedSize, qty);
      toast(`${product.name} added to cart!`, 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to add to cart.', 'error');
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) { toast('Sign in to save to wishlist.', 'info'); return; }
    try {
      if (wishlisted) {
        await removeFromWishlist(product._id);
        setWishlisted(false);
        toast('Removed from wishlist.', 'info');
      } else {
        await addToWishlist(product._id);
        setWishlisted(true);
        toast('Saved to wishlist!', 'success');
      }
    } catch {
      toast('Failed to update wishlist.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans">
        <p className="text-error mb-4">{error || 'Product not found.'}</p>
        <Link to="/products" className="text-primary underline hover:text-accent">
          ← Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      {/* Breadcrumb */}
      <nav className="text-xs text-secondary font-sans mb-8" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-primary">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left: Gallery */}
        <Gallery productId={product._id} imageFileIds={product.imageFileIds} />

        {/* Right: Info */}
        <div className="flex flex-col font-sans">
          <h1 className="text-3xl lg:text-4xl font-serif text-primary mb-3">{product.name}</h1>

          {/* Rating */}
          {product.ratingCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={14} className={n <= Math.round(product.ratingAverage) ? 'fill-accent text-accent' : 'text-border'} />
                ))}
              </div>
              <span className="text-xs text-secondary">
                {product.ratingAverage.toFixed(1)} ({product.ratingCount} review{product.ratingCount > 1 ? 's' : ''})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-semibold text-primary">${finalPrice.toFixed(2)}</span>
            {discounted && (
              <>
                <span className="text-base text-secondary line-through">${product.basePrice.toFixed(2)}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-surface bg-accent px-2 py-0.5 rounded">
                  {product.discount.type === 'percentage'
                    ? `${product.discount.value}% off`
                    : `$${product.discount.value} off`}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-secondary leading-relaxed mb-6 text-sm">{product.description}</p>
          )}

          {/* Size selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                Size {selectedSize && <span className="text-accent">— {selectedSize}</span>}
              </h3>
            </div>

            {product.sizes?.length ? (
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(({ size, stock: s }) => {
                  const oos = s <= 0;
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => { if (!oos) { setSelectedSize(size); setQty(1); } }}
                      disabled={oos}
                      aria-label={`Size ${size}${oos ? ' — out of stock' : ''}`}
                      aria-pressed={isSelected}
                      className={`relative w-12 h-12 flex items-center justify-center rounded border text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
                        ${oos ? 'border-border text-border cursor-not-allowed bg-background line-through' : ''}
                        ${!oos && isSelected ? 'border-primary bg-primary text-surface' : ''}
                        ${!oos && !isSelected ? 'border-border hover:border-primary text-secondary hover:text-primary' : ''}
                      `}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-secondary">No sizes available.</p>
            )}

            {/* Per-size stock indicator */}
            {selectedSize && stock !== null && (
              <p className={`mt-3 text-xs font-medium ${outOfStock ? 'text-error' : stock <= 5 ? 'text-yellow-600' : 'text-success'}`}>
                {outOfStock ? 'Out of stock in this size.' : stock <= 5 ? `Only ${stock} left!` : 'In stock'}
              </p>
            )}
          </div>

          {/* Qty + Add to cart */}
          <div className="flex items-center gap-4 mb-4">
            {/* Qty stepper */}
            <div className="flex items-center border border-border rounded">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
                className="w-10 h-10 flex items-center justify-center text-secondary hover:text-primary disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-l"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-medium text-primary select-none" aria-live="polite">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => (stock !== null ? Math.min(stock, q + 1) : q + 1))}
                disabled={stock !== null && qty >= stock}
                aria-label="Increase quantity"
                className="w-10 h-10 flex items-center justify-center text-secondary hover:text-primary disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-r"
              >
                +
              </button>
            </div>

            <Button
              fullWidth
              onClick={handleAddToCart}
              disabled={!selectedSize || outOfStock}
              title={!selectedSize ? 'Select a size first' : outOfStock ? 'Out of stock' : undefined}
            >
              <ShoppingCart size={18} />
              {!selectedSize ? 'Select a size' : outOfStock ? 'Out of stock' : 'Add to Cart'}
            </Button>

            {/* Wishlist */}
            <button
              onClick={toggleWishlist}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="shrink-0 w-11 h-11 flex items-center justify-center border border-border rounded text-secondary hover:text-accent hover:border-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Heart size={20} className={wishlisted ? 'fill-accent text-accent' : ''} />
            </button>
          </div>

          {!selectedSize && (
            <p className="text-xs text-secondary mt-1" role="status">Select a size to check availability.</p>
          )}
        </div>
      </div>

      {/* Reviews */}
      <ReviewsSection product={product} />
    </div>
  );
}
