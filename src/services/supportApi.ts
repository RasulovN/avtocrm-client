import { apiClient, API_ORIGIN } from './api';

// ───────────── Turlar ─────────────
export interface SupportAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface SupportMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_role: 'user' | 'agent';
  body: string | null;
  attachments: SupportAttachment[];
  is_read: boolean;
  created_at: string;
}

export interface SupportConversation {
  id: number;
  user_id: number;
  company_id: number | null;
  status: string;
  last_message_at: string | null;
  last_message_text: string | null;
  user_unread: number;
  agent_unread: number;
  created_at: string;
  updated_at: string;
  user: { id: number; full_name: string | null; email: string | null; phone_number: string | null } | null;
  company: { id: number; name: string } | null;
}

export interface ConversationThread {
  conversation: SupportConversation;
  messages: SupportMessage[];
  has_more: boolean;
}

export interface OlderMessages {
  results: SupportMessage[];
  has_more: boolean;
}

export interface SupportPaginated<T> {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Realtime payload (socket `support:message`).
export interface SupportMessageEvent {
  conversation_id: number;
  message: SupportMessage;
}

// Nisbiy media URL'ni to'liq manzilga aylantiradi (dev'da proxy, prod'da api origin).
export function resolveSupportUrl(url: string): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return url;
}

// ───────────── API ─────────────
export const supportApi = {
  // Umumiy: fayllarni yuklash (rasm/hujjat).
  upload: (files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    return apiClient
      .post<{ attachments: SupportAttachment[] }>('/support/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.attachments);
  },

  // ── Foydalanuvchi (kompaniya) tomoni ──
  myThread: () => apiClient.get<ConversationThread>('/support/me').then((r) => r.data),
  myOlder: (before: number) =>
    apiClient.get<OlderMessages>('/support/me/messages', { params: { before } }).then((r) => r.data),
  myUnread: () => apiClient.get<{ count: number }>('/support/me/unread').then((r) => r.data),
  sendMine: (body: string, attachments: SupportAttachment[]) =>
    apiClient.post<SupportMessage>('/support/me/messages', { body, attachments }).then((r) => r.data),

  // ── Agent (super admin) tomoni ──
  conversations: (params?: { status?: string; q?: string; page?: number; limit?: number }) =>
    apiClient.get<SupportPaginated<SupportConversation>>('/support/conversations', { params }).then((r) => r.data),
  agentUnread: () =>
    apiClient.get<{ count: number; conversations: number }>('/support/unread').then((r) => r.data),
  thread: (id: number) =>
    apiClient.get<ConversationThread>(`/support/conversations/${id}`).then((r) => r.data),
  older: (id: number, before: number) =>
    apiClient.get<OlderMessages>(`/support/conversations/${id}/messages`, { params: { before } }).then((r) => r.data),
  sendAgent: (id: number, body: string, attachments: SupportAttachment[]) =>
    apiClient.post<SupportMessage>(`/support/conversations/${id}/messages`, { body, attachments }).then((r) => r.data),
  setStatus: (id: number, status: 'open' | 'closed') =>
    apiClient.post<SupportConversation>(`/support/conversations/${id}/status`, { status }).then((r) => r.data),
};
