import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Bot, X, Headset, Loader2 } from 'lucide-react';
import { getSocket } from '../../services/socket';
import { supportApi } from '../../services/supportApi';
import type { SupportMessage, SupportMessageEvent } from '../../services/supportApi';
import { ChatInput, MessageList } from './chat';

export function SupportWidget() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unread, setUnread] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const openRef = useRef(open);
  openRef.current = open;

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  const appendUnique = useCallback((msg: SupportMessage) => {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
  }, []);

  // Boshlang'ich o'qilmaganlar soni.
  useEffect(() => {
    supportApi.myUnread().then((r) => setUnread(r.count)).catch(() => {});
  }, []);

  // Jonli xabarlar (socket).
  useEffect(() => {
    const socket = getSocket();
    const onMessage = (evt: SupportMessageEvent) => {
      const msg = evt.message;
      if (openRef.current) {
        appendUnique(msg);
        scrollToBottom();
      } else if (msg.sender_role === 'agent') {
        setUnread((u) => u + 1);
      }
    };
    socket.on('support:message', onMessage);
    return () => {
      socket.off('support:message', onMessage);
    };
  }, [appendUnique, scrollToBottom]);

  // Panel ochilganda suhbatni yuklaymiz (server o'qilgan deb belgilaydi).
  const openPanel = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const data = await supportApi.myThread();
      setMessages(data.messages);
      setHasMore(data.has_more);
      setUnread(0);
      scrollToBottom();
    } catch {
      toast.error(t('common.error', 'Xatolik yuz berdi'));
    } finally {
      setLoading(false);
    }
  };

  const loadOlder = async () => {
    if (!messages.length) return;
    setLoadingMore(true);
    try {
      const data = await supportApi.myOlder(messages[0].id);
      setMessages((prev) => [...data.results, ...prev]);
      setHasMore(data.has_more);
    } catch {
      /* ignore */
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSend = async (body: string, files: File[]) => {
    try {
      const attachments = files.length ? await supportApi.upload(files) : [];
      const msg = await supportApi.sendMine(body, attachments);
      appendUnique(msg);
      scrollToBottom();
    } catch {
      toast.error(t('support.sendError', 'Xabar yuborilmadi'));
    }
  };

  return (
    <>
      {/* Suzuvchi tugma */}
      {!open && (
        <button
          type="button"
          onClick={openPanel}
          className="fixed bottom-5 right-5 z-[200] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition hover:scale-105 hover:bg-primary/90"
          title={t('support.title', "Qo'llab-quvvatlash")}
          aria-label={t('support.title', "Qo'llab-quvvatlash")}
        >
          <Bot className="h-7 w-7" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </button>
      )}

      {/* Chat paneli */}
      {open && (
        <div className="fixed bottom-5 right-5 z-[200] flex h-[70vh] max-h-[560px] w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Sarlavha */}
          <div className="flex items-center justify-between gap-2 bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Headset className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{t('support.title', "Qo'llab-quvvatlash")}</p>
                <p className="text-[11px] leading-tight text-primary-foreground/80">
                  {t('support.subtitle', 'Odatda tez javob beramiz')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-white/20"
              aria-label={t('common.close', 'Yopish')}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Xabarlar */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-background/40 p-3">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                <Bot className="h-10 w-10 text-primary/50" />
                <p>{t('support.empty', "Savolingiz bormi? Bizga yozing — yordam beramiz.")}</p>
              </div>
            ) : (
              <MessageList
                messages={messages}
                isMine={(m) => m.sender_role === 'user'}
                hasMore={hasMore}
                onLoadMore={loadOlder}
                loadingMore={loadingMore}
              />
            )}
          </div>

          {/* Kiritish */}
          <ChatInput onSend={handleSend} disabled={loading} />
        </div>
      )}
    </>
  );
}
