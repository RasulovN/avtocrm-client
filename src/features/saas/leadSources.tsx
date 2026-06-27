// Lead manbalari katalogi — ikonka (inline SVG brend yo'llari), rang va label.
// Backend kodlari bilan mos: website/instagram/telegram/facebook/youtube/google/
// referral/other/manual/landing.

export interface SourceMeta {
  value: string;
  label: string;
  color: string; // ikonka rangi (hex)
  path: string;  // SVG path (stroke)
}

const SOURCES: Record<string, SourceMeta> = {
  instagram: { value: 'instagram', label: 'Instagram', color: '#ec4899', path: 'M4 4h16v16H4zM12 9a3 3 0 100 6 3 3 0 000-6zM17 6.5h.01' },
  telegram: { value: 'telegram', label: 'Telegram', color: '#0ea5e9', path: 'M21 4L3 11l5 2 2 6 3-4 5 4 3-15z' },
  facebook: { value: 'facebook', label: 'Facebook', color: '#2563eb', path: 'M16 8a5 5 0 015 5v6h-4v-6a1 1 0 00-2 0v6h-4v-10h4v1.5A4 4 0 0116 8z' },
  youtube: { value: 'youtube', label: 'YouTube', color: '#ef4444', path: 'M22 12s0-3-.4-4.4a2.5 2.5 0 00-1.7-1.7C18.4 5.5 12 5.5 12 5.5s-6.4 0-7.9.4A2.5 2.5 0 002.4 7.6C2 9 2 12 2 12s0 3 .4 4.4a2.5 2.5 0 001.7 1.7c1.5.4 7.9.4 7.9.4s6.4 0 7.9-.4a2.5 2.5 0 001.7-1.7C22 15 22 12 22 12zM10 15V9l5 3-5 3z' },
  google: { value: 'google', label: 'Google qidiruv', color: '#f59e0b', path: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3' },
  referral: { value: 'referral', label: 'Tavsiya', color: '#8b5cf6', path: 'M12 11a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6' },
  website: { value: 'website', label: 'Sayt', color: '#64748b', path: 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2c3 3 3 17 0 20' },
  landing: { value: 'landing', label: 'Sayt', color: '#64748b', path: 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2c3 3 3 17 0 20' },
  manual: { value: 'manual', label: "Qo'lda", color: '#10b981', path: 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z' },
  other: { value: 'other', label: 'Boshqa', color: '#94a3b8', path: 'M12 2a10 10 0 100 20 10 10 0 000-20zM8 12h.01M12 12h.01M16 12h.01' },
};

const FALLBACK: SourceMeta = SOURCES.website;

export function sourceMeta(code: string | null | undefined): SourceMeta {
  if (!code) return FALLBACK;
  return SOURCES[code] ?? { ...FALLBACK, label: code };
}

// Admin formasida tanlanadigan manbalar (legacy "landing" ko'rsatilmaydi).
export const SELECTABLE_SOURCES: SourceMeta[] = [
  SOURCES.manual, SOURCES.website, SOURCES.instagram, SOURCES.telegram,
  SOURCES.facebook, SOURCES.youtube, SOURCES.google, SOURCES.referral, SOURCES.other,
];

export function SourceIcon({ code, size = 16 }: { code: string | null | undefined; size?: number }) {
  const m = sourceMeta(code);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={m.path} stroke={m.color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Ikonka + label yonma-yon (jadval ustuni uchun).
export function SourceBadge({ code }: { code: string | null | undefined }) {
  const m = sourceMeta(code);
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
      <SourceIcon code={code} />
      <span>{m.label}</span>
    </span>
  );
}
