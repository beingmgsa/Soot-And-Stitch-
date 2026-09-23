import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, CreditCard, Lock, Sparkles } from 'lucide-react';
import { PaymentInitiationParams } from '../utils/payment';
import { BRAND_CONFIG } from '../data/brand';

export const SimulatedPaymentModal: React.FC = () => {
  const [activeParams, setActiveParams] = useState<PaymentInitiationParams | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const handleOpen = (e: CustomEvent<PaymentInitiationParams>) => {
      setActiveParams(e.detail);
      setProcessing(false);
      setCompleted(false);
    };

    window.addEventListener('open-simulated-payment' as any, handleOpen);
    return () => window.removeEventListener('open-simulated-payment' as any, handleOpen);
  }, []);

  if (!activeParams) return null;

  const handleClose = () => {
    if (!processing) {
      if (activeParams.onDismiss) activeParams.onDismiss();
      setActiveParams(null);
    }
  };

  const handleConfirmPayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setCompleted(true);
      const generatedPayId = `rzp_test_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      setTimeout(() => {
        activeParams.onSuccess(generatedPayId);
        setActiveParams(null);
      }, 1200);
    }, 1500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={handleClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden z-10">
        {/* Razorpay branded top bar */}
        <div className="bg-[#0C2340] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-base">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-wide">Razorpay Gateway</span>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded font-mono">
                  SECURE
                </span>
              </div>
              <p className="text-[11px] text-white/70">{BRAND_CONFIG.brandName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={processing}
            className="p-1.5 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-5">
          {/* Amount banner */}
          <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DFC9] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#1C3325]/70 block font-medium">Payable Amount</span>
              <span className="text-xs font-semibold text-[#1C3325] truncate max-w-[200px] block">
                {activeParams.productName}
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-serif font-bold text-[#1C3325]">
                ₹{activeParams.amountInINR.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {completed ? (
            <div className="py-6 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#1C3325]">
                Payment Successful!
              </h3>
              <p className="text-xs text-[#1C3325]/70">
                Opening WhatsApp with your verified order details...
              </p>
            </div>
          ) : (
            <>
              {/* Payment Method Selector */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block">
                  Select Payment Method
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'upi', label: 'UPI / QR', icon: '⚡' },
                    { id: 'card', label: 'Cards', icon: '💳' },
                    { id: 'netbanking', label: 'Netbanking', icon: '🏛️' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethod(m.id as any)}
                      className={`py-2 px-3 rounded-lg border text-xs font-medium text-center transition-all flex flex-col items-center gap-1 ${
                        selectedMethod === m.id
                          ? 'border-[#0C2340] bg-[#0C2340]/5 text-[#0C2340] font-semibold'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      <span className="text-base">{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Method input details */}
              {selectedMethod === 'upi' ? (
                <div className="space-y-1.5 p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
                  <label className="text-xs font-medium text-neutral-700 block">
                    Enter UPI ID (GPay / PhonePe / Paytm / BHIM)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourname@oksbi"
                    className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <span className="text-[11px] text-neutral-500 block">
                    Auto-approved in sandbox mode.
                  </span>
                </div>
              ) : selectedMethod === 'card' ? (
                <div className="space-y-2 p-3.5 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-center gap-2 text-xs font-medium text-neutral-700">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Card payment (Visa, Mastercard, RuPay)</span>
                  </div>
                  <input
                    type="text"
                    disabled
                    value="•••• •••• •••• 4242"
                    className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded-md text-xs text-neutral-500 font-mono"
                  />
                </div>
              ) : (
                <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-600">
                  Select from HDFC, ICICI, SBI, Axis, or Kotak Bank.
                </div>
              )}

              {/* Pay Button */}
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={processing}
                className="w-full py-3 bg-[#0C2340] hover:bg-[#15345b] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing securely...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-blue-300" />
                    <span>Pay ₹{activeParams.amountInINR.toLocaleString('en-IN')} Now</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-bit SSL encrypted • Razorpay payment integration</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
