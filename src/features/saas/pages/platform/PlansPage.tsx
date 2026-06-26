import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Button, Card, CardContent, Input, Label,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../../../../components/ui';
import { Badge } from '../../../../components/ui/Badge';
import { ConfirmDialog } from '../../../../components/shared/ConfirmDialog';
import { plansApi } from '../../services';
import type { Plan } from '../../types';
import { MultiLangInput, emptyMultiLang, type MultiLangValues } from '../../components/MultiLangInput';

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

interface FormState {
  name: MultiLangValues;
  description: MultiLangValues;
  price: string;
  duration_days: string;
  max_stores: string;
  max_users: string;
  sort_order: string;
  is_active: boolean;
}

const emptyForm: FormState = {
  name: { ...emptyMultiLang },
  description: { ...emptyMultiLang },
  price: '0', duration_days: '30',
  max_stores: '', max_users: '', sort_order: '0', is_active: true,
};

export function PlansPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<Plan | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    plansApi
      .adminList()
      .then(setItems)
      .catch((err) => toast.error(apiError(err, t('common.error', 'Xatolik yuz berdi'))))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p: Plan) => {
    setEditing(p);
    setForm({
      name: {
        uz: p.name_uz ?? p.name ?? '',
        en: p.name_en ?? '',
        ru: p.name_ru ?? '',
        cyrl: p.name_uz_cyrl ?? '',
      },
      description: {
        uz: p.description_uz ?? p.description ?? '',
        en: p.description_en ?? '',
        ru: p.description_ru ?? '',
        cyrl: p.description_uz_cyrl ?? '',
      },
      price: p.price,
      duration_days: String(p.duration_days),
      max_stores: p.max_stores != null ? String(p.max_stores) : '',
      max_users: p.max_users != null ? String(p.max_users) : '',
      sort_order: String(p.sort_order ?? 0),
      is_active: p.is_active ?? true,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.uz.trim()) {
      toast.error(t('plan.nameRequired', 'Tarif nomini kiriting'));
      return;
    }
    setSaving(true);
    const payload: Record<string, unknown> = {
      name: form.name.uz.trim(),
      name_ru: form.name.ru.trim() || null,
      name_en: form.name.en.trim() || null,
      name_uz_cyrl: form.name.cyrl.trim() || null,
      description: form.description.uz.trim() || null,
      description_ru: form.description.ru.trim() || null,
      description_en: form.description.en.trim() || null,
      description_uz_cyrl: form.description.cyrl.trim() || null,
      price: form.price || '0',
      duration_days: Number(form.duration_days) || 0,
      max_stores: form.max_stores === '' ? null : Number(form.max_stores),
      max_users: form.max_users === '' ? null : Number(form.max_users),
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };
    try {
      if (editing) await plansApi.update(editing.id, payload);
      else await plansApi.create(payload);
      toast.success(editing ? t('plan.updated', 'Tarif yangilandi') : t('plan.created', 'Tarif yaratildi'));
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
      await plansApi.remove(toDelete.id);
      toast.success(t('plan.deleted', 'Tarif o\'chirildi'));
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(apiError(err, t('plan.deleteError', 'Tarifni o\'chirib bo\'lmadi')));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('plan.title', 'Tariflar')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('plan.subtitle', 'Obuna tariflarini yarating va boshqaring')}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('plan.add', 'Tarif qo\'shish')}
        </Button>
      </div>

      <Card>
        <CardContent className="py-5">
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('plan.name', 'Nomi')}</TableHead>
                  <TableHead>{t('plan.price', 'Narx')}</TableHead>
                  <TableHead className="text-center">{t('plan.duration', 'Muddat (kun)')}</TableHead>
                  <TableHead className="text-center">{t('plan.maxStores', 'Maks. do\'kon')}</TableHead>
                  <TableHead className="text-center">{t('plan.maxUsers', 'Maks. foydalanuvchi')}</TableHead>
                  <TableHead className="text-center">{t('plan.statusCol', 'Holat')}</TableHead>
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
                  items.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{formatPrice(p.price)}</TableCell>
                      <TableCell className="text-center">{p.duration_days}</TableCell>
                      <TableCell className="text-center">{p.max_stores ?? '∞'}</TableCell>
                      <TableCell className="text-center">{p.max_users ?? '∞'}</TableCell>
                      <TableCell className="text-center">
                        {p.is_active ? (
                          <Badge variant="success">{t('common.active', 'Faol')}</Badge>
                        ) : (
                          <Badge variant="outline">{t('common.inactive', 'Nofaol')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(p)} title={t('common.edit', 'Tahrirlash')}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setToDelete(p)} title={t('common.delete', 'O\'chirish')}>
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
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{editing ? t('plan.editTitle', 'Tarifni tahrirlash') : t('plan.createTitle', 'Yangi tarif')}</DialogTitle>
            <DialogDescription>{t('plan.formSubtitle', 'Tarif ma\'lumotlarini to\'ldiring')}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <MultiLangInput
                label={t('plan.name', 'Nomi')}
                values={form.name}
                onChange={(name) => setForm({ ...form, name })}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <MultiLangInput
                label={t('plan.description', 'Tavsif')}
                values={form.description}
                onChange={(description) => setForm({ ...form, description })}
                type="textarea"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('plan.price', 'Narx')}</Label>
              <Input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('plan.duration', 'Muddat (kun)')}</Label>
              <Input type="number" min="0" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('plan.maxStores', 'Maks. do\'kon')}</Label>
              <Input type="number" min="0" placeholder="∞" value={form.max_stores} onChange={(e) => setForm({ ...form, max_stores: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('plan.maxUsers', 'Maks. foydalanuvchi')}</Label>
              <Input type="number" min="0" placeholder="∞" value={form.max_users} onChange={(e) => setForm({ ...form, max_users: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('plan.sortOrder', 'Tartib raqami')}</Label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 pt-7">
              <input
                id="plan-active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="plan-active" className="cursor-pointer">{t('common.active', 'Faol')}</Label>
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
        title={t('plan.deleteTitle', 'Tarifni o\'chirish')}
        description={t('plan.deleteConfirm', 'Ushbu tarifni o\'chirmoqchimisiz?')}
        confirmText={t('common.delete', 'O\'chirish')}
        cancelText={t('common.cancel', 'Bekor qilish')}
      />
    </div>
  );
}
