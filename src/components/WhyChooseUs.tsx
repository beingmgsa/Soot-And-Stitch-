import React from 'react';
import { Heart, Feather, Ruler, MessageCircle } from 'lucide-react';
import { getWhatsAppGeneralInquiryUrl } from '../utils/whatsapp';

interface WhyChooseUsProps {
  onOpenCustomOrder: () => void;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ onOpenCustomOrder }) => {
  const points = [
    {
      icon: Heart,
      title: 'Handmade with care',
      description:
        'Every single cardigan is knitted stitch-by-stitch by skilled artisans in Bhilwara, Rajasthan. We never mass-manufacture; each piece is individually crafted with patience, durable seams, and hand-stitched natural wooden or coconut shell buttons.',
      highlight: 'Zero fast-fashion waste',
    },
    {
      icon: Feather,
      title: 'Made for comfort',
      description:
        'We select gentle, breathable, skin-friendly wool blends and natural fibers that provide cloud-soft warmth without heaviness, scratchiness, or stiffness. Cozy wear designed to be loved season after season.',
      highlight: 'Ultra-soft & non-itchy',
    },
    {
      icon: Ruler,
      title: 'Custom sizing available',
      description:
        'Standard sizes often fall short. Whether you prefer extra long sleeves, cropped body lengths, specific chest room, or bespoke colorways, we tailor garments directly to your personal measurements through WhatsApp.',
      highlight: 'Tailored to your body',
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[#F5EFE6] border-b border-[#E8DFC9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#B85C38] font-semibold">
            The Artisan Standard
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#1C3325] mt-1.5">
            Why Soot & Stitch
          </h2>
          <p className="text-sm text-[#1C3325]/75 mt-2">
            In a world of synthetic fast fashion, we champion the slow, thoughtful art of pure handknitting.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {points.map((pt, idx) => {
            const Icon = pt.icon;
            return (
              <div
                key={idx}
                className="bg-[#FAF7F2] rounded-2xl p-7 border border-[#E8DFC9] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div>
                  {/* Subtle top indicator */}
                  <div className="w-12 h-12 rounded-xl bg-[#1C3325]/5 border border-[#1C3325]/10 flex items-center justify-center text-[#B85C38] mb-5">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B85C38] block mb-1">
                    {pt.highlight}
                  </span>

                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#1C3325] mb-3">
                    {pt.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#1C3325]/75 leading-relaxed">
                    {pt.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#E8DFC9]/70 flex items-center justify-between">
                  <span className="text-xs font-serif italic text-[#1C3325]/60">0{idx + 1} · Heritage Craft</span>
                  {idx === 2 && (
                    <button
                      type="button"
                      onClick={onOpenCustomOrder}
                      className="text-xs font-semibold text-[#B85C38] hover:text-[#9A4625] underline underline-offset-2"
                    >
                      Request sizing
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Direct WhatsApp Callout Banner */}
        <div className="mt-12 bg-[#1C3325] text-[#FAF7F2] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="text-center sm:text-left space-y-1">
            <h4 className="font-serif text-xl sm:text-2xl text-[#FAF7F2]">
              Need a personalized recommendation?
            </h4>
            <p className="text-xs sm:text-sm text-[#FAF7F2]/80 max-w-xl">
              Connect directly with our knitwear maker in Bhilwara on WhatsApp. We share live yarn swatches, gauge measurements, and styling advice.
            </p>
          </div>

          <a
            href={getWhatsAppGeneralInquiryUrl('Hello Soot & Stitch! I would like some advice on choosing the right cardigan.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FAF7F2] text-[#1C3325] hover:bg-[#FAF7F2]/90 rounded-md font-semibold text-xs sm:text-sm whitespace-nowrap shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-[#B85C38]"
          >
            <MessageCircle className="w-4 h-4 text-[#B85C38]" />
            <span>Chat on WhatsApp (+91 83026 25173)</span>
          </a>
        </div>
      </div>
    </section>
  );
};
