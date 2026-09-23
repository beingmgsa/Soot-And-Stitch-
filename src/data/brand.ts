import { BrandConfig } from '../types';

/**
 * BRAND CONFIGURATION - SOOT & STITCH
 * Boutique details, phone numbers, email, and studio address.
 */
export const BRAND_CONFIG: BrandConfig = {
  brandName: 'Soot & Stitch',
  tagline: 'Handknit warmth, made with care.',
  phoneDisplay: '+91 83026 25173',
  whatsappNumber: '918302625173', // Numbers only for wa.me API link
  email: 'sootandstitch@gmail.com',
  address: {
    street: 'Pur Road',
    landmark: 'Near Sanganeri Gate',
    city: 'Bhilwara',
    state: 'Rajasthan',
    pincode: '311001',
    country: 'India',
    fullFormatted: 'Pur Road, Near Sanganeri Gate, Bhilwara, Rajasthan – 311001, India',
  },
};
