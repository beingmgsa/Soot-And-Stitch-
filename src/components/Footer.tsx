import React from 'react';
import { MessageCircle, Phone, Mail, MapPin, Heart, ArrowUp } from 'lucide-react';
import { BRAND_CONFIG } from '../data/brand';
import { getWhatsAppGeneralInquiryUrl } from '../utils/whatsapp';

interface FooterProps {
  onNavigateHome: () => void;
  onNavigateCatalog: (category?: string) => void;
  onOpenCustomOrder: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateHome,
  onNavigateCatalog,
  onOpenCustomOrder,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1C3325] text-[#FAF7F2] pt-14 pb-10 border-t border-[#16281D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand Info & Mission (Col 1-5) */}
          <div className="lg:col-span-5 space-y-4">
            <span className="font-serif text-3xl font-medium tracking-tight text-[#FAF7F2] block">
              {BRAND_CONFIG.brandName}
            </span>
            <p className="text-sm text-[#C4A265] italic font-serif">
              "{BRAND_CONFIG.tagline}"
            </p>
            <p className="text-xs sm:text-sm text-[#FAF7F2]/75 leading-relaxed max-w-md">
              An independent handmade knitwear boutique rooted in Bhilwara, Rajasthan. We craft heirloom-quality cardigans, shrugs, and winter warmers using soft sustainable yarns and traditional slow-knitting techniques.
            </p>

            <div className="pt-2">
              <a
                href={getWhatsAppGeneralInquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FAF7F2] text-[#1C3325] hover:bg-[#FAF7F2]/90 rounded-md font-medium text-xs shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-[#B85C38]"
              >
                <MessageCircle className="w-4 h-4 text-[#B85C38]" />
                <span>Contact via WhatsApp (+91 83026 25173)</span>
              </a>
            </div>

            <div className="pt-3 border-t border-[#FAF7F2]/10 space-y-1 text-[11px] text-[#FAF7F2]/70">
              <p className="font-semibold text-[#C4A265]">Transparent Order & Payment Policy:</p>
              <p>• <strong>Prepaid:</strong> 10% instant discount applied at online checkout.</p>
              <p>• <strong>Cash on Delivery (COD):</strong> 35% advance required to begin handcrafting your made-to-order piece; 65% payable on delivery.</p>
            </div>
          </div>

          {/* Quick Links (Col 6-7) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C4A265]">
              Knitwear Collections
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#FAF7F2]/80">
              <li>
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="hover:text-[#C4A265] transition-colors"
                >
                  Home Showcase
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateCatalog('All')}
                  className="hover:text-[#C4A265] transition-colors"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateCatalog('Cardigans')}
                  className="hover:text-[#C4A265] transition-colors"
                >
                  Cardigans & Warmers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateCatalog('Shrugs')}
                  className="hover:text-[#C4A265] transition-colors"
                >
                  Cocoon Shrugs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateCatalog('Kidswear')}
                  className="hover:text-[#C4A265] transition-colors"
                >
                  Handknit Kidswear
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenCustomOrder}
                  className="text-[#C4A265] hover:underline transition-colors"
                >
                  Custom Sizing & Bespoke
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details & Address (Col 8-12) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C4A265]">
              Artisan Studio & Contact
            </h4>
            
            <div className="space-y-3 text-xs sm:text-sm text-[#FAF7F2]/80">
              {/* Full Address */}
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C4A265] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {BRAND_CONFIG.address.fullFormatted}
                </span>
              </div>

              {/* Phone & WhatsApp */}
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C4A265] shrink-0" />
                <a
                  href={`tel:${BRAND_CONFIG.phoneDisplay.replace(/\s+/g, '')}`}
                  className="hover:text-[#C4A265] transition-colors"
                >
                  {BRAND_CONFIG.phoneDisplay}
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C4A265] shrink-0" />
                <a
                  href={`mailto:${BRAND_CONFIG.email}`}
                  className="hover:text-[#C4A265] transition-colors"
                >
                  {BRAND_CONFIG.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Back to top & Slow Fashion statement */}
        <div className="pt-8 border-t border-[#FAF7F2]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF7F2]/60">
          <p>© {new Date().getFullYear()} Soot & Stitch. All rights reserved. Handcrafted in India. · <a href="/track" className="hover:text-[#C4A265] transition-colors underline">Track Order</a> · <a href="/admin" className="hover:text-[#C4A265] transition-colors underline">Admin Panel</a></p>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-[#FAF7F2]/75">
              <span>Made with care</span>
              <Heart className="w-3 h-3 text-[#B85C38] fill-[#B85C38]" />
              <span>in Bhilwara</span>
            </span>

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 hover:text-[#FAF7F2] transition-colors p-1"
              aria-label="Scroll to top of page"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
