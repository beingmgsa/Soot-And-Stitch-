import React, { useState, useEffect } from 'react';
import {
  Search,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
  Phone,
  FileText,
} from 'lucide-react';
import { BoutiqueOrder, getOrderByTracking, normalizePhoneNumber } from '../lib/orders';
import { BRAND_CONFIG } from '../data/brand';

interface OrderTrackingPageProps {
  initialOrderId?: string;
  onNavigateHome: () => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  initialOrderId = '',
  onNavigateHome,
}) => {
  const [orderIdInput, setOrderIdInput] = useState<string>(initialOrderId);
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [order, setOrder] = useState<BoutiqueOrder | null>(null);
  const [searched, setSearched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If initialOrderId came from URL parameter, prefill it
  useEffect(() => {
    if (initialOrderId) {
      setOrderIdInput(initialOrderId);
    }
  }, [initialOrderId]);

  const handleTrackSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const cleanId = orderIdInput.trim().toUpperCase();
    const cleanPhone = phoneInput.trim();

    if (!cleanId) {
      setErrorMsg('Please enter your unique Order ID (e.g. SS-8291-AB).');
      return;
    }
    if (!cleanPhone) {
      setErrorMsg('Please enter the customer phone number used when placing the order for verification.');
      return;
    }

    try {
      setLoading(true);
      const res = await getOrderByTracking(cleanId, cleanPhone);
      setSearched(true);
      if (res) {
        setOrder(res);
      } else {
        setOrder(null);
        setErrorMsg('No order found matching this Order ID and Phone Number. Please double check both values.');
      }
    } catch (err) {
      setErrorMsg('Could not fetch tracking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Status step index mapping
  // 1. Order Placed
  // 2. Payment Pending
  // 3. Payment Verified
  // 4. Order Confirmed
  // 5. In Production
  // 6. Shipped
  // 7. Delivered
  const getStepIndex = (ord: BoutiqueOrder): number => {
    if (ord.orderStatus === 'Delivered') return 7;
    if (ord.orderStatus === 'Shipped') return 6;
    if (ord.orderStatus === 'In Production') return 5;
    if (ord.orderStatus === 'Order Confirmed') return 4;
    if (ord.paymentStatus === 'Verified') return 3;
    if (ord.paymentStatus === 'Payment Pending') return 2;
    return 1;
  };

  const steps = [
    { title: 'Order Placed', desc: 'Recorded in database' },
    { title: 'Payment Pending', desc: 'Awaiting WhatsApp payment' },
    { title: 'Payment Verified', desc: 'Verified by boutique artisan' },
    { title: 'Order Confirmed', desc: 'Ready for handcrafting' },
    { title: 'In Production', desc: 'Handknit in Bhilwara' },
    { title: 'Shipped', desc: 'Dispatched with tracking' },
    { title: 'Delivered', desc: 'Warmth delivered to you' },
  ];

  const currentStep = order ? getStepIndex(order) : 1;

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#B85C38] font-bold">
            Private Order Verification
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C3325] font-semibold">
            Track Your Handknit Order
          </h1>
          <p className="text-xs sm:text-sm text-[#1C3325]/75 max-w-md mx-auto">
            Enter your unique Order ID and the phone number provided at checkout to verify payment and production progress.
          </p>
        </div>

        {/* Search Box */}
        <form
          onSubmit={handleTrackSubmit}
          className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DFC9] shadow-sm space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1C3325] uppercase tracking-wider block">
                Order ID:
              </label>
              <input
                type="text"
                placeholder="e.g. SS-8742-X1"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl text-sm font-mono font-medium text-[#1C3325] focus:outline-none focus:ring-2 focus:ring-[#B85C38]/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1C3325] uppercase tracking-wider block">
                Customer Phone Number:
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl text-sm text-[#1C3325] focus:outline-none focus:ring-2 focus:ring-[#B85C38]/40"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-[#1C3325]/60 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Your order details remain strictly private & secure.</span>
            </span>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#1C3325] hover:bg-[#284533] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Searching Order...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5 text-[#C4A265]" />
                  <span>Check Live Status</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Order Details & Timeline Display */}
        {order && (
          <div className="bg-white rounded-2xl border border-[#E8DFC9] shadow-sm p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
            {/* Top Bar Status Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8DFC9] gap-4">
              <div>
                <span className="text-[11px] font-mono text-[#B85C38] font-bold uppercase tracking-wider block">
                  Order Reference
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C3325] flex items-center gap-2">
                  <span>{order.id}</span>
                </h2>
                <p className="text-xs text-[#1C3325]/70 mt-0.5">
                  Placed for: <span className="font-semibold text-[#1C3325]">{order.customerName}</span> (
                  {order.customerPhone})
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                    order.orderStatus === 'Order Confirmed'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : order.orderStatus === 'In Production'
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{order.orderStatus}</span>
                </span>
                <p className="text-[11px] text-[#1C3325]/60 mt-1">
                  Payment Status:{' '}
                  <span className={`font-semibold ${order.paymentStatus === 'Verified' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {order.paymentStatus}
                  </span>
                </p>
              </div>
            </div>

            {/* 7-Step Horizontal / Vertical Progress Timeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1C3325] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B85C38]" />
                <span>Production & Fulfillment Progress</span>
              </h3>

              <div className="relative pt-2 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 sm:gap-1">
                  {steps.map((st, idx) => {
                    const stepNum = idx + 1;
                    const isDone = currentStep >= stepNum;
                    const isCurrent = currentStep === stepNum;

                    return (
                      <div
                        key={st.title}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-between gap-1.5 ${
                          isCurrent
                            ? 'bg-[#1C3325] text-[#FAF7F2] border-[#1C3325] shadow-sm'
                            : isDone
                            ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                            : 'bg-[#FAF7F2]/60 text-neutral-400 border-neutral-200'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCurrent
                              ? 'bg-[#C4A265] text-[#1C3325]'
                              : isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-neutral-200 text-neutral-500'
                          }`}
                        >
                          {isDone && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                        </div>
                        <span className="text-[11px] font-bold leading-tight line-clamp-1">{st.title}</span>
                        <span className="text-[9px] opacity-80 leading-none">{st.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Product Summary Box */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#FAF7F2] border border-[#E8DFC9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {order.productImage && (
                  <img
                    src={order.productImage}
                    alt={order.productName}
                    className="w-16 h-16 rounded-xl object-cover border border-[#E8DFC9] bg-white shrink-0"
                  />
                )}
                <div className="space-y-1">
                  <h4 className="font-serif text-base font-semibold text-[#1C3325]">
                    {order.productName}
                  </h4>
                  <div className="flex flex-wrap gap-2 text-xs text-[#1C3325]/75">
                    <span>Size: <strong>{order.size}</strong></span>
                    <span>•</span>
                    <span>Color: <strong>{order.color}</strong></span>
                    <span>•</span>
                    <span>Qty: <strong>{order.quantity}</strong></span>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    order.paymentMethod === 'prepaid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.paymentMethod === 'prepaid' ? 'Prepaid Order (10% Discount Applied)' : 'COD Order (35% Advance)'}
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="text-right space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto">
                <div className="text-xs text-[#1C3325]/70">
                  Total Order Value: <strong className="text-[#1C3325]">₹{order.totalPrice.toLocaleString('en-IN')}</strong>
                </div>
                {order.paymentMethod === 'prepaid' ? (
                  <div className="text-xs font-semibold text-emerald-800">
                    Paid Online: ₹{order.advancePayable.toLocaleString('en-IN')} (Saved ₹{order.discountAmount.toLocaleString('en-IN')})
                  </div>
                ) : (
                  <div className="space-y-0.5 text-xs">
                    <div className="text-[#1C3325]">
                      Advance Paid: <strong>₹{order.advancePayable.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="text-amber-800 font-semibold">
                      Payable on Delivery: ₹{order.remainingCodAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Courier Tracking Info if dispatched */}
            {(order.trackingNumber || order.courierName) && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Truck className="w-4 h-4 text-blue-700" />
                  <span>Shipment Dispatch Details</span>
                </div>
                <p>Courier: <strong>{order.courierName || 'Standard Express'}</strong></p>
                <p>Tracking Reference: <strong className="font-mono">{order.trackingNumber}</strong></p>
              </div>
            )}

            {/* Need Help WhatsApp CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#1C3325]/70 border-t border-[#E8DFC9]">
              <span>Have a question about sizing or delivery timeline?</span>
              <a
                href={`https://wa.me/${BRAND_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                  `Hello Soot & Stitch! I am checking on my Order ${order.id} (${order.productName}). Could you please share an update?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1C3325] text-white rounded-lg hover:bg-[#284533] transition-colors font-medium"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#C4A265]" />
                <span>Message Boutique on WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Back to Home Button */}
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-xs text-[#1C3325]/70 hover:text-[#B85C38] font-medium underline underline-offset-4"
          >
            ← Return to Soot & Stitch Boutique Catalog
          </button>
        </div>
      </div>
    </div>
  );
};
