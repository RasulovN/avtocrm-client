import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../app/store';
import { productService } from '../services/productService';
import type { Product } from '../types';
import { logger } from '../utils/logger';

interface ProductContextValue {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { i18n } = useTranslation();
  // Faqat kompaniyaga biriktirilgan foydalanuvchi uchun yuklaymiz (super admin uchun emas).
  const canLoad = useAuthStore((state) => Boolean(state.user) && Boolean(state.company));
  const user = useAuthStore((state) => state.user);
  const isAdmin = Boolean(user?.is_superuser || user?.role === 'superuser');
  const userStoreId = user?.store_id;
  const prevLangRef = useRef(i18n.language);
  const initialLoadRef = useRef(true);

   const refreshProducts = useCallback(async () => {
    // logger.info('refreshProducts called, isAdmin:', isAdmin, 'userStoreId:', userStoreId);
    try {
      setLoading(true);
      const filters: { limit?: number; store_id?: string } = { limit: 2000 };
      logger.info('Fetching products with filters:', filters);
      const response = await productService.getAll(filters);
      // logger.info('Products API response:', response);
      const data = Array.isArray(response.data) ? response.data : [];
      // logger.info('Products count:', data.length);
      setProducts(data);
      setError(null);
    } catch (err) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 401 || axiosErr.response?.status === 403) {
        setProducts([]);
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, userStoreId]);

   useEffect(() => {
     if (!canLoad) {
       initialLoadRef.current = true;
       prevLangRef.current = i18n.language;
       setProducts([]);
       setError(null);
       setLoading(false);
       return;
     }

     // Always refresh when store_id or admin status changes
     void refreshProducts();
   }, [canLoad, i18n.language, userStoreId, isAdmin, refreshProducts]);

  const value = useMemo(() => ({
    products,
    loading,
    error,
    refreshProducts,
  }), [products, loading, error, refreshProducts]);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  // logger.info('[useProducts] Hook called, returning:', {
  //   productsCount: context.products.length,
  //   loading: context.loading,
  //   hasError: !!context.error,
  // });
  return context;
}
