import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck, Package, ArrowRightLeft, AlertTriangle, Megaphone, X, Trash2 } from 'lucide-react';
import { cn } from '../../utils';
import { useNotifications, type NotificationItem } from '../../context/NotificationProvider';

function iconFor(type: string) {
  if (type === 'announcement') return Megaphone;
  if (type === 'tc' || type === 'ta' || type === 'tr') return ArrowRightLeft;
  if (type === 'lp' || type === 'lt') return AlertTriangle;
  return Package;
}

function timeAgo(iso: string, t: (k: string, fb: string) => string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return t('notifications.justNow', 'hozir');
  if (m < 60) return `${m} ${t('notifications.minAgo', 'daqiqa oldin')}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ${t('notifications.hourAgo', 'soat oldin')}`;
  const d = Math.floor(h / 24);
  return `${d} ${t('notifications.dayAgo', 'kun oldin')}`;
}

export function NotificationBell() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language || 'uz';
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleClick = (n: NotificationItem) => {
    if (!n.read) markAsRead(n.id);
    if (n.link) {
      setOpen(false);
      const path = n.link.startsWith('/') ? `/${lang}${n.link}` : n.link;
      navigate(path);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('notifications.title', 'Bildirishnomalar')}
        className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
      >
        <Bell className="h-[18px] w-[18px] text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-2rem)] rounded-xl border border-border/60 bg-card shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border/60">
            <span className="text-sm font-semibold">{t('notifications.title', 'Bildirishnomalar')}</span>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  {t('notifications.markAllRead', "Hammasini o'qildi")}
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearAll()}
                  className="flex items-center gap-1 text-xs text-destructive hover:underline"
                  title={t('notifications.clearAll', "Hammasini tozalash")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('notifications.clearAll', "Tozalash")}
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                {t('notifications.empty', 'Bildirishnomalar yo\'q')}
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = iconFor(n.type);
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'group relative flex w-full items-start gap-3 px-4 py-3 border-b border-border/40 hover:bg-muted/50 transition-colors',
                      !n.read && 'bg-primary/5',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleClick(n)}
                      className="flex min-w-0 flex-1 items-start gap-3 text-left"
                    >
                      <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', n.read ? 'bg-muted' : 'bg-primary/10')}>
                        <Icon className={cn('h-4 w-4', n.read ? 'text-muted-foreground' : 'text-primary')} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm truncate', !n.read && 'font-semibold')}>{n.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                        <p className="text-[11px] text-muted-foreground/70 mt-0.5">{timeAgo(n.createdAt, t)}</p>
                      </div>
                    </button>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                        title={t('common.delete', "O'chirish")}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
