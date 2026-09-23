import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, MessageCircle } from 'lucide-react';
import { Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onDirectOrder: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onDirectOrder,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim()
    ? products.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.availableColors.some((c) => c.name.toLowerCase().includes(q))
        );
      })
    : products.slice(0, 4); // show quick suggestions if query is empty

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-20 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#E8DFC9] overflow-hidden z-10">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E8DFC9] flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-[#B85C38]" />
          <input
            ref={inputRef}
            type="text"
            id="search-modal-title"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by cardigan name, color, wool style..."
            className="flex-1 bg-transparent text-sm sm:text-base text-[#1C3325] placeholder-[#1C3325]/40 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-[#1C3325]/40 hover:text-[#1C3325]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-xs font-semibold text-[#1C3325]/60 hover:text-[#1C3325] bg-[#FAF7F2] rounded-md border border-[#E8DFC9]"
          >
            ESC
          </button>
        </div>

        {/* Quick Suggestion Pills if empty */}
        {!query && (
          <div className="px-5 py-3 bg-[#F5EFE6] border-b border-[#E8DFC9] flex items-center gap-2 text-xs text-[#1C3325]/70 overflow-x-auto no-scrollbar">
            <span className="font-semibold text-[#1C3325]">Popular:</span>
            {['Everyday Cardigan', 'Winter Warmer', 'Cocoon Shrug', 'Kidswear', 'Forest Green'].map(
              (term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="px-2.5 py-1 bg-white rounded-full border border-[#E8DFC9] text-xs hover:border-[#B85C38] hover:text-[#B85C38] transition-colors whitespace-nowrap"
                >
                  {term}
                </button>
              )
            )}
          </div>
        )}

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {results.length > 0 ? (
            results.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-white border border-transparent hover:border-[#E8DFC9] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#EFE9DF] shrink-0 border border-[#E8DFC9]">
                    <img
                      src={product.image}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B85C38]">
                        {product.category}
                      </span>
                      {product.bestseller && (
                        <span className="text-[9px] uppercase px-1.5 py-0.2 bg-[#1C3325] text-white rounded">
                          Bestseller
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif text-sm sm:text-base font-semibold text-[#1C3325] group-hover:text-[#B85C38] transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xs text-[#1C3325]/60 line-clamp-1">
                      {product.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-right">
                    <span className="text-sm font-semibold text-[#1C3325] tabular-nums block">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    {product.oldPrice && (
                      <span className="text-[10px] text-[#1C3325]/45 line-through tabular-nums">
                        ₹{product.oldPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDirectOrder(product);
                      onClose();
                    }}
                    className="p-2 bg-[#B85C38] hover:bg-[#9E4A28] text-white rounded-md transition-colors"
                    title="Order on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs sm:text-sm text-[#1C3325]/60">
              No results found for "{query}". Try searching for "Cardigan" or "Wool".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
