import React from 'react';
import { ProductCategory } from '../types';
import imgCardigan from '../assets/images/collection_everyday_cardigan_1790149766682.jpg';
import imgShrug from '../assets/images/product_shrug_knit_1790149863156.jpg';
import imgSweater from '../assets/images/product_sweater_pullover_1790149896060.jpg';
import imgKidswear from '../assets/images/product_kidswear_knit_1790149880571.jpg';
import imgCustom from '../assets/images/collection_custom_knitwear_1790149818760.jpg';

interface OurCategoriesProps {
  onSelectCategory: (category: ProductCategory) => void;
  onOpenCustomOrder: () => void;
}

export const OurCategories: React.FC<OurCategoriesProps> = ({
  onSelectCategory,
  onOpenCustomOrder,
}) => {
  const categories = [
    {
      name: 'Cardigans' as ProductCategory,
      label: 'Cardigans',
      image: imgCardigan,
      count: '4 Styles',
      action: () => onSelectCategory('Cardigans'),
    },
    {
      name: 'Shrugs' as ProductCategory,
      label: 'Shrugs',
      image: imgShrug,
      count: 'Cocoon Cuts',
      action: () => onSelectCategory('Shrugs'),
    },
    {
      name: 'Sweaters' as ProductCategory,
      label: 'Sweaters',
      image: imgSweater,
      count: 'Pullover Knits',
      action: () => onSelectCategory('Sweaters'),
    },
    {
      name: 'Kidswear' as ProductCategory,
      label: 'Kidswear',
      image: imgKidswear,
      count: 'Soft & Gentle',
      action: () => onSelectCategory('Kidswear'),
    },
    {
      name: 'Custom Orders' as ProductCategory,
      label: 'Custom Orders',
      image: imgCustom,
      count: 'Bespoke Fit',
      action: onOpenCustomOrder,
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-[#FAF7F2] border-b border-[#E8DFC9]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <span className="text-xs uppercase tracking-widest text-[#B85C38] font-semibold">
            Boutique Department
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-[#1C3325] mt-1">
            Our Categories
          </h2>
          <p className="text-xs sm:text-sm text-[#1C3325]/70 mt-1.5">
            Select a category to explore handcrafted knits tailored for warmth and elegance.
          </p>
        </div>

        {/* Round category icons row */}
        <div className="flex items-center justify-between sm:justify-center gap-3 sm:gap-8 overflow-x-auto pb-4 no-scrollbar px-2">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              type="button"
              onClick={cat.action}
              className="group flex flex-col items-center shrink-0 w-20 sm:w-28 text-center focus-visible:outline-2 focus-visible:outline-[#B85C38] rounded-xl p-1"
            >
              {/* Round Category Icon Container */}
              <div className="relative w-16 h-16 sm:w-22 sm:h-22 rounded-full p-1 border-2 border-[#E8DFC9] group-hover:border-[#B85C38] transition-all duration-300 group-hover:shadow-md bg-white">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#EFE9DF]">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Title & Count */}
              <span className="font-serif text-sm sm:text-base font-semibold text-[#1C3325] group-hover:text-[#B85C38] transition-colors mt-2 leading-tight">
                {cat.label}
              </span>
              <span className="text-[10px] sm:text-xs text-[#1C3325]/50 group-hover:text-[#1C3325]/70 transition-colors">
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
