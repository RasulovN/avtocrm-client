import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { ChevronRight, Loader2, Pencil, Plus, Trash2, Languages } from 'lucide-react';
import {
  Button, Card, CardContent, Input, Label,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../../../../components/ui';
import { ConfirmDialog } from '../../../../components/shared/ConfirmDialog';
import { geoApi } from '../../services';
import type { Country, Region, District } from '../../types';
import { cn } from '../../../../utils';
import { latinToCyrillic, latinToRussian, latinToEnglish } from '../../../../utils/transliteration';

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

type Level = 'country' | 'region' | 'district';

interface GeoItem {
  id: number;
  name: string;
  name_uz_cyrl?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  label?: string; // ko'rsatish uchun (joriy til)
}

interface GeoForm {
  name: string;
  name_uz_cyrl: string;
  name_ru: string;
  name_en: string;
}
const EMPTY_FORM: GeoForm = { name: '', name_uz_cyrl: '', name_ru: '', name_en: '' };

interface ColumnProps {
  title: string;
  items: GeoItem[];
  loading: boolean;
  selectedId: number | null;
  onSelect?: (id: number) => void;
  onAdd: () => void;
  onEdit: (item: GeoItem) => void;
  onDelete: (item: GeoItem) => void;
  addLabel: string;
  emptyLabel: string;
  selectable: boolean;
  disabled?: boolean;
  disabledLabel?: string;
}

function GeoColumn({
  title, items, loading, selectedId, onSelect, onAdd, onEdit, onDelete,
  addLabel, emptyLabel, selectable, disabled, disabledLabel,
}: ColumnProps) {
  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col gap-3 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
          <Button size="sm" variant="outline" onClick={onAdd} disabled={disabled} className="h-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {disabled ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{disabledLabel}</p>
          ) : loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => selectable && onSelect?.(item.id)}
                className={cn(
                  'group flex items-center justify-between rounded-lg border border-transparent px-3 py-2 text-sm transition-colors',
                  selectable && 'cursor-pointer hover:bg-muted/50',
                  selectedId === item.id && 'border-primary/30 bg-primary/10',
                )}
              >
                <span className="truncate">{item.label ?? item.name}</span>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                    className="rounded p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                    title="Tahrirlash"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                    className="rounded p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                    title="O'chirish"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </button>
                  {selectable && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
            ))
          )}
        </div>
        <p className="text-xs text-muted-foreground">{addLabel}</p>
      </CardContent>
    </Card>
  );
}

export function GeoPage() {
  const { t, i18n } = useTranslation();

  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

  // form dialog
  const [dialog, setDialog] = useState<{ level: Level; item: GeoItem | null } | null>(null);
  const [form, setForm] = useState<GeoForm>(EMPTY_FORM);
  // qaysi tarjima maydonlari qo'lda o'zgartirilgan (avtomatik to'ldirish ularni bosib o'tmaydi)
  const [touched, setTouched] = useState({ cyrl: false, ru: false, en: false });
  const [saving, setSaving] = useState(false);

  // delete
  const [toDelete, setToDelete] = useState<{ level: Level; item: GeoItem } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const err = (e: unknown) => toast.error(apiError(e, t('common.error', 'Xatolik yuz berdi')));

  // Joriy tilga mos nomni tanlash (bo'sh bo'lsa uz lotinga qaytadi)
  const localized = useCallback(
    <T extends GeoItem>(item: T): T => {
      const l = i18n.language;
      let label = item.name;
      if (l === 'cyrl') label = item.name_uz_cyrl || item.name;
      else if (l === 'ru') label = item.name_ru || item.name;
      else if (l === 'en') label = item.name_en || item.name;
      return { ...item, label };
    },
    [i18n.language],
  );

  const loadCountries = useCallback(() => {
    setLoadingCountries(true);
    geoApi.countries(true).then(setCountries).catch(err).finally(() => setLoadingCountries(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadRegions = useCallback((countryId: number) => {
    setLoadingRegions(true);
    geoApi.regions(countryId).then(setRegions).catch(err).finally(() => setLoadingRegions(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDistricts = useCallback((regionId: number) => {
    setLoadingDistricts(true);
    geoApi.districts(regionId).then(setDistricts).catch(err).finally(() => setLoadingDistricts(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadCountries(); }, [loadCountries]);

  const selectCountry = (id: number) => {
    setSelectedCountry(id);
    setSelectedRegion(null);
    setRegions([]);
    setDistricts([]);
    loadRegions(id);
  };

  const selectRegion = (id: number) => {
    setSelectedRegion(id);
    setDistricts([]);
    loadDistricts(id);
  };

  const openAdd = (level: Level) => {
    setForm(EMPTY_FORM);
    setTouched({ cyrl: false, ru: false, en: false });
    setDialog({ level, item: null });
  };
  const openEdit = (level: Level, item: GeoItem) => {
    setForm({
      name: item.name,
      name_uz_cyrl: item.name_uz_cyrl ?? '',
      name_ru: item.name_ru ?? '',
      name_en: item.name_en ?? '',
    });
    // mavjud tarjimalarni avtomatik bosib o'tmaymiz
    setTouched({ cyrl: true, ru: true, en: true });
    setDialog({ level, item });
  };

  // uz lotin yozilganda kirill/rus/ingliz avtomatik to'ldiriladi (qo'lda tahrirlanmaganlari)
  const onNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      name_uz_cyrl: touched.cyrl ? prev.name_uz_cyrl : latinToCyrillic(value),
      name_ru: touched.ru ? prev.name_ru : latinToRussian(value),
      name_en: touched.en ? prev.name_en : latinToEnglish(value),
    }));
  };

  // "Tarjima qilish" tugmasi — barcha tillarni uz lotindan qayta to'ldiradi
  const autoTranslate = () => {
    setForm((prev) => ({
      ...prev,
      name_uz_cyrl: latinToCyrillic(prev.name),
      name_ru: latinToRussian(prev.name),
      name_en: latinToEnglish(prev.name),
    }));
    setTouched({ cyrl: false, ru: false, en: false });
  };

  const save = async () => {
    if (!dialog) return;
    if (!form.name.trim()) {
      toast.error(t('geo.nameRequired', 'Nom kiriting'));
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      name_uz_cyrl: form.name_uz_cyrl.trim() || null,
      name_ru: form.name_ru.trim() || null,
      name_en: form.name_en.trim() || null,
    };
    try {
      const { level, item } = dialog;
      if (level === 'country') {
        if (item) await geoApi.updateCountry(item.id, payload);
        else await geoApi.createCountry(payload);
        loadCountries();
      } else if (level === 'region') {
        if (item) await geoApi.updateRegion(item.id, payload);
        else await geoApi.createRegion({ ...payload, country_id: selectedCountry });
        if (selectedCountry) loadRegions(selectedCountry);
      } else {
        if (item) await geoApi.updateDistrict(item.id, payload);
        else await geoApi.createDistrict({ ...payload, region_id: selectedRegion });
        if (selectedRegion) loadDistricts(selectedRegion);
      }
      toast.success(t('common.saved', 'Saqlandi'));
      setDialog(null);
    } catch (e) {
      err(e);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const { level, item } = toDelete;
      if (level === 'country') {
        await geoApi.deleteCountry(item.id);
        loadCountries();
        if (selectedCountry === item.id) {
          setSelectedCountry(null);
          setSelectedRegion(null);
          setRegions([]);
          setDistricts([]);
        }
      } else if (level === 'region') {
        await geoApi.deleteRegion(item.id);
        if (selectedCountry) loadRegions(selectedCountry);
        if (selectedRegion === item.id) {
          setSelectedRegion(null);
          setDistricts([]);
        }
      } else {
        await geoApi.deleteDistrict(item.id);
        if (selectedRegion) loadDistricts(selectedRegion);
      }
      toast.success(t('common.deleted', 'O\'chirildi'));
      setToDelete(null);
    } catch (e) {
      err(e);
    } finally {
      setDeleting(false);
    }
  };

  const dialogTitle = () => {
    if (!dialog) return '';
    const labels: Record<Level, string> = {
      country: t('geo.country', 'Davlat'),
      region: t('geo.region', 'Viloyat'),
      district: t('geo.district', 'Tuman'),
    };
    return dialog.item
      ? `${labels[dialog.level]} — ${t('common.edit', 'Tahrirlash')}`
      : `${labels[dialog.level]} — ${t('common.add', 'Qo\'shish')}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('geo.title', 'Manzillar')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('geo.subtitle', 'Davlat, viloyat va tumanlar ierarxiyasini boshqaring')}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GeoColumn
          title={t('geo.countries', 'Davlatlar')}
          items={countries.map(localized)}
          loading={loadingCountries}
          selectedId={selectedCountry}
          onSelect={selectCountry}
          onAdd={() => openAdd('country')}
          onEdit={(item) => openEdit('country', item)}
          onDelete={(item) => setToDelete({ level: 'country', item })}
          addLabel={t('geo.selectCountryHint', 'Viloyatlarni ko\'rish uchun davlatni tanlang')}
          emptyLabel={t('geo.noCountries', 'Davlatlar yo\'q')}
          selectable
        />
        <GeoColumn
          title={t('geo.regions', 'Viloyatlar')}
          items={regions.map(localized)}
          loading={loadingRegions}
          selectedId={selectedRegion}
          onSelect={selectRegion}
          onAdd={() => openAdd('region')}
          onEdit={(item) => openEdit('region', item)}
          onDelete={(item) => setToDelete({ level: 'region', item })}
          addLabel={t('geo.selectRegionHint', 'Tumanlarni ko\'rish uchun viloyatni tanlang')}
          emptyLabel={t('geo.noRegions', 'Viloyatlar yo\'q')}
          selectable
          disabled={!selectedCountry}
          disabledLabel={t('geo.pickCountryFirst', 'Avval davlatni tanlang')}
        />
        <GeoColumn
          title={t('geo.districts', 'Tumanlar')}
          items={districts.map(localized)}
          loading={loadingDistricts}
          selectedId={null}
          onAdd={() => openAdd('district')}
          onEdit={(item) => openEdit('district', item)}
          onDelete={(item) => setToDelete({ level: 'district', item })}
          addLabel={t('geo.districtsHint', 'Tumanlar ro\'yxati')}
          emptyLabel={t('geo.noDistricts', 'Tumanlar yo\'q')}
          selectable={false}
          disabled={!selectedRegion}
          disabledLabel={t('geo.pickRegionFirst', 'Avval viloyatni tanlang')}
        />
      </div>

      <Dialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>{dialogTitle()}</DialogTitle>
            <DialogDescription>{t('geo.formSubtitle', 'Nomni 4 tilda kiriting')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>{t('geo.nameUz', "Nomi (O'zbekcha)")} *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-primary"
                  onClick={autoTranslate}
                  disabled={!form.name.trim()}
                  title={t('geo.autoTranslateHint', "O'zbekcha nomdan boshqa tillarni avtomatik to'ldirish")}
                >
                  <Languages className="mr-1 h-3.5 w-3.5" />
                  {t('geo.autoTranslate', 'Tarjima qilish')}
                </Button>
              </div>
              <Input
                value={form.name}
                onChange={(e) => onNameChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('geo.nameCyrl', 'Nomi (Кирилл)')}</Label>
              <Input
                value={form.name_uz_cyrl}
                onChange={(e) => { setForm((p) => ({ ...p, name_uz_cyrl: e.target.value })); setTouched((p) => ({ ...p, cyrl: true })); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('geo.nameRu', 'Nomi (Русский)')}</Label>
              <Input
                value={form.name_ru}
                onChange={(e) => { setForm((p) => ({ ...p, name_ru: e.target.value })); setTouched((p) => ({ ...p, ru: true })); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t('geo.nameEn', 'Nomi (English)')}</Label>
              <Input
                value={form.name_en}
                onChange={(e) => { setForm((p) => ({ ...p, name_en: e.target.value })); setTouched((p) => ({ ...p, en: true })); }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)} disabled={saving}>
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
        title={t('geo.deleteTitle', 'O\'chirish')}
        description={t('geo.deleteConfirm', `"${toDelete?.item.name ?? ''}" o'chirilsinmi? Bog'langan ma'lumotlar bo'lsa o'chirilmaydi.`)}
        confirmText={t('common.delete', 'O\'chirish')}
        cancelText={t('common.cancel', 'Bekor qilish')}
      />
    </div>
  );
}
