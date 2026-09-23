import React, { useState, useEffect } from 'react';
import { SAMPLE_PRODUCTS } from './data/products';
import { Product, ProductCategory } from './types';
import { AuthProvider } from './lib/AuthContext';
import { CartAndWishlistProvider } from './lib/CartAndWishlistContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeaturedProducts } from './components/FeaturedProducts';
import { ShopByCollection } from './components/ShopByCollection';
import { OurCategories } from './components/OurCategories';
import { WhyChooseUs } from './components/WhyChooseUs';
import { CatalogView } from './components/CatalogView';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { SearchModal } from './components/SearchModal';
import { CustomOrderModal } from './components/CustomOrderModal';
import { AuthModal } from './components/AuthModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { OrderTrackingPage } from './components/OrderTrackingPage';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { fetchCatalogProducts } from './lib/products';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'catalog' | 'tracking' | 'admin'>('home');
  const [catalogCategory, setCatalogCategory] = useState<ProductCategory>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [customOrderModalOpen, setCustomOrderModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [orderHistoryModalOpen, setOrderHistoryModalOpen] = useState<boolean>(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string>('');
  const [liveProducts, setLiveProducts] = useState<Product[]>(SAMPLE_PRODUCTS);

  // Load products from dynamic Firestore database
  useEffect(() => {
    fetchCatalogProducts()
      .then((prods) => {
        if (prods && prods.length > 0) {
          setLiveProducts(prods);
        }
      })
      .catch((err) => console.warn('Using default catalog:', err));
  }, [currentView]);

  // Support direct URL pathing (/admin, /track, #product-...)
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);

      if (path === '/admin' || hash === '#admin') {
        setCurrentView('admin');
        return;
      }

      if (path === '/track' || hash === '#track') {
        const orderIdParam = searchParams.get('orderId');
        if (orderIdParam) {
          setTrackingOrderId(orderIdParam);
        }
        setCurrentView('tracking');
        return;
      }

      if (hash && hash.startsWith('#product-')) {
        const prodId = hash.replace('#product-', '');
        const matched = liveProducts.find((p) => p.id === prodId) || SAMPLE_PRODUCTS.find((p) => p.id === prodId);
        if (matched) {
          setSelectedProduct(matched);
        }
      }
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    window.addEventListener('hashchange', handleUrlRouting);
    return () => {
      window.removeEventListener('popstate', handleUrlRouting);
      window.removeEventListener('hashchange', handleUrlRouting);
    };
  }, [liveProducts]);

  // Update hash when modal opens/closes
  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#product-${product.id}`);
    }
  };

  const handleCloseProduct = () => {
    setSelectedProduct(null);
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#product-')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // Nav actions
  const navigateToHome = () => {
    setCurrentView('home');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCatalog = (category: ProductCategory = 'All') => {
    setCatalogCategory(category);
    setCurrentView('catalog');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToTracking = (orderId?: string) => {
    if (orderId) {
      setTrackingOrderId(orderId);
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', `/track?orderId=${encodeURIComponent(orderId)}`);
      }
    } else {
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/track');
      }
    }
    setCurrentView('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    setCurrentView('admin');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/admin');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthProvider>
      <CartAndWishlistProvider>
        <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C3325]">
          {/* Render Dedicated Admin Panel at /admin */}
          {currentView === 'admin' ? (
            <AdminPanel onExitToStore={navigateToHome} />
          ) : currentView === 'tracking' ? (
            <>
              {/* Header */}
              <Header
                onOpenSearch={() => setSearchModalOpen(true)}
                onNavigateHome={navigateToHome}
                onNavigateCatalog={(cat) => navigateToCatalog((cat as ProductCategory) || 'All')}
                onOpenCustomOrder={() => setCustomOrderModalOpen(true)}
                onOpenAuth={() => setAuthModalOpen(true)}
                onOpenOrderHistory={() => setOrderHistoryModalOpen(true)}
                onOpenTracking={() => navigateToTracking()}
                onOpenAdmin={navigateToAdmin}
                currentView={currentView}
                activeCategory={catalogCategory}
              />

              {/* Tracking Page */}
              <OrderTrackingPage
                initialOrderId={trackingOrderId}
                onNavigateHome={navigateToHome}
              />

              {/* Footer */}
              <Footer
                onNavigateHome={navigateToHome}
                onNavigateCatalog={(cat) => navigateToCatalog((cat as ProductCategory) || 'All')}
                onOpenCustomOrder={() => setCustomOrderModalOpen(true)}
              />
            </>
          ) : (
            <>
              {/* 1. Sticky Header with strictly text-only logo "Soot & Stitch" & Auth triggers */}
              <Header
                onOpenSearch={() => setSearchModalOpen(true)}
                onNavigateHome={navigateToHome}
                onNavigateCatalog={(cat) => navigateToCatalog((cat as ProductCategory) || 'All')}
                onOpenCustomOrder={() => setCustomOrderModalOpen(true)}
                onOpenAuth={() => setAuthModalOpen(true)}
                onOpenOrderHistory={() => setOrderHistoryModalOpen(true)}
                onOpenTracking={() => navigateToTracking()}
                onOpenAdmin={navigateToAdmin}
                currentView={currentView}
                activeCategory={catalogCategory}
              />

              {/* Main Content Area */}
              <main className="flex-1">
                {currentView === 'home' ? (
                  <>
                    {/* 2. Full-width Hero Banner */}
                    <Hero
                      onShopCollection={() => navigateToCatalog('All')}
                      onCustomOrder={() => setCustomOrderModalOpen(true)}
                      featuredProduct={liveProducts[0]}
                      onSelectProduct={handleOpenProduct}
                    />

                    {/* 3. Featured Products with horizontal mobile scroll cards */}
                    <FeaturedProducts
                      products={liveProducts}
                      onSelectProduct={handleOpenProduct}
                      onDirectOrder={handleOpenProduct}
                      onViewAll={() => navigateToCatalog('All')}
                    />

                    {/* 4. Shop by Collection with image tiles */}
                    <ShopByCollection
                      onSelectCollection={(cat) => navigateToCatalog(cat as ProductCategory)}
                      onOpenCustomOrder={() => setCustomOrderModalOpen(true)}
                    />

                    {/* 5. Our Categories with round category icons */}
                    <OurCategories
                      onSelectCategory={(cat) => navigateToCatalog(cat)}
                      onOpenCustomOrder={() => setCustomOrderModalOpen(true)}
                    />

                    {/* 6. Why Soot & Stitch section with 3 craftsmanship points */}
                    <WhyChooseUs
                      onOpenCustomOrder={() => setCustomOrderModalOpen(true)}
                    />
                  </>
                ) : (
                  /* Catalog View (with filtering, search, sorting) */
                  <CatalogView
                    products={liveProducts}
                    initialCategory={catalogCategory}
                    onSelectProduct={handleOpenProduct}
                    onDirectOrder={handleOpenProduct}
                    onOpenCustomOrder={() => setCustomOrderModalOpen(true)}
                  />
                )}
              </main>

              {/* 7. Footer with brand details, address, phone, email, and WhatsApp */}
              <Footer
                onNavigateHome={navigateToHome}
                onNavigateCatalog={(cat) => navigateToCatalog((cat as ProductCategory) || 'All')}
                onOpenCustomOrder={() => setCustomOrderModalOpen(true)}
              />

              {/* Floating WhatsApp Button on all storefront pages */}
              <FloatingWhatsApp />
            </>
          )}

          {/* Product Details Modal with Size/Color Selectors & Structured WhatsApp Order Message */}
          <ProductDetailsModal
            product={selectedProduct}
            onClose={handleCloseProduct}
            onOpenCustomOrder={() => {
              handleCloseProduct();
              setCustomOrderModalOpen(true);
            }}
            onOpenTrackingWithId={(ordId) => {
              handleCloseProduct();
              navigateToTracking(ordId);
            }}
          />

          {/* Cart Drawer */}
          <CartDrawer
            onExploreCollection={() => navigateToCatalog('All')}
          />

          {/* Wishlist Drawer */}
          <WishlistDrawer
            onExploreCollection={() => navigateToCatalog('All')}
          />

          {/* Instant Search Modal */}
          <SearchModal
            isOpen={searchModalOpen}
            onClose={() => setSearchModalOpen(false)}
            products={liveProducts}
            onSelectProduct={handleOpenProduct}
            onDirectOrder={handleOpenProduct}
          />

          {/* Custom Sizing & Bespoke Order Modal */}
          <CustomOrderModal
            isOpen={customOrderModalOpen}
            onClose={() => setCustomOrderModalOpen(false)}
          />

          {/* Standalone User Authentication Modal */}
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
          />

          {/* User Account & WhatsApp Order History Modal */}
          <OrderHistoryModal
            isOpen={orderHistoryModalOpen}
            onClose={() => setOrderHistoryModalOpen(false)}
            onOpenTracking={(ordId) => {
              setOrderHistoryModalOpen(false);
              navigateToTracking(ordId);
            }}
          />
        </div>
      </CartAndWishlistProvider>
    </AuthProvider>
  );
}
