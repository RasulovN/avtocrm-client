import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Building2, ChevronLeft, ChevronRight, Eye, Loader2, Pause, Play, Search, Trash2,
} from 'lucide-react';
import {
  Button, Card, CardContent, Input,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../../components/ui';
import { Badge } from '../../../../components/ui/Badge';
import { ConfirmDialog } from '../../../../components/shared/ConfirmDialog';
import { companiesApi } from '../../services';
import type { Company } from '../../types';

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

function statusBadge(status: string, t: (k: string, d: string) => string) {
  switch (status) {
    case 'active':
      return <Badge variant="success">{t('company.status.active', 'Faol')}</Badge>;
    case 'suspended':
      return <Badge variant="danger">{t('company.status.suspended', 'To\'xtatilgan')}</Badge>;
    default:
      return <Badge variant="warning">{t('company.status.onboarding', 'Ro\'yxatdan o\'tmoqda')}</Badge>;
  }
}

export function CompaniesPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Company[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const [detail, setDetail] = useState<Company | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusBusy, setStatusBusy] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, unknown> = { page, page_size: PAGE_SIZE };
    if (search) params.search = search;
    if (statusFilter !== 'all') params.status = statusFilter;
    companiesApi
      .list(params)
      .then((res) => {
        setItems(res.results);
        setCount(res.count);
      })
      .catch((err) => toast.error(apiError(err, t('common.error', 'Xatolik yuz berdi'))))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter, t]);

  useEffect(() => {
    const id = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(id);
  }, [load, search]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  const openDetail = async (id: number) => {
    setDetailLoading(true);
    setDetail({} as Company);
    try {
      const c = await companiesApi.get(id);
      setDetail(c);
    } catch (err) {
      setDetail(null);
      toast.error(apiError(err, t('common.error', 'Xatolik yuz berdi')));
    } finally {
      setDetailLoading(false);
    }
  };

  const changeStatus = async (c: Company, status: 'active' | 'suspended') => {
    setStatusBusy(c.id);
    try {
      await companiesApi.setStatus(c.id, { status });
      toast.success(t('company.statusUpdated', 'Holat yangilandi'));
      load();
    } catch (err) {
      toast.error(apiError(err, t('common.error', 'Xatolik yuz berdi')));
    } finally {
      setStatusBusy(null);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await companiesApi.remove(toDelete.id);
      toast.success(t('company.deleted', 'Kompaniya o\'chirildi'));
      setToDelete(null);
      if (items.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (err) {
      toast.error(apiError(err, t('common.error', 'Xatolik yuz berdi')));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('company.title', 'Kompaniyalar')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('company.subtitle', 'Platformadagi barcha kompaniyalarni boshqaring')}
        </p>
      </div>

      <Card>
        <CardContent className="py-5 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('company.searchPlaceholder', 'Nom yoki egasi bo\'yicha qidirish...')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
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
                <SelectItem value="all">{t('company.filter.all', 'Barcha holatlar')}</SelectItem>
                <SelectItem value="onboarding">{t('company.status.onboarding', 'Ro\'yxatdan o\'tmoqda')}</SelectItem>
                <SelectItem value="active">{t('company.status.active', 'Faol')}</SelectItem>
                <SelectItem value="suspended">{t('company.status.suspended', 'To\'xtatilgan')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('company.name', 'Nomi')}</TableHead>
                  <TableHead>{t('company.owner', 'Egasi')}</TableHead>
                  <TableHead>{t('company.category', 'Soha')}</TableHead>
                  <TableHead>{t('company.address', 'Manzil')}</TableHead>
                  <TableHead>{t('company.statusCol', 'Holat')}</TableHead>
                  <TableHead className="text-center">{t('company.usersCol', 'Foydalanuvchilar')}</TableHead>
                  <TableHead className="text-center">{t('company.subscription', 'Obuna')}</TableHead>
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
                  items.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.owner?.full_name ?? '-'}</TableCell>
                      <TableCell>{c.category?.name ?? '-'}</TableCell>
                      <TableCell className="max-w-48 truncate">
                        {[c.region?.name, c.district?.name].filter(Boolean).join(', ') || '-'}
                      </TableCell>
                      <TableCell>{statusBadge(c.status, t)}</TableCell>
                      <TableCell className="text-center">{c.users_count ?? 0}</TableCell>
                      <TableCell className="text-center">
                        {c.subscription_active ? (
                          <Badge variant="success">{t('company.subActive', 'Faol')}</Badge>
                        ) : (
                          <Badge variant="outline">{t('company.subInactive', 'Yo\'q')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(c.id)} title={t('common.view', 'Ko\'rish')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {c.status === 'active' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={statusBusy === c.id}
                              onClick={() => changeStatus(c, 'suspended')}
                              title={t('company.suspend', 'To\'xtatish')}
                            >
                              {statusBusy === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pause className="h-4 w-4 text-amber-600" />}
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={statusBusy === c.id}
                              onClick={() => changeStatus(c, 'active')}
                              title={t('company.activate', 'Faollashtirish')}
                            >
                              {statusBusy === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 text-green-600" />}
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => setToDelete(c)} title={t('common.delete', 'O\'chirish')}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
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

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {t('company.detailTitle', 'Kompaniya ma\'lumotlari')}
            </DialogTitle>
            <DialogDescription>{t('company.detailSubtitle', 'To\'liq ma\'lumot')}</DialogDescription>
          </DialogHeader>
          <div className="pb-6">
            {detailLoading || !detail?.id ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
                {([
                  [t('company.name', 'Nomi'), detail.name],
                  [t('company.statusCol', 'Holat'), detail.status],
                  [t('company.owner', 'Egasi'), detail.owner?.full_name ?? '-'],
                  [t('company.ownerPhone', 'Egasi tel.'), detail.owner?.phone_number ?? '-'],
                  [t('company.category', 'Soha'), detail.category?.name ?? '-'],
                  [t('company.phone', 'Telefon'), detail.phone_number ?? '-'],
                  [t('company.email', 'Email'), detail.email ?? '-'],
                  [t('company.country', 'Davlat'), detail.country?.name ?? '-'],
                  [t('company.region', 'Viloyat'), detail.region?.name ?? '-'],
                  [t('company.district', 'Tuman'), detail.district?.name ?? '-'],
                  [t('company.street', 'Ko\'cha'), detail.street ?? '-'],
                  [t('company.usersCol', 'Foydalanuvchilar'), String(detail.users_count ?? 0)],
                ] as [string, React.ReactNode][]).map(([label, value]) => (
                  <div key={label} className="flex flex-col">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-medium break-words">{value || '-'}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        onConfirm={remove}
        variant="destructive"
        loading={deleting}
        title={t('company.deleteTitle', 'Kompaniyani o\'chirish')}
        description={t('company.deleteConfirm', `"${toDelete?.name ?? ''}" kompaniyasini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`)}
        confirmText={t('common.delete', 'O\'chirish')}
        cancelText={t('common.cancel', 'Bekor qilish')}
      />
    </div>
  );
}
