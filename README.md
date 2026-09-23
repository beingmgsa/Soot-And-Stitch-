# Soot & Stitch — Handmade Knitwear Boutique

Welcome to the **Soot & Stitch** ecommerce catalog website. This web application is crafted specifically for handmade cardigans, shrugs, and knitwear with a seamless direct WhatsApp ordering flow and no online checkout complications.

---

## Brand Details

- **Brand Name**: Soot & Stitch
- **Tagline**: Handknit warmth, made with care.
- **Phone / WhatsApp**: +91 83026 25173
- **WhatsApp for Order Links**: `918302625173`
- **Email**: sootandstitch@gmail.com
- **Studio Address**: Pur Road, Near Sanganeri Gate, Bhilwara, Rajasthan – 311001, India
- **Instagram**: `@sootandstitch` (configurable in `src/data/brand.ts`)

---

## 🛠️ How to Customize Your Store

### 1. Replacing Product Data (Photos, Names, Prices, Sizes, Colors)
Open the file:
📂 `src/data/products.ts`

Each product item is an object structured like this:

```typescript
{
  id: 'ss-cardigan-01',                               // Unique ID for the product
  name: 'Oatmeal Cable Everyday Cardigan',             // Name shown on card & details
  price: 2499,                                         // Price in INR (₹)
  oldPrice: 2999,                                      // Optional: Strikethrough price
  discount: '17% OFF',                                 // Optional: Discount badge
  category: 'Cardigans',                               // 'Cardigans' | 'Shrugs' | 'Sweaters' | 'Kidswear' | 'Custom Orders'
  shortDescription: 'Classic chunky cable-knit...',     // 1-sentence card description
  fullDescription: 'Our signature everyday cardigan...',// Full story, yarn description, fit
  availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'Custom Sizing'],
  availableColors: [
    { name: 'Warm Oatmeal', hex: '#E6DCCF' },
    { name: 'Forest Moss', hex: '#2A4433' },
    { name: 'Terracotta Rust', hex: '#B85C38' }
  ],
  image: imgEverydayCardigan,                          // Local imported photo or web URL
  bestseller: true,                                    // Displays "Bestseller" badge
  featured: true,                                      // Displays in Featured carousel
  materialDetails: '80% Soft Merino Wool, 20% Acrylic',// Material summary
  careInstructions: 'Hand wash gently in cold water...' // Washing guide
}
```

#### To update product images:
1. Place your new image file in `src/assets/images/your_photo.jpg` (or use any direct online image URL like `https://...`).
2. In `src/data/products.ts`, import the image at the top:
   ```typescript
   import myNewPhoto from '../assets/images/your_photo.jpg';
   ```
3. Set `image: myNewPhoto` on your product.

---

### 2. Updating Store Info, Phone, Email & Instagram
Open the file:
📂 `src/data/brand.ts`

```typescript
export const BRAND_CONFIG = {
  brandName: 'Soot & Stitch',
  tagline: 'Handknit warmth, made with care.',
  phoneDisplay: '+91 83026 25173',
  whatsappNumber: '918302625173', // Numbers only without '+' or spaces
  email: 'sootandstitch@gmail.com',
  address: {
    fullFormatted: 'Pur Road, Near Sanganeri Gate, Bhilwara, Rajasthan – 311001, India',
    ...
  },
  instagram: {
    handle: '@sootandstitch',
    url: 'https://instagram.com/sootandstitch',
    enabled: true,
  },
};
```

---

## 📱 WhatsApp Order Message Structure

When a customer selects a size and color and taps **Order Now**, it opens WhatsApp with number `918302625173` with the exact message prefilled:

```text
Hello Soot & Stitch! I would like to order:

Product: [Product Name]
Price: ₹[Price]
Size: [Selected Size]
Color: [Selected Color]
Quantity: [Selected Quantity]
Product Link: [Current Product URL]

Please confirm availability and delivery details. Thank you!
```

If size or color hasn't been chosen yet, a friendly validation alert appears right on screen before WhatsApp is opened.

---

## 🎨 Color Palette & Typography

- **Background Canvas**: Cream / Off-White (`#FAF7F2` and `#F5EFE6`)
- **Primary Text**: Deep Forest Green (`#1C3325`)
- **Accent**: Terracotta Rust (`#B85C38`)
- **Details & Highlights**: Muted Gold (`#C4A265`)
- **Headings**: Elegant Serif (`Cormorant Garamond`)
- **Body**: Clean Modern Sans-Serif (`Plus Jakarta Sans`)
- **Logo**: Text only ("Soot & Stitch") with zero icons/needles/threads.
