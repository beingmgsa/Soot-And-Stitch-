import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  AlertCircle,
  ShieldCheck,
  Ruler,
  Check,
  ChevronDown,
  Share2,
  Sparkles,
  CreditCard,
  Banknote,
  Lock,
  ArrowRight,
  Info,
  Heart,
  ShoppingBag,
} from 'lucide-react';
import { Product } from '../types';
import { BRAND_CONFIG } from '../data/brand';
import { generateWhatsAppOrderMessage, getWhatsAppOrderUrl, PaymentOption } from '../utils/whatsapp';
import { useAuth } from '../lib/AuthContext';
import { useCartAndWishlist } from '../lib/CartAndWishlistContext';
import { createStoreOrder, generateUniqueOrderId } from '../lib/orders';
import { AuthModal } from './AuthModal';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenCustomOrder?: () => void;
  onOpenTrackingWithId?: (orderId: string) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onOpenCustomOrder,
  onOpenTrackingWithId,
}) => {
  const { currentUser, userProfile } = useAuth();
  const { toggleWishlist, isInWishlist, addToCart, setIsCartOpen } = useCartAndWishlist();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('prepaid');
  const [customerNameInput, setCustomerNameInput] = useState<string>('');
  const [customerPhoneInput, setCustomerPhoneInput] = useState<string>('');
  const [shippingAddressInput, setShippingAddressInput] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showMessagePreview, setShowMessagePreview] = useState<boolean>(false);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);

  const wishlisted = product ? isInWishlist(product.id) : false;

  const handleAddToCart = () => {
    if (!product) return;
    const chosenSize = selectedSize || product.availableSizes[0] || 'Standard';
    const chosenColor = selectedColor || product.availableColors[0]?.name || 'Standard';
    addToCart(product, chosenSize, chosenColor, quantity);
  };

  // Sync customer details when user profile loads
  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setCustomerNameInput(userProfile.name);
      if (userProfile.phone) setCustomerPhoneInput(userProfile.phone);
      if (userProfile.shippingAddress) setShippingAddressInput(userProfile.shippingAddress);
    } else if (currentUser) {
      if (currentUser.displayName) setCustomerNameInput(currentUser.displayName);
      if (currentUser.email && !customerNameInput) {
        setCustomerNameInput(currentUser.email.split('@')[0]);
      }
    }
  }, [currentUser, userProfile]);

  // Reset variant choices when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize('');
      setSelectedColor('');
      setQuantity(1);
      setPaymentOption('prepaid');
      setValidationError(null);
      setCopiedLink(false);
    }
  }, [product]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const currentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/#product-${product.id}`
      : `https://sootandstitch.com/#product-${product.id}`;

  // Price calculations
  const originalSubtotal = product.price * quantity;
  const isPrepaid = paymentOption === 'prepaid';

  // 1. Prepaid Order — Exactly 10% Off
  const prepaidDiscount = Math.round(originalSubtotal * 0.1);
  const prepaidFinalAmount = originalSubtotal - prepaidDiscount;

  // 2. COD — 35% Advance Required, No discount
  const codTotalAmount = originalSubtotal;
  const codAdvancePayable = Math.round(codTotalAmount * 0.35);
  const codRemainingAmount = codTotalAmount - codAdvancePayable;

  const advancePayableNow = isPrepaid ? prepaidFinalAmount : codAdvancePayable;
  const finalRemainingOnDelivery = isPrepaid ? 0 : codRemainingAmount;
  const finalTotalOrderPrice = isPrepaid ? prepaidFinalAmount : codTotalAmount;

  /**
   * Order placement handler:
   * 1. Validates inputs & customer phone
   * 2. Generates unique Order ID
   * 3. Creates record in Firestore database with status "Payment Pending"
   * 4. Redirects to WhatsApp (918302625173) with complete prefilled order message & Order ID
   */
  const handlePlaceOrderToWhatsApp = async () => {
    // Validate size and color selection
    if (!selectedSize && !selectedColor) {
      setValidationError('Please select both a size and a color before placing your order.');
      return;
    }
    if (!selectedSize) {
      setValidationError('Please select an available size.');
      return;
    }
    if (!selectedColor) {
      setValidationError('Please select an available color.');
      return;
    }

    const cleanPhone = customerPhoneInput.trim();
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 10) {
      setValidationError('Please enter a valid 10-digit WhatsApp phone number so we can track and verify your order.');
      return;
    }

    setValidationError(null);

    // If customer is not logged in, prompt sign in / sign up first
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    setIsCreatingOrder(true);

    try {
      // 1. Generate unique Order ID (e.g. SS-8291-AB)
      const uniqueOrderId = generateUniqueOrderId();

      // 2. Build tracking URL
      const trackingUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/track?orderId=${encodeURIComponent(uniqueOrderId)}`
          : `https://sootandstitch.com/track?orderId=${encodeURIComponent(uniqueOrderId)}`;

      const customerName =
        customerNameInput.trim() ||
        userProfile?.name ||
        currentUser?.displayName ||
        currentUser?.email?.split('@')[0] ||
        'Customer';

      // 3. Build WhatsApp URL with the generated Order ID
      const whatsappUrl = getWhatsAppOrderUrl({
        orderId: uniqueOrderId,
        product,
        selectedSize,
        selectedColor,
        quantity,
        productUrl: currentUrl,
        paymentMethod: paymentOption,
        customerName,
        customerPhone: cleanPhone,
        trackingUrl,
        amountPaid: advancePayableNow,
        remainingAmount: finalRemainingOnDelivery,
      });

      // 4. Save order to Firestore with unique Order ID and payment status "Payment Pending"
      await createStoreOrder({
        id: uniqueOrderId,
        orderNumber: uniqueOrderId,
        userId: currentUser?.uid || 'guest',
        customerName,
        customerEmail: currentUser?.email || '',
        customerPhone: cleanPhone,
        shippingAddress: shippingAddressInput.trim() || userProfile?.shippingAddress || '',
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        size: selectedSize,
        color: selectedColor,
        quantity,
        subtotal: originalSubtotal,
        paymentMethod: paymentOption,
        discountAmount: isPrepaid ? prepaidDiscount : 0,
        advancePayable: advancePayableNow,
        remainingCodAmount: finalRemainingOnDelivery,
        totalPrice: finalTotalOrderPrice,
        whatsappUrl,
        trackingUrl,
      });

      setIsCreatingOrder(false);
      onClose();

      // 5. Open WhatsApp with prefilled message
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to create order before WhatsApp redirect:', err);
      setIsCreatingOrder(false);
      setValidationError('Could not record your order to the database. Please try again.');
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const liveOrderMessagePreview = generateWhatsAppOrderMessage({
    orderId: 'SS-[Unique-ID-Generated-On-Order]',
    product,
    selectedSize: selectedSize || '[Please select size]',
    selectedColor: selectedColor || '[Please select color]',
    quantity,
    productUrl: currentUrl,
    paymentMethod: paymentOption,
    customerName: customerNameInput || 'Customer',
    customerPhone: customerPhoneInput || 'Your WhatsApp number',
    amountPaid: advancePayableNow,
    remainingAmount: finalRemainingOnDelivery,
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 lg:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Backdrop click dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#E8DFC9] overflow-hidden z-10 max-h-[92vh] flex flex-col">
        {/* Sticky Header inside modal */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 bg-[#FAF7F2]/95 backdrop-blur-sm border-b border-[#E8DFC9]">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-semibold text-[#1C3325]">
              Soot & Stitch Boutique
            </span>
            <span className="text-xs text-[#1C3325]/50">·</span>
            <span className="text-xs text-[#B85C38] font-medium">{product.category}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`p-1.5 rounded-full transition-colors text-xs flex items-center gap-1 px-2.5 ${
                wishlisted
                  ? 'bg-rose-50 text-[#B85C38] border border-rose-200'
                  : 'text-[#1C3325]/70 hover:text-[#B85C38] hover:bg-[#E8DFC9]/60'
              }`}
              title={wishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-[#B85C38] text-[#B85C38]' : ''}`} />
              <span className="hidden sm:inline">{wishlisted ? 'Wishlisted' : 'Wishlist'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 text-[#1C3325]/70 hover:text-[#1C3325] rounded-full hover:bg-[#E8DFC9]/60 transition-colors text-xs flex items-center gap-1 px-2"
              title="Share product link"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#1C3325]/70 hover:text-[#1C3325] rounded-full hover:bg-[#E8DFC9]/60 transition-colors"
              aria-label="Close product details modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Left: Product Image */}
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-white border border-[#E8DFC9] shadow-sm relative group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                {product.bestseller && (
                  <span className="absolute top-3 left-3 bg-[#B85C38] text-[#FAF7F2] text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-sm shadow-sm">
                    Bestseller
                  </span>
                )}
              </div>

              {/* Craftsmanship Note */}
              <div className="p-3.5 bg-white rounded-xl border border-[#E8DFC9] text-xs text-[#1C3325]/80 space-y-1">
                <p className="font-semibold text-[#1C3325] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C4A265]" />
                  <span>Artisan Handcrafted in Bhilwara, Rajasthan</span>
                </p>
                <p className="leading-relaxed">
                  Every piece is handknit to order using sustainable premium yarns. Production begins immediately once your WhatsApp payment confirmation is received.
                </p>
              </div>
            </div>

            {/* Right: Product Details, Payment Options & Order Action */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                {/* Title */}
                <h2
                  id="product-title"
                  className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C3325] leading-snug"
                >
                  {product.name}
                </h2>

                {/* Subtitle / Short Description */}
                <p className="mt-2 text-sm text-[#1C3325]/75 leading-relaxed">
                  {product.fullDescription || product.shortDescription}
                </p>

                {/* Base Pricing Display */}
                <div className="mt-4 pb-4 border-b border-[#E8DFC9] flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-[#1C3325] tabular-nums">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm text-[#1C3325]/50 line-through tabular-nums">
                      ₹{product.oldPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-xs bg-[#B85C38]/10 text-[#B85C38] px-2 py-0.5 rounded font-medium">
                    10% Off on Prepaid
                  </span>
                </div>

                {/* Variant 1: Size Selector */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#1C3325]">
                      Select Size: <span className="text-[#B85C38] font-bold">{selectedSize || 'Required'}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSizeGuide(!showSizeGuide)}
                      className="text-xs text-[#B85C38] hover:underline flex items-center gap-1"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>{showSizeGuide ? 'Hide Guide' : 'Size Guide'}</span>
                    </button>
                  </div>

                  {showSizeGuide && (
                    <div className="p-3 bg-white rounded-lg border border-[#E8DFC9] text-xs space-y-1 text-[#1C3325]/80 animate-in fade-in duration-150">
                      <p className="font-semibold text-[#1C3325]">Handknit Sizing Chart (Bust / Length in inches):</p>
                      <p>• <strong>XS:</strong> Bust 32-34", Length 20"</p>
                      <p>• <strong>S:</strong> Bust 34-36", Length 21"</p>
                      <p>• <strong>M:</strong> Bust 36-38", Length 22"</p>
                      <p>• <strong>L:</strong> Bust 38-40", Length 23"</p>
                      <p>• <strong>XL:</strong> Bust 40-42", Length 24"</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    {product.availableSizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setSelectedSize(size);
                            setValidationError(null);
                          }}
                          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#1C3325] text-[#FAF7F2] border-[#1C3325] shadow-xs'
                              : 'bg-white text-[#1C3325] border-[#E8DFC9] hover:border-[#1C3325]'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Variant 2: Color Selector */}
                <div className="mt-5 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#1C3325]">
                    Select Colorway: <span className="text-[#B85C38] font-bold">{selectedColor || 'Required'}</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {product.availableColors.map((color) => {
                      const isSelected = selectedColor === color.name;
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => {
                            setSelectedColor(color.name);
                            setValidationError(null);
                          }}
                          className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#1C3325] text-[#FAF7F2] border-[#1C3325] shadow-xs'
                              : 'bg-white text-[#1C3325] border-[#E8DFC9] hover:border-[#1C3325]'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span>{color.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mt-5 flex items-center justify-between py-2 border-y border-[#E8DFC9]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#1C3325]">
                    Quantity:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-7 h-7 rounded-md bg-white border border-[#E8DFC9] text-[#1C3325] flex items-center justify-center font-bold text-sm disabled:opacity-40 hover:bg-[#FAF7F2]"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-[#1C3325] tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-7 h-7 rounded-md bg-white border border-[#E8DFC9] text-[#1C3325] flex items-center justify-center font-bold text-sm hover:bg-[#FAF7F2]"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Customer Contact & Delivery Info */}
                <div className="mt-5 space-y-3 p-4 bg-white rounded-xl border border-[#E8DFC9]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1C3325]">
                      Customer Order & Tracking Information:
                    </span>
                    <span className="text-[10px] text-emerald-800 font-semibold">
                      Required for tracking
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#1C3325] block">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Priyanshu Sharma"
                        value={customerNameInput}
                        onChange={(e) => setCustomerNameInput(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFC9] rounded-lg text-xs text-[#1C3325] focus:outline-none focus:ring-1 focus:ring-[#1C3325]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#1C3325] block">
                        WhatsApp Phone Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={customerPhoneInput}
                        onChange={(e) => setCustomerPhoneInput(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFC9] rounded-lg text-xs text-[#1C3325] focus:outline-none focus:ring-1 focus:ring-[#1C3325]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#1C3325] block">
                      Delivery Address / City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 302, Green Avenue, Jaipur, Rajasthan - 302001"
                      value={shippingAddressInput}
                      onChange={(e) => setShippingAddressInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFC9] rounded-lg text-xs text-[#1C3325] focus:outline-none focus:ring-1 focus:ring-[#1C3325]"
                    />
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    ESSENTIAL PAYMENT & ORDER RULES:
                    Option 1: Prepaid Order — 10% Off
                    Option 2: Cash on Delivery (COD) — 35% Advance Required
                -------------------------------------------------------------- */}
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1C3325]">
                      Select Payment Method:
                    </span>
                    <span className="text-[11px] text-[#B85C38] font-medium">
                      Payment confirmed on WhatsApp
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: Prepaid */}
                    <button
                      type="button"
                      onClick={() => setPaymentOption('prepaid')}
                      className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                        isPrepaid
                          ? 'border-[#B85C38] bg-white ring-2 ring-[#B85C38]/20 shadow-xs'
                          : 'border-[#E8DFC9] bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className={`w-4 h-4 ${isPrepaid ? 'text-[#B85C38]' : 'text-neutral-500'}`} />
                          <span className="text-xs font-bold text-[#1C3325]">Prepaid Order</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          10% OFF
                        </span>
                      </div>

                      <p className="text-[11px] text-[#B85C38] font-medium mt-1">
                        Pay online & get 10% off.
                      </p>

                      <div className="mt-2 pt-2 border-t border-[#E8DFC9]/60">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-bold text-[#1C3325]">
                            ₹{prepaidFinalAmount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-neutral-400 line-through">
                            ₹{originalSubtotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-700 font-medium">
                          You save ₹{prepaidDiscount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </button>

                    {/* Option 2: COD */}
                    <button
                      type="button"
                      onClick={() => setPaymentOption('cod')}
                      className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                        !isPrepaid
                          ? 'border-[#B85C38] bg-white ring-2 ring-[#B85C38]/20 shadow-xs'
                          : 'border-[#E8DFC9] bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Banknote className={`w-4 h-4 ${!isPrepaid ? 'text-[#B85C38]' : 'text-neutral-500'}`} />
                          <span className="text-xs font-bold text-[#1C3325]">Cash on Delivery</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          35% Advance
                        </span>
                      </div>

                      <p className="text-[11px] text-[#1C3325]/70 mt-1">
                        No discount applies to COD.
                      </p>

                      <div className="mt-2 pt-2 border-t border-[#E8DFC9]/60 space-y-0.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#1C3325]/75">Advance now:</span>
                          <span className="font-bold text-[#1C3325]">
                            ₹{codAdvancePayable.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#1C3325]/60">
                          <span>Payable on delivery:</span>
                          <span>₹{codRemainingAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Clarification Policy Box */}
                  <div className="p-3 bg-[#FAF7F2] rounded-lg border border-[#E8DFC9] text-xs text-[#1C3325] space-y-1.5">
                    {isPrepaid ? (
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-emerald-900">
                            Prepaid Order: 10% Discount Applied
                          </p>
                          <p className="text-[11px] text-[#1C3325]/70">
                            You pay discounted amount ₹{prepaidFinalAmount.toLocaleString('en-IN')} on WhatsApp (via UPI / Bank). Initial status: <em>Awaiting Prepaid Payment</em>.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-900">
                            For COD orders, a 35% advance is required to begin making your cardigan. No discount applies to COD.
                          </p>
                          <p className="text-[11px] text-[#1C3325]/70">
                            Pay ₹{codAdvancePayable.toLocaleString('en-IN')} advance on WhatsApp to commence artisan production. Remaining ₹{codRemainingAmount.toLocaleString('en-IN')} is payable on delivery. Initial status: <em>Awaiting 35% COD Advance</em>.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Validation Message Banner */}
                {validationError && (
                  <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Action Buttons: Add to Bag + WhatsApp Checkout */}
                <div className="mt-6 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="sm:col-span-5 flex items-center justify-center gap-2 px-4 py-3.5 bg-white hover:bg-[#FAF7F2] text-[#1C3325] border-2 border-[#1C3325] font-semibold text-sm rounded-xl shadow-xs transition-all hover:translate-y-[-1px] active:translate-y-[0px] cursor-pointer"
                      title="Add to shopping bag"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#B85C38]" />
                      <span>Add to Bag</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePlaceOrderToWhatsApp}
                      disabled={isCreatingOrder}
                      className="sm:col-span-7 flex items-center justify-center gap-2 px-5 py-3.5 bg-[#1C3325] hover:bg-[#284533] text-[#FAF7F2] font-semibold text-sm rounded-xl shadow-lg transition-all hover:translate-y-[-1px] active:translate-y-[0px] focus-visible:outline-2 focus-visible:outline-[#B85C38] cursor-pointer disabled:opacity-60"
                    >
                      {isCreatingOrder ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4 text-[#C4A265]" />
                          <span>
                            {isPrepaid
                              ? `Order (₹${prepaidFinalAmount.toLocaleString('en-IN')}) WhatsApp`
                              : `COD Advance (₹${codAdvancePayable.toLocaleString('en-IN')})`}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-center text-[#1C3325]/70 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Generates unique Order ID • Payment & verification conducted on WhatsApp (918302625173)</span>
                  </p>
                </div>

                {/* WhatsApp Message Preview */}
                <div className="mt-4 pt-3 border-t border-[#E8DFC9]/70">
                  <button
                    type="button"
                    onClick={() => setShowMessagePreview(!showMessagePreview)}
                    className="w-full flex items-center justify-between text-xs text-[#1C3325]/70 hover:text-[#1C3325] py-1"
                  >
                    <span className="font-medium">Preview prefilled order message sent to WhatsApp</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMessagePreview ? 'rotate-180' : ''}`} />
                  </button>

                  {showMessagePreview && (
                    <div className="mt-2 p-3 bg-white rounded-lg border border-[#E8DFC9] text-[11px] font-mono whitespace-pre-wrap text-[#1C3325]/80 select-all leading-relaxed shadow-inner">
                      {liveOrderMessagePreview}
                    </div>
                  )}
                </div>

                {/* Care Instructions */}
                {product.careInstructions && (
                  <div className="mt-4 pt-3 border-t border-[#E8DFC9]/70 text-xs text-[#1C3325]/70 space-y-1">
                    <p className="font-semibold text-[#1C3325]">Care Instructions:</p>
                    <p>{product.careInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal displayed before placing order */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        actionPrompt="Please sign in or create an account to record your order and enable private tracking."
        onSuccess={() => {
          setAuthModalOpen(false);
          // After signing in, immediately execute order creation
          setTimeout(() => {
            handlePlaceOrderToWhatsApp();
          }, 300);
        }}
      />
    </div>
  );
};
