import React, { useState, useEffect } from 'react';
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  DollarSign,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Shield,
  ShieldAlert,
  LogOut,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MessageCircle,
  FileSpreadsheet,
  AlertCircle,
  FolderPlus,
  Save,
  X,
  Sparkles,
  RotateCcw,
  ArrowLeft,
  AlertTriangle,
  ShoppingBag,
} from 'lucide-react';
import {
  BoutiqueOrder,
  fetchAllOrdersForAdmin,
  confirmOrderPaymentByAdmin,
  updateOrderStatusByAdmin,
  OrderLifecycleStatus,
  PaymentStatus,
} from '../lib/orders';
import { Product, ProductCategory } from '../types';
import {
  fetchAdminAllProducts,
  saveProduct,
  deleteProduct,
  toggleProductVisibility,
  softDeleteProduct,
  restoreProduct,
  reorderProducts,
  fetchCategories,
  saveCategory,
  deleteCategory,
  AdminCategory,
} from '../lib/products';
import { useAuth } from '../lib/AuthContext';
import { BRAND_CONFIG } from '../data/brand';

interface AdminPanelProps {
  onExitToStore: () => void;
}

// Configured Approved Admin Email
const APPROVED_ADMIN_EMAIL = (
  import.meta.env.VITE_ADMIN_EMAIL ||
  import.meta.env.VITE_ADMIN_DEFAULT_EMAIL ||
  'beingmagrajpvt@gmail.com'
).toLowerCase().trim();

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExitToStore }) => {
  const { currentUser, loginWithEmail, signUpWithEmail, logout } = useAuth();

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string>(APPROVED_ADMIN_EMAIL);
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState<boolean>(false);

  // Access Denied countdown state
  const [countdown, setCountdown] = useState<number>(5);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'categories' | 'customers'>('dashboard');

  // Orders State
  const [orders, setOrders] = useState<BoutiqueOrder[]>([]);
  const [orderSearchTerm, setOrderSearchTerm] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<BoutiqueOrder | null>(null);

  // Products State
  const [products, setProducts] = useState<(Product & { hidden?: boolean; deleted?: boolean; inStock?: boolean; sortOrder?: number })[]>([]);
  const [productStatusFilter, setProductStatusFilter] = useState<'All' | 'Active' | 'Hidden' | 'Deleted'>('Active');
  const [productSearchTerm, setProductSearchTerm] = useState<string>('');
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<(Partial<Product> & { hidden?: boolean; deleted?: boolean; inStock?: boolean; sortOrder?: number }) | null>(null);

  // Categories State
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [editingCategory, setEditingCategory] = useState<Partial<AdminCategory> | null>(null);

  // Customer Management Filter
  const [customerPhoneSearch, setCustomerPhoneSearch] = useState<string>('');

  // Check if signed-in user is unauthorized
  const isUnauthorizedUser = currentUser && currentUser.email?.toLowerCase().trim() !== APPROVED_ADMIN_EMAIL;

  // Auto-redirect countdown if unapproved user tries to access /admin
  useEffect(() => {
    if (isUnauthorizedUser) {
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onExitToStore();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isUnauthorizedUser, onExitToStore]);

  // Check server admin session and Firebase auth state
  useEffect(() => {
    const checkServerAdminSession = async () => {
      const token = sessionStorage.getItem('soot_admin_token');
      const isApprovedEmail = currentUser?.email?.toLowerCase().trim() === APPROVED_ADMIN_EMAIL;

      if (token) {
        try {
          const verifyRes = await fetch('/api/admin/verify', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const verifyData = await verifyRes.json();
          if (verifyData.authorized) {
            setIsAdminAuthenticated(true);
            return;
          }
        } catch {
          // Token invalid or network issue
        }
      }

      if (isApprovedEmail) {
        setIsAdminAuthenticated(true);
      } else if (currentUser && !isApprovedEmail) {
        setIsAdminAuthenticated(false);
        sessionStorage.removeItem('soot_admin_token');
        sessionStorage.removeItem('soot_admin_active');
      }
    };

    checkServerAdminSession();
  }, [currentUser]);

  // Load data once authenticated
  useEffect(() => {
    if (isAdminAuthenticated && !isUnauthorizedUser) {
      loadAllAdminData();
    }
  }, [isAdminAuthenticated, isUnauthorizedUser]);

  const loadAllAdminData = async () => {
    setLoadingOrders(true);
    setLoadingProducts(true);
    try {
      const [fetchedOrders, fetchedProducts, fetchedCats] = await Promise.all([
        fetchAllOrdersForAdmin(),
        fetchAdminAllProducts(),
        fetchCategories(),
      ]);
      setOrders(fetchedOrders);
      setProducts(fetchedProducts);
      setCategories(fetchedCats);
    } catch (err) {
      console.error('Error loading admin records:', err);
    } finally {
      setLoadingOrders(false);
      setLoadingProducts(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmittingAuth(true);

    try {
      const normalizedEnteredEmail = authEmail.trim().toLowerCase();

      // Strict enforcement: ONLY APPROVED_ADMIN_EMAIL is permitted
      if (normalizedEnteredEmail !== APPROVED_ADMIN_EMAIL) {
        throw new Error(
          'Access Denied: Unapproved email address. Only the authorized administrator email may access the portal.'
        );
      }

      if (!authPassword) {
        throw new Error('Please enter the administrator password.');
      }

      // 1. Verify credentials with secure server-side endpoint (compares against server environment variables)
      const serverRes = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEnteredEmail, password: authPassword }),
      });

      const serverData = await serverRes.json();

      if (!serverRes.ok || !serverData.success) {
        throw new Error(serverData.message || 'Access Denied: Invalid administrator credentials.');
      }

      // Store server token in session storage
      sessionStorage.setItem('soot_admin_token', serverData.token);
      sessionStorage.setItem('soot_admin_active', 'true');

      // 2. Authenticate with Firebase Auth so client SDK carries admin token for firestore.rules
      try {
        await loginWithEmail(normalizedEnteredEmail, authPassword);
      } catch (firebaseAuthErr: any) {
        // If user account is not yet registered in Firebase Auth, register as admin
        try {
          await signUpWithEmail(normalizedEnteredEmail, authPassword, 'Studio Administrator');
        } catch {
          console.warn('Firebase auth notice:', firebaseAuthErr?.message);
        }
      }

      // Clear password from form state immediately (never stored)
      setAuthPassword('');
      setIsAdminAuthenticated(true);
    } catch (err: any) {
      setAuthError(err.message || 'Invalid administrator credentials');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleAdminLogout = async () => {
    const token = sessionStorage.getItem('soot_admin_token');
    if (token) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    sessionStorage.removeItem('soot_admin_token');
    sessionStorage.removeItem('soot_admin_active');
    setIsAdminAuthenticated(false);
    await logout();
  };

  // One-click Confirm Order
  const handleConfirmOrder = async (orderId: string) => {
    try {
      await confirmOrderPaymentByAdmin(orderId);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, paymentStatus: 'Verified', orderStatus: 'Order Confirmed' }
            : o
        )
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: 'Verified', orderStatus: 'Order Confirmed' } : null));
      }
    } catch (e) {
      alert('Could not update order status.');
    }
  };

  // Lifecycle status update
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderLifecycleStatus,
    courierName?: string,
    trackingNumber?: string,
    adminNotes?: string
  ) => {
    try {
      await updateOrderStatusByAdmin(orderId, {
        orderStatus: newStatus,
        courierName,
        trackingNumber,
        adminNotes,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, orderStatus: newStatus, courierName, trackingNumber, adminNotes }
            : o
        )
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus, courierName, trackingNumber, adminNotes } : null));
      }
    } catch (e) {
      alert('Could not update order status.');
    }
  };

  // Product Actions: Add/Update
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || !editingProduct.price) {
      alert('Please provide product name and price.');
      return;
    }

    try {
      await saveProduct(editingProduct);
      setEditingProduct(null);
      const updated = await fetchAdminAllProducts();
      setProducts(updated);
    } catch (e) {
      alert('Error saving product to catalog.');
    }
  };

  // Product Action: Toggle Visibility (Hide/Unhide)
  const handleToggleProductHide = async (product: Product & { hidden?: boolean }) => {
    try {
      const newHidden = !product.hidden;
      await toggleProductVisibility(product.id, newHidden);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, hidden: newHidden } : p))
      );
    } catch (e) {
      alert('Could not update product visibility.');
    }
  };

  // Product Action: Soft-delete (move to Deleted tab)
  const handleSoftDeleteProduct = async (id: string) => {
    if (!confirm('Move this product to the Deleted/Archived queue? You can restore it anytime.')) return;
    try {
      await softDeleteProduct(id);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, deleted: true, hidden: true } : p))
      );
    } catch (e) {
      alert('Could not delete product.');
    }
  };

  // Product Action: Restore soft-deleted product
  const handleRestoreProduct = async (id: string) => {
    try {
      await restoreProduct(id);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, deleted: false, hidden: false } : p))
      );
    } catch (e) {
      alert('Could not restore product.');
    }
  };

  // Product Action: Permanently Delete
  const handlePermanentDeleteProduct = async (id: string) => {
    if (!confirm('WARNING: Permanently delete this product from the database? This cannot be undone.')) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert('Could not permanently delete product.');
    }
  };

  // Product Action: Reorder Move Up
  const handleMoveProductUp = async (index: number) => {
    if (index <= 0) return;
    const reordered = [...filteredProducts];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;

    // Assign new sortOrder values
    const updates = reordered.map((item, idx) => ({ id: item.id, sortOrder: idx + 1 }));
    setProducts((prev) => {
      const map = new Map(updates.map((u) => [u.id, u.sortOrder]));
      return prev.map((p) => (map.has(p.id) ? { ...p, sortOrder: map.get(p.id) } : p)).sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
    });

    try {
      await reorderProducts(updates);
    } catch (err) {
      console.error('Failed to persist product sequence:', err);
    }
  };

  // Product Action: Reorder Move Down
  const handleMoveProductDown = async (index: number) => {
    if (index >= filteredProducts.length - 1) return;
    const reordered = [...filteredProducts];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;

    const updates = reordered.map((item, idx) => ({ id: item.id, sortOrder: idx + 1 }));
    setProducts((prev) => {
      const map = new Map(updates.map((u) => [u.id, u.sortOrder]));
      return prev.map((p) => (map.has(p.id) ? { ...p, sortOrder: map.get(p.id) } : p)).sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
    });

    try {
      await reorderProducts(updates);
    } catch (err) {
      console.error('Failed to persist product sequence:', err);
    }
  };

  // Category actions
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name) return;
    const catPayload: AdminCategory = {
      id: editingCategory.id || editingCategory.name.toLowerCase().replace(/\s+/g, '-'),
      name: editingCategory.name,
      description: editingCategory.description || '',
      displayOrder: editingCategory.displayOrder || 0,
      hidden: editingCategory.hidden || false,
    };
    try {
      await saveCategory(catPayload);
      setEditingCategory(null);
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (e) {
      alert('Could not save category.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      alert('Could not delete category.');
    }
  };

  // Dashboard Stats Calculations
  const totalOrdersCount = orders.length;
  const ordersAwaitingPayment = orders.filter((o) => o.paymentStatus === 'Payment Pending').length;
  const confirmedOrdersCount = orders.filter((o) => o.orderStatus === 'Order Confirmed').length;
  const inProductionCount = orders.filter((o) => o.orderStatus === 'In Production').length;
  const shippedOrdersCount = orders.filter((o) => o.orderStatus === 'Shipped').length;
  const deliveredOrdersCount = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const totalSalesRevenue = orders
    .filter((o) => o.paymentStatus === 'Verified' || o.orderStatus !== 'Awaiting Prepaid Payment')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  // Filtered orders
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      ord.customerPhone.includes(orderSearchTerm) ||
      Boolean(ord.productName && ord.productName.toLowerCase().includes(orderSearchTerm.toLowerCase())) ||
      Boolean(ord.items && ord.items.some((it) => it.productName.toLowerCase().includes(orderSearchTerm.toLowerCase())));

    const matchesStatus =
      orderStatusFilter === 'All' ||
      ord.orderStatus === orderStatusFilter ||
      (orderStatusFilter === 'Payment Pending' && ord.paymentStatus === 'Payment Pending');

    return matchesSearch && matchesStatus;
  });

  // Filtered products for admin
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (productStatusFilter === 'Active') {
      return !p.hidden && !p.deleted;
    }
    if (productStatusFilter === 'Hidden') {
      return p.hidden && !p.deleted;
    }
    if (productStatusFilter === 'Deleted') {
      return Boolean(p.deleted);
    }
    return true; // 'All'
  });

  // Customer Directory Map
  const customerMap = orders.reduce((acc, ord) => {
    const key = ord.customerPhone;
    if (!acc[key]) {
      acc[key] = {
        name: ord.customerName,
        email: ord.customerEmail || '',
        phone: ord.customerPhone,
        orders: [],
        totalSpent: 0,
      };
    }
    acc[key].orders.push(ord);
    acc[key].totalSpent += ord.totalPrice || 0;
    return acc;
  }, {} as Record<string, { name: string; email: string; phone: string; orders: BoutiqueOrder[]; totalSpent: number }>);

  const customerList = Object.values(customerMap).filter((c) =>
    c.phone.includes(customerPhoneSearch) || c.name.toLowerCase().includes(customerPhoneSearch.toLowerCase())
  );

  // -------------------------------------------------------------------------
  // 1. STRICT ACCESS DENIED SCREEN (For Unapproved Email Addresses)
  // -------------------------------------------------------------------------
  if (isUnauthorizedUser) {
    return (
      <div className="min-h-screen bg-[#1C3325] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-rose-200 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-rose-600 font-bold px-2 py-0.5 bg-rose-50 rounded">
              Strict Access Control
            </span>
            <h1 className="font-serif text-2xl font-bold text-[#1C3325]">
              Access Denied
            </h1>
            <p className="text-xs text-neutral-600 leading-relaxed">
              You do not have administrator permissions to access this portal. This area is strictly restricted to the verified store administrator.
            </p>
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-left text-xs space-y-1">
            <p className="text-neutral-500 font-medium">Logged-in account:</p>
            <p className="font-mono font-semibold text-rose-700 break-all">{currentUser?.email}</p>
          </div>

          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 font-medium">
            Redirecting to homepage in <span className="font-bold text-rose-900">{countdown}</span> seconds...
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={onExitToStore}
              className="w-full py-3 bg-[#1C3325] hover:bg-[#284533] text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#C4A265]" />
              <span>Return to Homepage Immediately</span>
            </button>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium rounded-xl transition-all cursor-pointer"
            >
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. SECURE ADMIN LOGIN SCREEN (When Not Authenticated)
  // -------------------------------------------------------------------------
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1C3325] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-[#E8DFC9] space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#1C3325] text-[#C4A265] flex items-center justify-center mx-auto shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#1C3325]">
              Soot & Stitch Artisan Studio
            </h1>
            <p className="text-xs text-neutral-500">
              Protected Administrator & Order Control Panel
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="beingmagrajpvt@gmail.com"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#1C3325]"
              />
              <p className="text-[10px] text-neutral-400">
                Only the verified store admin ({APPROVED_ADMIN_EMAIL}) is permitted.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Password
              </label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#1C3325]"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingAuth}
              className="w-full py-3 bg-[#1C3325] hover:bg-[#284533] text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmittingAuth ? 'Verifying Admin Access...' : 'Sign In to Admin Control Panel'}
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <button
              type="button"
              onClick={onExitToStore}
              className="hover:text-[#B85C38] font-medium underline underline-offset-4 cursor-pointer"
            >
              ← Back to Customer Storefront
            </button>
            <span>Bhilwara Boutique</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 3. MAIN AUTHENTICATED ADMIN PANEL VIEW
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F5EFE6] text-[#1C3325] flex flex-col">
      {/* Top Navbar */}
      <header className="bg-[#1C3325] text-[#FAF7F2] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg font-bold tracking-wide text-[#C4A265]">
              Soot & Stitch
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-white/80">
              Admin Suite
            </span>
            <span className="hidden md:inline-block text-[11px] text-white/60 font-mono">
              ({APPROVED_ADMIN_EMAIL})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadAllAdminData}
              className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Refresh All Store Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onExitToStore}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3 h-3 text-[#C4A265]" />
            </button>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="text-xs px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 border-t border-white/10 overflow-x-auto text-xs font-medium">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Package },
            { id: 'orders', label: `Orders (${orders.length})`, icon: Clock },
            { id: 'products', label: `Products (${products.filter((p) => !p.deleted).length})`, icon: Sparkles },
            { id: 'categories', label: `Categories (${categories.length})`, icon: FolderPlus },
            { id: 'customers', label: `Customers (${Object.keys(customerMap).length})`, icon: FileSpreadsheet },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 sm:px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#C4A265] text-[#C4A265] font-semibold'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* -------------------------------------------------------------------
            TAB 1: DASHBOARD OVERVIEW
        -------------------------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C3325]">
                  Studio Operations Dashboard
                </h2>
                <p className="text-xs text-[#1C3325]/70">
                  Live summary of WhatsApp orders, advance payments, and handcrafting queue.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  Total Sales: ₹{totalSalesRevenue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
              {[
                { title: 'Total Orders', count: totalOrdersCount, icon: Package, color: 'text-neutral-800', bg: 'bg-white' },
                { title: 'Awaiting Payment', count: ordersAwaitingPayment, icon: Clock, color: 'text-amber-800', bg: 'bg-amber-50' },
                { title: 'Confirmed Orders', count: confirmedOrdersCount, icon: CheckCircle2, color: 'text-emerald-800', bg: 'bg-emerald-50' },
                { title: 'In Production', count: inProductionCount, icon: Sparkles, color: 'text-purple-800', bg: 'bg-purple-50' },
                { title: 'Shipped Orders', count: shippedOrdersCount, icon: Truck, color: 'text-blue-800', bg: 'bg-blue-50' },
                { title: 'Delivered', count: deliveredOrdersCount, icon: CheckCircle2, color: 'text-teal-800', bg: 'bg-teal-50' },
              ].map((card) => (
                <div
                  key={card.title}
                  className={`p-4 rounded-2xl border border-[#E8DFC9] shadow-xs ${card.bg} space-y-1`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#1C3325]/70">{card.title}</span>
                    <card.icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <div className={`text-2xl font-serif font-bold ${card.color}`}>
                    {card.count}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions & Recent Orders Queue */}
            <div className="bg-white rounded-2xl border border-[#E8DFC9] p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C3325]">
                  Action Needed: Orders Awaiting Verification ({ordersAwaitingPayment})
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-[#B85C38] hover:underline font-semibold cursor-pointer"
                >
                  View All Orders →
                </button>
              </div>

              {ordersAwaitingPayment === 0 ? (
                <div className="p-6 text-center text-xs text-[#1C3325]/60 bg-[#FAF7F2] rounded-xl border border-[#E8DFC9]">
                  🎉 All customer WhatsApp orders and payments are verified!
                </div>
              ) : (
                <div className="divide-y divide-[#E8DFC9]">
                  {orders
                    .filter((o) => o.paymentStatus === 'Payment Pending')
                    .slice(0, 5)
                    .map((ord) => (
                      <div
                        key={ord.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#B85C38]">{ord.id}</span>
                            <span className="text-xs font-semibold text-[#1C3325]">
                              {ord.items && ord.items.length > 0
                                ? `${ord.items.length} items (${ord.items[0].productName}${ord.items.length > 1 ? '...' : ''})`
                                : ord.productName}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                              {ord.orderStatus}
                            </span>
                          </div>
                          <p className="text-xs text-[#1C3325]/70">
                            Customer: <strong>{ord.customerName}</strong> ({ord.customerPhone}) • Advance/Total Due: <strong>₹{ord.advancePayable.toLocaleString('en-IN')}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleConfirmOrder(ord.id)}
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Payment Received / Confirm Order</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-neutral-100 text-[#1C3325] border border-[#E8DFC9] rounded-lg text-xs font-medium cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 2: ORDER MANAGEMENT
        -------------------------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C3325]">
                  Order Management
                </h2>
                <p className="text-xs text-[#1C3325]/70">
                  Search, verify payments, update fulfillment timeline, and provide courier tracking.
                </p>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Order ID, name, phone..."
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-white border border-[#E8DFC9] rounded-xl text-xs text-[#1C3325] focus:outline-none focus:ring-1 focus:ring-[#1C3325] w-64"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-[#E8DFC9] rounded-xl text-xs text-[#1C3325] focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Payment Pending">Payment Pending (All)</option>
                  <option value="Awaiting Prepaid Payment">Awaiting Prepaid Payment</option>
                  <option value="Awaiting 35% COD Advance">Awaiting 35% COD Advance</option>
                  <option value="Order Confirmed">Order Confirmed</option>
                  <option value="In Production">In Production</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-[#E8DFC9] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#E8DFC9] text-[#1C3325]/80 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">Customer & Phone</th>
                      <th className="p-3.5">Items & Specs</th>
                      <th className="p-3.5">Payment Method</th>
                      <th className="p-3.5">Total & Advance</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DFC9]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-xs text-[#1C3325]/60">
                          No matching orders found.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-[#B85C38]">
                            {ord.id}
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold block text-[#1C3325]">{ord.customerName}</span>
                            <span className="text-[#1C3325]/70 block">{ord.customerPhone}</span>
                            {ord.shippingAddress && (
                              <span className="text-[10px] text-[#1C3325]/50 truncate max-w-[150px] block" title={ord.shippingAddress}>
                                {ord.shippingAddress}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {ord.items && ord.items.length > 0 ? (
                              <div className="space-y-1">
                                <div className="font-semibold text-[#1C3325]">
                                  {ord.items.length} {ord.items.length === 1 ? 'Garment' : 'Garments'}
                                </div>
                                <div className="text-[11px] text-[#1C3325]/70 space-y-0.5">
                                  {ord.items.map((it, idx) => (
                                    <div key={idx} className="truncate max-w-[200px]">
                                      • {it.productName} ({it.size}, {it.color}) ×{it.quantity}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className="font-medium block text-[#1C3325]">{ord.productName}</span>
                                <span className="text-[10px] text-[#1C3325]/60 block">
                                  Size: {ord.size} • Color: {ord.color} • Qty: {ord.quantity}
                                </span>
                              </>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                ord.paymentMethod === 'prepaid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {ord.paymentMethod === 'prepaid' ? 'Prepaid (10% Off)' : 'COD (35% Advance)'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-[#1C3325]">
                              ₹{ord.totalPrice.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-[#1C3325]/70">
                              Advance: ₹{ord.advancePayable.toLocaleString('en-IN')}
                            </div>
                            {ord.paymentMethod === 'cod' && (
                              <div className="text-[10px] text-amber-700">
                                COD: ₹{ord.remainingCodAmount.toLocaleString('en-IN')}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                ord.orderStatus === 'Order Confirmed' || ord.orderStatus === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : ord.orderStatus === 'In Production'
                                  ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                  : ord.orderStatus === 'Shipped'
                                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                  : ord.orderStatus === 'Cancelled'
                                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}
                            >
                              {ord.orderStatus}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            {ord.paymentStatus === 'Payment Pending' && (
                              <button
                                type="button"
                                onClick={() => handleConfirmOrder(ord.id)}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                                title="Verify WhatsApp payment and confirm order"
                              >
                                Payment Received / Confirm Order
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedOrder(ord)}
                              className="px-2.5 py-1 bg-[#1C3325] hover:bg-[#284533] text-white rounded text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 3: PRODUCT CATALOG MANAGEMENT (Full CRUD, Restore, Reorder)
        -------------------------------------------------------------------- */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C3325]">
                  Product Catalog Management
                </h2>
                <p className="text-xs text-[#1C3325]/70">
                  Full CRUD: Add, edit, hide, soft-delete, restore, and reorder products.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setEditingProduct({
                      name: '',
                      price: 2499,
                      oldPrice: 2899,
                      discount: '15% Off',
                      category: 'Cardigans',
                      shortDescription: 'Artisan handcrafted cardigan using premium pure wool.',
                      fullDescription: 'Custom hand-knitted piece crafted with meticulous attention to detail by master artisans.',
                      availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
                      availableColors: [
                        { name: 'Oatmeal Beige', hex: '#E6DCCF' },
                        { name: 'Forest Moss', hex: '#2A4433' },
                        { name: 'Charcoal Soot', hex: '#1C3325' },
                      ],
                      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
                      bestseller: false,
                      featured: true,
                      hidden: false,
                      deleted: false,
                      inStock: true,
                      sortOrder: products.length + 1,
                    })
                  }
                  className="px-4 py-2 bg-[#1C3325] hover:bg-[#284533] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C4A265]" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar for Products */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E8DFC9]">
              <div className="flex items-center gap-1.5">
                {(['Active', 'Hidden', 'Deleted', 'All'] as const).map((filter) => {
                  const count =
                    filter === 'Active'
                      ? products.filter((p) => !p.hidden && !p.deleted).length
                      : filter === 'Hidden'
                      ? products.filter((p) => p.hidden && !p.deleted).length
                      : filter === 'Deleted'
                      ? products.filter((p) => p.deleted).length
                      : products.length;

                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setProductStatusFilter(filter)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        productStatusFilter === filter
                          ? 'bg-[#1C3325] text-white shadow-xs'
                          : 'bg-[#FAF7F2] text-[#1C3325]/75 hover:bg-neutral-100'
                      }`}
                    >
                      {filter} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter products by name or category..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl text-xs text-[#1C3325] focus:outline-none focus:ring-1 focus:ring-[#1C3325] w-full sm:w-64"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl border border-[#E8DFC9] p-8 text-center text-xs text-[#1C3325]/60">
                  No products found under "{productStatusFilter}" filter.
                </div>
              ) : (
                filteredProducts.map((p, index) => (
                  <div
                    key={p.id}
                    className={`bg-white rounded-2xl border border-[#E8DFC9] p-4 space-y-3 shadow-xs relative transition-all ${
                      p.deleted
                        ? 'bg-rose-50/40 border-rose-200 opacity-75'
                        : p.hidden
                        ? 'opacity-60 bg-neutral-50'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 rounded-xl object-cover border border-[#E8DFC9] shrink-0 bg-neutral-100"
                      />
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-mono font-bold text-[#B85C38]">
                            {p.category}
                          </span>
                          <div className="flex items-center gap-1">
                            {p.bestseller && (
                              <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                                Bestseller
                              </span>
                            )}
                            {p.deleted ? (
                              <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                                Deleted
                              </span>
                            ) : p.hidden ? (
                              <span className="text-[9px] bg-neutral-200 text-neutral-800 px-1.5 py-0.5 rounded font-bold">
                                Hidden
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <h4 className="font-serif text-sm font-semibold text-[#1C3325] truncate">
                          {p.name}
                        </h4>
                        <div className="text-xs font-bold text-[#1C3325]">
                          ₹{p.price.toLocaleString('en-IN')}{' '}
                          {p.oldPrice && (
                            <span className="text-[10px] font-normal line-through text-neutral-400">
                              ₹{p.oldPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#1C3325]/75 line-clamp-2">
                      {p.shortDescription || p.fullDescription}
                    </p>

                    {/* Reordering Controls & Visibility */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#E8DFC9] text-xs">
                      {/* Sequence arrows */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveProductUp(index)}
                          disabled={index === 0}
                          title="Move product earlier in storefront catalog"
                          className="p-1 rounded bg-[#FAF7F2] hover:bg-neutral-200 disabled:opacity-30 border border-[#E8DFC9] cursor-pointer"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveProductDown(index)}
                          disabled={index === filteredProducts.length - 1}
                          title="Move product later in storefront catalog"
                          className="p-1 rounded bg-[#FAF7F2] hover:bg-neutral-200 disabled:opacity-30 border border-[#E8DFC9] cursor-pointer"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleProductHide(p)}
                          className="inline-flex items-center gap-1 ml-1 text-neutral-600 hover:text-neutral-900 cursor-pointer"
                          title={p.hidden ? 'Click to show product' : 'Click to hide product'}
                        >
                          {p.hidden ? <EyeOff className="w-3.5 h-3.5 text-neutral-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                          <span className="text-[11px]">{p.hidden ? 'Hidden' : 'Live'}</span>
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="space-x-1.5">
                        {p.deleted ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRestoreProduct(p.id)}
                              className="px-2.5 py-1 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded font-semibold flex-inline items-center gap-1 cursor-pointer"
                              title="Restore product to active catalog"
                            >
                              <RotateCcw className="w-3 h-3 inline mr-1" />
                              Restore
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePermanentDeleteProduct(p.id)}
                              className="px-2.5 py-1 text-xs bg-rose-100 hover:bg-rose-200 text-rose-800 rounded font-medium cursor-pointer"
                              title="Permanently remove from database"
                            >
                              Purge
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditingProduct(p)}
                              className="px-2.5 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 rounded font-medium text-neutral-800 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSoftDeleteProduct(p.id)}
                              className="px-2.5 py-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-medium cursor-pointer"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 4: COLLECTION & CATEGORY MANAGEMENT
        -------------------------------------------------------------------- */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C3325]">
                  Collection & Category Management
                </h2>
                <p className="text-xs text-[#1C3325]/70">
                  Organize store navigation, categories, and showcase collections.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingCategory({ name: '', description: '', displayOrder: categories.length + 1 })}
                className="px-4 py-2 bg-[#1C3325] hover:bg-[#284533] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#C4A265]" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-[#E8DFC9] p-5 space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-base font-bold text-[#1C3325]">
                      {cat.name}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">Order: {cat.displayOrder}</span>
                  </div>
                  <p className="text-xs text-[#1C3325]/70">{cat.description || 'No description provided.'}</p>
                  <div className="pt-3 border-t border-[#E8DFC9] flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(cat)}
                      className="px-2.5 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 rounded font-medium cursor-pointer"
                    >
                      Edit
                    </button>
                    {cat.id !== 'all' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="px-2.5 py-1 text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 rounded font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 5: CUSTOMER DIRECTORY
        -------------------------------------------------------------------- */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C3325]">
                  Customer Profiles & Order History
                </h2>
                <p className="text-xs text-[#1C3325]/70">
                  Search customer order history by phone number to assist buyers during WhatsApp conversations.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by customer phone or name..."
                  value={customerPhoneSearch}
                  onChange={(e) => setCustomerPhoneSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-[#E8DFC9] rounded-xl text-xs text-[#1C3325] focus:outline-none focus:ring-1 focus:ring-[#1C3325] w-64"
                />
              </div>
            </div>

            <div className="space-y-4">
              {customerList.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E8DFC9] p-8 text-center text-xs text-[#1C3325]/60">
                  No customers found matching search query.
                </div>
              ) : (
                customerList.map((cust) => (
                  <div
                    key={cust.phone}
                    className="bg-white rounded-2xl border border-[#E8DFC9] p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E8DFC9] gap-2">
                      <div>
                        <h4 className="font-serif text-base font-bold text-[#1C3325]">
                          {cust.name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-[#1C3325]/75 mt-0.5">
                          <span>Phone / WhatsApp: <strong>{cust.phone}</strong></span>
                          {cust.email && <span>• Email: {cust.email}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#1C3325]/70">
                          {cust.orders.length} {cust.orders.length === 1 ? 'Order' : 'Orders'}
                        </span>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          Total Value: ₹{cust.totalSpent.toLocaleString('en-IN')}
                        </span>
                        <a
                          href={`https://wa.me/91${cust.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Open WhatsApp Chat</span>
                        </a>
                      </div>
                    </div>

                    {/* Customer Orders Mini List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cust.orders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFC9] text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-[#B85C38]">{ord.id}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-white text-[#1C3325] border border-[#E8DFC9]">
                              {ord.orderStatus}
                            </span>
                          </div>
                          <p className="font-medium text-[#1C3325] truncate">
                            {ord.items && ord.items.length > 0
                              ? `${ord.items.length} items (${ord.items[0].productName})`
                              : ord.productName}
                          </p>
                          <div className="flex justify-between text-[11px] text-[#1C3325]/70">
                            <span>₹{ord.totalPrice.toLocaleString('en-IN')} ({ord.paymentMethod.toUpperCase()})</span>
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(ord)}
                              className="text-[#B85C38] hover:underline font-semibold cursor-pointer"
                            >
                              Manage
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* ---------------------------------------------------------------------
          MODAL: ORDER DETAIL & FULFILLMENT MANAGER
      ---------------------------------------------------------------------- */}
      {selectedOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
        >
          <div
            className="fixed inset-0"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 p-6 sm:p-8 space-y-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DFC9]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#B85C38] font-bold">
                  Order Management
                </span>
                <h3 className="font-serif text-xl font-bold text-[#1C3325] flex items-center gap-2">
                  <span>{selectedOrder.id}</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-sans font-bold ${
                      selectedOrder.orderStatus === 'Order Confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedOrder.paymentStatus === 'Payment Pending'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    {selectedOrder.orderStatus}
                  </span>
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick action: Confirm order if payment pending */}
            {selectedOrder.paymentStatus === 'Payment Pending' && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>Awaiting WhatsApp Payment Proof</span>
                  </span>
                  <span className="text-xs font-bold text-[#1C3325]">
                    Amount Due: ₹{selectedOrder.advancePayable.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Verify customer transaction screenshot in WhatsApp, then click below to confirm order.
                  Customer tracking status will instantly update to <strong>Order Confirmed</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => handleConfirmOrder(selectedOrder.id)}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Payment Received / Confirm Order</span>
                </button>
              </div>
            )}

            {/* Direct WhatsApp Contact Button */}
            <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E8DFC9]">
              <div className="text-xs">
                <span className="font-semibold block text-[#1C3325]">Direct Customer WhatsApp</span>
                <span className="text-[#1C3325]/70">{selectedOrder.customerName} ({selectedOrder.customerPhone})</span>
              </div>
              <a
                href={`https://wa.me/91${selectedOrder.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Namaste ${selectedOrder.customerName}, regarding your Soot & Stitch Order #${selectedOrder.id}...`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Message on WhatsApp</span>
              </a>
            </div>

            {/* Ordered Items Breakdown (Multi-item support) */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#1C3325] uppercase tracking-wider block">
                Ordered Garments:
              </span>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="divide-y divide-[#E8DFC9] border border-[#E8DFC9] rounded-2xl overflow-hidden">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3 bg-[#FAF7F2] flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-3">
                        {it.productImage && (
                          <img
                            src={it.productImage}
                            alt={it.productName}
                            className="w-12 h-12 rounded-lg object-cover border border-[#E8DFC9] bg-white"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-[#1C3325]">{it.productName}</p>
                          <p className="text-[11px] text-[#1C3325]/70">
                            Size: <strong>{it.size}</strong> • Color: <strong>{it.color}</strong> • Qty: <strong>{it.quantity}</strong>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#1C3325]">₹{(it.unitPrice * it.quantity).toLocaleString('en-IN')}</span>
                        <span className="block text-[10px] text-[#1C3325]/60">₹{it.unitPrice.toLocaleString('en-IN')} each</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFC9] text-xs">
                  <p className="font-semibold text-[#1C3325]">{selectedOrder.productName}</p>
                  <p className="text-[11px] text-[#1C3325]/70">
                    Size: {selectedOrder.size} • Color: {selectedOrder.color} • Quantity: {selectedOrder.quantity}
                  </p>
                </div>
              )}
            </div>

            {/* Payment & Price Breakdown */}
            <div className="p-4 bg-white rounded-2xl border border-[#E8DFC9] text-xs space-y-2">
              <div className="flex justify-between text-[#1C3325]/80">
                <span>Payment Plan:</span>
                <span className="font-semibold uppercase tracking-wider">
                  {selectedOrder.paymentMethod === 'prepaid' ? 'Prepaid Online (10% Discount Applied)' : 'Cash on Delivery (35% Advance Required)'}
                </span>
              </div>
              <div className="flex justify-between text-[#1C3325]/80">
                <span>Subtotal:</span>
                <span>₹{(selectedOrder.subtotal || selectedOrder.totalPrice).toLocaleString('en-IN')}</span>
              </div>
              {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>Prepaid 10% Discount:</span>
                  <span>- ₹{selectedOrder.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#1C3325] pt-2 border-t border-[#E8DFC9]">
                <span>Total Order Value:</span>
                <span>₹{selectedOrder.totalPrice?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-[#B85C38] pt-1">
                <span>Advance Payable / Paid:</span>
                <span>₹{selectedOrder.advancePayable?.toLocaleString('en-IN')}</span>
              </div>
              {selectedOrder.paymentMethod === 'cod' && (
                <div className="flex justify-between text-xs text-amber-800">
                  <span>Balance Payable on Delivery:</span>
                  <span>₹{selectedOrder.remainingCodAmount?.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Lifecycle Status Progression */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1C3325] uppercase tracking-wider block">
                Update Order Lifecycle Status:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Awaiting Prepaid Payment',
                  'Awaiting 35% COD Advance',
                  'Order Confirmed',
                  'In Production',
                  'Shipped',
                  'Delivered',
                  'Cancelled',
                ].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, status as any)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-center cursor-pointer ${
                      selectedOrder.orderStatus === status
                        ? 'bg-[#1C3325] text-white border-[#1C3325] shadow-xs'
                        : 'bg-[#FAF7F2] text-[#1C3325] border-[#E8DFC9] hover:bg-neutral-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Courier Tracking Inputs */}
            <div className="space-y-3 pt-3 border-t border-[#E8DFC9]">
              <span className="text-xs font-semibold text-[#1C3325] uppercase tracking-wider block">
                Dispatch & Delivery Tracking
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Courier (e.g. Delhivery, BlueDart, DTDC)"
                  defaultValue={selectedOrder.courierName || ''}
                  id="modal-courier-name"
                  className="px-3 py-2 bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl text-xs"
                />
                <input
                  type="text"
                  placeholder="Tracking Number / AWB"
                  defaultValue={selectedOrder.trackingNumber || ''}
                  id="modal-tracking-number"
                  className="px-3 py-2 bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl text-xs font-mono"
                />
              </div>

              <textarea
                placeholder="Internal artisan notes (e.g. Yarn dyed on Tuesday, custom 24in length completed)"
                defaultValue={selectedOrder.adminNotes || ''}
                id="modal-admin-notes"
                rows={2}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl text-xs"
              />

              <button
                type="button"
                onClick={() => {
                  const courier = (document.getElementById('modal-courier-name') as HTMLInputElement)?.value;
                  const tracking = (document.getElementById('modal-tracking-number') as HTMLInputElement)?.value;
                  const notes = (document.getElementById('modal-admin-notes') as HTMLTextAreaElement)?.value;
                  handleUpdateStatus(selectedOrder.id, selectedOrder.orderStatus, courier, tracking, notes);
                  alert('Tracking and notes saved successfully!');
                }}
                className="w-full py-2.5 bg-[#1C3325] text-white rounded-xl text-xs font-semibold hover:bg-[#284533] transition-colors cursor-pointer"
              >
                Save Dispatch Tracking & Notes
              </button>
            </div>

            {/* Delivery Address */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFC9] text-xs space-y-1 text-[#1C3325]/80">
              <p><strong>Shipping Address:</strong> {selectedOrder.shippingAddress || 'Not provided'}</p>
              <p><strong>Order Timestamp:</strong> {selectedOrder.createdAt ? new Date((selectedOrder.createdAt as any).seconds ? (selectedOrder.createdAt as any).seconds * 1000 : selectedOrder.createdAt as any).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          MODAL: ADD / EDIT PRODUCT
      ---------------------------------------------------------------------- */}
      {editingProduct && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
        >
          <div
            className="fixed inset-0"
            onClick={() => setEditingProduct(null)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 p-6 sm:p-8 space-y-5 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC9]">
              <h3 className="font-serif text-xl font-bold text-[#1C3325]">
                {editingProduct.id ? `Edit Product: ${editingProduct.name}` : 'Add New Handknit Garment'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold block">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold block">Category *</label>
                  <select
                    value={editingProduct.category || 'Cardigans'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl text-xs cursor-pointer"
                  >
                    <option value="Cardigans">Cardigans</option>
                    <option value="Shrugs">Shrugs</option>
                    <option value="Sweaters">Sweaters</option>
                    <option value="Kidswear">Kidswear</option>
                    <option value="Custom Orders">Custom Orders</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold block">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold block">Original Price (Strike-through ₹)</label>
                  <input
                    type="number"
                    value={editingProduct.oldPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, oldPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold block">Product Image URL *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.image || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    placeholder="https://... image link"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold block">Display Sequence / Sort Order</label>
                  <input
                    type="number"
                    value={editingProduct.sortOrder || 1}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Image Preview */}
              {editingProduct.image && (
                <div className="flex items-center gap-3 p-2 bg-[#FAF7F2] rounded-xl border border-[#E8DFC9]">
                  <img
                    src={editingProduct.image}
                    alt="Preview"
                    className="w-16 h-16 rounded-lg object-cover border border-[#E8DFC9]"
                    onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                  />
                  <div className="text-[11px] text-[#1C3325]/70">
                    Image preview verified.
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold block">Short Description</label>
                <input
                  type="text"
                  value={editingProduct.shortDescription || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block">Full Description & Craftsmanship</label>
                <textarea
                  rows={3}
                  value={editingProduct.fullDescription || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, fullDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl text-xs"
                />
              </div>

              {/* Sizes (comma-separated for ease of editing) */}
              <div className="space-y-1">
                <label className="font-semibold block">Available Sizes (comma-separated)</label>
                <input
                  type="text"
                  value={editingProduct.availableSizes?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      availableSizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="XS, S, M, L, XL, Custom Sizing"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl text-xs"
                />
              </div>

              {/* Badges and Flags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-[#FAF7F2] rounded-xl border border-[#E8DFC9]">
                  <input
                    type="checkbox"
                    checked={editingProduct.inStock !== false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                    className="rounded text-[#1C3325]"
                  />
                  <span className="font-medium">In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 bg-[#FAF7F2] rounded-xl border border-[#E8DFC9]">
                  <input
                    type="checkbox"
                    checked={editingProduct.bestseller || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, bestseller: e.target.checked })}
                    className="rounded text-[#1C3325]"
                  />
                  <span className="font-medium">Bestseller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 bg-[#FAF7F2] rounded-xl border border-[#E8DFC9]">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="rounded text-[#1C3325]"
                  />
                  <span className="font-medium">Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 bg-[#FAF7F2] rounded-xl border border-[#E8DFC9]">
                  <input
                    type="checkbox"
                    checked={editingProduct.hidden || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, hidden: e.target.checked })}
                    className="rounded text-[#1C3325]"
                  />
                  <span className="font-medium">Hide from Store</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E8DFC9] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-semibold hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1C3325] text-white rounded-xl text-xs font-semibold hover:bg-[#284533] shadow-xs cursor-pointer"
                >
                  Save Product to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          MODAL: ADD / EDIT CATEGORY
      ---------------------------------------------------------------------- */}
      {editingCategory && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 p-6 space-y-4 z-10">
            <h3 className="font-serif text-lg font-bold text-[#1C3325]">
              {editingCategory.id ? 'Edit Category' : 'New Collection / Category'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold block">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block">Description</label>
                <input
                  type="text"
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block">Display Sequence</label>
                <input
                  type="number"
                  value={editingCategory.displayOrder || 1}
                  onChange={(e) => setEditingCategory({ ...editingCategory, displayOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#E8DFC9] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1C3325] text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
