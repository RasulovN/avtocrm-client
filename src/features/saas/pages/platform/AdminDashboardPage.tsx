import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, CreditCard, Layers, Loader2, Users } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui';
import { companiesApi, plansApi, subscriptionsApi } from '../../services';

interface Kpi {
  companies: number;
  activeSubscriptions: number;
  plans: number;
}

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const [kpi, setKpi] = useState<Kpi>({ companies: 0, activeSubscriptions: 0, plans: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      companiesApi.list({ page_size: 1 }),
      subscriptionsApi.list({ status: 'active', page_size: 1 }),
      plansApi.adminList(),
    ])
      .then(([companies, subs, plans]) => {
        setKpi({
          companies: companies.count,
          activeSubscriptions: subs.count,
          plans: plans.length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: t('admin.kpi.companies', 'Kompaniyalar'),
      value: kpi.companies,
      icon: Building2,
      color: 'text-blue-600 bg-blue-500/10',
    },
    {
      label: t('admin.kpi.activeSubscriptions', 'Faol obunalar'),
      value: kpi.activeSubscriptions,
      icon: CreditCard,
      color: 'text-green-600 bg-green-500/10',
    },
    {
      label: t('admin.kpi.plans', 'Tariflar'),
      value: kpi.plans,
      icon: Layers,
      color: 'text-purple-600 bg-purple-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('admin.dashboard.title', 'Boshqaruv paneli')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('admin.dashboard.subtitle', 'Platforma umumiy ko\'rsatkichlari')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center gap-4 py-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.color}`}>
                <c.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold">{c.value.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex items-center gap-3 py-5 text-sm text-muted-foreground">
          <Users className="h-5 w-5 text-primary" />
          {t('admin.dashboard.hint', 'Batafsil boshqaruv uchun chap menyudagi bo\'limlardan foydalaning.')}
        </CardContent>
      </Card>
    </div>
  );
}
