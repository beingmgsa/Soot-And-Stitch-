export interface ProductColor {
  name: string;
  hex: string;
  border?: boolean;
}

export type ProductCategory = 
  | 'All'
  | 'Cardigans'
  | 'Shrugs'
  | 'Sweaters'
  | 'Kidswear'
  | 'Custom Orders';

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  category: 'Cardigans' | 'Shrugs' | 'Sweaters' | 'Kidswear' | 'Custom Orders';
  shortDescription: string;
  fullDescription: string;
  availableSizes: string[];
  availableColors: ProductColor[];
  image: string;
  bestseller: boolean;
  featured?: boolean;
  inStock?: boolean;
  hidden?: boolean;
  deleted?: boolean;
  sortOrder?: number;
  materialDetails?: string;
  careInstructions?: string;
}

export interface BrandConfig {
  brandName: string;
  tagline: string;
  phoneDisplay: string;
  whatsappNumber: string;
  email: string;
  address: {
    street: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    fullFormatted: string;
  };
}
