import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X, Sparkles } from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { ProductCard } from './ProductCard';

interface CatalogViewProps {
  products: Product[];
  initialCategory?: ProductCategory;
  onSelectProduct: (product: Product) => void;
  onDirectOrder: (product: Product) => void;
  onOpenCustomOrder: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  initialCategory = 'All',
  onSelectProduct,
  onDirectOrder,
  onOpenCustomOrder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  const categories: ProductCategory[] = [
    'All',
    'Cardigans',
    'Shrugs',
    'Sweaters',
    'Kidswear',
    'Custom Orders',
  ];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category match
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // Search match
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchesName = p.name.toLowerCase().includes(query);
          const matchesDesc = p.shortDescription.toLowerCase().includes(query) || p.fullDescription.toLowerCase().includes(query);
          const matchesCat = p.category.toLowerCase().includes(query);
          const matchesColor = p.availableColors.some(c => c.name.toLowerCase().includes(query));
          return matchesName || matchesDesc || matchesCat || matchesColor;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        // Default: bestsellers first, then featured
        if (a.bestseller && !b.bestseller) return -1;
        if (!a.bestseller && b.bestseller) return 1;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="py-8 sm:py-12 bg-[#FAF7F2] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Breadcrumb & Heading */}
        <div className="text-center sm:text-left border-b border-[#E8DFC9] pb-6">
          <span className="text-xs uppercase tracking-widest text-[#B85C38] font-semibold">
            Boutique Collection
          </span>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-1">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1C3325]">
              {selectedCategory === 'All' ? 'Complete Knitwear Catalog' : `${selectedCategory} Collection`}
            </h1>
            <p className="text-xs sm:text-sm text-[#1C3325]/70 tabular-nums">
              Showing {filteredProducts.length} handcrafted {filteredProducts.length === 1 ? 'piece' : 'pieces'}
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C3325]/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cardigans, colors, wool types..."
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#E8DFC9] rounded-lg text-xs sm:text-sm text-[#1C3325] placeholder-[#1C3325]/45 focus:outline-none focus:ring-2 focus:ring-[#B85C38]/40 focus:border-[#B85C38]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1C3325]/50 hover:text-[#1C3325]"
                  aria-label="Clear search text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-[#1C3325]/60 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-[#B85C38]" />
                <span>Sort by:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-white border border-[#E8DFC9] rounded-lg text-xs font-medium text-[#1C3325] focus:outline-none focus:ring-2 focus:ring-[#B85C38]/40 cursor-pointer"
              >
                <option value="featured">Featured & Bestsellers</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#1C3325] text-[#FAF7F2] shadow-xs'
                    : 'bg-white text-[#1C3325] border border-[#E8DFC9] hover:bg-[#EFE9DF]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Order Callout Card if Custom Orders category is clicked */}
        {selectedCategory === 'Custom Orders' && (
          <div className="p-6 bg-[#F5EFE6] rounded-2xl border border-[#C4A265]/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#B85C38]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bespoke Knitting Service</span>
              </div>
              <h3 className="font-serif text-2xl text-[#1C3325] font-semibold">
                Have specific sizing or color requirements?
              </h3>
              <p className="text-xs sm:text-sm text-[#1C3325]/75 max-w-xl">
                We handcraft cardigans tailored precisely to your chest circumference, sleeve length, preferred neckline, and button style.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenCustomOrder}
              className="px-6 py-3 bg-[#B85C38] hover:bg-[#9E4A28] text-white font-medium text-xs sm:text-sm rounded-lg whitespace-nowrap shadow-sm transition-all"
            >
              Start Custom Sizing Request
            </button>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
                onDirectOrder={onDirectOrder}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[#E8DFC9] space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#EFE9DF] mx-auto flex items-center justify-center text-[#1C3325]">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-medium text-[#1C3325]">
              No knitwear matching "{searchQuery}"
            </h3>
            <p className="text-xs sm:text-sm text-[#1C3325]/70 max-w-md mx-auto">
              We couldn't find any products matching your query in the {selectedCategory} category. Try clearing your search or switching categories.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-4 py-2 bg-[#1C3325] text-[#FAF7F2] rounded-md text-xs font-semibold hover:bg-[#284533] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
