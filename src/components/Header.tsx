import React, { useState } from 'react';
import { Search, MessageCircle, Menu, X, User, Package, Shield, Truck, Heart, ShoppingBag } from 'lucide-react';
import { BRAND_CONFIG } from '../data/brand';
import { getWhatsAppGeneralInquiryUrl } from '../utils/whatsapp';
import { useAuth } from '../lib/AuthContext';
import { useCartAndWishlist } from '../lib/CartAndWishlistContext';

interface HeaderProps {
  onOpenSearch: () => void;
  onNavigateHome: () => void;
  onNavigateCatalog: (category: any) => void;
  onOpenCustomOrder: () => void;
  onOpenAuth: () => void;
  onOpenOrderHistory: () => void;
  onOpenTracking: () => void;
  onOpenAdmin: () => void;
  currentView: string;
  activeCategory?: string;
}

// Approved Admin Email configuration
const APPROVED_ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL ||
  'beingmagrajpvt@gmail.com'
).toLowerCase().trim();

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onNavigateHome,
  onNavigateCatalog,
  onOpenCustomOrder,
  onOpenAuth,
  onOpenOrderHistory,
  onOpenTracking,
  onOpenAdmin,
  currentView,
}) => {
  const { currentUser, userProfile } = useAuth();
  const { cartCount, wishlistCount, setIsCartOpen, setIsWishlistOpen } = useCartAndWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Strictly check if current logged-in user is the approved admin
  const isApprovedAdmin = currentUser?.email?.toLowerCase().trim() === APPROVED_ADMIN_EMAIL;

  const handleNavClick = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFC9] transition-all">
      {/* Top micro-announcement bar for boutique trust */}
      <div className="bg-[#1C3325] text-[#FAF7F2] text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium tracking-wider uppercase flex items-center justify-between max-w-7xl mx-auto">
        <span className="hidden sm:inline">Handcrafted in Bhilwara, India · Direct WhatsApp Orders</span>
        <span className="sm:hidden mx-auto">Handcrafted in Bhilwara · WhatsApp Orders</span>
        <div className="hidden sm:flex items-center gap-4 text-[10px] text-white/80">
          <button
            type="button"
            onClick={onOpenTracking}
            className="hover:text-[#C4A265] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Truck className="w-3 h-3" />
            <span>Track Order</span>
          </button>
          {isApprovedAdmin && (
            <>
              <span>·</span>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="hover:text-[#C4A265] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Shield className="w-3 h-3" />
                <span>Admin Portal</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile hamburger menu trigger & Desktop navigation links */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-[#1C3325] hover:text-[#B85C38] transition-colors focus-visible:outline-2 focus-visible:outline-[#B85C38]"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium tracking-wide">
            <button
              type="button"
              onClick={onNavigateHome}
              className={`transition-colors py-1 relative cursor-pointer ${
                currentView === 'home'
                  ? 'text-[#1C3325] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#B85C38]'
                  : 'text-[#1C3325]/75 hover:text-[#1C3325]'
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => onNavigateCatalog('All')}
              className={`transition-colors py-1 relative cursor-pointer ${
                currentView === 'catalog'
                  ? 'text-[#1C3325] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#B85C38]'
                  : 'text-[#1C3325]/75 hover:text-[#1C3325]'
              }`}
            >
              Knitwear Catalog
            </button>
            <button
              type="button"
              onClick={onOpenTracking}
              className={`transition-colors py-1 relative flex items-center gap-1 cursor-pointer ${
                currentView === 'tracking'
                  ? 'text-[#1C3325] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#B85C38]'
                  : 'text-[#1C3325]/75 hover:text-[#1C3325]'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-[#B85C38]" />
              <span>Track Order</span>
            </button>
          </nav>
        </div>

        {/* Center: Brand Name (TEXT ONLY LOGO) */}
        <div className="flex-1 text-center md:flex-initial">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-block group focus-visible:outline-2 focus-visible:outline-[#B85C38] rounded-sm cursor-pointer"
          >
            <span className="font-serif text-2xl sm:text-3xl lg:text-3xl font-semibold tracking-tight text-[#1C3325] group-hover:text-[#B85C38] transition-colors">
              Soot & Stitch
            </span>
          </button>
        </div>

        {/* Right: Actions (Search, Wishlist, Cart, WhatsApp Order, and Account) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Search Icon button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="p-2 text-[#1C3325] hover:text-[#B85C38] transition-colors rounded-full hover:bg-[#EFE9DF] focus-visible:outline-2 focus-visible:outline-[#B85C38] cursor-pointer"
            aria-label="Search knitwear catalog"
            title="Search products"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist Button with Live Badge */}
          <button
            type="button"
            onClick={() => setIsWishlistOpen(true)}
            className="p-2 text-[#1C3325] hover:text-[#B85C38] transition-colors rounded-full hover:bg-[#EFE9DF] focus-visible:outline-2 focus-visible:outline-[#B85C38] relative cursor-pointer"
            aria-label={`Wishlist with ${wishlistCount} items`}
            title="View saved wishlist"
          >
            <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-[#B85C38] fill-[#B85C38]' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#B85C38] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in-50 duration-200">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Bag Button with Live Badge */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="p-2 text-[#1C3325] hover:text-[#B85C38] transition-colors rounded-full hover:bg-[#EFE9DF] focus-visible:outline-2 focus-visible:outline-[#B85C38] relative cursor-pointer"
            aria-label={`Shopping bag with ${cartCount} items`}
            title="View shopping bag"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#1C3325] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in-50 duration-200">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {/* User Account / Orders Button */}
          {currentUser ? (
            <button
              type="button"
              onClick={onOpenOrderHistory}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E8DFC9] bg-white hover:bg-[#F5EFE6] text-xs font-medium text-[#1C3325] transition-all cursor-pointer"
              title="View account and order history"
            >
              <div className="w-5 h-5 rounded-full bg-[#1C3325] text-white flex items-center justify-center text-[10px] font-bold">
                {userProfile?.name?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:inline max-w-[90px] truncate">
                {userProfile?.name || 'Account'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8DFC9] bg-white hover:bg-[#F5EFE6] text-xs font-semibold text-[#1C3325] transition-all cursor-pointer"
              title="Sign in or Sign up"
            >
              <User className="w-3.5 h-3.5 text-[#B85C38]" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Direct WhatsApp Contact / Order action */}
          <a
            href={getWhatsAppGeneralInquiryUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium text-[#FAF7F2] bg-[#1C3325] hover:bg-[#284533] rounded-md transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-[#B85C38]"
            aria-label="Chat on WhatsApp"
            title="Chat with Soot & Stitch on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-[#C4A265]" />
            <span className="font-sans">WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8DFC9] bg-[#FAF7F2] px-6 py-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          {/* Mobile Auth Button */}
          <div className="pb-3 border-b border-[#E8DFC9]">
            {currentUser ? (
              <button
                type="button"
                onClick={() => handleNavClick(onOpenOrderHistory)}
                className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-[#E8DFC9]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#1C3325] text-white flex items-center justify-center font-bold text-xs">
                    {userProfile?.name?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-xs text-[#1C3325]">{userProfile?.name || 'Customer'}</p>
                    <p className="text-[10px] text-[#1C3325]/60">{currentUser?.email}</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#B85C38]">My Orders →</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNavClick(onOpenAuth)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-[#E8DFC9] rounded-xl text-xs font-semibold text-[#1C3325]"
              >
                <User className="w-4 h-4 text-[#B85C38]" />
                <span>Sign In / Create Account</span>
              </button>
            )}
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleNavClick(onNavigateHome)}
              className="w-full text-left py-2.5 text-base font-medium text-[#1C3325] hover:text-[#B85C38] border-b border-[#EFE9DF]"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick(() => onNavigateCatalog('All'))}
              className="w-full text-left py-2.5 text-base font-medium text-[#1C3325] hover:text-[#B85C38] border-b border-[#EFE9DF]"
            >
              Shop All Products
            </button>
            <button
              type="button"
              onClick={() => handleNavClick(() => setIsCartOpen(true))}
              className="w-full text-left py-2.5 text-base font-medium text-[#1C3325] hover:text-[#B85C38] border-b border-[#EFE9DF] flex items-center justify-between"
            >
              <span>Shopping Bag</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#1C3325] bg-white px-2 py-0.5 rounded-full border border-[#E8DFC9]">
                <ShoppingBag className="w-3.5 h-3.5 text-[#B85C38]" />
                <span>{cartCount}</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick(() => setIsWishlistOpen(true))}
              className="w-full text-left py-2.5 text-base font-medium text-[#1C3325] hover:text-[#B85C38] border-b border-[#EFE9DF] flex items-center justify-between"
            >
              <span>Saved Wishlist</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#1C3325] bg-white px-2 py-0.5 rounded-full border border-[#E8DFC9]">
                <Heart className="w-3.5 h-3.5 text-[#B85C38] fill-[#B85C38]" />
                <span>{wishlistCount}</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick(onOpenTracking)}
              className="w-full text-left py-2.5 text-base font-medium text-[#1C3325] hover:text-[#B85C38] border-b border-[#EFE9DF] flex items-center justify-between"
            >
              <span>Track Your Order</span>
              <Truck className="w-4 h-4 text-[#B85C38]" />
            </button>
            {isApprovedAdmin && (
              <button
                type="button"
                onClick={() => handleNavClick(onOpenAdmin)}
                className="w-full text-left py-2.5 text-base font-medium text-[#1C3325] hover:text-[#B85C38] border-b border-[#EFE9DF] flex items-center justify-between"
              >
                <span>Artisan Admin Portal</span>
                <Shield className="w-4 h-4 text-[#C4A265]" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
