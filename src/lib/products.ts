import { Product, ProductCategory } from '../types';
import { SAMPLE_PRODUCTS } from '../data/products';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

export interface AdminCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  hidden?: boolean;
}

const DEFAULT_CATEGORIES: AdminCategory[] = [
  { id: 'all', name: 'All', description: 'Browse all handknit garments', displayOrder: 0 },
  { id: 'cardigans', name: 'Cardigans', description: 'Everyday and chunky wool cardigans', displayOrder: 1 },
  { id: 'shrugs', name: 'Shrugs', description: 'Cozy cocoon and lightweight shrugs', displayOrder: 2 },
  { id: 'sweaters', name: 'Sweaters', description: 'Warm pullovers and textured sweaters', displayOrder: 3 },
  { id: 'kidswear', name: 'Kidswear', description: 'Soft gentle knitwear for children', displayOrder: 4 },
  { id: 'custom-orders', name: 'Custom Orders', description: 'Bespoke handknit sizing and colors', displayOrder: 5 },
];

/**
 * Initializes and fetches products from Firestore.
 * Automatically seeds SAMPLE_PRODUCTS on first load if the Firestore collection is empty.
 */
export async function fetchCatalogProducts(): Promise<Product[]> {
  const path = 'products';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      // First time initialization: seed from SAMPLE_PRODUCTS
      for (const prod of SAMPLE_PRODUCTS) {
        await setDoc(doc(db, path, prod.id), {
          ...prod,
          hidden: false,
          inStock: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      return SAMPLE_PRODUCTS;
    }

    const products: Product[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      // Filter out hidden or soft-deleted products for regular storefront
      if (!data.hidden && !data.deleted) {
        products.push({
          id: docSnap.id,
          name: data.name,
          price: Number(data.price),
          oldPrice: data.oldPrice ? Number(data.oldPrice) : undefined,
          discount: data.discount,
          category: data.category,
          shortDescription: data.shortDescription || '',
          fullDescription: data.fullDescription || '',
          availableSizes: data.availableSizes || ['S', 'M', 'L'],
          availableColors: data.availableColors || [],
          image: data.image || '',
          bestseller: Boolean(data.bestseller),
          featured: Boolean(data.featured),
          inStock: data.inStock !== false,
          sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 999,
          materialDetails: data.materialDetails,
          careInstructions: data.careInstructions,
        });
      }
    });

    // Sort by sortOrder ascending
    products.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));

    return products.length > 0 ? products : SAMPLE_PRODUCTS;
  } catch (err) {
    console.warn('Could not read products collection from Firestore, falling back to local catalog:', err);
    return SAMPLE_PRODUCTS;
  }
}

/**
 * Fetch all products for admin (including hidden ones)
 */
export async function fetchAdminAllProducts(): Promise<(Product & { hidden?: boolean; inStock?: boolean })[]> {
  const path = 'products';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      // Seed first
      for (const prod of SAMPLE_PRODUCTS) {
        await setDoc(doc(db, path, prod.id), {
          ...prod,
          hidden: false,
          inStock: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      return SAMPLE_PRODUCTS.map((p) => ({ ...p, hidden: false, inStock: true }));
    }

    const list: (Product & { hidden?: boolean; deleted?: boolean; inStock?: boolean })[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        name: data.name,
        price: Number(data.price),
        oldPrice: data.oldPrice ? Number(data.oldPrice) : undefined,
        discount: data.discount,
        category: data.category,
        shortDescription: data.shortDescription || '',
        fullDescription: data.fullDescription || '',
        availableSizes: data.availableSizes || ['S', 'M', 'L'],
        availableColors: data.availableColors || [],
        image: data.image || '',
        bestseller: Boolean(data.bestseller),
        featured: Boolean(data.featured),
        hidden: Boolean(data.hidden),
        deleted: Boolean(data.deleted),
        inStock: data.inStock !== false,
        sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 999,
        materialDetails: data.materialDetails,
        careInstructions: data.careInstructions,
      });
    });

    list.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

/**
 * Admin: Add or update product
 */
export async function saveProduct(product: Partial<Product> & { id?: string; hidden?: boolean; deleted?: boolean; inStock?: boolean; sortOrder?: number }) {
  const path = 'products';
  const id = product.id || `ss-knit-${Date.now().toString(36)}`;
  try {
    const docRef = doc(db, path, id);
    await setDoc(
      docRef,
      {
        ...product,
        id,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${path}/${id}`);
    throw err;
  }
}

/**
 * Admin: Toggle product visibility (hide / unhide)
 */
export async function toggleProductVisibility(productId: string, hidden: boolean) {
  const path = 'products';
  try {
    await updateDoc(doc(db, path, productId), {
      hidden,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${path}/${productId}`);
    throw err;
  }
}

/**
 * Admin: Soft delete product (moves to Deleted tab for recovery)
 */
export async function softDeleteProduct(productId: string) {
  const path = 'products';
  try {
    await updateDoc(doc(db, path, productId), {
      deleted: true,
      hidden: true,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${path}/${productId}`);
    throw err;
  }
}

/**
 * Admin: Restore soft-deleted product
 */
export async function restoreProduct(productId: string) {
  const path = 'products';
  try {
    await updateDoc(doc(db, path, productId), {
      deleted: false,
      hidden: false,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${path}/${productId}`);
    throw err;
  }
}

/**
 * Admin: Reorder products
 */
export async function reorderProducts(items: { id: string; sortOrder: number }[]) {
  const path = 'products';
  try {
    for (const item of items) {
      await updateDoc(doc(db, path, item.id), {
        sortOrder: item.sortOrder,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error('Error reordering products:', err);
    throw err;
  }
}

/**
 * Admin: Permanently delete product
 */
export async function deleteProduct(productId: string) {
  const path = 'products';
  try {
    await deleteDoc(doc(db, path, productId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${path}/${productId}`);
    throw err;
  }
}

/**
 * Fetch Categories
 */
export async function fetchCategories(): Promise<AdminCategory[]> {
  const path = 'categories';
  try {
    const snap = await getDocs(query(collection(db, path), orderBy('displayOrder', 'asc')));
    if (snap.empty) {
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, path, cat.id), cat);
      }
      return DEFAULT_CATEGORIES;
    }
    const categories: AdminCategory[] = [];
    snap.forEach((d) => categories.push({ id: d.id, ...(d.data() as any) }));
    return categories;
  } catch (e) {
    return DEFAULT_CATEGORIES;
  }
}

/**
 * Admin: Save or update category
 */
export async function saveCategory(category: AdminCategory) {
  const path = 'categories';
  try {
    await setDoc(doc(db, path, category.id), category, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${path}/${category.id}`);
    throw err;
  }
}

/**
 * Admin: Delete category
 */
export async function deleteCategory(categoryId: string) {
  const path = 'categories';
  try {
    await deleteDoc(doc(db, path, categoryId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${path}/${categoryId}`);
    throw err;
  }
}
