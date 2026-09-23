import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Heart, ShoppingBag, Eye } from 'lucide-react';
import heroCardiganImg from '../assets/images/hero_handknit_cardigan_1790149747369.jpg';
import { Product } from '../types';
import { useCartAndWishlist } from '../lib/CartAndWishlistContext';
import { SAMPLE_PRODUCTS } from '../data/products';

interface HeroProps {
  onShopCollection: () => void;
  onCustomOrder: () => void;
  featuredProduct?: Product;
  onSelectProduct?: (product: Product) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onShopCollection,
  onCustomOrder,
  featuredProduct,
  onSelectProduct,
}) => {
  const { toggleWishlist, isInWishlist, addToCart } = useCartAndWishlist();
  const signatureProduct = featuredProduct || SAMPLE_PRODUCTS[0];
  const wishlisted = signatureProduct ? isInWishlist(signatureProduct.id) : false;

  return (
    <section className="relative overflow-hidden bg-[#F5EFE6] border-b border-[#E8DFC9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Content Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Boutique trust pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C3325]/5 border border-[#1C3325]/10 text-xs font-medium text-[#1C3325]">
              <Sparkles className="w-3.5 h-3.5 text-[#B85C38]" />
              <span>Artisan Handcrafted Knitwear · Small Batch Production</span>
            </div>

            {/* Headline with elegant serif */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-[#1C3325] leading-[1.15] text-balance">
              Handknit warmth, <br className="hidden sm:inline" />
              <span className="italic text-[#B85C38]">made with care.</span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-[#1C3325]/80 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Thoughtfully made cardigans for every cozy moment. Knitted stitch by stitch in Bhilwara, Rajasthan with pure wool and timeless silhouettes.
            </p>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <button
                type="button"
                onClick={onShopCollection}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#1C3325] hover:bg-[#284533] text-[#FAF7F2] font-medium text-sm rounded-md shadow-sm transition-all hover:translate-y-[-1px] active:translate-y-[0px] focus-visible:outline-2 focus-visible:outline-[#B85C38]"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-4 h-4 text-[#C4A265]" />
              </button>

              <button
                type="button"
                onClick={onCustomOrder}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FAF7F2] hover:bg-[#FAF7F2]/80 border border-[#1C3325]/20 text-[#1C3325] font-medium text-sm rounded-md transition-all focus-visible:outline-2 focus-visible:outline-[#B85C38]"
              >
                <span>Custom Sizing Request</span>
              </button>
            </div>

            {/* Micro guarantees */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-[#1C3325]/70">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#B85C38]" />
                <span>Zero online checkout hassle</span>
              </div>
              <span className="text-[#C4A265]" aria-hidden="true">·</span>
              <div>Direct artisan WhatsApp confirmation</div>
              <span className="text-[#C4A265]" aria-hidden="true">·</span>
              <div>All-India delivery</div>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative card frame with soft shadow */}
              <div 
                className="relative rounded-2xl overflow-hidden shadow-xl bg-white border border-[#E8DFC9] aspect-[4/3] sm:aspect-[4/3] lg:aspect-[4/3] cursor-pointer group"
                onClick={() => {
                  if (onSelectProduct && signatureProduct) onSelectProduct(signatureProduct);
                }}
              >
                <img
                  src={signatureProduct?.image || heroCardiganImg}
                  alt="Cozy handmade chunky knit cardigan by Soot & Stitch"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transform group-hover:scale-102 transition-transform duration-700 ease-out"
                />

                {/* Heart Wishlist Button on Hero Card */}
                {signatureProduct && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(signatureProduct);
                    }}
                    className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md z-10 ${
                      wishlisted
                        ? 'bg-white text-[#B85C38]'
                        : 'bg-white/85 hover:bg-white text-[#1C3325]/70 hover:text-[#B85C38]'
                    }`}
                    title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                    aria-label={wishlisted ? 'Remove hero cardigan from wishlist' : 'Save hero cardigan to wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${wishlisted ? 'fill-[#B85C38]' : ''}`} />
                  </button>
                )}
                
                {/* Floating soft card badge with Add to Bag button */}
                <div className="absolute bottom-3 left-3 right-3 bg-[#FAF7F2]/95 backdrop-blur-md rounded-xl p-3.5 border border-[#E8DFC9] shadow-md flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#B85C38]">Signature Piece</p>
                    <p className="font-serif text-sm sm:text-base text-[#1C3325] font-semibold truncate">
                      {signatureProduct?.name || 'The Everyday Cable Cardigan'}
                    </p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xs sm:text-sm font-semibold text-[#1C3325]">
                        ₹{signatureProduct?.price.toLocaleString('en-IN') || '2,499'}
                      </span>
                      {signatureProduct?.oldPrice && (
                        <span className="text-[11px] text-[#1C3325]/50 line-through">
                          ₹{signatureProduct.oldPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="text-[10px] text-emerald-700 font-medium">10% off prepaid</span>
                    </div>
                  </div>

                  {signatureProduct && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(signatureProduct);
                      }}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 bg-[#1C3325] hover:bg-[#284533] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                      title="Add signature piece to bag"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#C4A265]" />
                      <span className="hidden sm:inline">Add to Bag</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Artisan Note Tag */}
              <div className="absolute -top-3 -left-3 hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] border border-[#C4A265] rounded-full shadow-md text-xs font-medium text-[#1C3325]">
                <span className="w-2 h-2 rounded-full bg-[#1C3325] animate-pulse"></span>
                <span>100% Handknit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
