import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Building2, Loader2, MapPin, Save } from 'lucide-react';
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui';
import { companiesApi, companyCategoriesApi, geoApi } from '../../services';
import type { CompanyCategory, Country, Region, District } from '../../types';
import { YandexMapPicker } from '../../components/YandexMapPicker';
import { useAuthStore } from '../../../../app/store';

const selectCls =
  'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50';

export function CompanyProfilePage() {
  const { t } = useTranslation();

  const [categories, setCategories] = useState<CompanyCategory[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    country_id: '',
    region_id: '',
    district_id: '',
    street: '',
    phone_number: '',
    email: '',
    latitude: '',
    longitude: '',
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Dastlabki yuklash: kompaniya profili + lug'atlar
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [me, cats, ctrs] = await Promise.all([
          companiesApi.me(),
          companyCategoriesApi.list().catch(() => [] as CompanyCategory[]),
          geoApi.countries().catch(() => [] as Country[]),
        ]);
        if (cancelled) return;
        setCategories(cats);
        setCountries(ctrs);

        // bog'liq ro'yxatlarni oldindan yuklash
        if (me.country?.id) {
          await geoApi.regions(me.country.id).then((r) => !cancelled && setRegions(r)).catch(() => {});
        }
        if (me.region?.id) {
          await geoApi.districts(me.region.id).then((d) => !cancelled && setDistricts(d)).catch(() => {});
        }
        if (cancelled) return;

        setForm({
          name: me.name ?? '',
          category_id: me.category?.id ? String(me.category.id) : '',
          country_id: me.country?.id ? String(me.country.id) : '',
          region_id: me.region?.id ? String(me.region.id) : '',
          district_id: me.district?.id ? String(me.district.id) : '',
          street: me.street ?? '',
          phone_number: me.phone_number ?? '',
          email: me.email ?? '',
          latitude: me.latitude ?? '',
          longitude: me.longitude ?? '',
        });
      } catch {
        if (!cancelled) toast.error(t('common.loadError', "Ma'lumotlarni yuklab bo'lmadi"));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cascading reset'lar foydalanuvchi tanlovida bajariladi (effect emas) —
  // shunda dastlabki yuklashda saqlangan viloyat/tuman TOZALANMAYDI.
  const onCountryChange = (value: string) => {
    setForm((f) => ({ ...f, country_id: value, region_id: '', district_id: '' }));
    setDistricts([]);
    if (value) geoApi.regions(Number(value)).then(setRegions).catch(() => setRegions([]));
    else setRegions([]);
  };

  const onRegionChange = (value: string) => {
    setForm((f) => ({ ...f, region_id: value, district_id: '' }));
    if (value) geoApi.districts(Number(value)).then(setDistricts).catch(() => setDistricts([]));
    else setDistricts([]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error(t('company.profile.nameRequired', 'Kompaniya nomi kerak'));
      return;
    }
    setSaving(true);
    try {
      await companiesApi.updateMe({
        name: form.name,
        category_id: form.category_id ? Number(form.category_id) : null,
        country_id: form.country_id ? Number(form.country_id) : null,
        region_id: form.region_id ? Number(form.region_id) : null,
        district_id: form.district_id ? Number(form.district_id) : null,
        street: form.street || null,
        phone_number: form.phone_number || null,
        email: form.email || null,
        latitude: form.latitude || null,
        longitude: form.longitude || null,
      });
      // header/kontekst yangilanishi uchun
      await useAuthStore.getState().checkAuth();
      toast.success(t('company.profile.saved', 'Profil saqlandi'));
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: Record<string, unknown> } };
      const data = e2.response?.data;
      toast.error(data ? Object.values(data).flat().join(' ') : t('common.error', 'Xatolik'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          {t('company.profile.title', 'Kompaniya profili')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t('company.profile.subtitle', "Kompaniya ma'lumotlari va manzilini boshqaring")}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('company.profile.general', "Umumiy ma'lumot")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-semibold">{t('company.profile.name', 'Kompaniya nomi')} *</Label>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} required className="h-11" />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">{t('company.profile.category', 'Soha / kategoriya')}</Label>
              <select className={selectCls} value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
                <option value="">{t('common.select', 'Tanlang')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="font-semibold">{t('company.profile.phone', 'Telefon')}</Label>
                <Input
                  value={form.phone_number}
                  onChange={(e) => set('phone_number', e.target.value)}
                  className="h-11"
                  placeholder="+998901234567"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  className="h-11"
                  placeholder="email@misol.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {t('company.profile.address', 'Manzil')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="font-semibold text-sm">{t('company.profile.country', 'Davlat')}</Label>
                <select className={selectCls} value={form.country_id} onChange={(e) => onCountryChange(e.target.value)}>
                  <option value="">{t('common.select', 'Tanlang')}</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-sm">{t('company.profile.region', 'Viloyat')}</Label>
                <select
                  className={selectCls}
                  value={form.region_id}
                  onChange={(e) => onRegionChange(e.target.value)}
                  disabled={!form.country_id}
                >
                  <option value="">{t('common.select', 'Tanlang')}</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-sm">{t('company.profile.district', 'Tuman')}</Label>
                <select
                  className={selectCls}
                  value={form.district_id}
                  onChange={(e) => set('district_id', e.target.value)}
                  disabled={!form.region_id}
                >
                  <option value="">{t('common.select', 'Tanlang')}</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">{t('company.profile.street', "Ko'cha / manzil")}</Label>
              <Input
                value={form.street}
                onChange={(e) => set('street', e.target.value)}
                className="h-11"
                placeholder="Ko'cha, uy"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {t('company.profile.location', 'Joylashuv (xaritadan tanlang)')}
              </Label>
              <YandexMapPicker
                latitude={form.latitude}
                longitude={form.longitude}
                onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={form.latitude}
                  onChange={(e) => set('latitude', e.target.value)}
                  className="h-10"
                  placeholder="Latitude"
                />
                <Input
                  value={form.longitude}
                  onChange={(e) => set('longitude', e.target.value)}
                  className="h-10"
                  placeholder="Longitude"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="h-11 px-6" disabled={saving}>
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('common.save', 'Saqlash')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
