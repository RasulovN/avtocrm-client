import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../app/store';
import { ALWAYS_AVAILABLE_PATHS } from './constants';

function useLang(): string {
  const { i18n } = useTranslation();
  return i18n.language || 'uz';
}

// Ildiz yo'naltirish: login / admin / onboarding / dashboard
export function RootRedirect() {
  const lang = useLang();
  const { user, company, isPlatform } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;
  // Platform (super admin panel) foydalanuvchisi — super admin YOKI platform roli bor.
  // Bunday foydalanuvchi kompaniyaga tegishli emas, shuning uchun onboarding EMAS,
  // to'g'ridan-to'g'ri super admin paneliga o'tadi.
  if (isPlatform) return <Navigate to={`/${lang}/admin`} replace />;
  if (!company) return <Navigate to={`/${lang}/onboarding`} replace />;
  return <Navigate to={`/${lang}/dashboard`} replace />;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Super admin panel: super admin YOKI platform roli/ruxsati bor foydalanuvchi.
// (Har bir admin sahifa API-lari backend'da alohida platform.* ruxsati bilan gate qilinadi.)
export function RequireSuperuser({ children }: { children: ReactNode }) {
  const lang = useLang();
  const { user, isPlatform } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (!isPlatform) return <Navigate to={`/${lang}/dashboard`} replace />;
  return <>{children}</>;
}

// Kompaniya foydalanuvchisi: company bo'lishi shart (aks holda onboarding).
// Platform foydalanuvchisi bu yerga tushmaydi — super admin paneliga yo'naltiriladi.
export function RequireCompany({ children }: { children: ReactNode }) {
  const lang = useLang();
  const { user, company, isPlatform } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (isPlatform) return <Navigate to={`/${lang}/admin`} replace />;
  if (!company) return <Navigate to={`/${lang}/onboarding`} replace />;
  return <>{children}</>;
}

// Ruxsat tekshiruvi
export function RequirePermission({ code, children }: { code: string; children: ReactNode }) {
  const lang = useLang();
  const { hasPermission } = useAuthStore();
  if (!hasPermission(code)) return <Navigate to={`/${lang}/dashboard`} replace />;
  return <>{children}</>;
}

// Obuna gating: obuna faol bo'lmasa, faqat alwaysAvailable sahifalar ochiq.
// `path` — til prefiksisiz joriy yo'l (masalan "/products").
export function SubscriptionGate({ path, children }: { path: string; children: ReactNode }) {
  const lang = useLang();
  const { subscriptionActive } = useAuthStore();
  const isAlways = ALWAYS_AVAILABLE_PATHS.some((p) => path.startsWith(p));
  if (!subscriptionActive && !isAlways) {
    return <Navigate to={`/${lang}/subscription`} replace />;
  }
  return <>{children}</>;
}
