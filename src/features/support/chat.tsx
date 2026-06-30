import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Paperclip, Send, Loader2, FileText, X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SupportAttachment, SupportMessage } from '../../services/supportApi';
import { resolveSupportUrl } from '../../services/supportApi';

export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
}

export function formatDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatBytes(n: number): string {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

const isImage = (a: SupportAttachment) =>
  a.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg|heic)$/i.test(a.url);

// ───────────── Rasm ko'ruvchi (lightbox modal) ─────────────
function ImageLightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: SupportAttachment[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const { t } = useTranslation();
  const current = images[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && images.length > 1) onNavigate((index - 1 + images.length) % images.length);
      else if (e.key === 'ArrowRight' && images.length > 1) onNavigate((index + 1) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, images.length, onClose, onNavigate]);

  if (!current) return null;
  const url = resolveSupportUrl(current.url);

  return (
    <div
      className="fixed inset-0 z-[320] flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      {/* Yopish */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        aria-label={t('common.close', 'Yopish')}
      >
        <X className="h-6 w-6" />
      </button>

      {/* Yuklab olish */}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        download={current.name}
        onClick={(e) => e.stopPropagation()}
        className="absolute right-16 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        aria-label={t('support.download', 'Yuklab olish')}
      >
        <Download className="h-6 w-6" />
      </a>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onNavigate((index - 1 + images.length) % images.length); }}
            className="absolute left-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Prev"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onNavigate((index + 1) % images.length); }}
            className="absolute right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Next"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </>
      )}

      <img
        src={url}
        alt={current.name}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
      />

      {images.length > 1 && (
        <span className="absolute bottom-4 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
          {index + 1} / {images.length}
        </span>
      )}
    </div>
  );
}

// ───────────── Biriktirilgan fayllar ko'rinishi ─────────────
export function AttachmentList({ attachments }: { attachments: SupportAttachment[] }) {
  // Rasmlar lightbox uchun alohida indekslanadi.
  const images = (attachments ?? []).filter(isImage);
  const [viewIdx, setViewIdx] = useState<number | null>(null);

  if (!attachments?.length) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {attachments.map((a, i) => {
        const url = resolveSupportUrl(a.url);
        if (isImage(a)) {
          // Rasm — chat ichida modalda ko'rsatiladi (yangi sahifada ochilmaydi).
          const imgIndex = images.findIndex((im) => im.url === a.url);
          return (
            <button
              key={i}
              type="button"
              onClick={() => setViewIdx(imgIndex >= 0 ? imgIndex : 0)}
              className="block cursor-zoom-in overflow-hidden rounded-lg border border-border/40"
            >
              <img
                src={url}
                alt={a.name}
                className="max-h-52 max-w-full object-cover transition hover:opacity-90"
                loading="lazy"
              />
            </button>
          );
        }
        // Fayl — alohida (yangi sahifada / yuklab olish).
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noreferrer"
            download={a.name}
            className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 px-2.5 py-2 text-xs hover:bg-accent"
          >
            <FileText className="h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate font-medium">{a.name}</span>
            <span className="shrink-0 text-muted-foreground">{formatBytes(a.size)}</span>
            <Download className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </a>
        );
      })}

      {viewIdx !== null && (
        <ImageLightbox
          images={images}
          index={viewIdx}
          onClose={() => setViewIdx(null)}
          onNavigate={setViewIdx}
        />
      )}
    </div>
  );
}

// ───────────── Bitta xabar pufakchasi ─────────────
export function MessageBubble({ msg, mine }: { msg: SupportMessage; mine: boolean }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
          mine
            ? 'rounded-br-md bg-primary text-primary-foreground'
            : 'rounded-bl-md bg-muted text-foreground'
        }`}
      >
        {msg.attachments?.length > 0 && (
          <div className={msg.body ? 'mb-1.5' : ''}>
            <AttachmentList attachments={msg.attachments} />
          </div>
        )}
        {msg.body && <p className="whitespace-pre-wrap break-words">{msg.body}</p>}
        <div className={`mt-0.5 text-right text-[10px] ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {formatTime(msg.created_at)}
        </div>
      </div>
    </div>
  );
}

// ───────────── Xabarlar ro'yxati (kun ajratgichlari bilan) ─────────────
export function MessageList({
  messages,
  isMine,
  hasMore,
  onLoadMore,
  loadingMore,
}: {
  messages: SupportMessage[];
  isMine: (m: SupportMessage) => boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
}) {
  const { t } = useTranslation();
  let lastDay = '';
  return (
    <div className="flex flex-col gap-2">
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="mx-auto my-1 flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:bg-accent disabled:opacity-50"
        >
          {loadingMore && <Loader2 className="h-3 w-3 animate-spin" />}
          {t('support.loadMore', 'Oldingi xabarlar')}
        </button>
      )}
      {messages.map((m) => {
        const day = formatDay(m.created_at);
        const showDay = day !== lastDay;
        lastDay = day;
        return (
          <div key={m.id} className="flex flex-col gap-2">
            {showDay && (
              <div className="my-1 flex justify-center">
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">{day}</span>
              </div>
            )}
            <MessageBubble msg={m} mine={isMine(m)} />
          </div>
        );
      })}
    </div>
  );
}

// ───────────── Kiritish maydoni (matn + fayl) ─────────────
export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (body: string, files: File[]) => Promise<void>;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    if (list.length) setFiles((prev) => [...prev, ...list].slice(0, 10));
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const submit = async () => {
    const body = text.trim();
    if ((!body && files.length === 0) || sending) return;
    setSending(true);
    try {
      await onSend(body, files);
      setText('');
      setFiles([]);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  return (
    <div className="border-t border-border bg-card p-2">
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {files.map((f, i) => (
            <span key={i} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
              <FileText className="h-3 w-3 text-primary" />
              <span className="max-w-[120px] truncate">{f.name}</span>
              <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-end gap-1.5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || sending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
          title={t('support.attach', 'Fayl biriktirish')}
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          onChange={pickFiles}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar,.mp4,.mov,.webm,.mp3,.ogg,.wav"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled || sending}
          rows={1}
          placeholder={t('support.placeholder', 'Xabar yozing...')}
          className="max-h-32 min-h-[2.25rem] flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || sending || (!text.trim() && files.length === 0)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          title={t('support.send', 'Yuborish')}
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
