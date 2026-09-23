import { BRAND_CONFIG } from '../data/brand';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface PaymentInitiationParams {
  orderId: string;
  productName: string;
  amountInINR: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  onSuccess: (paymentId: string) => void;
  onDismiss?: () => void;
}

/**
 * Initiates Razorpay checkout flow.
 * If VITE_RAZORPAY_KEY_ID is a real key, opens standard Razorpay modal.
 * If placeholder or not provided, opens an interactive simulated Razorpay test payment modal.
 */
export function initiateRazorpayPayment(params: PaymentInitiationParams): void {
  const envKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const isRealRazorpayKey = Boolean(
    envKey && 
    envKey.trim() !== '' && 
    envKey !== 'rzp_test_placeholder' && 
    !envKey.includes('placeholder')
  );

  // If a real Razorpay key is configured and Razorpay script is available
  if (isRealRazorpayKey && typeof window !== 'undefined' && window.Razorpay) {
    const options = {
      key: envKey,
      amount: Math.round(params.amountInINR * 100), // amount in paise
      currency: 'INR',
      name: BRAND_CONFIG.brandName,
      description: `Payment for ${params.productName}`,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200',
      handler: function (response: any) {
        params.onSuccess(response.razorpay_payment_id || `pay_${Date.now()}`);
      },
      prefill: {
        name: params.customerName,
        email: params.customerEmail,
        contact: params.customerPhone || BRAND_CONFIG.whatsappNumber,
      },
      notes: {
        orderId: params.orderId,
        product: params.productName,
      },
      theme: {
        color: '#1C3325',
      },
      modal: {
        ondismiss: function () {
          if (params.onDismiss) params.onDismiss();
        },
      },
    };

    try {
      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
      return;
    } catch (e) {
      console.warn('Could not launch Razorpay SDK instance, falling back to simulated UI:', e);
    }
  }

  // Fallback: Trigger custom simulated checkout modal for testing and preview
  const event = new CustomEvent('open-simulated-payment', {
    detail: params,
  });
  window.dispatchEvent(event);
}
