import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FeaturedProductsProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onDirectOrder: (product: Product) => void;
  onViewAll: () => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  onSelectProduct,
  onDirectOrder,
  onViewAll,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Filter to featured or bestsellers, fallback to first 6
  const featuredList = products.filter(p => p.featured || p.bestseller).slice(0, 6);

  return (
    <section className="py-12 sm:py-16 bg-[#FAF7F2] border-b border-[#E8DFC9]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#B85C38] font-semibold">
              Handknit Curations
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-[#1C3325] mt-1">
              Featured Cardigans & Warmers
            </h2>
            <p className="text-xs sm:text-sm text-[#1C3325]/70 mt-1 max-w-xl">
              Our most-loved artisanal silhouettes, handknitted with soft wool and finished with natural buttons.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Carousel navigation arrows */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="p-2 rounded-full border border-[#E8DFC9] bg-white text-[#1C3325] hover:bg-[#EFE9DF] hover:border-[#1C3325]/40 transition-colors focus-visible:outline-2 focus-visible:outline-[#B85C38]"
                aria-label="Scroll left in featured products"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="p-2 rounded-full border border-[#E8DFC9] bg-white text-[#1C3325] hover:bg-[#EFE9DF] hover:border-[#1C3325]/40 transition-colors focus-visible:outline-2 focus-visible:outline-[#B85C38]"
                aria-label="Scroll right in featured products"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#B85C38] hover:text-[#9A4625] transition-colors py-1"
            >
              <span>View All Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Mobile Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
        >
          {featuredList.map((product) => (
            <div
              key={product.id}
              className="w-[260px] sm:w-[290px] md:w-[310px] shrink-0 snap-start"
            >
              <ProductCard
                product={product}
                onSelectProduct={onSelectProduct}
                onDirectOrder={onDirectOrder}
              />
            </div>
          ))}
        </div>

        {/* Mobile Swipe Hint */}
        <div className="sm:hidden flex items-center justify-center gap-2 text-[11px] text-[#1C3325]/50 mt-2">
          <span>← Swipe horizontally to explore more →</span>
        </div>
      </div>
    </section>
  );
};
