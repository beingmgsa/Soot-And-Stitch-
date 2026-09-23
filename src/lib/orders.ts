import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

export type PaymentMethod = 'prepaid' | 'cod';
export type PaymentStatus = 'Payment Pending' | 'Verified';
export type OrderLifecycleStatus =
  | 'Awaiting Prepaid Payment'
  | 'Awaiting 35% COD Advance'
  | 'Payment Pending'
  | 'Payment Verified'
  | 'Order Confirmed'
  | 'In Production'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItemDetail {
  productId: string;
  productName: string;
  productImage?: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface BoutiqueOrder {
  id: string; // Unique Order ID, e.g. SS-ORD-93820
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  items?: OrderItemDetail[];
  price?: number;
  size?: string;
  color?: string;
  quantity: number;
  subtotal: number;
  paymentMethod: PaymentMethod;
  discountAmount: number;
  advancePayable: number;
  remainingCodAmount: number;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderLifecycleStatus;
  trackingNumber?: string;
  courierName?: string;
  adminNotes?: string;
  whatsappUrl: string;
  trackingUrl: string;
  createdAt?: any;
  confirmedAt?: any;
  updatedAt?: any;
}

/**
 * Generate a distinctive, human-friendly order identifier.
 * Example: SS-2026-8742
 */
export function generateUniqueOrderId(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const timeSuffix = Date.now().toString(36).toUpperCase().slice(-3);
  return `SS-${randomDigits}-${timeSuffix}`;
}

/**
 * Clean phone number for exact matching (removes +, spaces, dashes, leading 0 or 91)
 */
export function normalizePhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  // Normalize 10-digit Indian numbers
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return digitsOnly.slice(2);
  }
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return digitsOnly.slice(1);
  }
  return digitsOnly;
}

/**
 * Creates and saves an order before opening WhatsApp.
 * Initial status:
 * - Prepaid: "Awaiting Prepaid Payment"
 * - COD: "Awaiting 35% COD Advance"
 * Payment Status: "Payment Pending"
 */
export async function createStoreOrder(
  data: Omit<BoutiqueOrder, 'paymentStatus' | 'orderStatus' | 'createdAt' | 'updatedAt'>
): Promise<BoutiqueOrder> {
  const path = 'orders';
  const initialOrderStatus: OrderLifecycleStatus =
    data.paymentMethod === 'prepaid' ? 'Awaiting Prepaid Payment' : 'Awaiting 35% COD Advance';

  const orderPayload: BoutiqueOrder = {
    ...data,
    productName:
      data.productName ||
      (data.items && data.items.length > 0
        ? `${data.items.length} Handknit Garments (${data.items.map((i) => i.productName).join(', ')})`
        : 'Artisan Handknit Collection'),
    price: data.price !== undefined ? data.price : data.totalPrice,
    size: data.size || (data.items ? data.items.map((i) => i.size).join(', ') : 'Standard'),
    color: data.color || (data.items ? data.items.map((i) => i.color).join(', ') : 'Assorted'),
    paymentStatus: 'Payment Pending',
    orderStatus: initialOrderStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = doc(db, path, data.id);
    await setDoc(docRef, orderPayload);
    return orderPayload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${data.id}`);
    throw error;
  }
}

/**
 * Customer Order Tracking:
 * Securely retrieves an order given Order ID and matching customer phone number.
 */
export async function getOrderByTracking(orderId: string, phoneInput: string): Promise<BoutiqueOrder | null> {
  const cleanId = orderId.trim().toUpperCase();
  const cleanPhoneInput = normalizePhoneNumber(phoneInput);

  if (!cleanId || !cleanPhoneInput) return null;

  const path = 'orders';
  try {
    const docRef = doc(db, path, cleanId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    const orderData = snap.data() as BoutiqueOrder;
    const storedPhoneNormalized = normalizePhoneNumber(orderData.customerPhone || '');

    // Validate phone number privacy match
    if (
      storedPhoneNormalized === cleanPhoneInput ||
      storedPhoneNormalized.endsWith(cleanPhoneInput) ||
      cleanPhoneInput.endsWith(storedPhoneNormalized)
    ) {
      return {
        ...orderData,
        id: snap.id,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching order for tracking:', error);
    return null;
  }
}

/**
 * Fetch orders for authenticated customer
 */
export async function fetchUserOrders(userId: string): Promise<BoutiqueOrder[]> {
  const path = 'orders';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snap = await getDocs(q);
    const orders: BoutiqueOrder[] = [];
    snap.forEach((d) => {
      orders.push({
        id: d.id,
        ...(d.data() as any),
      });
    });
    return orders.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Admin: Fetch all orders across store
 */
export async function fetchAllOrdersForAdmin(): Promise<BoutiqueOrder[]> {
  const path = 'orders';
  try {
    const snap = await getDocs(collection(db, path));
    const list: BoutiqueOrder[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as any) });
    });
    return list.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Admin: One-click "Payment Received / Confirm Order"
 * Transitions:
 * - paymentStatus: "Verified"
 * - orderStatus: "Order Confirmed"
 */
export async function confirmOrderPaymentByAdmin(orderId: string): Promise<void> {
  const path = 'orders';
  try {
    const docRef = doc(db, path, orderId);
    await updateDoc(docRef, {
      paymentStatus: 'Verified',
      orderStatus: 'Order Confirmed',
      confirmedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${orderId}`);
    throw error;
  }
}

/**
 * Admin: Update lifecycle status (In Production, Shipped, Delivered) and tracking info
 */
export async function updateOrderStatusByAdmin(
  orderId: string,
  params: {
    orderStatus?: OrderLifecycleStatus;
    paymentStatus?: PaymentStatus;
    courierName?: string;
    trackingNumber?: string;
    adminNotes?: string;
  }
): Promise<void> {
  const path = 'orders';
  try {
    const docRef = doc(db, path, orderId);
    await updateDoc(docRef, {
      ...params,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${orderId}`);
    throw error;
  }
}
