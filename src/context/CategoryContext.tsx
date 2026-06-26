import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../app/store';
import { categoryService } from '../services/categoryService';
import type { Category } from '../types';

interface CategoryContextValue {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
  setCategories: (categories: Category[]) => void;
}

const CategoryContext = createContext<CategoryContextValue | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { i18n } = useTranslation();
  // Faqat kompaniyaga biriktirilgan foydalanuvchi uchun yuklaymiz.
  // Super admin (kompaniyasiz) yoki kompaniyasiz foydalanuvchi uchun 403 chaqirmaymiz.
  const canLoad = useAuthStore((state) => Boolean(state.user) && Boolean(state.company));
  const prevLangRef = useRef(i18n.language);
  const initialLoadRef = useRef(true);

  const refreshCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAll({ limit: 1000 });
      const data = Array.isArray(response.data) ? response.data : [];
      setCategories(data);
      setError(null);
    } catch (err) {
      const axiosErr = err as { response?: { status?: number } };
      // 401 (avtorizatsiya) yoki 403 (ruxsat/kompaniya yo'q) — jimgina o'tkazamiz.
      if (axiosErr.response?.status === 401 || axiosErr.response?.status === 403) {
        setCategories([]);
        return;
      }
      console.error('Failed to load categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canLoad) {
      initialLoadRef.current = true;
      prevLangRef.current = i18n.language;
      setCategories([]);
      setError(null);
      setLoading(false);
      return;
    }

    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      void refreshCategories();
      return;
    }

    const currentLang = i18n.language;
    if (prevLangRef.current !== currentLang) {
      prevLangRef.current = currentLang;
      void refreshCategories();
    }
  }, [canLoad, i18n.language, refreshCategories]);

  const value = useMemo(() => ({
    categories,
    loading,
    error,
    refreshCategories,
    setCategories,
  }), [categories, loading, error, refreshCategories]);

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoryProvider');
  }
  return context;
}
