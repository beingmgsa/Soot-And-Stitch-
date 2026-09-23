import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

export interface CartItem {
  id: string; // Composite key: ${product.id}_${size}_${color}
  productId: string;
  product: Product;
  size: string;
  color: string;
  colorHex?: string;
  quantity: number;
  unitPrice: number;
}

export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: number;
}

interface CartAndWishlistContextType {
  // Cart
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (product: Product, size?: string, color?: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Wishlist
  wishlist: WishlistItem[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  moveWishlistToCart: (product: Product, size?: string, color?: string) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;

  // Toast feedback
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CartAndWishlistContext = createContext<CartAndWishlistContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'soot_boutique_cart_v1';
const WISHLIST_STORAGE_KEY = 'soot_boutique_wishlist_v1';

export const CartAndWishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize Cart from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse cart storage:', e);
      return [];
    }
  });

  // Initialize Wishlist from localStorage
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse wishlist storage:', e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart storage:', e);
    }
  }, [cart]);

  // Sync Wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist storage:', e);
    }
  }, [wishlist]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Cart operations
  const addToCart = (product: Product, size?: string, color?: string, quantity: number = 1) => {
    const chosenSize = size || product.availableSizes[0] || 'Standard';
    const chosenColor = color || (product.availableColors[0]?.name ?? 'Natural Oatmeal');
    const colorObj = product.availableColors.find((c) => c.name === chosenColor);
    const colorHex = colorObj?.hex;

    const cartItemId = `${product.id}__${chosenSize}__${chosenColor}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          product,
          size: chosenSize,
          color: chosenColor,
          colorHex,
          quantity,
          unitPrice: product.price,
        };
        return [...prev, newItem];
      }
    });

    showToast(`Added "${product.name}" (${chosenSize}) to cart`);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist operations
  const isInWishlist = (productId: string): boolean => {
    return wishlist.some((item) => item.productId === productId);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.productId === product.id);
      if (exists) {
        showToast(`Removed "${product.name}" from wishlist`);
        return prev.filter((item) => item.productId !== product.id);
      } else {
        showToast(`Saved "${product.name}" to wishlist`);
        return [...prev, { productId: product.id, product, addedAt: Date.now() }];
      }
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.productId !== productId));
  };

  const moveWishlistToCart = (product: Product, size?: string, color?: string) => {
    addToCart(product, size, color, 1);
    removeFromWishlist(product.id);
    showToast(`Moved "${product.name}" to your cart`);
  };

  // Live item counts
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <CartAndWishlistContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        wishlistCount,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        moveWishlistToCart,
        isWishlistOpen,
        setIsWishlistOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CartAndWishlistContext.Provider>
  );
};

export const useCartAndWishlist = () => {
  const context = useContext(CartAndWishlistContext);
  if (!context) {
    throw new Error('useCartAndWishlist must be used within a CartAndWishlistProvider');
  }
  return context;
};
