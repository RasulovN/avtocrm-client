import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { getSocket, disconnectSocket } from '../services/socket';
import { notificationApi, type ApiNotification } from '../services/notificationApi';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';

type ConnectionStatus = 'connecting' | 'open' | 'closed' | 'error' | 'reconnecting';

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

type NotificationContextType = {
  notifications: NotificationItem[];
  unreadCount: number;
  connectionStatus: ConnectionStatus;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  clearAll: () => void;
  refresh: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function mapApi(n: ApiNotification): NotificationItem {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link,
    read: n.is_read,
    createdAt: n.created_at,
  };
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('closed');
  const mountedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!authService.isAuthenticated()) return;
    try {
      const [list, count] = await Promise.all([
        notificationApi.list({ page: 1, limit: 30 }),
        notificationApi.unreadCount(),
      ]);
      setNotifications(list.results.map(mapApi));
      setUnreadCount(count);
    } catch (e) {
      // Backend o'chiq / tarmoq xatosi — jimgina o'tkazamiz (console spam bo'lmasin).
      const err = e as { code?: string; response?: unknown };
      const isNetwork = err?.code === 'ERR_NETWORK' || !err?.response;
      if (!isNetwork) logger.error('[NotificationProvider] refresh xato:', e);
    }
  }, []);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    if (!authService.isAuthenticated()) {
      setConnectionStatus('closed');
      return;
    }

    void refresh();

    const socket = getSocket();
    setConnectionStatus('connecting');

    const onConnect = () => setConnectionStatus('open');
    const onDisconnect = () => setConnectionStatus('closed');
    const onConnectError = () => setConnectionStatus('error');
    const onReconnectAttempt = () => setConnectionStatus('reconnecting');
    const onNew = (data: Partial<NotificationItem> & { created_at?: string }) => {
      // Toast + ovoz (socket payload bevosita ishlatiladi)
      window.dispatchEvent(new CustomEvent('notification-toast', { detail: data }));
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(() => {});
      } catch {
        /* ignore */
      }
      // Ro'yxat + sanoqni serverdan yangilaymiz (haqiqiy id va o'qilgan holati uchun)
      void refresh();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.io.on('reconnect_attempt', onReconnectAttempt);
    socket.on('notification:new', onNew);
    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.io.off('reconnect_attempt', onReconnectAttempt);
      socket.off('notification:new', onNew);
      disconnectSocket();
      mountedRef.current = false;
    };
  }, [refresh]);

  const markAsRead = useCallback(async (id: number) => {
    // Realtime toast'da id bo'lmasligi mumkin — bunday holda hech narsa qilmaymiz
    if (typeof id !== 'number' || !Number.isFinite(id)) return;
    let wasUnread = false;
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id && !n.read) wasUnread = true;
        return n.id === id ? { ...n, read: true } : n;
      }),
    );
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await notificationApi.markRead(id);
    } catch {
      /* ignore */
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await notificationApi.markAllRead();
    } catch {
      /* ignore */
    }
  }, []);

  const deleteNotification = useCallback(async (id: number) => {
    if (typeof id !== 'number' || !Number.isFinite(id)) return;
    let wasUnread = false;
    setNotifications((prev) =>
      prev.filter((n) => {
        if (n.id === id && !n.read) wasUnread = true;
        return n.id !== id;
      }),
    );
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await notificationApi.remove(id);
    } catch {
      void refresh();
    }
  }, [refresh]);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    setUnreadCount(0);
    try {
      await notificationApi.clear();
    } catch {
      void refresh();
    }
  }, [refresh]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, connectionStatus, markAsRead, markAllAsRead, deleteNotification, clearAll, refresh }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
