import {
  LayoutDashboard, Package, ArrowDownToLine, ArrowRightLeft, DollarSign, Truck,
  Store, BarChart3, Settings, Users, ClipboardCheck, AlertTriangle, Shield,
  Building2, CreditCard, Tags, MapPin, UserCog, Receipt, Wallet, Undo2,
  Plus, List, LocationEdit, Ruler, Bell, Activity, SlidersHorizontal, Database,
  Inbox, Globe,
} from 'lucide-react';

export interface SubMenuEntry {
  label: string;
  fallback: string;
  path: string;
  icon: React.ElementType;
  permission: string;
}

export interface MenuEntry {
  label: string;        // i18n kaliti yoki to'g'ridan-to'g'ri matn
  fallback: string;     // i18n bo'lmasa
  path: string;         // til prefiksisiz (/:lang qo'shiladi)
  icon: React.ElementType;
  permission: string;   // talab qilinadigan ruxsat kodi
  alwaysAvailable?: boolean; // obuna faol bo'lmasa ham
  children?: SubMenuEntry[]; // submenu (akkordeon)
}

// ───────── Company panel (tenant) ─────────
export const COMPANY_MENU: MenuEntry[] = [
  { label: 'nav.dashboard', fallback: 'Boshqaruv paneli', path: '/dashboard', icon: LayoutDashboard, permission: 'company.dashboard.view' },

  // Sotuvlar — submenu
  {
    label: 'nav.sales', fallback: 'Sotuvlar', path: '/sales', icon: DollarSign, permission: 'company.sales.view',
    children: [
      { label: 'sales.newSale', fallback: 'Yangi sotuv', path: '/sales/new', icon: Plus, permission: 'company.sales.create' },
      { label: 'sales.list', fallback: "Sotuvlar ro'yxati", path: '/sales', icon: List, permission: 'company.sales.view' },
      { label: 'nav.saleReturns', fallback: 'Qaytarishlar', path: '/sales-returns', icon: Undo2, permission: 'company.returns.view' },
    ],
  },

  { label: 'nav.transfers', fallback: "Ko'chirishlar", path: '/transfers', icon: ArrowRightLeft, permission: 'company.transfers.view' },

  // Mahsulotlar — submenu
  {
    label: 'nav.products', fallback: 'Mahsulotlar', path: '/products', icon: Package, permission: 'company.products.view',
    children: [
      { label: 'products.list', fallback: "Mahsulotlar ro'yxati", path: '/products', icon: List, permission: 'company.products.view' },
      { label: 'categories.title', fallback: 'Kategoriyalar', path: '/products/categories', icon: Tags, permission: 'company.categories.view' },
      { label: 'products.ProductLocatiion', fallback: 'Joylashuvlar', path: '/products/location', icon: LocationEdit, permission: 'company.products.view' },
      { label: 'products.units', fallback: "O'lchov birliklari", path: '/products/units', icon: Ruler, permission: 'company.products.view' },
    ],
  },

  { label: 'nav.stockentry', fallback: 'Kirimlar', path: '/stockentry', icon: ArrowDownToLine, permission: 'company.stock_entries.view' },

  // Inventarizatsiya — submenu
  {
    label: 'nav.inventory', fallback: 'Inventarizatsiya', path: '/inventory', icon: ClipboardCheck, permission: 'company.inventory.view',
    children: [
      { label: 'inventory.sessions', fallback: 'Inventarizatsiyalar', path: '/inventory', icon: ClipboardCheck, permission: 'company.inventory.view' },
      { label: 'nav.lowStock', fallback: 'Kam zaxira', path: '/inventory/low-stock', icon: AlertTriangle, permission: 'company.inventory.view' },
      { label: 'inventory.shortages', fallback: 'Kamomatlar', path: '/inventory/kamomat', icon: AlertTriangle, permission: 'company.inventory.view' },
    ],
  },

  { label: 'nav.customers', fallback: 'Mijozlar', path: '/customers', icon: Users, permission: 'company.customers.view' },
  { label: 'nav.suppliers', fallback: "Ta'minotchilar", path: '/suppliers', icon: Truck, permission: 'company.suppliers.view' },
  { label: 'nav.stores', fallback: "Do'konlar", path: '/stores', icon: Store, permission: 'company.stores.view' },
  { label: 'nav.reports', fallback: 'Hisobotlar', path: '/reports', icon: BarChart3, permission: 'company.reports.view' },
  // Sozlamalar — submenu (profil, xodimlar, rollar, obuna, faollik loglari)
  {
    label: 'nav.settings', fallback: 'Sozlamalar', path: '/settings', icon: Settings, permission: 'company.profile.view', alwaysAvailable: true,
    children: [
      { label: 'nav.companyProfile', fallback: 'Kompaniya profili', path: '/company/profile', icon: Building2, permission: 'company.profile.view' },
      { label: 'nav.team', fallback: 'Xodimlar', path: '/company/users', icon: UserCog, permission: 'company.users.view' },
      { label: 'nav.roles', fallback: 'Rollar', path: '/company/roles', icon: Shield, permission: 'company.roles.view' },
      { label: 'nav.subscription', fallback: 'Obuna', path: '/subscription', icon: CreditCard, permission: 'company.subscription.view' },
      { label: 'nav.logs', fallback: 'Faollik loglari', path: '/company/logs', icon: Activity, permission: 'company.profile.view' },
      { label: 'nav.settingsGeneral', fallback: 'Umumiy sozlamalar', path: '/settings', icon: SlidersHorizontal, permission: 'company.settings.update' },
    ],
  },
];

// ───────── Platform panel (super admin) ─────────
export const PLATFORM_MENU: MenuEntry[] = [
  { label: 'admin.dashboardNav', fallback: 'Bosh sahifa', path: '/admin', icon: LayoutDashboard, permission: 'platform.dashboard.view' },
  { label: 'admin.companies', fallback: 'Kompaniyalar', path: '/admin/companies', icon: Building2, permission: 'platform.companies.view' },
  { label: 'admin.leads', fallback: 'Demo zayavkalar', path: '/admin/leads', icon: Inbox, permission: 'platform.leads.view' },

  // Ma'lumotnomalar — submenu (sohalar + manzillar)
  {
    label: 'admin.references', fallback: "Ma'lumotnomalar", path: '/admin/company-categories', icon: Database, permission: 'platform.company_categories.view',
    children: [
      { label: 'admin.categories', fallback: 'Sohalar', path: '/admin/company-categories', icon: Tags, permission: 'platform.company_categories.view' },
      { label: 'admin.geo', fallback: 'Manzillar', path: '/admin/geo', icon: MapPin, permission: 'platform.geo.view' },
    ],
  },

  // Obuna & to'lovlar — submenu
  {
    label: 'admin.billing', fallback: "Obuna & to'lovlar", path: '/admin/plans', icon: CreditCard, permission: 'platform.plans.view',
    children: [
      { label: 'admin.plans', fallback: 'Tariflar', path: '/admin/plans', icon: Wallet, permission: 'platform.plans.view' },
      { label: 'admin.subscriptions', fallback: 'Obunalar', path: '/admin/subscriptions', icon: CreditCard, permission: 'platform.subscriptions.view' },
      { label: 'admin.payments', fallback: "To'lovlar", path: '/admin/payments', icon: Receipt, permission: 'platform.payments.view' },
    ],
  },

  // Administratsiya — submenu (rollar, adminlar, faolliklar)
  {
    label: 'admin.administration', fallback: 'Administratsiya', path: '/admin/roles', icon: Shield, permission: 'platform.roles.view',
    children: [
      { label: 'admin.roles', fallback: 'Rollar', path: '/admin/roles', icon: Shield, permission: 'platform.roles.view' },
      { label: 'admin.users', fallback: 'Administratorlar', path: '/admin/users', icon: UserCog, permission: 'platform.users.view' },
      { label: 'admin.logs', fallback: 'Faollik loglari', path: '/admin/logs', icon: Activity, permission: 'platform.dashboard.view' },
    ],
  },

  { label: 'admin.notifications', fallback: 'Bildirishnomalar', path: '/admin/notifications', icon: Bell, permission: 'platform.dashboard.view' },
  { label: 'admin.siteSettings', fallback: 'Landing sozlamalari', path: '/admin/site-settings', icon: Globe, permission: 'platform.settings.view' },
];
