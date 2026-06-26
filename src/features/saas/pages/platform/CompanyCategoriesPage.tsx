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
import { companyCategoriesApi } from '../../services';
import type { CompanyCategory } from '../../types';
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

interface FormState {
  name: MultiLangValues;
  description: MultiLangValues;
  icon: string;
  is_active: boolean;
}

const emptyForm: FormState = {
  name: { ...emptyMultiLang },
  description: { ...emptyMultiLang },
  icon: '',
  is_active: true,
};

export function CompanyCategoriesPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<CompanyCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyCategory | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<CompanyCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    companyCategoriesApi
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

  const openEdit = (c: CompanyCategory) => {
    setEditing(c);
    setForm({
      name: {
        uz: c.name_uz ?? c.name ?? '',
        en: c.name_en ?? '',
        ru: c.name_ru ?? '',
        cyrl: c.name_uz_cyrl ?? '',
      },
      description: {
        uz: c.description_uz ?? c.description ?? '',
        en: c.description_en ?? '',
        ru: c.description_ru ?? '',
        cyrl: c.description_uz_cyrl ?? '',
      },
      icon: c.icon ?? '',
      is_active: c.is_active ?? true,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.uz.trim()) {
      toast.error(t('category.nameRequired', 'Soha nomini kiriting'));
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
      icon: form.icon.trim() || null,
      is_active: form.is_active,
    };
    try {
      if (editing) await companyCategoriesApi.update(editing.id, payload);
      else await companyCategoriesApi.create(payload);
      toast.success(editing ? t('category.updated', 'Soha yangilandi') : t('category.created', 'Soha yaratildi'));
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
      await companyCategoriesApi.remove(toDelete.id);
      toast.success(t('category.deleted', 'Soha o\'chirildi'));
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(apiError(err, t('category.deleteError', 'Avval kompaniyalarni uzing')));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('category.title', 'Sohalar')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('category.subtitle', 'Kompaniya sohalarini boshqaring')}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('category.add', 'Soha qo\'shish')}
        </Button>
      </div>

      <Card>
        <CardContent className="py-5">
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('category.name', 'Nomi')}</TableHead>
                  <TableHead>{t('category.slug', 'Slug')}</TableHead>
                  <TableHead className="text-center">{t('category.companies', 'Kompaniyalar')}</TableHead>
                  <TableHead className="text-center">{t('category.statusCol', 'Holat')}</TableHead>
                  <TableHead className="text-right">{t('common.actions', 'Amallar')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      {t('common.noData', 'Ma\'lumot yo\'q')}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{c.slug}</TableCell>
                      <TableCell className="text-center">{c.companies_count ?? 0}</TableCell>
                      <TableCell className="text-center">
                        {c.is_active ?? true ? (
                          <Badge variant="success">{t('common.active', 'Faol')}</Badge>
                        ) : (
                          <Badge variant="outline">{t('common.inactive', 'Nofaol')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(c)} title={t('common.edit', 'Tahrirlash')}>
                            <Pencil className="h-4 w-4" />
                          </Button>
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
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('category.editTitle', 'Sohani tahrirlash') : t('category.createTitle', 'Yangi soha')}</DialogTitle>
            <DialogDescription>{t('category.formSubtitle', 'Soha ma\'lumotlarini to\'ldiring')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <MultiLangInput
              label={t('category.name', 'Nomi')}
              values={form.name}
              onChange={(name) => setForm({ ...form, name })}
              required
            />
            <MultiLangInput
              label={t('category.description', 'Tavsif')}
              values={form.description}
              onChange={(description) => setForm({ ...form, description })}
              type="textarea"
            />
            <div className="space-y-1.5">
              <Label>{t('category.icon', 'Ikon (nomi yoki emoji)')}</Label>
              <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="cat-active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="cat-active" className="cursor-pointer">{t('common.active', 'Faol')}</Label>
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
        title={t('category.deleteTitle', 'Sohani o\'chirish')}
        description={t('category.deleteConfirm', 'Ushbu sohani o\'chirmoqchimisiz? Bog\'langan kompaniyalar bo\'lsa o\'chirilmaydi.')}
        confirmText={t('common.delete', 'O\'chirish')}
        cancelText={t('common.cancel', 'Bekor qilish')}
      />
    </div>
  );
}
