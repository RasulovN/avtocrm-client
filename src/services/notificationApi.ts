import { apiClient } from './api';

export interface ApiNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  transfer: number | null;
  announcement: number | null;
  created_at: string;
}

interface Paginated<T> {
  count: number;
  results: T[];
}

export type Audience = 'all' | 'mobile' | 'company_users' | 'company_admins' | 'company';

export interface BroadcastInput {
  title: string;
  message: string;
  link?: string | null;
  audience: Audience;
  company?: number | null;
}

export interface BroadcastItem {
  id: number;
  title: string;
  message: string;
  link: string | null;
  audience: Audience;
  company: { id: number; name: string } | null;
  recipient_count: number;
  created_by: string | null;
  created_at: string;
}

export const notificationApi = {
  list: (params?: { page?: number; limit?: number; unread?: boolean; archived?: boolean }) =>
    apiClient
      .get<Paginated<ApiNotification>>('/notifications/', {
        // Fon so'rovi — backend o'chiq bo'lsa global xato loggerini chaqirmaymiz.
        skipGlobalErrorHandler: true,
        params: {
          page: params?.page,
          limit: params?.limit,
          unread: params?.unread ? 1 : undefined,
          archived: params?.archived ? 1 : undefined,
        },
      })
      .then((r) => r.data),

  unreadCount: () =>
    apiClient
      .get<{ count: number }>('/notifications/unread-count/', { skipGlobalErrorHandler: true })
      .then((r) => r.data.count),

  markRead: (id: number) => apiClient.post(`/notifications/${id}/read/`),

  markAllRead: () => apiClient.post<{ updated: number }>('/notifications/read-all/'),

  // Bittasini o'chirish
  remove: (id: number) => apiClient.delete<{ status: string }>(`/notifications/${id}/`),

  // Hammasini tozalash (readOnly=true -> faqat o'qilganlar)
  clear: (readOnly?: boolean) =>
    apiClient
      .delete<{ deleted: number }>('/notifications/', { params: { read: readOnly ? 1 : undefined } })
      .then((r) => r.data),

  // ── Super admin ──
  broadcast: (input: BroadcastInput) =>
    apiClient
      .post<{ id: number; recipient_count: number }>('/notifications/broadcast/', input)
      .then((r) => r.data),

  broadcasts: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<Paginated<BroadcastItem>>('/notifications/broadcasts/', { params })
      .then((r) => r.data),

  // Yuborilgan broadcast'ni admin o'z ko'rinishidan o'chiradi
  // (qabul qiluvchilarning bildirishnomalari saqlanadi).
  deleteBroadcast: (id: number) =>
    apiClient.delete<{ status: string }>(`/notifications/broadcasts/${id}/`),
};
