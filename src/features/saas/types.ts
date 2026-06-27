// SaaS backend (/api/auth, /api/rbac, /api/companies, ...) tiplari.

export interface MeUser {
  id: number;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  is_superuser: boolean;
  is_email_verified: boolean;
  company_id: number | null;
  role: string | null; // rol nomi (masalan "Owner")
}

export interface MeCompany {
  id: number;
  name: string;
  slug: string | null;
  status: string; // onboarding | active | suspended
  is_active: boolean;
  logo: string | null;
}

export interface MenuItem {
  module: string;
  label: string;
  scope: 'platform' | 'company';
  available: boolean;
}

export interface MeResponse {
  user: MeUser;
  company: MeCompany | null;
  subscription_active: boolean;
  is_superuser: boolean;
  permissions: string[];
  menus: MenuItem[];
}

export interface LoginResponse {
  success: boolean;
  access: string;
  refresh: string;
  user: MeUser;
}

// ---- RBAC ----
export interface PermissionDef {
  code: string;
  label: string;
}
export interface PermissionGroup {
  module: string;
  module_label: string;
  permissions: PermissionDef[];
}
export interface Role {
  id: number;
  name: string;
  description: string | null;
  scope: 'platform' | 'company';
  is_system: boolean;
  permissions: string[];
  users_count?: number;
}
export interface CompanyUser {
  id: number;
  full_name: string | null;
  phone_number: string | null;
  email: string | null;
  is_active: boolean;
  role: string | null;
  role_id: number | null;
}

// ---- Companies / address / categories ----
export interface CompanyCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  // RAW 4 tilli variantlar (admin forma to'ldirish uchun)
  name_uz?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  name_uz_cyrl?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  description_en?: string | null;
  description_uz_cyrl?: string | null;
  is_active?: boolean;
  companies_count?: number;
}
export interface Country { id: number; name: string; name_uz_cyrl?: string | null; name_ru?: string | null; name_en?: string | null; code: string | null; is_active?: boolean; }
export interface Region { id: number; country_id: number; name: string; name_uz_cyrl?: string | null; name_ru?: string | null; name_en?: string | null; is_active?: boolean; }
export interface District { id: number; region_id: number; name: string; name_uz_cyrl?: string | null; name_ru?: string | null; name_en?: string | null; is_active?: boolean; }

export interface Company {
  id: number;
  name: string;
  slug: string | null;
  status: string;
  is_active: boolean;
  logo: string | null;
  phone_number: string | null;
  email: string | null;
  street: string | null;
  latitude: string | null;
  longitude: string | null;
  category: { id: number; name: string } | null;
  country: { id: number; name: string } | null;
  region: { id: number; name: string } | null;
  district: { id: number; name: string } | null;
  owner?: { id: number; full_name: string | null; phone_number: string | null };
  users_count?: number;
  subscription_active?: boolean;
  contact?: import('./contact.types').ContactInfo;
}

// ---- Plans / subscriptions ----
export interface Plan {
  id: number;
  name: string;
  description: string | null;
  // RAW 4 tilli variantlar (admin forma to'ldirish uchun)
  name_uz?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  name_uz_cyrl?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  description_en?: string | null;
  description_uz_cyrl?: string | null;
  price: string;
  duration_days: number;
  features: unknown;
  max_stores: number | null;
  max_users: number | null;
  is_active?: boolean;
  sort_order?: number;
}
export interface Subscription {
  id: number;
  status: string;
  amount: string;
  start_at: string | null;
  end_at: string | null;
  plan: { id: number; name: string; duration_days: number } | null;
  company?: { id: number; name: string };
  created_at?: string;
}
export interface SubscribeResponse {
  subscription: Subscription;
  checkout_url: string | null;
  free?: boolean;
  message?: string;
  payme?: unknown;
}

export interface Paginated<T> {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
