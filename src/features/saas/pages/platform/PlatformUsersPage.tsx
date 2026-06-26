import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Search, Shield, Trash2 } from 'lucide-react';
import {
  Button, Card, CardContent, Input, Label,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../../components/ui';
import { Badge } from '../../../../components/ui/Badge';
import { ConfirmDialog } from '../../../../components/shared/ConfirmDialog';
import { cn } from '../../../../utils';
import { rbacApi } from '../../services';
import type { CompanyUser, Role } from '../../types';

const SCOPE = 'platform' as const;
const PAGE_SIZE = 10;

type TabKey = 'admins' | 'all';

// Super admin "Barcha foydalanuvchilar" jadvali uchun qator tipi
interface AllUserRow {
  id: number;
  full_name: string | null;
  phone_number: string | null;
  email: string | null;
  is_active: boolean;
  is_superuser?: boolean;
  company_id?: number | null;
  company_name?: string | null;
  role_id?: number | null;
  role_name?: string | null;
}

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

interface FormState {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  role_id: string;
  is_active: boolean;
}

const emptyForm: FormState = {
  full_name: '', email: '', phone_number: '', password: '', role_id: '', is_active: true,
};

function AdminsTab() {
  const { t } = useTranslation();
  const [items, setItems] = useState<CompanyUser[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyUser | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<CompanyUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    rbacApi
      .listUsers(SCOPE, { page, page_size: PAGE_SIZE })
      .then((res) => {
        setItems(res.results);
        setCount(res.count);
      })
      .catch((err) => toast.error(apiError(err, t('common.error', 'Xatolik yuz berdi'))))
      .finally(() => setLoading(false));
  }, [page, t]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    rbacApi.listRoles(SCOPE).then(setRoles).catch(() => {});
  }, []);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (u: CompanyUser) => {
    setEditing(u);
    setForm({
      full_name: u.full_name ?? '',
      email: u.email ?? '',
      phone_number: u.phone_number ?? '',
      password: '',
      role_id: u.role_id != null ? String(u.role_id) : '',
      is_active: u.is_active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.full_name.trim()) {
      toast.error(t('user.nameRequired', 'F.I.O kiriting'));
      return;
    }
    if (!editing && !form.password.trim()) {
      toast.error(t('user.passwordRequired', 'Parol kiriting'));
      return;
    }
    setSaving(true);
    const payload: Record<string, unknown> = {
      full_name: form.full_name.trim(),
      email: form.email.trim() || null,
      phone_number: form.phone_number.trim() || null,
      role_id: form.role_id ? Number(form.role_id) : null,
      is_active: form.is_active,
    };
    if (form.password.trim()) payload.password = form.password;
    try {
      if (editing) await rbacApi.updateUser(SCOPE, editing.id, payload);
      else await rbacApi.createUser(SCOPE, payload);
      toast.success(editing ? t('user.updated', 'Foydalanuvchi yangilandi') : t('user.created', 'Foydalanuvchi yaratildi'));
      setOpen(false);
      if (editing) load();
      else { setPage(1); load(); }
    } catch (err) {
      toast.error(apiError(err, t('common.error', 'Xatolik yuz berdi')));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await rbacApi.deleteUser(SCOPE, toDelete.id);
      toast.success(t('user.deleted', 'Foydalanuvchi o\'chirildi'));
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {t('user.subtitle', 'Platforma administratorlarini boshqaring')}
        </p>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('user.add', 'Administrator qo\'shish')}
        </Button>
      </div>

      <Card>
        <CardContent className="py-5 space-y-4">
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('user.fullName', 'F.I.O')}</TableHead>
                  <TableHead>{t('user.email', 'Email')}</TableHead>
                  <TableHead>{t('user.phone', 'Telefon')}</TableHead>
                  <TableHead>{t('user.role', 'Rol')}</TableHead>
                  <TableHead className="text-center">{t('user.statusCol', 'Holat')}</TableHead>
                  <TableHead className="text-right">{t('common.actions', 'Amallar')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      {t('common.noData', 'Ma\'lumot yo\'q')}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.full_name ?? '-'}</TableCell>
                      <TableCell>{u.email ?? '-'}</TableCell>
                      <TableCell>{u.phone_number ?? '-'}</TableCell>
                      <TableCell>{u.role ?? '-'}</TableCell>
                      <TableCell className="text-center">
                        {u.is_active ? (
                          <Badge variant="success">{t('common.active', 'Faol')}</Badge>
                        ) : (
                          <Badge variant="outline">{t('common.inactive', 'Nofaol')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(u)} title={t('common.edit', 'Tahrirlash')}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setToDelete(u)} title={t('common.delete', 'O\'chirish')}>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{editing ? t('user.editTitle', 'Administratorni tahrirlash') : t('user.createTitle', 'Yangi administrator')}</DialogTitle>
            <DialogDescription>{t('user.formSubtitle', 'Foydalanuvchi ma\'lumotlarini to\'ldiring')}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label>{t('user.fullName', 'F.I.O')}</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('user.email', 'Email')}</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('user.phone', 'Telefon')}</Label>
              <Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>{editing ? t('user.newPassword', 'Yangi parol (ixtiyoriy)') : t('user.password', 'Parol')}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editing ? t('user.keepPassword', 'O\'zgartirmaslik uchun bo\'sh qoldiring') : ''}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('user.role', 'Rol')}</Label>
              <Select value={form.role_id} onValueChange={(v) => setForm({ ...form, role_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('user.selectRole', 'Rolni tanlang')} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-7">
              <input
                id="user-active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="user-active" className="cursor-pointer">{t('common.active', 'Faol')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              {t('common.cancel', 'Bekor qilish')}
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.save', 'Saqlash')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        onConfirm={remove}
        variant="destructive"
        loading={deleting}
        title={t('user.deleteTitle', 'Administratorni o\'chirish')}
        description={t('user.deleteConfirm', 'Ushbu foydalanuvchini o\'chirmoqchimisiz?')}
        confirmText={t('common.delete', 'O\'chirish')}
        cancelText={t('common.cancel', 'Bekor qilish')}
      />
    </div>
  );
}

function AllUsersTab() {
  const { t } = useTranslation();
  const [items, setItems] = useState<AllUserRow[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [toDelete, setToDelete] = useState<AllUserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  // search debounce
  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, unknown> = { page, page_size: PAGE_SIZE };
    if (query.trim()) params.search = query.trim();
    rbacApi
      .allUsers(params)
      .then((res) => {
        setItems(res.results as unknown as AllUserRow[]);
        setCount(res.count);
      })
      .catch((err) => toast.error(apiError(err, t('common.error', 'Xatolik yuz berdi'))))
      .finally(() => setLoading(false));
  }, [page, query, t]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  const hasCompany = !!toDelete?.company_id;

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await rbacApi.deleteAnyUser(toDelete.id, { cascadeCompany: hasCompany });
      toast.success(
        hasCompany
          ? t('user.userCompanyDeleted', 'Kompaniya va foydalanuvchi o\'chirildi')
          : t('user.deleted', 'Foydalanuvchi o\'chirildi'),
      );
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
    <div className="space-y-4">
      <Card>
        <CardContent className="py-5 space-y-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('user.searchAll', 'F.I.O, telefon, email yoki kompaniya...')}
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('user.fullName', 'F.I.O')}</TableHead>
                  <TableHead>{t('user.phone', 'Telefon')}</TableHead>
                  <TableHead>{t('user.email', 'Email')}</TableHead>
                  <TableHead>{t('user.company', 'Kompaniya')}</TableHead>
                  <TableHead>{t('user.role', 'Rol')}</TableHead>
                  <TableHead className="text-center">{t('user.statusCol', 'Holat')}</TableHead>
                  <TableHead className="text-right">{t('common.actions', 'Amallar')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      {t('common.noData', 'Ma\'lumot yo\'q')}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>{u.full_name ?? '-'}</span>
                          {u.is_superuser && (
                            <Badge variant="warning" className="gap-1">
                              <Shield className="h-3 w-3" />
                              {t('user.superAdmin', 'Super admin')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{u.phone_number ?? '-'}</TableCell>
                      <TableCell>{u.email ?? '-'}</TableCell>
                      <TableCell>{u.company_name ?? '—'}</TableCell>
                      <TableCell>{u.role_name ?? '-'}</TableCell>
                      <TableCell className="text-center">
                        {u.is_active ? (
                          <Badge variant="success">{t('common.active', 'Faol')}</Badge>
                        ) : (
                          <Badge variant="outline">{t('common.inactive', 'Nofaol')}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {u.is_superuser ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setToDelete(u)}
                            title={t('common.delete', 'O\'chirish')}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
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

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        onConfirm={remove}
        variant="destructive"
        loading={deleting}
        title={
          hasCompany
            ? t('user.deleteWithCompanyTitle', 'Kompaniya va foydalanuvchini o\'chirish')
            : t('user.deleteUserTitle', 'Foydalanuvchini o\'chirish')
        }
        description={
          hasCompany
            ? t(
                'user.deleteWithCompanyConfirm',
                'Bu foydalanuvchi "{{company}}" kompaniyasiga tegishli. Uni o\'chirish uchun kompaniya va uning BARCHA ma\'lumotlari (do\'konlar, mahsulotlar, sotuvlar, xodimlar) ham o\'chiriladi. Bu amalni qaytarib bo\'lmaydi. Davom etasizmi?',
                { company: toDelete?.company_name ?? '' },
              )
            : t('user.deleteConfirm', 'Ushbu foydalanuvchini o\'chirmoqchimisiz?')
        }
        confirmText={
          hasCompany
            ? t('user.deleteWithCompanyAction', 'Kompaniya bilan o\'chirish')
            : t('common.delete', 'O\'chirish')
        }
        cancelText={t('common.cancel', 'Bekor qilish')}
      />
    </div>
  );
}

export function PlatformUsersPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabKey>('admins');

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'admins', label: t('user.title', 'Administratorlar') },
    { key: 'all', label: t('user.allUsers', 'Barcha foydalanuvchilar') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('user.pageTitle', 'Foydalanuvchilar')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('user.pageSubtitle', 'Platforma administratorlari va barcha foydalanuvchilar')}
        </p>
      </div>

      <div className="inline-flex items-center gap-1 rounded-xl bg-muted/50 p-1">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={cn(
              'h-8 rounded-lg px-3 text-sm font-medium transition-all',
              tab === tb.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'admins' ? <AdminsTab /> : <AllUsersTab />}
    </div>
  );
}
