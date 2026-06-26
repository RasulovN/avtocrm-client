import { create } from 'zustand';
import { saasAuth } from '../features/saas/services';
import { apiClient } from '../services/api';
import type { MeCompany, MenuItem } from '../features/saas/types';
import type { User } from '../types';

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
  stores: UserStoreLite[];

  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  isAuthenticated: () => boolean;
  hasRole: (roles: string[]) => boolean;
  isSuperUser: () => boolean;
  isStoreScopedUser: () => boolean;
  hasPermission: (code: string) => boolean;
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

async function loadStores(): Promise<UserStoreLite[]> {
  try {
    const res = await apiClient.get<{ id: number; name: string }[]>('/store/', { skipGlobalErrorHandler: true });
    const list = Array.isArray(res.data) ? res.data : [];
    if (list.length && !localStorage.getItem('active_store_id')) {
      localStorage.setItem('active_store_id', String(list[0].id));
    }
    return list.map((s) => ({ id: s.id, name: s.name }));
  } catch {
    return [];
  }
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
  stores: [],

  login: async (login: string, password: string) => {
    set({ isLoading: true, error: null });
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
    set({ user: null, token: null, permissions: [], company: null, menus: [], subscriptionActive: false, stores: [] });
  },

  checkAuth: async () => {
    // Sessiya markeri bo'lmasa — /auth/me so'rovini umuman yubormaymiz (401 oldini olamiz).
    if (typeof window !== 'undefined' && !localStorage.getItem('crm_auth_time')) {
      set({ user: null, token: null, permissions: [], company: null, menus: [], subscriptionActive: false, stores: [], isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const me = await saasAuth.me();
      const stores = me.company ? await loadStores() : [];
      set({
        user: mapMeToUser(me),
        token: 'session',
        permissions: me.permissions,
        company: me.company,
        menus: me.menus,
        subscriptionActive: me.subscription_active,
        stores,
        isLoading: false,
      });
    } catch {
      // Sessiya yaroqsiz/eskirgan — markerni tozalaymiz.
      if (typeof window !== 'undefined') localStorage.removeItem('crm_auth_time');
      set({ user: null, token: null, permissions: [], company: null, menus: [], subscriptionActive: false, stores: [], isLoading: false });
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
}));
