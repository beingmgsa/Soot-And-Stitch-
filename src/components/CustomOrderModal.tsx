import React, { useState } from 'react';
import { X, MessageCircle, Ruler, Sparkles, ShieldCheck } from 'lucide-react';
import { getWhatsAppCustomOrderUrl } from '../utils/whatsapp';

interface CustomOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomOrderModal: React.FC<CustomOrderModalProps> = ({ isOpen, onClose }) => {
  const [customerName, setCustomerName] = useState('');
  const [measurements, setMeasurements] = useState('');
  const [preferredColor, setPreferredColor] = useState('');
  const [yarnType, setYarnType] = useState('Pure Wool Blend');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = getWhatsAppCustomOrderUrl({
      name: customerName,
      measurements,
      preferredColor,
      yarnType,
      notes,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-order-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#E8DFC9] overflow-hidden z-10 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DFC9] bg-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B85C38]" />
            <h3 id="custom-order-title" className="font-serif text-xl font-semibold text-[#1C3325]">
              Custom Sizing & Bespoke Knitwear
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#1C3325]/70 hover:text-[#B85C38] rounded-full hover:bg-[#EFE9DF]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          <p className="text-xs text-[#1C3325]/75 leading-relaxed bg-[#F5EFE6] p-3 rounded-lg border border-[#E8DFC9]">
            Have a custom measurement or specific color in mind? Fill in your preferences below, and we will open a direct WhatsApp chat with our Bhilwara artisan to discuss yarn availability, timeline, and pricing.
          </p>

          <div className="space-y-1">
            <label className="font-semibold text-[#1C3325] block">
              Your Name:
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Radhika Sharma"
              className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFC9] rounded-lg text-[#1C3325] focus:outline-none focus:ring-2 focus:ring-[#B85C38]/40"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#1C3325] flex items-center justify-between">
              <span>Your Measurements / Desired Fit:</span>
              <span className="text-[11px] text-[#B85C38] font-normal flex items-center gap-1">
                <Ruler className="w-3 h-3" /> Chest, length, or sleeve in inches
              </span>
            </label>
            <textarea
              rows={2}
              value={measurements}
              onChange={(e) => setMeasurements(e.target.value)}
              placeholder="e.g. Chest 38 inches, Cardigan Length 22 inches, Arm length 23 inches, or oversized relaxed fit"
              className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFC9] rounded-lg text-[#1C3325] focus:outline-none focus:ring-2 focus:ring-[#B85C38]/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-[#1C3325] block">
                Preferred Colorway:
              </label>
              <input
                type="text"
                value={preferredColor}
                onChange={(e) => setPreferredColor(e.target.value)}
                placeholder="e.g. Sage Green, Cream, Terracotta"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFC9] rounded-lg text-[#1C3325] focus:outline-none focus:ring-2 focus:ring-[#B85C38]/40"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#1C3325] block">
                Yarn Preference:
              </label>
              <select
                value={yarnType}
                onChange={(e) => setYarnType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFC9] rounded-lg text-[#1C3325] focus:outline-none focus:ring-2 focus:ring-[#B85C38]/40 cursor-pointer"
              >
                <option value="Soft Merino Wool Blend">Soft Merino Wool Blend</option>
                <option value="100% Pure Wool">100% Pure Wool</option>
                <option value="Organic Cotton & Wool">Organic Cotton & Wool</option>
                <option value="Alpaca Fluffy Blend">Alpaca Fluffy Blend</option>
                <option value="Artisan Suggestion Needed">Recommend for my climate</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#1C3325] block">
              Additional Notes or Inspiration:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Would love wooden buttons, deep pockets, or extra high collar."
              className="w-full px-3.5 py-2.5 bg-white border border-[#E8DFC9] rounded-lg text-[#1C3325] focus:outline-none focus:ring-2 focus:ring-[#B85C38]/40"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1C3325] hover:bg-[#284533] text-[#FAF7F2] font-semibold text-sm rounded-xl shadow-md transition-all focus-visible:outline-2 focus-visible:outline-[#B85C38]"
            >
              <MessageCircle className="w-4 h-4 text-[#C4A265]" />
              <span>Send Custom Request to WhatsApp</span>
            </button>
            <p className="text-[11px] text-center text-[#1C3325]/60 mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>No online payment needed · We confirm availability directly on WhatsApp</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
