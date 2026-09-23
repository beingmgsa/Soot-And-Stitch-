import { BRAND_CONFIG } from '../data/brand';
import { Product } from '../types';

export type PaymentOption = 'prepaid' | 'cod';

export interface OrderDetails {
  orderId?: string;
  product: Product;
  selectedSize?: string;
  selectedColor?: string;
  quantity?: number;
  productUrl?: string;
  paymentMethod?: PaymentOption;
  customerName?: string;
  customerPhone?: string;
  trackingUrl?: string;
  amountPaid?: number;
  remainingAmount?: number;
}

/**
 * Builds the exact structured WhatsApp order message requested:
 *
 * Hello Soot & Stitch! I would like to place an order:
 *
 * Order ID: [Unique Order ID]
 * Product: [Product Name]
 * Price: ₹[Price]
 * Size: [Selected Size]
 * Color: [Selected Color]
 * Quantity: [Selected Quantity]
 * Payment Method: [Prepaid (10% discount applied) / Cash on Delivery (35% Advance)]
 * Discount: [10% Off (-₹X) / No Discount]
 * Payable Now on WhatsApp: ₹[Advance / Discounted Amount]
 * Remaining COD on Delivery: ₹[Remaining Amount or ₹0]
 *
 * Customer Name: [Name]
 * Phone: [Phone]
 * Track Order Status: [Tracking URL]
 * Product Link: [Current Product URL]
 *
 * Please confirm payment instructions and production details. Thank you!
 */
export function generateWhatsAppOrderMessage({
  orderId = 'PENDING-GENERATION',
  product,
  selectedSize,
  selectedColor,
  quantity = 1,
  productUrl,
  paymentMethod = 'prepaid',
  customerName,
  customerPhone,
  trackingUrl,
  amountPaid,
  remainingAmount,
}: OrderDetails): string {
  const currentUrl =
    productUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/#product-${product.id}`
      : `https://sootandstitch.com/#product-${product.id}`);

  const subtotal = product.price * quantity;
  const isPrepaid = paymentMethod === 'prepaid';

  // 10% discount for prepaid, 0 for COD
  const discount = isPrepaid ? Math.round(subtotal * 0.1) : 0;
  const advancePayableNow =
    amountPaid !== undefined
      ? amountPaid
      : isPrepaid
      ? subtotal - discount
      : Math.round(subtotal * 0.35);

  const remainingOnDelivery =
    remainingAmount !== undefined
      ? remainingAmount
      : isPrepaid
      ? 0
      : subtotal - advancePayableNow;

  const orderTrackLink =
    trackingUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/track?orderId=${encodeURIComponent(orderId)}`
      : `https://sootandstitch.com/track?orderId=${encodeURIComponent(orderId)}`);

  const paymentMethodLabel = isPrepaid
    ? 'Prepaid (10% discount applied)'
    : 'Cash on Delivery (35% Advance Required)';

  const discountLabel = isPrepaid ? `10% Off (-₹${discount.toLocaleString('en-IN')})` : 'None (COD standard price)';
  const remainingLabel = remainingOnDelivery > 0 ? `₹${remainingOnDelivery.toLocaleString('en-IN')} (Payable on Delivery)` : '₹0 (Fully Paid Online)';

  return `Hello Soot & Stitch! I would like to place an order:

Order ID: ${orderId}
Product: ${product.name}
Original Price: ₹${product.price.toLocaleString('en-IN')}
Size: ${selectedSize || 'Not selected'}
Color: ${selectedColor || 'Not selected'}
Quantity: ${quantity}

Payment Method: ${paymentMethodLabel}
Discount: ${discountLabel}
Payable Now on WhatsApp: ₹${advancePayableNow.toLocaleString('en-IN')}
Remaining COD: ${remainingLabel}

Customer: ${customerName || 'Customer'}
Phone: ${customerPhone || 'Provided in chat'}
Order Tracking Link: ${orderTrackLink}
Product Link: ${currentUrl}

Payment and proof will be completed here in WhatsApp chat. Please share your UPI / Bank details to confirm my order. Thank you!`;
}

/**
 * Generates the WhatsApp link with prefilled order details.
 */
export function getWhatsAppOrderUrl(details: OrderDetails): string {
  const text = generateWhatsAppOrderMessage(details);
  return `https://wa.me/${BRAND_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export interface CartOrderItem {
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CartOrderDetails {
  orderId: string;
  items: CartOrderItem[];
  subtotal: number;
  paymentMethod: PaymentOption;
  discountAmount: number;
  advancePayable: number;
  remainingAmount: number;
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  shippingAddress?: string;
  trackingUrl: string;
}

export function generateWhatsAppCartOrderMessage(details: CartOrderDetails): string {
  const isPrepaid = details.paymentMethod === 'prepaid';
  const paymentMethodLabel = isPrepaid
    ? 'Prepaid (10% discount applied)'
    : 'Cash on Delivery (35% Advance Required)';

  const discountLabel = isPrepaid
    ? `10% Off (-₹${details.discountAmount.toLocaleString('en-IN')})`
    : 'None (COD standard price)';

  const remainingLabel =
    details.remainingAmount > 0
      ? `₹${details.remainingAmount.toLocaleString('en-IN')} (Payable on Delivery)`
      : '₹0 (Fully Paid Online)';

  const itemsListFormatted = details.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.productName}\n   - Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}\n   - Price: ₹${item.subtotal.toLocaleString('en-IN')}`
    )
    .join('\n\n');

  return `Hello Soot & Stitch! I would like to place an order:

Order ID: ${details.orderId}

Items Ordered:
${itemsListFormatted}

Order Summary:
Subtotal: ₹${details.subtotal.toLocaleString('en-IN')}
Payment Method: ${paymentMethodLabel}
Discount: ${discountLabel}
Payable Now on WhatsApp: ₹${details.advancePayable.toLocaleString('en-IN')}
Remaining COD: ${remainingLabel}
Total Order Value: ₹${details.totalPrice.toLocaleString('en-IN')}

Customer Details:
Name: ${details.customerName || 'Customer'}
Phone: ${details.customerPhone || 'Provided in chat'}
Delivery Address: ${details.shippingAddress || 'To be confirmed in chat'}

Track Order Status: ${details.trackingUrl}

Payment and proof will be completed here in WhatsApp chat. Please share your UPI / Bank details to confirm my order. Thank you!`;
}

export function getWhatsAppCartOrderUrl(details: CartOrderDetails): string {
  const text = generateWhatsAppCartOrderMessage(details);
  return `https://wa.me/${BRAND_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Generates the general inquiry WhatsApp link for floating button & header button.
 */
export function getWhatsAppGeneralInquiryUrl(customText?: string): string {
  const message = customText || 'Hello Soot & Stitch! I have a question about your cardigans.';
  return `https://wa.me/${BRAND_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates custom order inquiry WhatsApp link.
 */
export function getWhatsAppCustomOrderUrl(params: {
  name?: string;
  measurements?: string;
  preferredColor?: string;
  yarnType?: string;
  notes?: string;
}): string {
  const message = `Hello Soot & Stitch! I am interested in a Custom Handknit Order:

Name: ${params.name || 'Bespoke Customer'}
Measurements: ${params.measurements || 'Need guidance on sizing'}
Preferred Color: ${params.preferredColor || 'To be discussed'}
Yarn Choice: ${params.yarnType || 'Standard Wool Blend'}
Notes: ${params.notes || 'Please guide me through the custom knitting process.'}

Please let me know how we can proceed. Thank you!`;

  return `https://wa.me/${BRAND_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
