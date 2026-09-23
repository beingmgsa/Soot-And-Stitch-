import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import imgEveryday from '../assets/images/collection_everyday_cardigan_1790149766682.jpg';
import imgWinter from '../assets/images/collection_winter_warmer_1790149785349.jpg';
import imgCropped from '../assets/images/collection_cropped_cardigan_1790149803756.jpg';
import imgCustom from '../assets/images/collection_custom_knitwear_1790149818760.jpg';

interface ShopByCollectionProps {
  onSelectCollection: (categoryOrTag: string) => void;
  onOpenCustomOrder: () => void;
}

export const ShopByCollection: React.FC<ShopByCollectionProps> = ({
  onSelectCollection,
  onOpenCustomOrder,
}) => {
  const collections = [
    {
      title: 'Everyday Cardigans',
      subtitle: 'Lightweight layers & classic cable knits for daily comfort',
      image: imgEveryday,
      action: () => onSelectCollection('Cardigans'),
      tag: 'Versatile Wear',
    },
    {
      title: 'Winter Warmers',
      subtitle: 'Dense honeycomb textures & heavy wool blends for cold days',
      image: imgWinter,
      action: () => onSelectCollection('Cardigans'),
      tag: 'Maximum Cozy',
    },
    {
      title: 'Cropped Cardigans',
      subtitle: 'Modern silhouettes designed to pair with high-waist styles',
      image: imgCropped,
      action: () => onSelectCollection('Cardigans'),
      tag: 'Boutique Cut',
    },
    {
      title: 'Custom Orders',
      subtitle: 'Bespoke handknit cardigans tailored to your exact measurements',
      image: imgCustom,
      action: onOpenCustomOrder,
      tag: 'Made to Measure',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-[#F5EFE6] border-b border-[#E8DFC9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-[#B85C38] font-semibold">
            Curated Lines
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-[#1C3325] mt-1">
            Shop by Collection
          </h2>
          <p className="text-xs sm:text-sm text-[#1C3325]/70 mt-2">
            Explore our thoughtfully curated editions, knit for every climate and personal aesthetic.
          </p>
        </div>

        {/* Collection Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {collections.map((item, idx) => (
            <div
              key={idx}
              onClick={item.action}
              className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white border border-[#E8DFC9] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 aspect-[4/5] flex flex-col justify-end"
            >
              {/* Image Background */}
              <img
                src={item.image}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Gradient scrim overlay for perfect contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C3325]/90 via-[#1C3325]/40 to-transparent transition-opacity group-hover:from-[#1C3325]/95" />

              {/* Top Tag */}
              <div className="absolute top-3.5 left-3.5">
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 bg-[#FAF7F2]/90 text-[#1C3325] rounded-full backdrop-blur-xs">
                  {item.tag}
                </span>
              </div>

              {/* Bottom Card Content */}
              <div className="relative p-5 text-[#FAF7F2] space-y-1.5 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl sm:text-2xl font-medium leading-snug">
                    {item.title}
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-[#FAF7F2]/20 flex items-center justify-center text-[#FAF7F2] group-hover:bg-[#B85C38] transition-colors shrink-0 ml-2">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-[#FAF7F2]/80 line-clamp-2">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
