import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Ban, CalendarPlus, Check, CheckCircle2, ChevronLeft, ChevronRight, Loader2, FileText } from 'lucide-react';
import {
  Button, Card, CardContent, Input, Label,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../../components/ui';
import { Badge } from '../../../../components/ui/Badge';
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
    const first = Object.values(obj)[0];
    if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
    if (typeof first === 'string') return first;
  }
  return fallback;
}

function formatPrice(p: string): string {
  const n = Number(p);
  if (!n) return 'Bepul';
  return new Intl.NumberFormat('uz-UZ').format(n) + " so'm";
}

function formatDate(d: string | null): string {
  if (!d) return '-';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('uz-UZ');
}

function statusBadge(status: string, t: (k: string, d: string) => string) {
  switch (status) {
    case 'active':
      return <Badge variant="success">{t('sub.status.active', 'Faol')}</Badge>;
    case 'pending':
      return <Badge variant="warning">{t('sub.status.pending', 'Kutilmoqda')}</Badge>;
    case 'cancelled':
      return <Badge variant="danger">{t('sub.status.cancelled', 'Bekor qilingan')}</Badge>;
    case 'expired':
      return <Badge variant="outline">{t('sub.status.expired', 'Muddati tugagan')}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function SubscriptionsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Subscription[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Tasdiqlash dialogi (faollashtirish / bekor qilish)
  const [confirmTarget, setConfirmTarget] = useState<{ sub: Subscription; action: 'activate' | 'cancel' } | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Uzaytirish (extend) dialogi
  const [extendTarget, setExtendTarget] = useState<Subscription | null>(null);
  const [extendDays, setExtendDays] = useState('');
  const [extending, setExtending] = useState(false);

  // To'lov cheki (receipt) modali
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
    const params: Record<string, unknown> = { page, page_size: PAGE_SIZE };
    if (statusFilter !== 'all') params.status = statusFilter;
    subscriptionsApi
      .list(params)
      .then((res) => {
        setItems(res.results);
        setCount(res.count);
      })
      .catch((err) => toast.error(apiError(err, t('common.error', 'Xatolik yuz berdi'))))
      .finally(() => setLoading(false));
  }, [page, statusFilter, t]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  // Tasdiqlash dialogidan keyin faollashtirish/bekor qilishni bajaradi.
  const runConfirm = async () => {
    if (!confirmTarget) return;
    const { sub, action } = confirmTarget;
    setConfirming(true);
    try {
      await subscriptionsApi.manage(sub.id, action);
      toast.success(
        action === 'activate'
          ? t('sub.activated', 'Obuna faollashtirildi')
          : t('sub.cancelled', 'Obuna bekor qilindi'),
      );
      setConfirmTarget(null);
      load();
    } catch (err) {
      toast.error(apiError(err, t('common.error', 'Xatolik yuz berdi')));
    } finally {
      setConfirming(false);
    }
  };

  const openExtend = (s: Subscription) => {
    setExtendTarget(s);
    setExtendDays(s.plan?.duration_days ? String(s.plan.duration_days) : '');
  };

  const confirmExtend = async () => {
    if (!extendTarget) return;
    const trimmed = extendDays.trim();
    const days = trimmed ? Number(trimmed) : undefined;
    if (trimmed && (!Number.isFinite(days) || (days as number) <= 0)) {
      toast.error(t('sub.extendInvalid', "To'g'ri kun sonini kiriting"));
      return;
    }
    setExtending(true);
    try {
      await subscriptionsApi.manage(extendTarget.id, 'extend', days);
      toast.success(t('sub.extended', 'Obuna uzaytirildi'));
      setExtendTarget(null);
      load();
    } catch (err) {
      toast.error(apiError(err, t('common.error', 'Xatolik yuz berdi')));
    } finally {
      setExtending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('sub.title', 'Obunalar')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('sub.subtitle', 'Kompaniyalarning obunalarini boshqaring')}
        </p>
      </div>

      <Card>
        <CardContent className="py-5 space-y-4">
          <div className="flex justify-end">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('sub.filter.all', 'Barcha holatlar')}</SelectItem>
                <SelectItem value="active">{t('sub.status.active', 'Faol')}</SelectItem>
                <SelectItem value="pending">{t('sub.status.pending', 'Kutilmoqda')}</SelectItem>
                <SelectItem value="cancelled">{t('sub.status.cancelled', 'Bekor qilingan')}</SelectItem>
                <SelectItem value="expired">{t('sub.status.expired', 'Muddati tugagan')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('sub.orderId', 'Order ID')}</TableHead>
                  <TableHead>{t('sub.company', 'Kompaniya')}</TableHead>
                  <TableHead>{t('sub.plan', 'Tarif')}</TableHead>
                  <TableHead>{t('sub.statusCol', 'Holat')}</TableHead>
                  <TableHead>{t('sub.amount', 'Summa')}</TableHead>
                  <TableHead>{t('sub.startAt', 'Boshlanish')}</TableHead>
                  <TableHead>{t('sub.endAt', 'Tugash')}</TableHead>
                  <TableHead className="text-right">{t('common.actions', 'Amallar')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      {t('common.noData', 'Ma\'lumot yo\'q')}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">#{s.id}</TableCell>
                      <TableCell className="font-medium">{s.company?.name ?? '-'}</TableCell>
                      <TableCell>{s.plan?.name ?? '-'}</TableCell>
                      <TableCell>{statusBadge(s.status, t)}</TableCell>
                      <TableCell>{formatPrice(s.amount)}</TableCell>
                      <TableCell>{formatDate(s.start_at)}</TableCell>
                      <TableCell>{formatDate(s.end_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openReceipt(s)}
                            title={t('sub.viewReceipt', 'Chek / tafsilot')}
                          >
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          {s.status !== 'active' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmTarget({ sub: s, action: 'activate' })}
                              title={s.status === 'pending'
                                ? t('sub.approve', 'Tasdiqlash')
                                : t('sub.activate', 'Faollashtirish')}
                            >
                              {s.status === 'pending' ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                          )}
                          {(s.status === 'active' || s.status === 'pending') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openExtend(s)}
                              title={t('sub.extend', 'Uzaytirish')}
                            >
                              <CalendarPlus className="h-4 w-4 text-primary" />
                            </Button>
                          )}
                          {s.status !== 'cancelled' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmTarget({ sub: s, action: 'cancel' })}
                              title={t('sub.cancel', 'Bekor qilish')}
                            >
                              <Ban className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, count)} / {count}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Faollashtirish / bekor qilish tasdig'i */}
      <Dialog open={!!confirmTarget} onOpenChange={(o) => !o && !confirming && setConfirmTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmTarget?.action === 'activate'
                ? (confirmTarget.sub.status === 'pending'
                    ? t('sub.confirmApproveTitle', 'Obunani tasdiqlash')
                    : t('sub.confirmActivateTitle', 'Obunani faollashtirish'))
                : t('sub.confirmCancelTitle', 'Obunani bekor qilish')}
            </DialogTitle>
            <DialogDescription>
              {confirmTarget && (
                <>
                  <span className="font-medium text-foreground">{confirmTarget.sub.company?.name ?? '-'}</span>
                  {' — '}
                  {confirmTarget.sub.plan?.name ?? '-'}
                  {'. '}
                  {confirmTarget.action === 'activate'
                    ? t('sub.confirmActivateDesc', 'Ushbu obunani faollashtirmoqchimisiz? Kompaniya tizimdan to\'liq foydalana boshlaydi.')
                    : t('sub.confirmCancelDesc', 'Ushbu obunani bekor qilmoqchimisiz? Bu amalni qaytarib bo\'lmaydi.')}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmTarget(null)} disabled={confirming}>
              {t('common.cancel', 'Bekor qilish')}
            </Button>
            <Button
              variant={confirmTarget?.action === 'cancel' ? 'destructive' : 'default'}
              onClick={runConfirm}
              disabled={confirming}
            >
              {confirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmTarget?.action === 'activate'
                ? (confirmTarget.sub.status === 'pending'
                    ? t('sub.approve', 'Tasdiqlash')
                    : t('sub.activate', 'Faollashtirish'))
                : t('sub.cancel', 'Bekor qilish')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!extendTarget} onOpenChange={(o) => !o && setExtendTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('sub.extendTitle', 'Obunani uzaytirish')}</DialogTitle>
            <DialogDescription>
              {extendTarget?.company?.name ?? ''}
              {' — '}
              {t('sub.extendDesc', "Qo'shiladigan kun sonini kiriting. Bo'sh qoldirsangiz tarif muddati olinadi.")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label>{t('sub.daysLabel', 'Kun soni')}</Label>
            <Input
              type="number"
              min={1}
              value={extendDays}
              onChange={(e) => setExtendDays(e.target.value)}
              placeholder={extendTarget?.plan?.duration_days ? String(extendTarget.plan.duration_days) : ''}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendTarget(null)} disabled={extending}>
              {t('common.cancel', 'Bekor qilish')}
            </Button>
            <Button onClick={confirmExtend} disabled={extending}>
              {extending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('sub.extend', 'Uzaytirish')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PaymentReceiptModal
        open={!!receipt}
        onOpenChange={(o) => !o && setReceipt(null)}
        data={receipt}
        canEditFiscal
        onSaveFiscal={async (url) => {
          if (!receipt) return;
          try {
            const updated = await subscriptionsApi.setFiscal(receipt.subscription_id, url);
            setReceipt((r) => (r ? { ...r, payment: updated.payment ?? null } : r));
            toast.success(url ? t('sub.fiscalSaved', 'Fiskal havola biriktirildi') : t('sub.fiscalRemoved', 'Fiskal havola olib tashlandi'));
            load();
          } catch (err) {
            toast.error(apiError(err, t('common.error', 'Xatolik yuz berdi')));
          }
        }}
      />
    </div>
  );
}
