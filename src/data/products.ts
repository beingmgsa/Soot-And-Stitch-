import { Product } from '../types';

import imgEverydayCardigan from '../assets/images/collection_everyday_cardigan_1790149766682.jpg';
import imgWinterWarmer from '../assets/images/collection_winter_warmer_1790149785349.jpg';
import imgCroppedCardigan from '../assets/images/collection_cropped_cardigan_1790149803756.jpg';
import imgCustomKnitwear from '../assets/images/collection_custom_knitwear_1790149818760.jpg';
import imgShrugKnit from '../assets/images/product_shrug_knit_1790149863156.jpg';
import imgKidswearKnit from '../assets/images/product_kidswear_knit_1790149880571.jpg';
import imgSweaterPullover from '../assets/images/product_sweater_pullover_1790149896060.jpg';
import imgHeroCardigan from '../assets/images/hero_handknit_cardigan_1790149747369.jpg';

/**
 * =========================================================================
 * PRODUCT CATALOG DATA - SAMPLE PLACEHOLDER PRODUCTS
 * =========================================================================
 * NOTE TO STORE OWNER:
 * You can easily edit, add, or delete products in this list.
 * 
 * Fields you can customize for each product:
 * - id: unique identifier string (e.g. 'c-01', 'sw-02')
 * - name: product name displayed on card & details
 * - price: current price in INR (e.g. 2499)
 * - oldPrice: (optional) original price before discount
 * - discount: (optional) discount badge text, e.g. "15% OFF" or "SAVE ₹500"
 * - category: 'Cardigans' | 'Shrugs' | 'Sweaters' | 'Kidswear' | 'Custom Orders'
 * - shortDescription: 1-sentence summary for quick preview
 * - fullDescription: detailed product description, yarn details, fit
 * - availableSizes: array of sizes, e.g. ['XS', 'S', 'M', 'L', 'XL', 'Custom Sizing']
 * - availableColors: array of { name: 'Color Name', hex: '#hexCode' }
 * - image: local image import or online URL
 * - bestseller: true/false for Bestseller badge
 * - featured: true/false to show in Homepage Featured carousel
 * =========================================================================
 */

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'ss-cardigan-01',
    name: 'Oatmeal Cable Everyday Cardigan',
    price: 2499,
    oldPrice: 2999,
    discount: '17% OFF',
    category: 'Cardigans',
    shortDescription: 'Classic chunky cable-knit everyday cardigan with handcrafted coconut shell buttons.',
    fullDescription: 'Our signature everyday cardigan is spun from soft, breathable premium wool blend yarn. Featuring intricate vertical cable stitchwork and natural coconut shell buttons, this cardigan pairs effortlessly with denim, kurtis, or dresses. Thoughtfully knitted with reinforced ribbed cuffs to keep its shape through seasons of cozy wear.',
    availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'Custom Sizing'],
    availableColors: [
      { name: 'Warm Oatmeal', hex: '#E6DCCF' },
      { name: 'Forest Moss', hex: '#2A4433' },
      { name: 'Terracotta Rust', hex: '#B85C38' },
    ],
    image: imgEverydayCardigan,
    bestseller: true,
    featured: true,
    materialDetails: '80% Soft Merino Wool, 20% Organic Recycled Acrylic for shape retention.',
    careInstructions: 'Hand wash gently in cold water with mild wool detergent. Dry flat in shade. Do not wring or hang.',
  },
  {
    id: 'ss-cardigan-02',
    name: 'Bhilwara Heritage Forest Winter Warmer',
    price: 3199,
    oldPrice: 3699,
    discount: '14% OFF',
    category: 'Cardigans',
    shortDescription: 'Heavyweight cozy winter warmer cardigan in deep artisanal forest green.',
    fullDescription: 'Crafted for chilly mornings and winter strolls, this heavyweight cardigan features a dense honeycomb knit pattern that locks in gentle body warmth without feeling bulky. Accented with smooth handmade wooden buttons and deep practical pockets for your hands.',
    availableSizes: ['S', 'M', 'L', 'XL', 'Custom Sizing'],
    availableColors: [
      { name: 'Forest Green', hex: '#1C3325' },
      { name: 'Charcoal Soot', hex: '#2B2B2B' },
      { name: 'Warm Cream', hex: '#F5EFE6' },
    ],
    image: imgWinterWarmer,
    bestseller: true,
    featured: true,
    materialDetails: '100% Hand-spun Artisan Wool from certified ethical sources.',
    careInstructions: 'Dry clean or gentle cold hand wash. Store folded with natural cedar balls.',
  },
  {
    id: 'ss-cardigan-03',
    name: 'Terracotta Scalloped Cropped Cardigan',
    price: 2199,
    oldPrice: 2499,
    discount: '12% OFF',
    category: 'Cardigans',
    shortDescription: 'Chic cropped silhouette with delicate scalloped edges and warm earth tones.',
    fullDescription: 'A modern boutique favorite. This cropped cardigan sits perfectly at high-waist trousers, skirts, or sarees. Handknit with airy pointelle stitch accents and finished with a delicate scalloped edge along the hemline and button placket.',
    availableSizes: ['XS', 'S', 'M', 'L', 'Custom Sizing'],
    availableColors: [
      { name: 'Terracotta Rust', hex: '#B85C38' },
      { name: 'Blush Cream', hex: '#F0E2D6' },
      { name: 'Muted Mustard', hex: '#C4A265' },
    ],
    image: imgCroppedCardigan,
    bestseller: true,
    featured: true,
    materialDetails: 'Ultra-soft cotton-wool blend, ideal for mild winters and transitional seasons.',
    careInstructions: 'Gentle hand wash only. Dry flat. Never tumble dry.',
  },
  {
    id: 'ss-shrug-01',
    name: 'Cocoon Blanket Knit Shrug',
    price: 1999,
    oldPrice: 2299,
    discount: '13% OFF',
    category: 'Shrugs',
    shortDescription: 'Effortless open-front cocoon shrug with fluid drape and oversized sleeves.',
    fullDescription: 'The ultimate slip-on warmth. This cocoon shrug wraps over your shoulders like a gentle embrace. Designed with a loose, relaxed drape that fits universally across body types, making it an ideal gift or everyday wardrobe companion.',
    availableSizes: ['Free Size (XS-L)', 'Plus Size (XL-3XL)', 'Custom Sizing'],
    availableColors: [
      { name: 'Heather Oatmeal', hex: '#DED5C6' },
      { name: 'Warm Hazelnut', hex: '#8C684E' },
      { name: 'Sage Green', hex: '#687864' },
    ],
    image: imgShrugKnit,
    bestseller: false,
    featured: true,
    materialDetails: 'Lightweight brushed wool blend with feathered finish.',
    careInstructions: 'Spot clean when possible or cold soak with mild conditioner. Lay flat.',
  },
  {
    id: 'ss-sweater-01',
    name: 'Highland Moss Ribbed Pullover',
    price: 2799,
    oldPrice: 3299,
    discount: '15% OFF',
    category: 'Sweaters',
    shortDescription: 'Classic crewneck pullover sweater with thick textured fisherman ribbing.',
    fullDescription: 'A quintessential winter essential knit by hand with precision gauge ribbing. Designed with a relaxed crewneck, drop shoulders, and snug ribbed cuffs that keep cold breezes out. Feels soft against bare skin without scratchiness.',
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL', 'Custom Sizing'],
    availableColors: [
      { name: 'Highland Moss', hex: '#233929' },
      { name: 'Natural Sand', hex: '#E8DEC8' },
      { name: 'Indigo Dusk', hex: '#2C3E50' },
    ],
    image: imgSweaterPullover,
    bestseller: true,
    featured: false,
    materialDetails: '85% Premium Highland Wool, 15% Mulberry Silk for subtle lustre.',
    careInstructions: 'Hand wash cold. Lay flat on dry towel. Reshape while damp.',
  },
  {
    id: 'ss-kidswear-01',
    name: 'Little Acorn Handknit Baby Cardigan',
    price: 1499,
    oldPrice: 1799,
    discount: '16% OFF',
    category: 'Kidswear',
    shortDescription: 'Hypoallergenic organic knit cardigan for babies and toddlers with soft wooden toggles.',
    fullDescription: 'Handknit with certified baby-grade organic wool that is non-itchy, breathable, and gentle on sensitive young skin. Features wide armholes for easy dressing and charming natural wooden toggle buttons.',
    availableSizes: ['0-6 Months', '6-12 Months', '1-2 Years', '2-4 Years', 'Custom Sizing'],
    availableColors: [
      { name: 'Pastel Sand', hex: '#EBE3D5' },
      { name: 'Earthy Peach', hex: '#E0A899' },
      { name: 'Soft Sage', hex: '#A3B18A' },
    ],
    image: imgKidswearKnit,
    bestseller: false,
    featured: true,
    materialDetails: '100% Certified Baby-Safe Organic Merino Wool.',
    careInstructions: 'Hand wash gently in lukewarm water. Dry flat away from direct heat.',
  },
  {
    id: 'ss-custom-01',
    name: 'Bespoke Tailored Handknit Cardigan (Custom Order)',
    price: 3499,
    category: 'Custom Orders',
    shortDescription: 'Handmade entirely to your exact body measurements, preferred color, and button choices.',
    fullDescription: 'Have a dream cardigan design or need special sleeve lengths, shoulder widths, or custom yarn blends? Our master artisans in Bhilwara will handknit your piece stitch-by-stitch according to your exact specifications. Contact us on WhatsApp with your measurements and yarn preferences.',
    availableSizes: ['Bespoke Custom Measurements', 'Provide on WhatsApp'],
    availableColors: [
      { name: 'Custom Palette (Any Shade)', hex: '#C4A265' },
      { name: 'Off-White / Cream', hex: '#FAF7F2', border: true },
      { name: 'Deep Forest', hex: '#1C3325' },
      { name: 'Terracotta', hex: '#B85C38' },
    ],
    image: imgCustomKnitwear,
    bestseller: true,
    featured: true,
    materialDetails: 'Tailored to your choice: Pure Wool, Cashmere Blend, or Organic Cotton.',
    careInstructions: 'Care card tailored to your selected yarn provided with parcel.',
  },
  {
    id: 'ss-cardigan-04',
    name: 'Morning Ember Buttoned Slouch Cardigan',
    price: 2599,
    oldPrice: 2899,
    discount: '10% OFF',
    category: 'Cardigans',
    shortDescription: 'Oversized slouchy boyfriend-fit cardigan in warm heathered tones with deep pockets.',
    fullDescription: 'A cozy everyday piece designed to be tossed over anything. Features a gentle V-neckline, roomy drop shoulders, and two front slip pockets for your phone and essentials. Hand-knitted with an airy loose-gauge stitch that feels weightless yet deeply warm.',
    availableSizes: ['XS/S', 'M/L', 'XL/XXL', 'Custom Sizing'],
    availableColors: [
      { name: 'Warm Cream', hex: '#F7F3EB' },
      { name: 'Clay Terracotta', hex: '#C86237' },
      { name: 'Dark Olive', hex: '#37473A' },
    ],
    image: imgHeroCardigan,
    bestseller: false,
    featured: false,
    materialDetails: '75% Soft Wool, 25% Alpaca blend for fluffy cloud-soft feel.',
    careInstructions: 'Cold hand wash with wool detergent. Dry flat on a mesh drying rack.',
  },
];
