import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Users, Loader2, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../../components/ui';
import { Badge } from '../../../../components/ui/Badge';
import { rbacApi } from '../../services';
import { usePlanLimits } from '../../usePlanLimits';
import type { CompanyUser } from '../../types';

const SCOPE = 'company' as const;

// Xodimga biriktirish uchun rol (yengil shakl)
interface AssignableRole {
  id: number;
  name: string;
  is_system: boolean;
}

// Do'kon (yengil shakl) — xodimni biriktirish uchun.
interface StoreLite {
  id: number;
  name: string;
}

const selectCls =
  'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50';

interface UserForm {
  full_name: string;
  phone_number: string;
  email: string;
  password: string;
  role_id: string;
  is_active: boolean;
  store_id: string; // '' = biriktirilmagan
  store_role: 'm' | 's';
}

const emptyForm: UserForm = {
  full_name: '',
  phone_number: '',
  email: '',
  password: '',
  role_id: '',
  is_active: true,
  store_id: '',
  store_role: 's',
};

export function CompanyUsersPage() {
  const { t } = useTranslation();

  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [roles, setRoles] = useState<AssignableRole[]>([]);
  const [stores, setStores] = useState<StoreLite[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [count, setCount] = useState(0);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyUser | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<CompanyUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Tarif limiti (foydalanuvchi soni)
  const { limits, userFull, reload: reloadLimits } = usePlanLimits();

  const loadUsers = (p = page) => {
    setLoading(true);
    rbacApi
      .listUsers(SCOPE, { page: p })
      .then((res) => {
        setUsers(res.results);
        setTotalPages(res.total_pages || 1);
        setCount(res.count);
        setPage(res.current_page || p);
      })
      .catch(() => toast.error(t('common.loadError', "Ma'lumotlarni yuklab bo'lmadi")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    rbacApi
      .assignableRoles()
      .then(setRoles)
      .catch(() => toast.error(t('company.users.rolesLoadError', "Rollarni yuklab bo'lmadi")));
    // Kompaniya do'konlari (xodimni biriktirish uchun) — company.users.view bilan ochiq.
    rbacApi
      .assignableStores()
      .then((list) => setStores(list.map((s) => ({ id: s.id, name: s.name }))))
      .catch(() => setStores([]));
    loadUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goto = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    loadUsers(p);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (u: CompanyUser) => {
    setEditing(u);
    setForm({
      full_name: u.full_name ?? '',
      phone_number: u.phone_number ?? '',
      email: u.email ?? '',
      password: '',
      role_id: u.role_id ? String(u.role_id) : '',
      is_active: u.is_active,
      store_id: u.store_id ? String(u.store_id) : '',
      store_role: (u.store_role as 'm' | 's') ?? 's',
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) {
      toast.error(t('company.users.nameRequired', 'F.I.SH kerak'));
      return;
    }
    if (!form.role_id) {
      toast.error(t('company.users.roleRequired', 'Rol tanlang'));
      return;
    }
    // Yaratishda telefon yoki email majburiy
    if (!editing && !form.phone_number.trim() && !form.email.trim()) {
      toast.error(t('company.users.contactRequired', 'Telefon yoki email kiriting'));
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await rbacApi.updateUser(SCOPE, editing.id, {
          full_name: form.full_name.trim(),
          role_id: Number(form.role_id),
          is_active: form.is_active,
          // '' => null (do'kondan chiqarish), aks holda tanlangan do'kon.
          store_id: form.store_id ? Number(form.store_id) : null,
          store_role: form.store_role,
        });
        toast.success(t('company.users.updated', 'Xodim yangilandi'));
      } else {
        await rbacApi.createUser(SCOPE, {
          full_name: form.full_name.trim(),
          phone_number: form.phone_number.trim() || undefined,
          email: form.email.trim() || undefined,
          password: form.password || undefined,
          role_id: Number(form.role_id),
          store_id: form.store_id ? Number(form.store_id) : undefined,
          store_role: form.store_role,
        });
        toast.success(t('company.users.created', 'Xodim qoshildi'));
      }
      setOpen(false);
      loadUsers(editing ? page : 1);
      void reloadLimits();
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: Record<string, unknown> } };
      const data = e2.response?.data;
      toast.error(data ? Object.values(data).flat().join(' ') : t('common.error', 'Xatolik'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await rbacApi.deleteUser(SCOPE, toDelete.id);
      toast.success(t('company.users.deleted', "Xodim o'chirildi"));
      setToDelete(null);
      loadUsers(page);
      void reloadLimits();
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: Record<string, unknown> } };
      const data = e2.response?.data;
      toast.error(data ? Object.values(data).flat().join(' ') : t('common.error', 'Xatolik'));
    } finally {
      setDeleting(false);
    }
  };

  // Owner rolidagi xodimni o'chirish/cheklash uchun aniqlash
  const isOwner = (u: CompanyUser) => roles.find((r) => r.id === u.role_id)?.is_system === true;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            {t('company.users.title', 'Xodimlar')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('company.users.subtitle', 'Kompaniya xodimlari va ularning rollarini boshqaring')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {limits && limits.users.max !== null && (
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {t('company.users.usage', 'Xodimlar')}: <b className="text-foreground">{limits.users.used}</b> / {limits.users.max}
            </span>
          )}
          <Button
            onClick={openCreate}
            className="h-10"
            disabled={userFull}
            title={userFull ? t('company.users.limitReached', "Tarif limiti to'ldi. Ko'proq xodim uchun tarifni yangilang.") : undefined}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('company.users.add', 'Xodim qoshish')}
          </Button>
        </div>
      </div>

      {userFull && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-300">
          {t('company.users.limitReached', "Tarif limiti to'ldi. Ko'proq xodim uchun tarifni yangilang.")}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              {t('company.users.empty', 'Hozircha xodimlar yoq')}
            </div>
          ) : (
            <>
              {/* Mobil karta ko'rinishi */}
              <div className="divide-y divide-border/60 md:hidden">
                {users.map((u) => {
                  const owner = isOwner(u);
                  return (
                    <div key={u.id} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 font-medium">
                            <span className="truncate">{u.full_name || '-'}</span>
                            {owner && <Crown className="w-3.5 h-3.5 shrink-0 text-amber-500" />}
                          </div>
                          <p className="truncate text-sm text-muted-foreground">
                            {u.role || '-'}{u.store_name ? ` · ${u.store_name}` : ''}
                          </p>
                        </div>
                        <Badge variant={u.is_active ? 'success' : 'danger'}>
                          {u.is_active ? t('company.users.active', 'Faol') : t('company.users.inactive', 'Nofaol')}
                        </Badge>
                      </div>
                      <div className="space-y-0.5 text-sm text-muted-foreground">
                        {u.phone_number && <a href={`tel:${u.phone_number}`} className="block truncate">{u.phone_number}</a>}
                        {u.email && <a href={`mailto:${u.email}`} className="block truncate">{u.email}</a>}
                        {!u.phone_number && !u.email && <span>-</span>}
                      </div>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(u)} title={t('common.edit', 'Tahrirlash')}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {!owner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setToDelete(u)}
                            title={t('common.delete', "O'chirish")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop jadval ko'rinishi */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('company.users.fullName', 'F.I.SH')}</TableHead>
                      <TableHead>{t('company.users.phone', 'Telefon')}</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>{t('company.users.role', 'Rol')}</TableHead>
                      <TableHead>{t('company.users.store', "Do'kon")}</TableHead>
                      <TableHead className="text-center">{t('company.users.status', 'Holat')}</TableHead>
                      <TableHead className="text-right">{t('common.actions', 'Amallar')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => {
                      const owner = isOwner(u);
                      return (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {u.full_name || '-'}
                              {owner && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{u.phone_number || '-'}</TableCell>
                          <TableCell className="text-muted-foreground">{u.email || '-'}</TableCell>
                          <TableCell>{u.role || '-'}</TableCell>
                          <TableCell className="text-muted-foreground">{u.store_name || '-'}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={u.is_active ? 'success' : 'danger'}>
                              {u.is_active ? t('company.users.active', 'Faol') : t('company.users.inactive', 'Nofaol')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openEdit(u)} title={t('common.edit', 'Tahrirlash')}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              {!owner && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setToDelete(u)}
                                  title={t('common.delete', "O'chirish")}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t('common.total', 'Jami')}: {count}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => goto(page - 1)} disabled={page <= 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-2">
              {page} / {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={() => goto(page + 1)} disabled={page >= totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Yaratish / tahrirlash dialogi */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle>
                {editing ? t('company.users.editTitle', 'Xodimni tahrirlash') : t('company.users.createTitle', 'Yangi xodim')}
              </DialogTitle>
              <DialogDescription>
                {t('company.users.dialogHint', "Xodim ma'lumotlari va rolini tanlang")}
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold">{t('company.users.fullName', 'F.I.SH')} *</Label>
                <Input
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  required
                  className="h-11"
                />
              </div>

              {!editing && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="font-semibold">{t('company.users.phone', 'Telefon')}</Label>
                      <Input
                        value={form.phone_number}
                        onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
                        className="h-11"
                        placeholder="+998901234567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Email</Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        className="h-11"
                        placeholder="email@misol.com"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2">
                    {t('company.users.contactHint', 'Telefon yoki email majburiy')}
                  </p>
                  <div className="space-y-2">
                    <Label className="font-semibold">{t('company.users.password', 'Parol')}</Label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      className="h-11"
                      placeholder="••••••••"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className="font-semibold">{t('company.users.role', 'Rol')} *</Label>
                <select
                  className={selectCls}
                  value={form.role_id}
                  onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))}
                  required
                >
                  <option value="">{t('common.select', 'Tanlang')}</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Do'kon biriktirish — xodim login qilganda shu do'kon konteksti faol bo'ladi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="font-semibold">{t('company.users.store', "Do'kon")}</Label>
                  <select
                    className={selectCls}
                    value={form.store_id}
                    onChange={(e) => setForm((f) => ({ ...f, store_id: e.target.value }))}
                  >
                    <option value="">{t('company.users.noStore', 'Biriktirilmagan')}</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">{t('company.users.storeRole', "Do'kondagi rol")}</Label>
                  <select
                    className={selectCls}
                    value={form.store_role}
                    onChange={(e) => setForm((f) => ({ ...f, store_role: e.target.value as 'm' | 's' }))}
                    disabled={!form.store_id}
                  >
                    <option value="s">{t('company.users.seller', 'Sotuvchi')}</option>
                    <option value="m">{t('company.users.manager', 'Menejer')}</option>
                  </select>
                </div>
              </div>

              {editing && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input accent-primary"
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  />
                  <span className="text-sm font-medium">{t('company.users.activeLabel', 'Faol foydalanuvchi')}</span>
                </label>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                {t('common.cancel', 'Bekor qilish')}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.save', 'Saqlash')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* O'chirishni tasdiqlash dialogi */}
      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>{t('company.users.deleteTitle', "Xodimni o'chirish")}</DialogTitle>
            <DialogDescription>
              {t('company.users.deleteConfirm', 'Quyidagi xodimni ochirishni tasdiqlaysizmi?')}{' '}
              <span className="font-semibold text-foreground">{toDelete?.full_name}</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)} disabled={deleting}>
              {t('common.cancel', 'Bekor qilish')}
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.delete', "O'chirish")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
