import { apiClient } from '../../services/api';
import type {
  MeResponse, LoginResponse, PermissionGroup, Role, CompanyUser,
  CompanyCategory, Country, Region, District, Company, Plan, Subscription,
  SubscribeResponse, Paginated,
} from './types';

// ===================== AUTH =====================
export const saasAuth = {
  register: (data: { email: string; password: string; confirm_password: string; full_name?: string }) =>
    apiClient.post('/auth/register/', data).then((r) => r.data),

  verifyEmail: (token: string) =>
    apiClient.post('/auth/verify-email/', { token }).then((r) => r.data),

  resendVerification: (email: string) =>
    apiClient.post('/auth/resend-verification/', { email }).then((r) => r.data),

  // login = telefon raqami YOKI email
  login: (login: string, password: string) =>
    apiClient.post<LoginResponse>('/auth/login/', { login, password }).then((r) => r.data),

  logout: () => apiClient.post('/auth/logout/', undefined, { skipGlobalErrorHandler: true }).catch(() => {}),

  me: () => apiClient.get<MeResponse>('/auth/me/', { skipGlobalErrorHandler: true }).then((r) => r.data),

  refresh: () => apiClient.post('/auth/refresh/', undefined, { skipGlobalErrorHandler: true }).then((r) => r.data),

  changePassword: (data: { old_password: string; new_password: string; confirm_password: string }) =>
    apiClient.post('/auth/change-password/', data).then((r) => r.data),

  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password/', { email }).then((r) => r.data),

  resetPassword: (uidb64: string, token: string, password: string, confirm_password: string) =>
    apiClient.post(`/auth/reset-password/${uidb64}/${token}/`, { password, confirm_password }).then((r) => r.data),
};

// ===================== RBAC =====================
export const rbacApi = {
  permissions: (scope?: 'platform' | 'company') =>
    apiClient.get<PermissionGroup[]>('/rbac/permissions/', { params: scope ? { scope } : {} }).then((r) => r.data),

  // platform | company
  listRoles: (scope: 'platform' | 'company') =>
    apiClient.get<Role[]>(`/rbac/${scope}/roles/`).then((r) => r.data),
  // Xodimga rol biriktirish uchun yengil ro'yxat (company.users.view bilan ochiq)
  assignableRoles: () =>
    apiClient
      .get<{ id: number; name: string; is_system: boolean }[]>('/rbac/company/assignable-roles/')
      .then((r) => r.data),
  createRole: (scope: 'platform' | 'company', data: { name: string; description?: string; permissions: string[] }) =>
    apiClient.post<Role>(`/rbac/${scope}/roles/`, data).then((r) => r.data),
  getRole: (scope: 'platform' | 'company', id: number) =>
    apiClient.get<Role>(`/rbac/${scope}/roles/${id}/`).then((r) => r.data),
  updateRole: (scope: 'platform' | 'company', id: number, data: { name?: string; description?: string; permissions?: string[] }) =>
    apiClient.put<Role>(`/rbac/${scope}/roles/${id}/`, data).then((r) => r.data),
  deleteRole: (scope: 'platform' | 'company', id: number) =>
    apiClient.delete(`/rbac/${scope}/roles/${id}/`).then((r) => r.data),

  listUsers: (scope: 'platform' | 'company', params?: Record<string, unknown>) =>
    apiClient.get<Paginated<CompanyUser>>(`/rbac/${scope}/users/`, { params }).then((r) => r.data),
  // super admin: barcha foydalanuvchilar (platform + kompaniyalar)
  allUsers: (params?: Record<string, unknown>) =>
    apiClient.get<Paginated<CompanyUser & { company_name: string | null; is_superuser: boolean }>>(
      '/rbac/all-users/', { params },
    ).then((r) => r.data),
  createUser: (scope: 'platform' | 'company', data: Record<string, unknown>) =>
    apiClient.post<CompanyUser>(`/rbac/${scope}/users/`, data).then((r) => r.data),
  updateUser: (scope: 'platform' | 'company', id: number, data: Record<string, unknown>) =>
    apiClient.put<CompanyUser>(`/rbac/${scope}/users/${id}/`, data).then((r) => r.data),
  deleteUser: (scope: 'platform' | 'company', id: number) =>
    apiClient.delete(`/rbac/${scope}/users/${id}/`).then((r) => r.data),
};

// ===================== COMPANIES =====================
export const companiesApi = {
  onboarding: (data: Record<string, unknown>) =>
    apiClient.post('/companies/onboarding/', data).then((r) => r.data),
  me: () => apiClient.get<Company>('/companies/me/').then((r) => r.data),
  updateMe: (data: Record<string, unknown>) => apiClient.put<Company>('/companies/me/', data).then((r) => r.data),

  // super admin
  list: (params?: Record<string, unknown>) =>
    apiClient.get<Paginated<Company>>('/companies/', { params }).then((r) => r.data),
  get: (id: number) => apiClient.get<Company>(`/companies/${id}/`).then((r) => r.data),
  setStatus: (id: number, data: { status?: string; is_active?: boolean }) =>
    apiClient.patch(`/companies/${id}/status/`, data).then((r) => r.data),
  remove: (id: number) => apiClient.delete(`/companies/${id}/`).then((r) => r.data),
};

// ===================== COMPANY CATEGORIES (sohalar) =====================
export const companyCategoriesApi = {
  list: (all = false) =>
    apiClient.get<CompanyCategory[]>('/company-categories/', { params: all ? { all: true } : {} }).then((r) => r.data),
  adminList: () => apiClient.get<CompanyCategory[]>('/company-categories/admin/').then((r) => r.data),
  create: (data: Record<string, unknown>) => apiClient.post('/company-categories/', data).then((r) => r.data),
  update: (id: number, data: Record<string, unknown>) => apiClient.put(`/company-categories/${id}/`, data).then((r) => r.data),
  remove: (id: number) => apiClient.delete(`/company-categories/${id}/`).then((r) => r.data),
};

// ===================== GEO (manzil) =====================
export const geoApi = {
  countries: (all = false) => apiClient.get<Country[]>('/geo/countries/', { params: all ? { all: true } : {} }).then((r) => r.data),
  regions: (countryId: number) => apiClient.get<Region[]>('/geo/regions/', { params: { country_id: countryId } }).then((r) => r.data),
  districts: (regionId: number) => apiClient.get<District[]>('/geo/districts/', { params: { region_id: regionId } }).then((r) => r.data),
  yandexKey: () => apiClient.get<{ api_key: string }>('/geo/yandex-key/').then((r) => r.data),

  createCountry: (data: Record<string, unknown>) => apiClient.post('/geo/countries/', data).then((r) => r.data),
  updateCountry: (id: number, data: Record<string, unknown>) => apiClient.put(`/geo/countries/${id}/`, data).then((r) => r.data),
  deleteCountry: (id: number) => apiClient.delete(`/geo/countries/${id}/`).then((r) => r.data),
  createRegion: (data: Record<string, unknown>) => apiClient.post('/geo/regions/', data).then((r) => r.data),
  updateRegion: (id: number, data: Record<string, unknown>) => apiClient.put(`/geo/regions/${id}/`, data).then((r) => r.data),
  deleteRegion: (id: number) => apiClient.delete(`/geo/regions/${id}/`).then((r) => r.data),
  createDistrict: (data: Record<string, unknown>) => apiClient.post('/geo/districts/', data).then((r) => r.data),
  updateDistrict: (id: number, data: Record<string, unknown>) => apiClient.put(`/geo/districts/${id}/`, data).then((r) => r.data),
  deleteDistrict: (id: number) => apiClient.delete(`/geo/districts/${id}/`).then((r) => r.data),
};

// ===================== PLANS =====================
export const plansApi = {
  list: () => apiClient.get<Plan[]>('/plans/').then((r) => r.data),
  adminList: () => apiClient.get<Plan[]>('/plans/admin/').then((r) => r.data),
  create: (data: Record<string, unknown>) => apiClient.post('/plans/', data).then((r) => r.data),
  update: (id: number, data: Record<string, unknown>) => apiClient.put(`/plans/${id}/`, data).then((r) => r.data),
  remove: (id: number) => apiClient.delete(`/plans/${id}/`).then((r) => r.data),
};

// ===================== SUBSCRIPTIONS =====================
export const subscriptionsApi = {
  subscribe: (planId: number) =>
    apiClient.post<SubscribeResponse>('/subscriptions/', { plan_id: planId }).then((r) => r.data),
  me: () => apiClient.get<{ active: Subscription | null; history: Subscription[] }>('/subscriptions/me/').then((r) => r.data),
  active: () => apiClient.get<{ active: Subscription | null; days_left: number | null }>('/subscriptions/me/active/').then((r) => r.data),

  // super admin
  list: (params?: Record<string, unknown>) =>
    apiClient.get<Paginated<Subscription>>('/subscriptions/', { params }).then((r) => r.data),
  manage: (id: number, action: 'activate' | 'cancel' | 'extend', days?: number) =>
    apiClient.patch(`/subscriptions/${id}/`, { action, days }).then((r) => r.data),
};
