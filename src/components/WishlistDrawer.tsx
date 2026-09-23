import React, { useEffect } from 'react';
import {
  X,
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCartAndWishlist } from '../lib/CartAndWishlistContext';
import { Product } from '../types';

interface WishlistDrawerProps {
  onOpenProductDetails?: (product: Product) => void;
  onExploreCollection?: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  onOpenProductDetails,
  onExploreCollection,
}) => {
  const {
    wishlist,
    wishlistCount,
    removeFromWishlist,
    moveWishlistToCart,
    isWishlistOpen,
    setIsWishlistOpen,
    setIsCartOpen,
  } = useCartAndWishlist();

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isWishlistOpen) setIsWishlistOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWishlistOpen, setIsWishlistOpen]);

  if (!isWishlistOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Wishlist"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsWishlistOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] shadow-2xl border-l border-[#E8DFC9] flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E8DFC9] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-[#B85C38] fill-[#B85C38]" />
              <h2 className="font-serif text-lg font-bold text-[#1C3325]">
                Saved Favorites ({wishlistCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsWishlistOpen(false)}
              className="p-1.5 text-[#1C3325]/70 hover:text-[#B85C38] rounded-full hover:bg-[#EFE9DF] transition-colors"
              aria-label="Close wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Wishlist Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {wishlist.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#EFE9DF] flex items-center justify-center mx-auto text-[#1C3325]/40">
                  <Heart className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-serif text-lg font-semibold text-[#1C3325]">
                    Your wishlist is empty
                  </p>
                  <p className="text-xs text-[#1C3325]/60 max-w-xs mx-auto">
                    Click the heart icon on any cardigan, shrug, or sweater to save your favorite handknit pieces for later.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsWishlistOpen(false);
                    if (onExploreCollection) onExploreCollection();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1C3325] text-white hover:bg-[#284533] text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  <span>Explore Handknit Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C4A265]" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {wishlist.map(({ product }) => (
                  <div
                    key={product.id}
                    className="p-3.5 bg-white rounded-xl border border-[#E8DFC9] flex gap-3.5 items-center group relative hover:border-[#B85C38]/40 transition-colors"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover bg-[#EFE9DF] border border-[#E8DFC9] shrink-0 cursor-pointer"
                      onClick={() => {
                        if (onOpenProductDetails) {
                          setIsWishlistOpen(false);
                          onOpenProductDetails(product);
                        }
                      }}
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[10px] uppercase font-semibold text-[#B85C38] tracking-wider">
                        {product.category}
                      </span>
                      <h4
                        onClick={() => {
                          if (onOpenProductDetails) {
                            setIsWishlistOpen(false);
                            onOpenProductDetails(product);
                          }
                        }}
                        className="font-serif text-sm font-semibold text-[#1C3325] truncate cursor-pointer hover:text-[#B85C38]"
                        title={product.name}
                      >
                        {product.name}
                      </h4>

                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-xs text-[#1C3325] tabular-nums">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.oldPrice && (
                          <span className="text-[11px] text-[#1C3325]/50 line-through tabular-nums">
                            ₹{product.oldPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                        <span className="text-[10px] text-emerald-700 font-medium">
                          ₹{Math.round(product.price * 0.9).toLocaleString('en-IN')} prepaid
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-1.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            moveWishlistToCart(product);
                            setIsWishlistOpen(false);
                            setIsCartOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1C3325] hover:bg-[#284533] text-white text-[11px] font-semibold rounded-md shadow-xs transition-colors"
                        >
                          <ShoppingBag className="w-3 h-3 text-[#C4A265]" />
                          <span>Move to Bag</span>
                        </button>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(product.id)}
                      className="self-start p-1.5 text-[#1C3325]/40 hover:text-rose-600 rounded-md transition-colors"
                      title="Remove from favorites"
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer note */}
          {wishlist.length > 0 && (
            <div className="p-4 bg-white border-t border-[#E8DFC9] flex items-center justify-between">
              <span className="text-xs text-[#1C3325]/70">
                {wishlist.length} item{wishlist.length > 1 ? 's' : ''} saved
              </span>
              <button
                type="button"
                onClick={() => {
                  // Move all items to cart
                  wishlist.forEach((item) => moveWishlistToCart(item.product));
                  setIsWishlistOpen(false);
                  setIsCartOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B85C38] hover:text-[#9A4625]"
              >
                <span>Move All to Bag</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
