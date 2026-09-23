import React, { useState, useEffect } from 'react';
import { X, Package, ExternalLink, MapPin, Phone, Sparkles, Clock, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { BoutiqueOrder, fetchUserOrders } from '../lib/orders';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTracking: (orderId?: string) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  onOpenTracking,
}) => {
  const { currentUser, userProfile, updateUserContact, logout } = useAuth();
  const [orders, setOrders] = useState<BoutiqueOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [savedContact, setSavedContact] = useState<boolean>(false);

  useEffect(() => {
    if (userProfile) {
      setPhone(userProfile.phone || '');
      setAddress(userProfile.shippingAddress || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadOrders();
    }
  }, [isOpen, currentUser]);

  const loadOrders = async () => {
    if (!currentUser) return;
    setLoading(true);
    const userOrders = await fetchUserOrders(currentUser.uid);
    setOrders(userOrders);
    setLoading(false);
  };

  if (!isOpen || !currentUser) return null;

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserContact(phone, address);
    setSavedContact(true);
    setTimeout(() => setSavedContact(false), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#E8DFC9] overflow-hidden z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DFC9] bg-white">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1C3325]">
              My Account & WhatsApp Orders
            </h3>
            <p className="text-xs text-[#1C3325]/60">
              Logged in as {currentUser.email}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                await logout();
                onClose();
              }}
              className="text-xs px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-md font-medium transition-colors"
            >
              Sign Out
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#1C3325]/70 hover:text-[#B85C38] rounded-full hover:bg-[#EFE9DF]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Default Delivery Contact Form */}
          <div className="p-4 bg-white rounded-xl border border-[#E8DFC9] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1C3325] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#B85C38]" />
                Saved Delivery Details
              </span>
              {savedContact && (
                <span className="text-[11px] text-emerald-700 font-semibold animate-pulse">
                  Details updated!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-[#1C3325]/70 flex items-center gap-1 font-medium">
                    <Phone className="w-3 h-3 text-[#B85C38]" /> Contact / WhatsApp No.
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFC9] rounded-md text-xs text-[#1C3325] focus:outline-none focus:ring-1 focus:ring-[#B85C38]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-[#1C3325]/70 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-[#B85C38]" /> City / Delivery Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Bhilwara / Jaipur / Delhi"
                    className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFC9] rounded-md text-xs text-[#1C3325] focus:outline-none focus:ring-1 focus:ring-[#B85C38]"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#1C3325] text-white hover:bg-[#284533] rounded-md text-xs font-medium transition-colors cursor-pointer"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>

          {/* Orders Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#E8DFC9] pb-2">
              <h4 className="font-serif text-base font-semibold text-[#1C3325] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#B85C38]" />
                <span>Your WhatsApp Order History</span>
              </h4>
              <span className="text-xs text-[#1C3325]/60 font-medium">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
              </span>
            </div>

            {loading ? (
              <div className="py-10 text-center text-xs text-[#1C3325]/60 animate-pulse">
                Loading your orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-8 text-center bg-white rounded-xl border border-[#E8DFC9] space-y-2">
                <Package className="w-8 h-8 text-[#1C3325]/30 mx-auto" />
                <p className="font-medium text-[#1C3325]">No orders found yet</p>
                <p className="text-xs text-[#1C3325]/60 max-w-sm mx-auto">
                  When you select a cardigan and click "Order via WhatsApp", a record of your order is saved here with live progress tracking!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 bg-white rounded-xl border border-[#E8DFC9] hover:border-[#B85C38]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {ord.productImage && (
                        <img
                          src={ord.productImage}
                          alt={ord.productName}
                          className="w-14 h-14 rounded-lg object-cover bg-[#EFE9DF] border border-[#E8DFC9] shrink-0"
                        />
                      )}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-[#B85C38]">
                            {ord.id}
                          </span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                            ord.orderStatus === 'Order Confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.orderStatus}
                          </span>
                        </div>
                        <h5 className="font-serif text-sm font-semibold text-[#1C3325]">
                          {ord.productName}
                        </h5>
                        <p className="text-xs text-[#1C3325]/75">
                          Size: <span className="font-medium text-[#1C3325]">{ord.size}</span> · Color: <span className="font-medium text-[#1C3325]">{ord.color}</span> · Qty: <span className="font-medium text-[#1C3325]">{ord.quantity}</span>
                        </p>
                        {ord.paymentMethod && (
                          <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              ord.paymentMethod === 'prepaid' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ord.paymentMethod === 'prepaid' ? 'Prepaid (10% Off)' : 'COD (35% Advance)'}
                            </span>
                            {ord.paymentMethod === 'cod' && ord.remainingCodAmount > 0 ? (
                              <span className="text-neutral-500">
                                Advance: ₹{ord.advancePayable?.toLocaleString('en-IN')} • ₹{ord.remainingCodAmount?.toLocaleString('en-IN')} on delivery
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-medium">
                                Total: ₹{ord.totalPrice?.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E8DFC9]">
                      <div className="text-right">
                        <span className="font-semibold text-sm text-[#1C3325] tabular-nums block">
                          ₹{ord.totalPrice?.toLocaleString('en-IN')}
                        </span>
                        {ord.discountAmount && ord.discountAmount > 0 ? (
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            Saved ₹{ord.discountAmount.toLocaleString('en-IN')}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenTracking(ord.id);
                          }}
                          className="px-2.5 py-1 bg-[#1C3325] text-white rounded text-xs font-medium hover:bg-[#284533] transition-colors"
                        >
                          Track Order
                        </button>

                        {ord.whatsappUrl && (
                          <a
                            href={ord.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B85C38] hover:underline"
                          >
                            <span>WhatsApp</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
