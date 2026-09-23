import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { getWhatsAppGeneralInquiryUrl } from '../utils/whatsapp';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex items-end flex-col gap-2">
      {/* Friendly subtle boutique tooltip on mobile/desktop */}
      {showTooltip && (
        <div className="bg-[#FAF7F2] text-[#1C3325] text-xs py-2 px-3 rounded-xl shadow-lg border border-[#E8DFC9] flex items-center gap-2 max-w-[210px] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="leading-tight">
            Order or ask directly via <span className="font-semibold text-[#1C3325]">WhatsApp</span>
          </span>
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            className="text-[#1C3325]/50 hover:text-[#1C3325] p-0.5 rounded-full"
            aria-label="Dismiss WhatsApp hint"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={getWhatsAppGeneralInquiryUrl('Hello Soot & Stitch! I have a question about your cardigans.')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Soot & Stitch on WhatsApp"
        className="group relative flex items-center justify-center w-14 h-14 bg-[#1C3325] hover:bg-[#284533] text-[#FAF7F2] rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-[#C4A265] focus-visible:outline-3 focus-visible:outline-[#B85C38]"
        title="Chat with us on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-[#FAF7F2] group-hover:rotate-12 transition-transform" />

        {/* Pulsing indicator ring */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C4A265] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#C4A265]"></span>
        </span>
      </a>
    </div>
  );
};
