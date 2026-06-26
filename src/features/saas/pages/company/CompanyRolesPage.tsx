import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ShieldCheck, Loader2, Plus, Pencil, Trash2, Crown } from 'lucide-react';
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import type { Role, PermissionGroup } from '../../types';

const SCOPE = 'company' as const;

interface RoleForm {
  name: string;
  description: string;
  permissions: string[];
}

const emptyForm: RoleForm = { name: '', description: '', permissions: [] };

export function CompanyRolesPage() {
  const { t } = useTranslation();

  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog holati
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState<RoleForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  // O'chirish tasdiqlash
  const [toDelete, setToDelete] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([rbacApi.listRoles(SCOPE), rbacApi.permissions(SCOPE)])
      .then(([rl, gr]) => {
        setRoles(rl);
        setGroups(gr);
      })
      .catch(() => toast.error(t('common.loadError', "Ma'lumotlarni yuklab bo'lmadi")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allCodes = useMemo(() => groups.flatMap((g) => g.permissions.map((p) => p.code)), [groups]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    setForm({
      name: role.name,
      description: role.description ?? '',
      permissions: [...role.permissions],
    });
    setOpen(true);
  };

  const togglePerm = (code: string) =>
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(code)
        ? f.permissions.filter((c) => c !== code)
        : [...f.permissions, code],
    }));

  const toggleModule = (codes: string[], allSelected: boolean) =>
    setForm((f) => ({
      ...f,
      permissions: allSelected
        ? f.permissions.filter((c) => !codes.includes(c))
        : Array.from(new Set([...f.permissions, ...codes])),
    }));

  const toggleAll = (allSelected: boolean) =>
    setForm((f) => ({ ...f, permissions: allSelected ? [] : [...allCodes] }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error(t('company.roles.nameRequired', 'Rol nomi kerak'));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        permissions: form.permissions,
      };
      if (editing) {
        await rbacApi.updateRole(SCOPE, editing.id, payload);
        toast.success(t('company.roles.updated', 'Rol yangilandi'));
      } else {
        await rbacApi.createRole(SCOPE, payload);
        toast.success(t('company.roles.created', 'Rol yaratildi'));
      }
      setOpen(false);
      load();
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
      await rbacApi.deleteRole(SCOPE, toDelete.id);
      toast.success(t('company.roles.deleted', "Rol o'chirildi"));
      setToDelete(null);
      load();
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: Record<string, unknown> } };
      const data = e2.response?.data;
      toast.error(data ? Object.values(data).flat().join(' ') : t('common.error', 'Xatolik'));
    } finally {
      setDeleting(false);
    }
  };

  const allSelected = allCodes.length > 0 && allCodes.every((c) => form.permissions.includes(c));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            {t('company.roles.title', 'Rollar va ruxsatlar')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('company.roles.subtitle', 'Xodimlar uchun rollar va ularning ruxsatlarini boshqaring')}
          </p>
        </div>
        <Button onClick={openCreate} className="h-10">
          <Plus className="w-4 h-4 mr-2" />
          {t('company.roles.add', 'Rol qoshish')}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : roles.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              {t('company.roles.empty', 'Hozircha rollar yoq')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('company.roles.name', 'Nomi')}</TableHead>
                  <TableHead>{t('company.roles.description', 'Tavsif')}</TableHead>
                  <TableHead className="text-center">{t('company.roles.permsCount', 'Ruxsatlar')}</TableHead>
                  <TableHead className="text-center">{t('company.roles.usersCount', 'Foydalanuvchilar')}</TableHead>
                  <TableHead className="text-right">{t('common.actions', 'Amallar')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {role.name}
                        {role.is_system && (
                          <Badge variant="warning" className="gap-1">
                            <Crown className="w-3 h-3" /> Owner
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {role.description || '-'}
                    </TableCell>
                    <TableCell className="text-center">{role.permissions.length}</TableCell>
                    <TableCell className="text-center">{role.users_count ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(role)} title={t('common.edit', 'Tahrirlash')}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {!role.is_system && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setToDelete(role)}
                            title={t('common.delete', "O'chirish")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Yaratish / tahrirlash dialogi */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="xl">
          <form onSubmit={submit} className="flex flex-col max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>
                {editing ? t('company.roles.editTitle', 'Rolni tahrirlash') : t('company.roles.createTitle', 'Yangi rol')}
              </DialogTitle>
              <DialogDescription>
                {t('company.roles.dialogHint', 'Rol nomi va ruxsatlarni tanlang')}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-2 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="font-semibold">{t('company.roles.name', 'Nomi')} *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    className="h-11"
                    placeholder={t('company.roles.namePh', 'Masalan: Menejer')}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">{t('company.roles.description', 'Tavsif')}</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">{t('company.roles.permissions', 'Ruxsatlar')}</Label>
                  <button
                    type="button"
                    onClick={() => toggleAll(allSelected)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {allSelected
                      ? t('company.roles.deselectAll', 'Hammasini bekor qilish')
                      : t('company.roles.selectAll', 'Barchasini tanlash')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groups.map((group) => {
                    const codes = group.permissions.map((p) => p.code);
                    const moduleAll = codes.length > 0 && codes.every((c) => form.permissions.includes(c));
                    const someSelected = codes.some((c) => form.permissions.includes(c));
                    return (
                      <div key={group.module} className="rounded-xl border border-border/60 p-3 space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-input accent-primary"
                            checked={moduleAll}
                            ref={(el) => {
                              if (el) el.indeterminate = !moduleAll && someSelected;
                            }}
                            onChange={() => toggleModule(codes, moduleAll)}
                          />
                          <span className="font-semibold text-sm">{group.module_label || group.module}</span>
                        </label>
                        <div className="pl-6 space-y-1.5">
                          {group.permissions.map((perm) => (
                            <label
                              key={perm.code}
                              className="flex items-center gap-2 cursor-pointer select-none text-sm text-muted-foreground hover:text-foreground"
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-input accent-primary"
                                checked={form.permissions.includes(perm.code)}
                                onChange={() => togglePerm(perm.code)}
                              />
                              {perm.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {groups.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {t('company.roles.noPerms', 'Ruxsatlar topilmadi')}
                  </p>
                )}
              </div>
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
            <DialogTitle>{t('company.roles.deleteTitle', "Rolni o'chirish")}</DialogTitle>
            <DialogDescription>
              {t('company.roles.deleteConfirm', 'Quyidagi rolni ochirishni tasdiqlaysizmi?')}{' '}
              <span className="font-semibold text-foreground">{toDelete?.name}</span>
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
