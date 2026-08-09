import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { getWishlist, removeFromWishlist } from '../api/wishlist';
import { useFetch } from '../hooks/useFetch';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ui/ToastProvider';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

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

export default function WishlistPage() {
  const { toast } = useToast();
  const { addItem } = useCart();

  const { data, loading, error, refetch } = useFetch(
    useCallback(() => getWishlist(), [])
  );

  // Server returns wishlist as populated product array
  const products = data?.wishlist || [];

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      toast('Removed from wishlist.', 'info');
      refetch();
    } catch {
      toast('Failed to remove item.', 'error');
    }
  };

  const handleAddToCart = async (product) => {
    // Pick first available size, or prompt user to view the product if there are multiple sizes
    const availableSize = product.sizes?.find((s) => s.stock > 0);
    if (!availableSize) {
      toast(`${product.name} is currently out of stock.`, 'warning');
      return;
    }
    if (product.sizes?.filter((s) => s.stock > 0).length > 1) {
      toast('This product has multiple sizes — please select one on the product page.', 'info');
      return;
    }
    try {
      await addItem(product._id, availableSize.size, 1);
      toast(`${product.name} added to cart!`, 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to add to cart.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <h1 className="text-3xl font-serif text-primary mb-8">My Wishlist</h1>

      {error ? (
        <div className="text-center py-20 text-error font-sans border border-dashed border-error/30 rounded bg-error/5">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 font-sans">
          <Heart size={40} className="mx-auto text-border mb-4" />
          <p className="text-secondary">Your wishlist is empty.</p>
          <Link
            to="/products"
            className="inline-block mt-4 text-sm text-primary underline hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {products.map((product) => {
            if (!product?._id) return null;
            const finalPrice = computePrice(product);
            const isDiscounted = finalPrice < product.basePrice;
            const img = product.imageFileIds?.length
              ? `${API}/products/${product._id}/images/${product.imageFileIds[0]}`
              : null;
            const inStock = product.sizes?.some((s) => s.stock > 0);

            return (
              <div key={product._id} className="group flex flex-col font-sans">
                {/* Image */}
                <div className="relative aspect-[3/4] bg-background rounded overflow-hidden border border-border">
                  <Link
                    to={`/products/${product._id}`}
                    className="block w-full h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-secondary text-sm">No image</div>
                    )}
                  </Link>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(product._id)}
                    aria-label={`Remove ${product.name} from wishlist`}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-surface/80 hover:bg-surface text-secondary hover:text-error transition-colors shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <Heart size={16} className="fill-current" />
                  </button>

                  {!inStock && (
                    <div className="absolute bottom-0 inset-x-0 bg-primary/70 text-surface text-xs text-center py-1 font-medium">
                      Out of stock
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="mt-3 flex flex-col flex-1 gap-2">
                  <Link
                    to={`/products/${product._id}`}
                    className="text-sm font-medium text-primary hover:text-accent transition-colors line-clamp-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                  >
                    {product.name}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">${finalPrice.toFixed(2)}</span>
                    {isDiscounted && (
                      <span className="text-xs text-secondary line-through">${product.basePrice.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Quick add to cart */}
                  {inStock ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      fullWidth
                      onClick={() => handleAddToCart(product)}
                      className="mt-auto"
                    >
                      <ShoppingCart size={14} />
                      Add to Cart
                    </Button>
                  ) : (
                    <Link
                      to={`/products/${product._id}`}
                      className="text-xs text-center text-secondary hover:text-primary underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded mt-auto"
                    >
                      View product
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
