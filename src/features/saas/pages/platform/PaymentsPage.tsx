import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Receipt, ChevronLeft, ChevronRight, Loader2, FileText, Search } from 'lucide-react';
import {
  Button, Card, CardContent, Input,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../../components/ui';
import { Badge } from '../../../../components/ui/Badge';
import { PageHeader } from '../../../../components/shared/PageHeader';
import { subscriptionsApi } from '../../services';
import type { Subscription } from '../../types';
import { PaymentReceiptModal, type ReceiptData } from '../../components/PaymentReceiptModal';

const PAGE_SIZE = 10;

function apiError(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: unknown } };
  const data = e?.response?.data;
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (typeof obj.detail === 'string') return obj.detail;
  }
  return fallback;
}

function formatPrice(p: string | number): string {
  const n = Number(p);
  if (!Number.isFinite(n)) return String(p);
  return new Intl.NumberFormat('uz-UZ').format(n) + " so'm";
}

function formatDateTimeMs(ms: number | null | undefined): string {
  if (!ms) return '';
  try {
    return new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ms));
  } catch {
    return '';
  }
}

function formatDateIso(d: string | null | undefined): string {
  if (!d) return '—';
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('uz-UZ');
}

function statusBadge(status: string, t: (k: string, d: string) => string) {
  switch (status) {
    case 'active':
      return <Badge variant="success">{t('sub.status.active', 'Faol')}</Badge>;
    case 'expired':
      return <Badge variant="outline">{t('sub.status.expired', 'Muddati tugagan')}</Badge>;
    case 'cancelled':
      return <Badge variant="danger">{t('sub.status.cancelled', 'Bekor qilingan')}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function PaymentsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Subscription[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const openReceipt = (s: Subscription) => setReceipt({
    subscription_id: s.id,
    plan_name: s.plan?.name ?? s.plan_name ?? null,
    amount: s.amount,
    status: s.status,
    period_months: s.period_months,
    created_at: s.created_at ?? null,
    company_name: s.company?.name ?? null,
    payment: s.payment ?? null,
  });

  const load = useCallback(() => {
    setLoading(true);
    subscriptionsApi
      .payments({ page, page_size: PAGE_SIZE })
      .then((res) => {
        setItems(res.results);
        setCount(res.count);
      })
      .catch((err) => toast.error(apiError(err, t('common.error', 'Xatolik yuz berdi'))))
      .finally(() => setLoading(false));
  }, [page, t]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  // Qidiruv — mijoz nomi bo'yicha (joriy sahifada).
  const filtered = search.trim()
    ? items.filter((s) => (s.company?.name ?? '').toLowerCase().includes(search.trim().toLowerCase()))
    : items;

  // To'lov sanasi: Payme perform_time (ms) bo'lsa o'sha, aks holda obuna sanasi.
  const paymentDate = (s: Subscription): string => {
    const ms = s.payment?.perform_time ?? s.payment?.create_time ?? null;
    return ms ? formatDateTimeMs(ms) : formatDateIso(s.created_at);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.payments', "To'lovlar")}
        description={t('payments.subtitle', "To'lov qilgan kompaniyalar va cheklari")}
      />

      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('payments.searchCompany', 'Kompaniya bo\'yicha qidirish')}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <Receipt className="h-8 w-8 opacity-40" />
              <span className="text-sm">{t('payments.empty', 'Hozircha to\'lovlar yo\'q')}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('payments.company', 'Kompaniya')}</TableHead>
                    <TableHead>{t('payments.plan', 'Tarif')}</TableHead>
                    <TableHead className="text-right">{t('payments.amount', 'Summa')}</TableHead>
                    <TableHead className="text-center">{t('payments.period', 'Muddat')}</TableHead>
                    <TableHead>{t('payments.date', "To'lov sanasi")}</TableHead>
                    <TableHead className="text-center">{t('common.status', 'Holat')}</TableHead>
                    <TableHead className="text-right">{t('payments.receipt', 'Chek')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.company?.name ?? '—'}</TableCell>
                      <TableCell>{s.plan?.name ?? s.plan_name ?? '—'}</TableCell>
                      <TableCell className="text-right font-semibold">{formatPrice(s.amount)}</TableCell>
                      <TableCell className="text-center">
                        {s.period_months ?? 1} {t('subscription.monthShort', 'oy')}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{paymentDate(s)}</TableCell>
                      <TableCell className="text-center">{statusBadge(s.status, t)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => openReceipt(s)}>
                          <FileText className="h-3.5 w-3.5 mr-1.5" />
                          {t('payments.receipt', 'Chek')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {count > PAGE_SIZE && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                {t('common.total', 'Jami')}: {count}
              </span>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">{page} / {totalPages}</span>
                <Button size="icon" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentReceiptModal open={!!receipt} onOpenChange={(o) => !o && setReceipt(null)} data={receipt} />
    </div>
  );
}
