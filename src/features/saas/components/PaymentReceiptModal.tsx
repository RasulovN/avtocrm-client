import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Receipt, Copy, Check as CheckIcon, FileText } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/Dialog';
import { Badge } from '../../../components/ui/Badge';

// Fiskal konstantalar — backend PAYME_FISCAL_* bilan bir xil (dasturiy taʼminot obunasi, QQS 0).
const FISCAL = {
  mxik: '10305008002000000',
  packageCode: '1514296',
  vatPercent: 0,
} as const;

export interface ReceiptPayment {
  payme_id: string;
  state: number;
  amount_tiyin: string;
  create_time: number | null;
  perform_time: number | null;
  cancel_time: number | null;
}

export interface ReceiptData {
  subscription_id: number;
  plan_name: string | null;
  amount: string | number;
  status: string;
  period_months?: number;
  created_at?: string | null;
  company_name?: string | null;
  payment?: ReceiptPayment | null;
}

function fmtMoney(v: string | number): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return new Intl.NumberFormat('uz-UZ').format(n) + " so'm";
}

function fmtMs(ms: number | null | undefined): string {
  if (!ms) return '—';
  try {
    return new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ms));
  } catch {
    return '—';
  }
}

function fmtIso(s: string | null | undefined): string {
  if (!s) return '—';
  try {
    return new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(s));
  } catch {
    return '—';
  }
}

function statusInfo(status: string, t: TFunction): { cls: string; label: string } {
  switch (status) {
    case 'active':
      return { cls: 'bg-green-600', label: t('subscription.statusActive', 'Faol / To\'langan') };
    case 'pending':
      return { cls: 'bg-amber-500', label: t('subscription.statusPending', 'Kutilmoqda') };
    case 'expired':
      return { cls: 'bg-gray-500', label: t('subscription.statusExpired', 'Muddati tugagan') };
    case 'cancelled':
      return { cls: 'bg-red-600', label: t('subscription.statusCancelled', 'Bekor qilingan') };
    default:
      return { cls: 'bg-gray-500', label: status };
  }
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/40 last:border-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className={`text-sm font-medium text-right break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

export function PaymentReceiptModal({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  data: ReceiptData | null;
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const st = statusInfo(data.status, t);
  const paid = data.payment?.state === 2;
  const productTitle = `${t('receipt.subscription', 'Obuna')} — ${data.plan_name ?? t('receipt.software', "dasturiy taʼminot")}`;
  const payDate = data.payment?.perform_time ?? data.payment?.create_time;

  const copyId = async () => {
    if (!data.payment?.payme_id) return;
    try {
      await navigator.clipboard.writeText(data.payment.payme_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success(t('receipt.copied', 'Nusxalandi'));
    } catch { /* ignore */ }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            {t('receipt.title', "To'lov cheki")}
          </DialogTitle>
          <DialogDescription>{t('receipt.subtitle', 'To\'lov va fiskal chek tafsilotlari')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Holat + summa */}
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4">
            <div>
              <p className="text-xs text-muted-foreground">{t('receipt.amount', 'Summa')}</p>
              <p className="text-2xl font-bold">{fmtMoney(data.amount)}</p>
            </div>
            <Badge className={st.cls}>{st.label}</Badge>
          </div>

          {/* To'lov tafsilotlari */}
          <div className="rounded-xl border border-border/60 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('receipt.paymentInfo', "To'lov ma'lumotlari")}
            </p>
            {data.payment?.payme_id && (
              <Row
                label={t('receipt.paymeId', "To'lov ID")}
                mono
                value={
                  <button onClick={copyId} className="inline-flex items-center gap-1.5 hover:text-primary" title={t('receipt.copy', 'Nusxalash')}>
                    {data.payment.payme_id}
                    {copied ? <CheckIcon className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 opacity-60" />}
                  </button>
                }
              />
            )}
            <Row label={t('receipt.date', 'Sana')} value={data.payment ? fmtMs(payDate) : fmtIso(data.created_at)} />
            <Row label={t('receipt.product', 'Mahsulot')} value={`${productTitle} (×1)`} />
            <Row label={t('receipt.orderNo', 'Obuna raqami')} mono value={`#${data.subscription_id}`} />
            {data.period_months && data.period_months > 1 && (
              <Row label={t('receipt.period', 'Muddat')} value={`${data.period_months} ${t('subscription.months', 'oy')}`} />
            )}
            {data.company_name && <Row label={t('receipt.company', 'Kompaniya')} value={data.company_name} />}
          </div>

          {/* Fiskal chek */}
          <div className="rounded-xl border border-border/60 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              {t('receipt.fiscal', 'Fiskal chek')}
            </p>
            <Row label={t('receipt.mxik', 'MXIK (ИКПУ)')} mono value={FISCAL.mxik} />
            <Row label={t('receipt.packageCode', "O'lchov birligi kodi")} mono value={FISCAL.packageCode} />
            <Row label={t('receipt.vat', 'QQS')} value={`${FISCAL.vatPercent}%`} />
            <Row label={t('receipt.fiscalProduct', 'Xizmat')} value={productTitle} />
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              {paid
                ? t('receipt.fiscalNote', "Rasmiy fiskal chek (RRN, fiskal belgi, chek raqami) Payme ilovasi/kabinetida saqlanadi. Ushbu chek to'lov tafsilotlari va MXIK ma'lumotini ko'rsatadi.")
                : t('receipt.notPaidNote', "Bu buyurtma hali to'lanmagan — fiskal chek to'lovdan so'ng shakllanadi.")}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
