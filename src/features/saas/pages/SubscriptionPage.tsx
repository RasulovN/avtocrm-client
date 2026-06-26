import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import toast from 'react-hot-toast';
import { Check, Crown, Loader2, CreditCard, Receipt } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { plansApi, subscriptionsApi } from '../services';
import type { Plan, Subscription } from '../types';
import { useAuthStore } from '../../../app/store';
import { formatDate } from '../../../utils/index';

function formatPrice(p: string, t: TFunction): string {
  const n = Number(p);
  if (n === 0) return t('subscription.free', 'Bepul');
  return new Intl.NumberFormat('uz-UZ').format(n) + ' ' + t('subscription.currency', "so'm");
}

// Backend serializeSubscription tekis maydonlar qaytaradi (plan_name, ...)
interface PaymentRow {
  id: number;
  plan_name: string | null;
  plan_duration_days: number | null;
  amount: string;
  status: string;
  start_at: string | null;
  end_at: string | null;
  created_at?: string;
}

function statusBadge(status: string): { cls: string; key: string; fb: string } {
  switch (status) {
    case 'active':
      return { cls: 'bg-green-600', key: 'subscription.statusActive', fb: 'Faol' };
    case 'pending':
      return { cls: 'bg-amber-500', key: 'subscription.statusPending', fb: 'Kutilmoqda' };
    case 'expired':
      return { cls: 'bg-gray-500', key: 'subscription.statusExpired', fb: 'Muddati tugagan' };
    case 'cancelled':
      return { cls: 'bg-red-600', key: 'subscription.statusCancelled', fb: 'Bekor qilingan' };
    default:
      return { cls: 'bg-gray-500', key: '', fb: status };
  }
}

export function SubscriptionPage() {
  const { t } = useTranslation();
  const { subscriptionActive, checkAuth } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [active, setActive] = useState<Subscription | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [history, setHistory] = useState<PaymentRow[]>([]);

  useEffect(() => {
    Promise.all([plansApi.list(), subscriptionsApi.active(), subscriptionsApi.me()])
      .then(([pl, act, mine]) => {
        setPlans(pl);
        setActive(act.active);
        setDaysLeft(act.days_left);
        setHistory((mine.history ?? []) as unknown as PaymentRow[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const subscribe = async (planId: number) => {
    setSubscribing(planId);
    try {
      const res = await subscriptionsApi.subscribe(planId);
      if (res.checkout_url) {
        // PULLIK tarif → Payme checkout sahifasiga yo'naltirish
        window.location.href = res.checkout_url;
      } else {
        // BEPUL tarif → so'rov adminga yuborildi, tasdiqlanishini kutadi
        void checkAuth();
        toast.success(
          (res as { message?: string }).message ||
          t('subscription.freeRequested', "Bepul tarif so'rovi yuborildi. Administrator tasdiqlashini kuting."),
          { duration: 5000 },
        );
        // Joriy obuna holatini yangilash
        subscriptionsApi.active().then((act) => { setActive(act.active); setDaysLeft(act.days_left); }).catch(() => {});
        setSubscribing(null);
      }
    } catch {
      toast.error(t('common.error', 'Xatolik yuz berdi'));
      setSubscribing(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">{t('subscription.title', 'Obuna tariflari')}</h1>
        <p className="text-muted-foreground">{t('subscription.subtitle', "Biznesingiz uchun mos tarifni tanlang")}</p>
      </div>

      {subscriptionActive && active ? (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="py-5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold">{t('subscription.activePlan', 'Faol tarif')}: {active.plan?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t('subscription.daysLeft', 'Qolgan kunlar')}: <span className="font-medium">{daysLeft ?? '-'}</span>
                </p>
              </div>
            </div>
            <Badge className="bg-green-600">{t('subscription.active', 'Faol')}</Badge>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4 text-center">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              {t('subscription.inactive', "Obunangiz faol emas. To'liq imkoniyatlar uchun tarifni faollashtiring.")}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = active?.plan?.id === plan.id && subscriptionActive;
          const features = Array.isArray(plan.features) ? (plan.features as string[]) : [];
          return (
            <Card key={plan.id} className="relative flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                {plan.description && <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>}
                <div className="mt-4 mb-4">
                  <span className="text-3xl font-extrabold">{formatPrice(plan.price, t)}</span>
                  <span className="text-sm text-muted-foreground"> / {t('subscription.durationDays', '{{count}} kun', { count: plan.duration_days })}</span>
                </div>
                <ul className="space-y-2 text-sm flex-1">
                  {plan.max_stores != null && (
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> {t('subscription.storesCount', "{{count}} ta do'kon", { count: plan.max_stores })}</li>
                  )}
                  {plan.max_users != null && (
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> {t('subscription.usersCount', '{{count}} ta foydalanuvchi', { count: plan.max_users })}</li>
                  )}
                  {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> {f}</li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-5 h-11"
                  disabled={isCurrent || subscribing === plan.id}
                  variant={isCurrent ? 'outline' : 'default'}
                  onClick={() => subscribe(plan.id)}
                >
                  {subscribing === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    t('subscription.current', 'Joriy tarif')
                  ) : (
                    <><CreditCard className="w-4 h-4 mr-2" />{t('subscription.choose', 'Tanlash va to\'lash')}</>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* To'lovlar / obuna tarixi */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold">{t('subscription.paymentHistory', "To'lovlar tarixi")}</h2>
          </div>

          {history.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t('subscription.noPayments', "Hozircha to'lovlar yo'q")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border/60">
                    <th className="py-2 pr-4 font-medium">{t('subscription.plan', 'Tarif')}</th>
                    <th className="py-2 pr-4 font-medium">{t('subscription.amount', 'Summa')}</th>
                    <th className="py-2 pr-4 font-medium">{t('subscription.period', 'Muddat')}</th>
                    <th className="py-2 pr-4 font-medium">{t('subscription.status', 'Holat')}</th>
                    <th className="py-2 pr-4 font-medium">{t('subscription.date', 'Sana')}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => {
                    const sb = statusBadge(row.status);
                    return (
                      <tr key={row.id} className="border-b border-border/40 last:border-0">
                        <td className="py-2.5 pr-4 font-medium">{row.plan_name ?? '-'}</td>
                        <td className="py-2.5 pr-4">{formatPrice(row.amount, t)}</td>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          {row.start_at && row.end_at
                            ? `${formatDate(row.start_at)} — ${formatDate(row.end_at)}`
                            : row.plan_duration_days
                              ? `${row.plan_duration_days} ${t('subscription.days', 'kun')}`
                              : '-'}
                        </td>
                        <td className="py-2.5 pr-4">
                          <Badge className={sb.cls}>{sb.key ? t(sb.key, sb.fb) : sb.fb}</Badge>
                        </td>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          {row.created_at ? formatDate(row.created_at) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
