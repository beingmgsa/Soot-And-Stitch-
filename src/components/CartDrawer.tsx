import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Heart,
  MessageCircle,
  CreditCard,
  Banknote,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Info,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useCartAndWishlist, CartItem } from '../lib/CartAndWishlistContext';
import { useAuth } from '../lib/AuthContext';
import { PaymentOption, getWhatsAppCartOrderUrl } from '../utils/whatsapp';
import { createStoreOrder, generateUniqueOrderId } from '../lib/orders';

interface CartDrawerProps {
  onOpenProductDetails?: (productId: string) => void;
  onExploreCollection?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onOpenProductDetails,
  onExploreCollection,
}) => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    moveWishlistToCart,
    toggleWishlist,
    isInWishlist,
  } = useCartAndWishlist();

  const { currentUser, userProfile } = useAuth();

  const [paymentOption, setPaymentOption] = useState<PaymentOption>('prepaid');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

  // Sync profile details
  useEffect(() => {
    if (userProfile) {
      if (userProfile.name && !customerName) setCustomerName(userProfile.name);
      if (userProfile.phone && !customerPhone) setCustomerPhone(userProfile.phone);
      if (userProfile.shippingAddress && !shippingAddress) setShippingAddress(userProfile.shippingAddress);
    } else if (currentUser) {
      if (currentUser.displayName && !customerName) setCustomerName(currentUser.displayName);
      if (currentUser.email && !customerName) setCustomerName(currentUser.email.split('@')[0]);
    }
  }, [currentUser, userProfile]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) setIsCartOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  // Calculation
  const isPrepaid = paymentOption === 'prepaid';
  const discountAmount = isPrepaid ? Math.round(cartSubtotal * 0.1) : 0;
  const advancePayable = isPrepaid
    ? cartSubtotal - discountAmount
    : Math.round(cartSubtotal * 0.35);
  const remainingOnDelivery = isPrepaid ? 0 : cartSubtotal - advancePayable;
  const totalOrderValue = isPrepaid ? cartSubtotal - discountAmount : cartSubtotal;

  const handleCheckoutToWhatsApp = async () => {
    if (cart.length === 0) return;

    const cleanPhone = customerPhone.trim();
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 10) {
      setValidationError('Please enter a valid 10-digit WhatsApp phone number to place your order.');
      return;
    }

    setValidationError(null);
    setIsCheckingOut(true);

    try {
      // 1. Generate unique Order ID
      const uniqueOrderId = generateUniqueOrderId();

      // 2. Tracking URL
      const trackingUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/track?orderId=${encodeURIComponent(uniqueOrderId)}`
          : `https://sootandstitch.com/track?orderId=${encodeURIComponent(uniqueOrderId)}`;

      const finalName =
        customerName.trim() ||
        userProfile?.name ||
        currentUser?.displayName ||
        currentUser?.email?.split('@')[0] ||
        'Customer';

      // 3. Format items
      const orderItems = cart.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.image,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.unitPrice * item.quantity,
      }));

      // 4. WhatsApp link
      const whatsappUrl = getWhatsAppCartOrderUrl({
        orderId: uniqueOrderId,
        items: orderItems,
        subtotal: cartSubtotal,
        paymentMethod: paymentOption,
        discountAmount,
        advancePayable,
        remainingAmount: remainingOnDelivery,
        totalPrice: totalOrderValue,
        customerName: finalName,
        customerPhone: cleanPhone,
        shippingAddress: shippingAddress.trim() || userProfile?.shippingAddress || '',
        trackingUrl,
      });

      // 5. Save order in Firestore with paymentStatus: "Payment Pending"
      await createStoreOrder({
        id: uniqueOrderId,
        orderNumber: uniqueOrderId,
        userId: currentUser?.uid || 'guest',
        customerName: finalName,
        customerEmail: currentUser?.email || '',
        customerPhone: cleanPhone,
        shippingAddress: shippingAddress.trim() || userProfile?.shippingAddress || '',
        items: orderItems,
        quantity: cartCount,
        subtotal: cartSubtotal,
        paymentMethod: paymentOption,
        discountAmount,
        advancePayable,
        remainingCodAmount: remainingOnDelivery,
        totalPrice: totalOrderValue,
        whatsappUrl,
        trackingUrl,
      });

      // Clear cart on successful placement
      clearCart();
      setIsCheckingOut(false);
      setIsCartOpen(false);

      // Open WhatsApp
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to create cart order:', err);
      setIsCheckingOut(false);
      setValidationError('Could not record your order to the database. Please try again.');
    }
  };

  const handleMoveToWishlist = (item: CartItem) => {
    if (!isInWishlist(item.productId)) {
      toggleWishlist(item.product);
    }
    removeFromCart(item.id);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] shadow-2xl border-l border-[#E8DFC9] flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E8DFC9] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#B85C38]" />
              <h2 className="font-serif text-lg font-bold text-[#1C3325]">
                Your Shopping Bag ({cartCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#1C3325]/70 hover:text-[#B85C38] rounded-full hover:bg-[#EFE9DF] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#EFE9DF] flex items-center justify-center mx-auto text-[#1C3325]/40">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-serif text-lg font-semibold text-[#1C3325]">
                    Your bag is empty
                  </p>
                  <p className="text-xs text-[#1C3325]/60 max-w-xs mx-auto">
                    Discover our handknit cardigans, warmers, and bespoke knitwear handcrafted stitch by stitch.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    if (onExploreCollection) onExploreCollection();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1C3325] text-white hover:bg-[#284533] text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C4A265]" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* List of Cart Items */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-white rounded-xl border border-[#E8DFC9] flex gap-3 items-center group relative hover:border-[#B85C38]/40 transition-colors"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover bg-[#EFE9DF] border border-[#E8DFC9] shrink-0"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <h4
                          onClick={() => {
                            if (onOpenProductDetails) {
                              setIsCartOpen(false);
                              onOpenProductDetails(item.productId);
                            }
                          }}
                          className="font-serif text-xs font-semibold text-[#1C3325] truncate cursor-pointer hover:text-[#B85C38]"
                          title={item.product.name}
                        >
                          {item.product.name}
                        </h4>

                        <div className="flex items-center gap-2 text-[11px] text-[#1C3325]/70">
                          <span className="bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E8DFC9] font-medium">
                            {item.size}
                          </span>
                          <span className="flex items-center gap-1">
                            {item.colorHex && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/20"
                                style={{ backgroundColor: item.colorHex }}
                              />
                            )}
                            <span className="truncate max-w-[100px]">{item.color}</span>
                          </span>
                        </div>

                        {/* Price & Quantity Adjuster */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center border border-[#E8DFC9] rounded-md bg-[#FAF7F2] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-xs hover:bg-[#EFE9DF] text-[#1C3325] transition-colors"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-semibold text-[#1C3325] tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-xs hover:bg-[#EFE9DF] text-[#1C3325] transition-colors"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-semibold text-xs text-[#1C3325] tabular-nums">
                            ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex flex-col gap-1.5 self-start">
                        <button
                          type="button"
                          onClick={() => handleMoveToWishlist(item)}
                          className="p-1 text-[#1C3325]/50 hover:text-[#B85C38] rounded transition-colors"
                          title="Move to Wishlist"
                        >
                          <Heart className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-[#1C3325]/50 hover:text-rose-600 rounded transition-colors"
                          title="Remove from Bag"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Contact Details for WhatsApp tracking */}
                <div className="p-4 bg-white rounded-xl border border-[#E8DFC9] space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[#1C3325] text-[11px]">
                      Delivery Contact & Tracking:
                    </span>
                    <span className="text-[10px] text-emerald-800 font-semibold">
                      Required
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="Your Full Name *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFC9] rounded-lg text-xs text-[#1C3325] focus:outline-none focus:ring-1 focus:ring-[#1C3325]"
                    />
                    <input
                      type="tel"
                      placeholder="WhatsApp Phone Number *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFC9] rounded-lg text-xs text-[#1C3325] focus:outline-none focus:ring-1 focus:ring-[#1C3325]"
                    />
                    <input
                      type="text"
                      placeholder="Delivery City & Address (Optional)"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFC9] rounded-lg text-xs text-[#1C3325] focus:outline-none focus:ring-1 focus:ring-[#1C3325]"
                    />
                  </div>
                </div>

                {/* Payment Option Selection */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1C3325] block">
                    Select Payment Method:
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Option 1: Prepaid (10% Off) */}
                    <button
                      type="button"
                      onClick={() => setPaymentOption('prepaid')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isPrepaid
                          ? 'border-[#B85C38] bg-white ring-2 ring-[#B85C38]/20 shadow-xs'
                          : 'border-[#E8DFC9] bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-[#B85C38]" />
                          <span className="text-xs font-bold text-[#1C3325]">Prepaid</span>
                        </div>
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          10% OFF
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-700 font-medium mt-1">
                        Save ₹{Math.round(cartSubtotal * 0.1).toLocaleString('en-IN')}
                      </p>
                    </button>

                    {/* Option 2: COD (35% Advance) */}
                    <button
                      type="button"
                      onClick={() => setPaymentOption('cod')}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        !isPrepaid
                          ? 'border-[#B85C38] bg-white ring-2 ring-[#B85C38]/20 shadow-xs'
                          : 'border-[#E8DFC9] bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Banknote className="w-3.5 h-3.5 text-[#B85C38]" />
                          <span className="text-xs font-bold text-[#1C3325]">COD</span>
                        </div>
                        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-100 text-amber-800">
                          35% Adv
                        </span>
                      </div>
                      <p className="text-[10px] text-[#1C3325]/60 mt-1">
                        No discount applies
                      </p>
                    </button>
                  </div>

                  {/* Payment Explanatory Box */}
                  <div className="p-2.5 bg-white rounded-lg border border-[#E8DFC9] text-[11px] text-[#1C3325]/80 space-y-1">
                    {isPrepaid ? (
                      <p className="text-emerald-800 font-medium">
                        ✓ 10% instant discount applied. Pay discounted total online via WhatsApp UPI / Bank transfer.
                      </p>
                    ) : (
                      <p className="text-amber-800 font-medium">
                        ⓘ 35% advance (₹{Math.round(cartSubtotal * 0.35).toLocaleString('en-IN')}) required to begin artisan knitting. Remaining balance payable on delivery.
                      </p>
                    )}
                  </div>
                </div>

                {/* Validation Error Banner */}
                {validationError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-5 bg-white border-t border-[#E8DFC9] space-y-3">
              {/* Order breakdown */}
              <div className="space-y-1 text-xs text-[#1C3325]/80">
                <div className="flex justify-between">
                  <span>Bag Subtotal ({cartCount} items):</span>
                  <span className="tabular-nums">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {isPrepaid && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Prepaid Discount (10%):</span>
                    <span className="tabular-nums">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {!isPrepaid && (
                  <div className="flex justify-between text-[#1C3325]/60">
                    <span>Balance on Delivery:</span>
                    <span className="tabular-nums">₹{remainingOnDelivery.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-[#1C3325] text-sm pt-1 border-t border-[#E8DFC9]">
                  <span>{isPrepaid ? 'Payable Now:' : 'Advance Payable Now:'}</span>
                  <span className="tabular-nums text-[#B85C38]">
                    ₹{advancePayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                type="button"
                onClick={handleCheckoutToWhatsApp}
                disabled={isCheckingOut}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#1C3325] hover:bg-[#284533] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg transition-all hover:translate-y-[-1px] active:translate-y-[0px] cursor-pointer disabled:opacity-60"
              >
                {isCheckingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Recording Order & Connecting...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 text-[#C4A265]" />
                    <span>
                      Place Bag Order (₹{advancePayable.toLocaleString('en-IN')}) via WhatsApp
                    </span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-[#1C3325]/60 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>Generates unique Order ID • WhatsApp payment & verification (918302625173)</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
