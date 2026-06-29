import { Suspense, lazy, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useThemeStore, useAuthStore } from './app/store';

// Layouts
import { CompanyLayout } from './features/saas/layouts/CompanyLayout';
import { PlatformLayout } from './features/saas/layouts/PlatformLayout';
// Guards
import {
  RootRedirect, RequireAuth, RequireSuperuser, RequireCompany, SubscriptionGate,
} from './features/saas/guards';

// ───── Auth / SaaS pages ─────
const LoginPage = lazy(() => import('./features/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./features/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const RegisterPage = lazy(() => import('./features/saas/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() => import('./features/saas/pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })));
const OnboardingPage = lazy(() => import('./features/saas/pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })));
const SubscriptionPage = lazy(() => import('./features/saas/pages/SubscriptionPage').then((m) => ({ default: m.SubscriptionPage })));

// ───── Platform (super admin) ─────
const AdminDashboardPage = lazy(() => import('./features/saas/pages/platform/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const CompaniesPage = lazy(() => import('./features/saas/pages/platform/CompaniesPage').then((m) => ({ default: m.CompaniesPage })));
const PlansPage = lazy(() => import('./features/saas/pages/platform/PlansPage').then((m) => ({ default: m.PlansPage })));
const AdminSubscriptionsPage = lazy(() => import('./features/saas/pages/platform/SubscriptionsPage').then((m) => ({ default: m.SubscriptionsPage })));
const CompanyCategoriesPage = lazy(() => import('./features/saas/pages/platform/CompanyCategoriesPage').then((m) => ({ default: m.CompanyCategoriesPage })));
const GeoPage = lazy(() => import('./features/saas/pages/platform/GeoPage').then((m) => ({ default: m.GeoPage })));
const LeadsPage = lazy(() => import('./features/saas/pages/platform/LeadsPage').then((m) => ({ default: m.LeadsPage })));
const SiteSettingsPage = lazy(() => import('./features/saas/pages/platform/SiteSettingsPage').then((m) => ({ default: m.SiteSettingsPage })));
const PlatformRolesPage = lazy(() => import('./features/saas/pages/platform/PlatformRolesPage').then((m) => ({ default: m.PlatformRolesPage })));
const PlatformUsersPage = lazy(() => import('./features/saas/pages/platform/PlatformUsersPage').then((m) => ({ default: m.PlatformUsersPage })));
const PlatformNotificationsPage = lazy(() => import('./features/saas/pages/platform/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const AuditLogsPage = lazy(() => import('./features/saas/pages/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage })));

// ───── Landing (ommaviy marketing sahifa) ─────
const LandingHomePage = lazy(() => import('./features/landing/LandingHomePage').then((m) => ({ default: m.LandingHomePage })));
const LandingFeaturesPage = lazy(() => import('./features/landing/LandingFeaturesPage').then((m) => ({ default: m.LandingFeaturesPage })));
const LandingPricingPage = lazy(() => import('./features/landing/LandingPricingPage').then((m) => ({ default: m.LandingPricingPage })));
const LandingLegalPage = lazy(() => import('./features/landing/LandingLegalPage').then((m) => ({ default: m.LandingLegalPage })));

// Ildiz: autentifikatsiya bo'lsa ilovaga yo'naltiradi, aks holda landing'ni ko'rsatadi.
function PublicHome() {
  // Qiymatlarga (funksiyaga emas) obuna — login/logout'da reaktiv qayta render bo'ladi.
  const authed = useAuthStore((s) => !!s.user || !!s.token);
  return authed ? <RootRedirect /> : <LandingHomePage />;
}

// ───── Company management ─────
const CompanyProfilePage = lazy(() => import('./features/saas/pages/company/CompanyProfilePage').then((m) => ({ default: m.CompanyProfilePage })));
const CompanyRolesPage = lazy(() => import('./features/saas/pages/company/CompanyRolesPage').then((m) => ({ default: m.CompanyRolesPage })));
const CompanyUsersPage = lazy(() => import('./features/saas/pages/company/CompanyUsersPage').then((m) => ({ default: m.CompanyUsersPage })));

// ───── CRM pages (tenant) ─────
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ProductListPage = lazy(() => import('./features/products/ProductListPage').then((m) => ({ default: m.ProductListPage })));
const ProductFormPage = lazy(() => import('./features/products/ProductFormPage').then((m) => ({ default: m.ProductFormPage })));
const ProductBarcodePage = lazy(() => import('./features/products/ProductBarcodePage').then((m) => ({ default: m.ProductBarcodePage })));
const ProductUnitPage = lazy(() => import('./features/products/ProductUnit').then((m) => ({ default: m.default })));
const CategoryListPage = lazy(() => import('./features/categories/CategoryListPage').then((m) => ({ default: m.CategoryListPage })));
const ProductLocationPage = lazy(() => import('./features/product-location/ProductLocationPage').then((m) => ({ default: m.ProductLocationPage })));
const StockEntryListPage = lazy(() => import('./features/StockEntry/StockEntryListPage').then((m) => ({ default: m.StockEntryListPage })));
const InventorySessionsListPage = lazy(() => import('./features/inventory/InventoryListPage').then((m) => ({ default: m.InventorySessionsListPage })));
const InventoryDetailPage = lazy(() => import('./features/inventory/InventoryDetailPage').then((m) => ({ default: m.InventoryDetailPage })));
const InventoryShortagesPage = lazy(() => import('./features/inventory/InventoryShortagesPage').then((m) => ({ default: m.InventoryShortagesPage })));
const LowStockPage = lazy(() => import('./features/inventory/LowStockPage').then((m) => ({ default: m.LowStockPage })));
const TransferListPage = lazy(() => import('./features/transfers/pages/TransferListPage').then((m) => ({ default: m.TransferListPage })));
const TransferCreatePage = lazy(() => import('./features/transfers/pages/TransferCreatePage').then((m) => ({ default: m.TransferCreatePage })));
const TransferRequestsPage = lazy(() => import('./features/transfers/pages/TransferRequestsPage').then((m) => ({ default: m.TransferRequestsPage })));
const SalesListPage = lazy(() => import('./features/sales/SalesListPage').then((m) => ({ default: m.SalesListPage })));
const SalesPage = lazy(() => import('./features/sales/SalesPage').then((m) => ({ default: m.SalesPage })));
const SalesDetailPage = lazy(() => import('./features/sales/SalesDetailPage').then((m) => ({ default: m.SalesDetailPage })));
const SaleReturnListPage = lazy(() => import('./features/sales/SaleReturnListPage').then((m) => ({ default: m.SaleReturnListPage })));
const SaleReturnCreatePage = lazy(() => import('./features/sales/SaleReturnCreatePage').then((m) => ({ default: m.SaleReturnCreatePage })));
const CustomerListPage = lazy(() => import('./features/customers/CustomerListPage').then((m) => ({ default: m.CustomerListPage })));
const SupplierListPage = lazy(() => import('./features/suppliers/SupplierListPage').then((m) => ({ default: m.SupplierListPage })));
const StoreListPage = lazy(() => import('./features/stores/StoreListPage').then((m) => ({ default: m.StoreListPage })));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ReportsPage = lazy(() => import('./features/reports/ReportsPage').then((m) => ({ default: m.ReportsPage })));

import './i18n/index';
import InventoryPage from './features/inventory/InventoryPage';

function DocumentMetaSync() {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  useEffect(() => {
    const HTML_LANG_MAP: Record<string, string> = { uz: 'uz', cyrl: 'uz-Cyrl', ru: 'ru', en: 'en' };
    document.documentElement.lang = HTML_LANG_MAP[i18n.language] ?? 'uz';
    document.title = t('seo.defaultTitle', 'Zumex');
  }, [i18n.language, location.pathname, t]);
  return null;
}

function App() {
  const { theme } = useThemeStore();
  const { t, i18n } = useTranslation();
  const checkAuth = useAuthStore((s) => s.checkAuth);
  // user/token qiymatlariga obuna bo'lamiz — shunda login VA logout'da App qayta
  // render bo'lib, /login·/register route elementlari yangidan baholanadi (aks holda
  // logout'dan keyin eski <RootRedirect/> qolib, sahifa bo'sh ko'rinardi).
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const authed = !!user || !!token;

  useEffect(() => { checkAuth(); }, [checkAuth]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const lang = i18n.language || 'uz';

  if (isAuthLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center" aria-busy="true">
        <div className="text-sm text-muted-foreground">{t('common.loading', 'Yuklanmoqda...')}</div>
      </main>
    );
  }

  const fallback = (
    <main className="flex min-h-screen items-center justify-center" aria-busy="true">
      <div className="text-sm text-muted-foreground">{t('common.loading', 'Yuklanmoqda...')}</div>
    </main>
  );

  // Company CRM/management route: auth + company + subscription gating + layout
  const companyRoute = (path: string, page: ReactNode) => (
    <RequireCompany>
      <SubscriptionGate path={path}>
        <CompanyLayout>{page}</CompanyLayout>
      </SubscriptionGate>
    </RequireCompany>
  );

  // Platform (super admin) route
  const platformRoute = (page: ReactNode) => (
    <RequireSuperuser>
      <PlatformLayout>{page}</PlatformLayout>
    </RequireSuperuser>
  );

  return (
    <BrowserRouter>
      <DocumentMetaSync />
      <Toaster position="top-center" toastOptions={{ duration: 2500 }} containerStyle={{ top: 80 }} />
      <Suspense fallback={fallback}>
        <Routes>
          {/* Public auth */}
          <Route path="/login" element={authed ? <RootRedirect /> : <LoginPage />} />
          <Route path="/register" element={authed ? <RootRedirect /> : <RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:uidb64/:token" element={<ResetPasswordPage />} />

          {/* Root → landing (mehmon) yoki ilovaga yo'naltirish (autentifikatsiya bo'lsa) */}
          <Route path="/" element={<PublicHome />} />
          <Route path="/:lang" element={<PublicHome />} />

          {/* Ommaviy landing sahifalari (autentifikatsiyasiz ham ochiq) */}
          <Route path="/:lang/features" element={<LandingFeaturesPage />} />
          <Route path="/:lang/pricing" element={<LandingPricingPage />} />

          {/* Huquqiy sahifalar — to'g'ridan-to'g'ri ochiladi (Paddle to'lov tekshiruvi uchun) */}
          <Route path="/terms" element={<LandingLegalPage which="terms" />} />
          <Route path="/privacy" element={<LandingLegalPage which="privacy" />} />
          <Route path="/refunds" element={<LandingLegalPage which="refund" />} />
          <Route path="/:lang/terms" element={<LandingLegalPage which="terms" />} />
          <Route path="/:lang/privacy" element={<LandingLegalPage which="privacy" />} />
          <Route path="/:lang/refunds" element={<LandingLegalPage which="refund" />} />

          {/* Onboarding (auth, no company yet) */}
          <Route path="/:lang/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />

          {/* ───── Platform (super admin) ───── */}
          <Route path="/:lang/admin" element={platformRoute(<AdminDashboardPage />)} />
          <Route path="/:lang/admin/companies" element={platformRoute(<CompaniesPage />)} />
          <Route path="/:lang/admin/plans" element={platformRoute(<PlansPage />)} />
          <Route path="/:lang/admin/subscriptions" element={platformRoute(<AdminSubscriptionsPage />)} />
          <Route path="/:lang/admin/company-categories" element={platformRoute(<CompanyCategoriesPage />)} />
          <Route path="/:lang/admin/geo" element={platformRoute(<GeoPage />)} />
          <Route path="/:lang/admin/leads" element={platformRoute(<LeadsPage />)} />
          <Route path="/:lang/admin/site-settings" element={platformRoute(<SiteSettingsPage />)} />
          <Route path="/:lang/admin/roles" element={platformRoute(<PlatformRolesPage />)} />
          <Route path="/:lang/admin/users" element={platformRoute(<PlatformUsersPage />)} />
          <Route path="/:lang/admin/notifications" element={platformRoute(<PlatformNotificationsPage />)} />
          <Route path="/:lang/admin/logs" element={platformRoute(<AuditLogsPage />)} />

          {/* ───── Subscription (always available) ───── */}
          <Route path="/:lang/subscription" element={companyRoute('/subscription', <SubscriptionPage />)} />

          {/* ───── Company management ───── */}
          <Route path="/:lang/company/profile" element={companyRoute('/company/profile', <CompanyProfilePage />)} />
          <Route path="/:lang/company/roles" element={companyRoute('/company/roles', <CompanyRolesPage />)} />
          <Route path="/:lang/company/users" element={companyRoute('/company/users', <CompanyUsersPage />)} />
          <Route path="/:lang/company/logs" element={companyRoute('/company/logs', <AuditLogsPage />)} />

          {/* ───── Company CRM ───── */}
          <Route path="/:lang/dashboard" element={companyRoute('/dashboard', <DashboardPage />)} />
          <Route path="/:lang/products" element={companyRoute('/products', <ProductListPage />)} />
          <Route path="/:lang/products/new" element={companyRoute('/products', <ProductFormPage />)} />
          <Route path="/:lang/products/:id/edit" element={companyRoute('/products', <ProductFormPage />)} />
          <Route path="/:lang/products/:id/barcode" element={companyRoute('/products', <ProductBarcodePage />)} />
          <Route path="/:lang/products/units" element={companyRoute('/products', <ProductUnitPage />)} />
          <Route path="/:lang/products/categories" element={companyRoute('/products', <CategoryListPage />)} />
          <Route path="/:lang/products/location" element={companyRoute('/products', <ProductLocationPage />)} />
          <Route path="/:lang/stockentry" element={companyRoute('/stockentry', <StockEntryListPage />)} />
          <Route path="/:lang/inventory" element={companyRoute('/inventory', <InventorySessionsListPage />)} />
          <Route path="/:lang/inventory/new" element={companyRoute('/inventory', <InventoryPage />)} />
          <Route path="/:lang/inventory/kirimlar" element={companyRoute('/inventory', <StockEntryListPage />)} />
          <Route path="/:lang/inventory/kamomat" element={companyRoute('/inventory', <InventoryShortagesPage />)} />
          <Route path="/:lang/inventory/low-stock" element={companyRoute('/inventory', <LowStockPage />)} />
          <Route path="/:lang/inventory-sessions" element={companyRoute('/inventory', <InventorySessionsListPage />)} />
          <Route path="/:lang/inventory-session/:id" element={companyRoute('/inventory', <InventoryDetailPage />)} />
          <Route path="/:lang/transfers" element={companyRoute('/transfers', <TransferListPage />)} />
          <Route path="/:lang/transfers/new" element={companyRoute('/transfers', <TransferCreatePage />)} />
          <Route path="/:lang/transfers/requests" element={companyRoute('/transfers', <TransferRequestsPage />)} />
          <Route path="/:lang/transfer-requests" element={companyRoute('/transfers', <TransferRequestsPage />)} />
          <Route path="/:lang/sales/new" element={companyRoute('/sales', <SalesPage />)} />
          <Route path="/:lang/sales" element={companyRoute('/sales', <SalesListPage />)} />
          <Route path="/:lang/sales/:id" element={companyRoute('/sales', <SalesDetailPage />)} />
          <Route path="/:lang/sales-returns" element={companyRoute('/sales-returns', <SaleReturnListPage />)} />
          <Route path="/:lang/sales-returns/new" element={companyRoute('/sales-returns', <SaleReturnCreatePage />)} />
          <Route path="/:lang/customers" element={companyRoute('/customers', <CustomerListPage />)} />
          <Route path="/:lang/suppliers" element={companyRoute('/suppliers', <SupplierListPage />)} />
          <Route path="/:lang/stores" element={companyRoute('/stores', <StoreListPage />)} />
          <Route path="/:lang/reports" element={companyRoute('/reports', <ReportsPage />)} />
          <Route path="/:lang/settings" element={companyRoute('/settings', <SettingsPage />)} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={`/${lang}`} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
