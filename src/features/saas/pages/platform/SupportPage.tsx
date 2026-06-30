import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Search, MessageSquare, Loader2, ArrowLeft, Building2, Lock, Unlock, CheckCheck, Info,
} from 'lucide-react';
import { getSocket } from '../../../../services/socket';
import { supportApi } from '../../../../services/supportApi';
import type {
  SupportConversation, SupportMessage, SupportMessageEvent,
} from '../../../../services/supportApi';
import { ChatInput, MessageList, formatTime } from '../../../support/chat';
import { CompanyInfoModal } from '../../../support/CompanyInfoModal';

const PAGE_SIZE = 20;

function initials(c: SupportConversation): string {
  const n = c.user?.full_name || c.user?.email || c.user?.phone_number || '?';
  return n.trim().slice(0, 2).toUpperCase();
}

function displayName(c: SupportConversation): string {
  return c.user?.full_name || c.user?.email || c.user?.phone_number || `User #${c.user_id}`;
}

export function SupportPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<SupportConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [q, setQ] = useState('');

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [companyModalId, setCompanyModalId] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const selectedRef = useRef<number | null>(null);
  selectedRef.current = selectedId;

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  const loadList = useCallback(() => {
    setLoading(true);
    supportApi
      .conversations({ status, q: q.trim() || undefined, page: 1, limit: PAGE_SIZE })
      .then((res) => setItems(res.results))
      .catch(() => toast.error(t('common.error', 'Xatolik yuz berdi')))
      .finally(() => setLoading(false));
  }, [status, q, t]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  // Suhbatni tanlash — xabarlarni yuklaymiz (server foydalanuvchi xabarlarini o'qilgan qiladi).
  const selectConversation = async (id: number) => {
    setSelectedId(id);
    setThreadLoading(true);
    try {
      const data = await supportApi.thread(id);
      setConversation(data.conversation);
      setMessages(data.messages);
      setHasMore(data.has_more);
      // Ro'yxatdagi o'qilmagan belgisini tozalaymiz.
      setItems((prev) => prev.map((c) => (c.id === id ? { ...c, agent_unread: 0 } : c)));
      scrollToBottom();
    } catch {
      toast.error(t('common.error', 'Xatolik yuz berdi'));
    } finally {
      setThreadLoading(false);
    }
  };

  const loadOlder = async () => {
    if (!selectedId || !messages.length) return;
    setLoadingMore(true);
    try {
      const data = await supportApi.older(selectedId, messages[0].id);
      setMessages((prev) => [...data.results, ...prev]);
      setHasMore(data.has_more);
    } catch {
      /* ignore */
    } finally {
      setLoadingMore(false);
    }
  };

  // Jonli xabarlar.
  useEffect(() => {
    const socket = getSocket();
    const onMessage = (evt: SupportMessageEvent) => {
      const { conversation_id, message } = evt;

      // Ochiq suhbat bo'lsa — xabarni qo'shamiz.
      if (selectedRef.current === conversation_id) {
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
        scrollToBottom();
      }

      // Ro'yxatni yangilaymiz: oxirgi xabar + o'qilmaganlar + tepaga ko'tarish.
      setItems((prev) => {
        const idx = prev.findIndex((c) => c.id === conversation_id);
        if (idx === -1) {
          // Yangi suhbat — ro'yxatni qayta yuklaymiz.
          loadList();
          return prev;
        }
        const conv = prev[idx];
        const isOpen = selectedRef.current === conversation_id;
        const updated: SupportConversation = {
          ...conv,
          last_message_text: message.body || (message.attachments.length ? '📎 Fayl' : conv.last_message_text),
          last_message_at: message.created_at,
          status: message.sender_role === 'user' ? 'open' : conv.status,
          agent_unread:
            message.sender_role === 'user' && !isOpen ? conv.agent_unread + 1 : conv.agent_unread,
        };
        const rest = prev.filter((c) => c.id !== conversation_id);
        return [updated, ...rest];
      });
    };
    socket.on('support:message', onMessage);
    return () => {
      socket.off('support:message', onMessage);
    };
  }, [loadList, scrollToBottom]);

  const handleSend = async (body: string, files: File[]) => {
    if (!selectedId) return;
    try {
      const attachments = files.length ? await supportApi.upload(files) : [];
      const msg = await supportApi.sendAgent(selectedId, body, attachments);
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      scrollToBottom();
    } catch {
      toast.error(t('support.sendError', 'Xabar yuborilmadi'));
    }
  };

  const toggleStatus = async () => {
    if (!conversation) return;
    const next = conversation.status === 'closed' ? 'open' : 'closed';
    try {
      const updated = await supportApi.setStatus(conversation.id, next);
      setConversation(updated);
      setItems((prev) => prev.map((c) => (c.id === updated.id ? { ...c, status: updated.status } : c)));
      toast.success(
        next === 'closed'
          ? t('support.closed', 'Suhbat yopildi')
          : t('support.reopened', 'Suhbat qayta ochildi'),
      );
    } catch {
      toast.error(t('common.error', 'Xatolik yuz berdi'));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('support.adminTitle', "Qo'llab-quvvatlash")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('support.adminSubtitle', 'Foydalanuvchilar bilan yozishmalar')}
        </p>
      </div>

      <div className="flex h-[calc(100vh-13rem)] overflow-hidden rounded-2xl border border-border bg-card">
        {/* ── Chap panel: suhbatlar ro'yxati ── */}
        <div
          className={`flex w-full flex-col border-r border-border md:w-[340px] md:shrink-0 ${
            selectedId ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="space-y-2 border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('support.search', 'Qidirish...')}
                className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-1.5">
              {(['all', 'open', 'closed'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                    status === s ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'
                  }`}
                >
                  {s === 'all'
                    ? t('support.filterAll', 'Barchasi')
                    : s === 'open'
                      ? t('support.filterOpen', 'Ochiq')
                      : t('support.filterClosed', 'Yopiq')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-8 w-8 opacity-40" />
                {t('support.noConversations', 'Suhbatlar yo\'q')}
              </div>
            ) : (
              items.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectConversation(c.id)}
                  className={`flex w-full items-center gap-3 border-b border-border/40 px-3 py-2.5 text-left transition hover:bg-accent ${
                    selectedId === c.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {initials(c)}
                    {c.status === 'closed' && (
                      <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-muted p-0.5">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{displayName(c)}</span>
                      {c.last_message_at && (
                        <span className="shrink-0 text-[10px] text-muted-foreground">{formatTime(c.last_message_at)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-muted-foreground">
                        {c.last_message_text || t('support.noMessages', 'Xabar yo\'q')}
                      </span>
                      {c.agent_unread > 0 && (
                        <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                          {c.agent_unread > 99 ? '99+' : c.agent_unread}
                        </span>
                      )}
                    </div>
                    {c.company && (
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{c.company.name}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── O'ng panel: tanlangan suhbat ── */}
        <div className={`flex flex-1 flex-col ${selectedId ? 'flex' : 'hidden md:flex'}`}>
          {!conversation ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-12 w-12 opacity-30" />
              {t('support.selectConversation', 'Suhbatni tanlang')}
            </div>
          ) : (
            <>
              {/* Sarlavha */}
              <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setSelectedId(null); setConversation(null); }}
                    className="rounded-full p-1 text-muted-foreground hover:bg-accent md:hidden"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {initials(conversation)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{displayName(conversation)}</p>
                    {conversation.company ? (
                      <button
                        type="button"
                        onClick={() => setCompanyModalId(conversation.company_id)}
                        className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                        title={t('support.viewCompany', 'Kompaniya ma\'lumotlari')}
                      >
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{conversation.company.name}</span>
                        <Info className="h-3 w-3 shrink-0" />
                      </button>
                    ) : (
                      <p className="truncate text-[11px] text-muted-foreground">
                        {conversation.user?.email || conversation.user?.phone_number || ''}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleStatus}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
                >
                  {conversation.status === 'closed' ? (
                    <><Unlock className="h-3.5 w-3.5" /> {t('support.reopen', 'Qayta ochish')}</>
                  ) : (
                    <><CheckCheck className="h-3.5 w-3.5" /> {t('support.close', 'Yopish')}</>
                  )}
                </button>
              </div>

              {/* Xabarlar */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto bg-background/40 p-3">
                {threadLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    {t('support.noMessages', 'Xabar yo\'q')}
                  </div>
                ) : (
                  <MessageList
                    messages={messages}
                    isMine={(m) => m.sender_role === 'agent'}
                    hasMore={hasMore}
                    onLoadMore={loadOlder}
                    loadingMore={loadingMore}
                  />
                )}
              </div>

              {/* Kiritish */}
              <ChatInput onSend={handleSend} disabled={threadLoading} />
            </>
          )}
        </div>
      </div>

      {/* Kompaniya ma'lumotlari modali */}
      <CompanyInfoModal companyId={companyModalId} onClose={() => setCompanyModalId(null)} />
    </div>
  );
}
