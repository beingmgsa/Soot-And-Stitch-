import React from 'react';
import { MessageCircle, Eye, Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useCartAndWishlist } from '../lib/CartAndWishlistContext';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onDirectOrder: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onDirectOrder,
}) => {
  const { toggleWishlist, isInWishlist, addToCart } = useCartAndWishlist();
  const wishlisted = isInWishlist(product.id);

  return (
    <article className="group bg-[#FAF7F2] rounded-xl border border-[#E8DFC9] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:border-[#C4A265]/60 hover:-translate-y-1">
      {/* Product Image Area */}
      <div 
        className="relative aspect-[4/3] bg-[#EFE9DF] overflow-hidden cursor-pointer"
        onClick={() => onSelectProduct(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top Badges (Bestseller & Discount) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          {product.bestseller && (
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[#1C3325] text-[#FAF7F2] rounded shadow-xs">
              Bestseller
            </span>
          )}
          {product.discount && (
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[#B85C38] text-[#FAF7F2] rounded shadow-xs">
              {product.discount}
            </span>
          )}
        </div>

        {/* Heart Wishlist Button (Top Right) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-[#B85C38] z-10 ${
            wishlisted
              ? 'bg-white text-[#B85C38]'
              : 'bg-white/80 hover:bg-white text-[#1C3325]/70 hover:text-[#B85C38]'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart className={`w-4 h-4 transition-transform ${wishlisted ? 'fill-[#B85C38] scale-110' : 'hover:scale-110'}`} />
        </button>

        {/* Category Pill Tag */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 bg-[#FAF7F2]/85 backdrop-blur-xs text-[#1C3325] rounded-xs border border-[#E8DFC9]">
            {product.category}
          </span>
        </div>

        {/* Hover Quick View Overlay Button */}
        <div className="absolute inset-0 bg-[#1C3325]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] text-[#1C3325] text-xs font-medium rounded-full shadow-md">
            <Eye className="w-3.5 h-3.5 text-[#B85C38]" />
            <span>View Details</span>
          </span>
        </div>
      </div>

      {/* Product Info Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 
            onClick={() => onSelectProduct(product)}
            className="font-serif text-lg font-semibold text-[#1C3325] hover:text-[#B85C38] transition-colors cursor-pointer line-clamp-1"
            title={product.name}
          >
            {product.name}
          </h3>
          <p className="text-xs text-[#1C3325]/70 line-clamp-2 mt-1 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Color swatches preview */}
          {product.availableColors && product.availableColors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="text-[10px] text-[#1C3325]/60">Colors:</span>
              <div className="flex items-center gap-1">
                {product.availableColors.slice(0, 4).map((color, index) => (
                  <span
                    key={index}
                    className="w-3 h-3 rounded-full border border-black/15"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
                {product.availableColors.length > 4 && (
                  <span className="text-[10px] text-[#1C3325]/50">+{product.availableColors.length - 4}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-[#E8DFC9]/70 flex flex-col gap-2">
          {/* Price with old price strike-through & prepaid discount note */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-semibold text-[#1C3325] tabular-nums">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.oldPrice && (
                  <span className="text-xs text-[#1C3325]/50 line-through tabular-nums">
                    ₹{product.oldPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#B85C38] font-medium leading-none mt-0.5">
                ₹{Math.round(product.price * 0.9).toLocaleString('en-IN')} prepaid (10% off)
              </p>
            </div>
          </div>

          {/* CTA Buttons Row: Add to Cart + WhatsApp Order */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#1C3325] bg-white hover:bg-[#EFE9DF] border border-[#E8DFC9] rounded-md transition-colors shadow-2xs focus-visible:outline-2 focus-visible:outline-[#B85C38] cursor-pointer"
              title={`Add ${product.name} to cart`}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#B85C38]" />
              <span>Add to Bag</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDirectOrder(product);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#FAF7F2] bg-[#B85C38] hover:bg-[#9E4A28] rounded-md transition-colors shadow-xs focus-visible:outline-2 focus-visible:outline-[#B85C38] cursor-pointer"
              title={`Order ${product.name} on WhatsApp`}
              aria-label={`Order ${product.name} on WhatsApp`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Order</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
