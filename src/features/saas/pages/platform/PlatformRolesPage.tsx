import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Loader2, Lock, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Button, Card, CardContent, Input, Label,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../../../../components/ui';
import { Badge } from '../../../../components/ui/Badge';
import { ConfirmDialog } from '../../../../components/shared/ConfirmDialog';
import { rbacApi } from '../../services';
import type { Role, PermissionGroup } from '../../types';

const SCOPE = 'platform' as const;

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

export function PlatformRolesPage() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([rbacApi.listRoles(SCOPE), rbacApi.permissions(SCOPE)])
      .then(([r, p]) => {
        setRoles(r);
        setGroups(p);
      })
      .catch((err) => toast.error(apiError(err, t('common.error', 'Xatolik yuz berdi'))))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setSelectedPerms(new Set());
    setOpen(true);
  };

  const openEdit = (r: Role) => {
    setEditing(r);
    setName(r.name);
    setDescription(r.description ?? '');
    setSelectedPerms(new Set(r.permissions));
    setOpen(true);
  };

  const togglePerm = (code: string) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleGroup = (group: PermissionGroup) => {
    const codes = group.permissions.map((p) => p.code);
    const allSelected = codes.every((c) => selectedPerms.has(c));
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      codes.forEach((c) => { if (allSelected) next.delete(c); else next.add(c); });
      return next;
    });
  };

  const save = async () => {
    if (!name.trim()) {
      toast.error(t('role.nameRequired', 'Rol nomini kiriting'));
      return;
    }
    setSaving(true);
    const permissions = Array.from(selectedPerms);
    try {
      if (editing) await rbacApi.updateRole(SCOPE, editing.id, { name: name.trim(), description: description.trim(), permissions });
      else await rbacApi.createRole(SCOPE, { name: name.trim(), description: description.trim(), permissions });
      toast.success(editing ? t('role.updated', 'Rol yangilandi') : t('role.created', 'Rol yaratildi'));
      setOpen(false);
      load();
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
      await rbacApi.deleteRole(SCOPE, toDelete.id);
      toast.success(t('role.deleted', 'Rol o\'chirildi'));
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(apiError(err, t('common.error', 'Xatolik yuz berdi')));
    } finally {
      setDeleting(false);
    }
  };

  const isSystem = editing?.is_system ?? false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('role.title', 'Platforma rollari')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('role.subtitle', 'Administrator rollarini va ruxsatlarini boshqaring')}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('role.add', 'Rol qo\'shish')}
        </Button>
      </div>

      <Card>
        <CardContent className="py-5">
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('role.name', 'Nomi')}</TableHead>
                  <TableHead>{t('role.description', 'Tavsif')}</TableHead>
                  <TableHead className="text-center">{t('role.permsCount', 'Ruxsatlar')}</TableHead>
                  <TableHead className="text-center">{t('role.users', 'Foydalanuvchilar')}</TableHead>
                  <TableHead className="text-center">{t('role.type', 'Turi')}</TableHead>
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
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      {t('common.noData', 'Ma\'lumot yo\'q')}
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="max-w-64 truncate text-muted-foreground">{r.description ?? '-'}</TableCell>
                      <TableCell className="text-center">{r.permissions.length}</TableCell>
                      <TableCell className="text-center">{r.users_count ?? 0}</TableCell>
                      <TableCell className="text-center">
                        {r.is_system ? (
                          <Badge variant="info">{t('role.system', 'Tizimli')}</Badge>
                        ) : (
                          <Badge variant="outline">{t('role.custom', 'Maxsus')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(r)} title={t('common.edit', 'Tahrirlash')}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {!r.is_system && (
                            <Button variant="ghost" size="sm" onClick={() => setToDelete(r)} title={t('common.delete', 'O\'chirish')}>
                              <Trash2 className="h-4 w-4 text-red-500" />
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
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg" className="max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isSystem && <Lock className="h-4 w-4 text-muted-foreground" />}
              {editing ? t('role.editTitle', 'Rolni tahrirlash') : t('role.createTitle', 'Yangi rol')}
            </DialogTitle>
            <DialogDescription>
              {isSystem
                ? t('role.systemHint', 'Tizimli rol — tahrirlash cheklangan')
                : t('role.formSubtitle', 'Rol nomi va ruxsatlarini belgilang')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t('role.name', 'Nomi')}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} disabled={isSystem} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('role.description', 'Tavsif')}</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSystem} />
              </div>
            </div>

            <div className="space-y-3">
              <Label>{t('role.permissions', 'Ruxsatlar')}</Label>
              {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('role.noPerms', 'Ruxsatlar topilmadi')}</p>
              ) : (
                <div className="space-y-3">
                  {groups.map((group) => {
                    const codes = group.permissions.map((p) => p.code);
                    const allSelected = codes.length > 0 && codes.every((c) => selectedPerms.has(c));
                    return (
                      <div key={group.module} className="rounded-xl border border-border/60 p-3">
                        <label className="mb-2 flex items-center gap-2 font-medium">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            disabled={isSystem}
                            onChange={() => toggleGroup(group)}
                            className="h-4 w-4 rounded border-border"
                          />
                          {group.module_label || group.module}
                        </label>
                        <div className="grid grid-cols-1 gap-1.5 pl-6 sm:grid-cols-2">
                          {group.permissions.map((perm) => (
                            <label key={perm.code} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={selectedPerms.has(perm.code)}
                                disabled={isSystem}
                                onChange={() => togglePerm(perm.code)}
                                className="h-4 w-4 rounded border-border"
                              />
                              <span className="truncate">{perm.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="px-6">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              {t('common.cancel', 'Bekor qilish')}
            </Button>
            <Button onClick={save} disabled={saving || isSystem}>
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
        title={t('role.deleteTitle', 'Rolni o\'chirish')}
        description={t('role.deleteConfirm', 'Ushbu rolni o\'chirmoqchimisiz?')}
        confirmText={t('common.delete', 'O\'chirish')}
        cancelText={t('common.cancel', 'Bekor qilish')}
      />
    </div>
  );
}
