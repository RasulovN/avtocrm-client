import { create } from 'zustand';
import { saasAuth } from '../features/saas/services';
import { apiClient } from '../services/api';
import { logger } from '../utils/logger';
import type { MeCompany, MenuItem } from '../features/saas/types';
import type { User } from '../types';

// Logout paytida joriy qurilmadagi barcha savat (cart) kalitlarini tozalaymiz —
// umumiy kompyuterda boshqa foydalanuvchi oldingi savatni ko'rmasligi uchun.
function clearCartStorage(): void {
  if (typeof window === 'undefined') return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith('crm_cart_')) keys.push(key);
  }
  keys.forEach((key) => localStorage.removeItem(key));
}

interface ThemeStore {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    return { theme: newTheme };
  }),
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },
}));

interface UserStoreLite { id: number; name: string }

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  // SaaS konteksti
  permissions: string[];
  company: MeCompany | null;
  menus: MenuItem[];
  subscriptionActive: boolean;
  // Platform (super admin panel) foydalanuvchisi — /admin ga yo'naltiriladi, onboarding emas.
  isPlatform: boolean;
  stores: UserStoreLite[];
  // Kompaniya admin tomonidan nofaollashtirilganda ko'rsatiladigan xabar (login sahifasida).
  blockedMessage: string | null;

  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  isAuthenticated: () => boolean;
  hasRole: (roles: string[]) => boolean;
  isSuperUser: () => boolean;
  isStoreScopedUser: () => boolean;
  hasPermission: (code: string) => boolean;
  // Interceptor/checkAuth chaqiradi: obuna faolsizlanganda menyularni bloklash.
  markSubscriptionInactive: () => void;
  // Kompaniya nofaollashtirilganda: sessiyani tozalab, xabar ko'rsatadi.
  setBlocked: (message: string) => void;
  clearBlocked: () => void;
}

// /auth/me user -> legacy `User` shakliga map qilish
function mapMeToUser(me: Awaited<ReturnType<typeof saasAuth.me>>): User {
  return {
    id: String(me.user.id),
    user_id: String(me.user.id),
    role: me.user.role ?? (me.is_superuser ? 'superuser' : ''),
    is_superuser: me.is_superuser,
    full_name: me.user.full_name ?? '',
    phone_number: me.user.phone_number ?? '',
    email: me.user.email ?? undefined,
  } as User;
}

// Faol do'konni resolve qiladi: joriy active_store_id ro'yxatda bo'lmasa (yoki yo'q bo'lsa),
// birinchi do'konni tanlaydi. Shu orqali do'konga biriktirilgan xodim login qilganda
// o'z do'koni konteksti (X-Store-ID) avtomatik faollashadi.
function resolveActiveStore(list: { id: number; name: string }[]): UserStoreLite[] {
  const mapped = list.map((s) => ({ id: s.id, name: s.name }));
  if (mapped.length) {
    const cur = localStorage.getItem('active_store_id');
    const has = cur && mapped.some((s) => String(s.id) === cur);
    if (!has) localStorage.setItem('active_store_id', String(mapped[0].id));
  }
  return mapped;
}

async function loadStores(canManageStores: boolean): Promise<UserStoreLite[]> {
  // 1) Foydalanuvchining O'ZIGA biriktirilgan do'kon(lar)i (StoreUser links) — profil orqali.
  //    Kim do'konga biriktirilgan bo'lsa (menejer/sotuvchi/xodim), u FAQAT shu do'kon(lar)
  //    doirasida ishlaydi — ruxsatlari keng bo'lsa ham markaziy omborga o'tib ketmaydi.
  let own: UserStoreLite[] = [];
  try {
    const res = await apiClient.get<{ stores?: { id: number; name: string; is_active?: boolean }[] }>(
      '/users/profile/',
      { skipGlobalErrorHandler: true },
    );
    own = (res.data?.stores ?? [])
      .filter((s) => s.is_active !== false)
      .map((s) => ({ id: s.id, name: s.name }));
  } catch {
    /* profil xatosi — pastda /store/ orqali urinib ko'ramiz */
  }

  // Biriktirilgan do'koni bor foydalanuvchi — faol do'kon DOIM o'z do'koni bo'ladi
  // va ro'yxat ham faqat o'z do'kon(lar)i bilan cheklanadi.
  if (own.length) {
    const cur = localStorage.getItem('active_store_id');
    const valid = cur && own.some((s) => String(s.id) === cur);
    if (!valid) localStorage.setItem('active_store_id', String(own[0].id));
    return own;
  }

  // 2) Shaxsan biriktirilmagan (markaziy admin/ega) — kompaniyaning barcha do'konlari.
  if (canManageStores) {
    try {
      const res = await apiClient.get<{ id: number; name: string }[]>('/store/', { skipGlobalErrorHandler: true });
      const list = Array.isArray(res.data) ? res.data : [];
      return resolveActiveStore(list);
    } catch (err) {
      logger.error("Do'konlar ro'yxatini yuklab bo'lmadi", { error: err instanceof Error ? err.message : String(err) });
    }
  }
  localStorage.removeItem('active_store_id');
  return [];
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  error: null,
  permissions: [],
  company: null,
  menus: [],
  subscriptionActive: false,
  isPlatform: false,
  stores: [],
  blockedMessage: null,

  login: async (login: string, password: string) => {
    set({ isLoading: true, error: null, blockedMessage: null });
    try {
      await saasAuth.login(login, password);
      localStorage.setItem('crm_auth_time', Date.now().toString());
      await get().checkAuth();
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Login failed' });
      throw error;
    }
  },

  logout: () => {
    void saasAuth.logout();
    localStorage.removeItem('crm_auth_time');
    localStorage.removeItem('active_store_id');
    clearCartStorage();
    set({ user: null, token: null, permissions: [], company: null, menus: [], subscriptionActive: false, isPlatform: false, stores: [] });
  },

  checkAuth: async () => {
    // Sessiya markeri bo'lmasa — /auth/me so'rovini umuman yubormaymiz (401 oldini olamiz).
    if (typeof window !== 'undefined' && !localStorage.getItem('crm_auth_time')) {
      set({ user: null, token: null, permissions: [], company: null, menus: [], subscriptionActive: false, isPlatform: false, stores: [], isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const me = await saasAuth.me();
      // Do'kon boshqaruvchisi (barcha do'konlarni ko'ra oladi) vs do'kon xodimi (bitta do'kon).
      const canManageStores =
        me.is_superuser || (me.permissions ?? []).includes('company.stores.view');
      const stores = me.company ? await loadStores(canManageStores) : [];
      // Platform (super admin panel) foydalanuvchisi — mustahkam aniqlash:
      // backend `is_platform` yuborsa o'shani, aks holda super admin YOKI biror
      // `platform.*` ruxsatdan hisoblaymiz (eski/stale backend bilan ham to'g'ri ishlaydi).
      const isPlatform =
        me.is_platform ??
        (me.is_superuser || (me.permissions ?? []).some((p) => p.startsWith('platform.')));
      set({
        user: mapMeToUser(me),
        token: 'session',
        permissions: me.permissions,
        company: me.company,
        menus: me.menus,
        subscriptionActive: me.subscription_active,
        isPlatform,
        stores,
        isLoading: false,
      });
    } catch (err) {
      // Sessiya yaroqsiz/eskirgan — markerni tozalaymiz.
      if (typeof window !== 'undefined') localStorage.removeItem('crm_auth_time');
      // Kompaniya admin tomonidan nofaollashtirilgan bo'lsa — aniq xabar saqlaymiz.
      const e = err as { response?: { status?: number; data?: { code?: string; detail?: string } } };
      const blocked =
        e?.response?.status === 403 && e.response.data?.code === 'company_disabled'
          ? e.response.data.detail ?? 'Sizning tizimingiz administrator tomonidan faolsizlantirilgan.'
          : get().blockedMessage;
      set({ user: null, token: null, permissions: [], company: null, menus: [], subscriptionActive: false, isPlatform: false, stores: [], blockedMessage: blocked, isLoading: false });
    }
  },

  isAuthenticated: () => !!get().user || !!get().token,

  hasRole: (roles: string[]) => {
    const user = get().user;
    if (!user) return false;
    return roles.includes(user.role as string);
  },

  isSuperUser: () => {
    const user = get().user;
    return Boolean(user?.is_superuser || user?.role === 'superuser');
  },

  isStoreScopedUser: () => {
    const user = get().user;
    return user != null && !(user.is_superuser || user.role === 'superuser');
  },

  hasPermission: (code: string) => {
    const { user, permissions } = get();
    if (user?.is_superuser) return true;
    return permissions.includes(code);
  },

  markSubscriptionInactive: () => set({ subscriptionActive: false }),

  setBlocked: (message: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crm_auth_time');
      localStorage.removeItem('active_store_id');
    }
    set({
      user: null, token: null, permissions: [], company: null, menus: [],
      subscriptionActive: false, isPlatform: false, stores: [], blockedMessage: message,
    });
  },

  clearBlocked: () => set({ blockedMessage: null }),
}));
