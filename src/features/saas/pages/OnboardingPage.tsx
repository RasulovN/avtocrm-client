import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Building2, Loader2, MapPin } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Logo } from '../../../components/shared/Logo';
import { companiesApi, companyCategoriesApi, geoApi } from '../services';
import type { CompanyCategory, Country, Region, District } from '../types';
import { YandexMapPicker } from '../components/YandexMapPicker';
import { useAuthStore } from '../../../app/store';

export function OnboardingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { checkAuth, logout, isPlatform, company } = useAuthStore();
  const lang = i18n.language || 'uz';

  const [categories, setCategories] = useState<CompanyCategory[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', category_id: '', country_id: '', region_id: '', district_id: '',
    street: '', phone_number: '+998', email: '', latitude: '', longitude: '',
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    companyCategoriesApi.list().then(setCategories).catch(() => {});
    geoApi.countries().then(setCountries).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.country_id) geoApi.regions(Number(form.country_id)).then(setRegions).catch(() => setRegions([]));
    else setRegions([]);
    set('region_id', ''); set('district_id', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.country_id]);

  useEffect(() => {
    if (form.region_id) geoApi.districts(Number(form.region_id)).then(setDistricts).catch(() => setDistricts([]));
    else setDistricts([]);
    set('district_id', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.region_id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error(t('onboarding.nameRequired', 'Kompaniya nomi kerak')); return; }
    setLoading(true);
    try {
      await companiesApi.onboarding({
        name: form.name,
        category_id: form.category_id ? Number(form.category_id) : undefined,
        country_id: form.country_id ? Number(form.country_id) : undefined,
        region_id: form.region_id ? Number(form.region_id) : undefined,
        district_id: form.district_id ? Number(form.district_id) : undefined,
        street: form.street || undefined,
        phone_number: form.phone_number || undefined,
        email: form.email || undefined,
        latitude: form.latitude || undefined,
        longitude: form.longitude || undefined,
      });
      await checkAuth();
      toast.success(t('onboarding.created', 'Kompaniya yaratildi!'));
      navigate(`/${lang}/subscription`, { replace: true });
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: Record<string, unknown> } };
      const data = e2.response?.data;
      toast.error(data ? Object.values(data).flat().join(' ') : t('common.error', 'Xatolik'));
    } finally {
      setLoading(false);
    }
  };

  const selectCls = 'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

  // Platform (super admin panel) foydalanuvchisi onboarding qilmaydi — super admin paneliga.
  // Allaqachon kompaniyasi bor foydalanuvchi ham qayta onboarding qilmaydi — dashboard'ga.
  if (isPlatform) return <Navigate to={`/${lang}/admin`} replace />;
  if (company) return <Navigate to={`/${lang}/dashboard`} replace />;

  return (
    <main className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <Logo mark className="h-11 w-11" />
          <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/login'); }}>{t('auth.logout', 'Chiqish')}</Button>
        </div>
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 bg-primary rounded-2xl flex items-center justify-center"><Building2 className="w-7 h-7 text-primary-foreground" /></div>
            <CardTitle className="text-2xl">{t('onboarding.title', 'Biznesingizni qo\'shing')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('onboarding.subtitle', "Kompaniya ma'lumotlarini to'ldiring")}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold">{t('onboarding.companyName', 'Kompaniya nomi')} *</Label>
                <Input value={form.name} onChange={(e) => set('name', e.target.value)} required className="h-11" placeholder="Masalan: Avto Zapchast Servis" />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">{t('onboarding.category', 'Soha / kategoriya')}</Label>
                <select className={selectCls} value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
                  <option value="">{t('common.select', 'Tanlang')}</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">{t('onboarding.country', 'Davlat')}</Label>
                  <select className={selectCls} value={form.country_id} onChange={(e) => set('country_id', e.target.value)}>
                    <option value="">{t('common.select', 'Tanlang')}</option>
                    {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">{t('onboarding.region', 'Viloyat')}</Label>
                  <select className={selectCls} value={form.region_id} onChange={(e) => set('region_id', e.target.value)} disabled={!form.country_id}>
                    <option value="">{t('common.select', 'Tanlang')}</option>
                    {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">{t('onboarding.district', 'Tuman')}</Label>
                  <select className={selectCls} value={form.district_id} onChange={(e) => set('district_id', e.target.value)} disabled={!form.region_id}>
                    <option value="">{t('common.select', 'Tanlang')}</option>
                    {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">{t('onboarding.street', "Ko'cha / manzil")}</Label>
                <Input value={form.street} onChange={(e) => set('street', e.target.value)} className="h-11" placeholder="Ko'cha, uy" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="font-semibold">{t('stores.phone', 'Telefon')}</Label>
                  <Input value={form.phone_number} onChange={(e) => set('phone_number', e.target.value)} className="h-11" placeholder="+998901234567" />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="h-11" placeholder="email@misol.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold flex items-center gap-1"><MapPin className="w-4 h-4" /> {t('onboarding.location', 'Joylashuv (xaritadan tanlang)')}</Label>
                <YandexMapPicker latitude={form.latitude} longitude={form.longitude} onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))} />
                <div className="grid grid-cols-2 gap-3">
                  <Input value={form.latitude} onChange={(e) => set('latitude', e.target.value)} className="h-10" placeholder="Latitude" />
                  <Input value={form.longitude} onChange={(e) => set('longitude', e.target.value)} className="h-10" placeholder="Longitude" />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('onboarding.submit', "Kompaniyani yaratish")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
