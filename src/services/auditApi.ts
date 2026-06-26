import { apiClient } from './api';

export interface AuditLogRow {
  id: number;
  user_id: number | null;
  user_name: string | null;
  company_id: number | null;
  company_name: string | null;
  action: string;
  entity: string | null;
  entity_id: number | null;
  summary: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface Paginated<T> {
  count: number;
  results: T[];
}

export interface AuditQuery {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
  user_id?: number;
  company_id?: number;
  date_from?: string;
  date_to?: string;
}

export const auditApi = {
  logs: (params?: AuditQuery) =>
    apiClient.get<Paginated<AuditLogRow>>('/audit/logs/', { params }).then((r) => r.data),
  my: (params?: AuditQuery) =>
    apiClient.get<Paginated<AuditLogRow>>('/audit/my/', { params }).then((r) => r.data),
};
