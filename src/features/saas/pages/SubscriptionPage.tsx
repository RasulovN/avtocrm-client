import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import toast from 'react-hot-toast';
import { Check, Crown, Loader2, CreditCard, Receipt, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { plansApi, subscriptionsApi } from '../services';
import { PaymeCardModal } from '../components/PaymeCardModal';
import type { Plan, Subscription } from '../types';
import { useAuthStore } from '../../../app/store';
import { formatDate } from '../../../utils/index';

// Oldindan to'lash mumkin bo'lgan oylar (1 oy asosiy + 3/6/12 oy oldindan).
const MONTH_OPTIONS = [1, 3, 6, 12] as const;
const HISTORY_PAGE_SIZE = 10;

function formatPrice(p: string | number, t: TFunction): string {
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
  period_months?: number;
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
  // Har bir tarif uchun tanlangan oylar soni (default 1).
  const [monthsByPlan, setMonthsByPlan] = useState<Record<number, number>>({});
  // To'lovlar tarixi (pagination bilan).
  const [history, setHistory] = useState<PaymentRow[]>([]);
  const [histPage, setHistPage] = useState(1);
  const [histTotalPages, setHistTotalPages] = useState(1);
  const [histCount, setHistCount] = useState(0);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [payModal, setPayModal] = useState<{ subscriptionId: number; planName: string; amountLabel: string } | null>(null);

  const getMonths = (planId: number) => monthsByPlan[planId] ?? 1;

  const loadHistory = useCallback((page: number) => {
    return subscriptionsApi
      .history({ page, limit: HISTORY_PAGE_SIZE })
      .then((res) => {
        setHistory(res.results as unknown as PaymentRow[]);
        setHistPage(res.current_page);
        setHistTotalPages(res.total_pages || 1);
        setHistCount(res.count);
      })
      .catch(() => {});
  }, []);

  const refreshActive = useCallback(() => {
    void checkAuth();
    return subscriptionsApi
      .active()
      .then((act) => {
        setActive(act.active);
        setDaysLeft(act.days_left);
      })
      .catch(() => {});
  }, [checkAuth]);

  const refreshAll = useCallback(() => {
    void refreshActive();
    void loadHistory(1);
  }, [refreshActive, loadHistory]);

  useEffect(() => {
    Promise.all([plansApi.list(), subscriptionsApi.active(), subscriptionsApi.history({ page: 1, limit: HISTORY_PAGE_SIZE })])
      .then(([pl, act, hist]) => {
        setPlans(pl);
        setActive(act.active);
        setDaysLeft(act.days_left);
        setHistory(hist.results as unknown as PaymentRow[]);
        setHistPage(hist.current_page);
        setHistTotalPages(hist.total_pages || 1);
        setHistCount(hist.count);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Tarifga obuna bo'lish yoki muddatni uzaytirish (oldindan to'lov).
  const subscribe = async (plan: Plan) => {
    const months = getMonths(plan.id);
    setSubscribing(plan.id);
    try {
      const res = await subscriptionsApi.subscribe(plan.id, months);
      if (res.free || !res.checkout_url) {
        // BEPUL tarif → so'rov adminga yuborildi, tasdiqlanishini kutadi
        void checkAuth();
        toast.success(
          (res as { message?: string }).message ||
            t('subscription.freeRequested', "Bepul tarif so'rovi yuborildi. Administrator tasdiqlashini kuting."),
          { duration: 5000 },
        );
        void refreshAll();
      } else {
        // PULLIK tarif → o'z saytimizdagi karta to'lov oynasi (Payme Subscribe API)
        setPayModal({
          subscriptionId: res.subscription.id,
          planName: plan.name + (months > 1 ? ` · ${months} ${t('subscription.months', 'oy')}` : ''),
          amountLabel: formatPrice(res.subscription.amount, t),
        });
      }
      setSubscribing(null);
    } catch {
      toast.error(t('common.error', 'Xatolik yuz berdi'));
      setSubscribing(null);
    }
  };

  // Kutilayotgan (pending) to'lovni bekor qilish.
  const cancelPending = async (id: number) => {
    if (!window.confirm(t('subscription.cancelConfirm', "Ushbu kutilayotgan to'lovni bekor qilmoqchimisiz?"))) return;
    setCancelling(id);
    try {
      await subscriptionsApi.cancelMine(id);
      toast.success(t('subscription.cancelled', "To'lov bekor qilindi"));
      await Promise.all([loadHistory(histPage), refreshActive()]);
    } catch (e) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail ?? t('common.error', 'Xatolik yuz berdi'));
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">{t('subscription.title', 'Obuna tariflari')}</h1>
        <p className="text-muted-foreground">{t('subscription.subtitle', 'Biznesingiz uchun mos tarifni tanlang')}</p>
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
          const isFree = Number(plan.price) === 0;
          const months = getMonths(plan.id);
          const total = Number(plan.price) * months;
          return (
            <Card key={plan.id} className="relative flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                {plan.description && <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>}
                <div className="mt-4 mb-4">
                  <span className="text-3xl font-extrabold">{formatPrice(plan.price, t)}</span>
                  <span className="text-sm text-muted-foreground"> / {t('subscription.durationDays', '{{count}} kun', { count: plan.duration_days })}</span>
                </div>

                {/* Oldindan to'lash: oylar soni (faqat pullik tariflarda) */}
                {!isFree && (
                  <div className="mb-4">
                    <label className="text-xs font-medium text-muted-foreground">
                      {t('subscription.payPeriod', "To'lov muddati")}
                    </label>
                    <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                      {MONTH_OPTIONS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMonthsByPlan((prev) => ({ ...prev, [plan.id]: m }))}
                          className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                            months === m
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background hover:border-primary/50'
                          }`}
                        >
                          {m} {t('subscription.monthShort', 'oy')}
                        </button>
                      ))}
                    </div>
                    {months > 1 && (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {t('subscription.totalForMonths', 'Jami')}: <span className="font-semibold text-foreground">{formatPrice(total, t)}</span>
                      </p>
                    )}
                  </div>
                )}

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
                  disabled={subscribing === plan.id || (isCurrent && isFree)}
                  variant={isCurrent ? 'outline' : 'default'}
                  onClick={() => subscribe(plan)}
                >
                  {subscribing === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    // Faol tarif: pullik bo'lsa muddatni uzaytirish mumkin
                    isFree ? t('subscription.current', 'Joriy tarif') : t('subscription.extend', 'Muddatni uzaytirish')
                  ) : (
                    <><CreditCard className="w-4 h-4 mr-2" />{isFree ? t('subscription.choose', "Tanlash") : t('subscription.choosePay', "Tanlash va to'lash")}</>
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
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold">{t('subscription.paymentHistory', "To'lovlar tarixi")}</h2>
            </div>
            {histCount > 0 && (
              <span className="text-xs text-muted-foreground">{t('subscription.totalCount', 'Jami')}: {histCount}</span>
            )}
          </div>

          {history.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t('subscription.noPayments', "Hozircha to'lovlar yo'q")}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b border-border/60">
                      <th className="py-2 pr-4 font-medium">{t('subscription.orderId', 'Order ID')}</th>
                      <th className="py-2 pr-4 font-medium">{t('subscription.plan', 'Tarif')}</th>
                      <th className="py-2 pr-4 font-medium">{t('subscription.amount', 'Summa')}</th>
                      <th className="py-2 pr-4 font-medium">{t('subscription.period', 'Muddat')}</th>
                      <th className="py-2 pr-4 font-medium">{t('subscription.status', 'Holat')}</th>
                      <th className="py-2 pr-4 font-medium">{t('subscription.date', 'Sana')}</th>
                      <th className="py-2 pr-2 font-medium text-right">{t('subscription.action', 'Amal')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row) => {
                      const sb = statusBadge(row.status);
                      return (
                        <tr key={row.id} className="border-b border-border/40 last:border-0">
                          <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">#{row.id}</td>
                          <td className="py-2.5 pr-4 font-medium">
                            {row.plan_name ?? '-'}
                            {row.period_months && row.period_months > 1 ? (
                              <span className="ml-1 text-xs text-muted-foreground">· {row.period_months} {t('subscription.monthShort', 'oy')}</span>
                            ) : null}
                          </td>
                          <td className="py-2.5 pr-4">{formatPrice(row.amount, t)}</td>
                          <td className="py-2.5 pr-4 text-muted-foreground">
                            {row.start_at && row.end_at
                              ? `${formatDate(row.start_at)} — ${formatDate(row.end_at)}`
                              : row.plan_duration_days
                                ? `${row.plan_duration_days * (row.period_months ?? 1)} ${t('subscription.days', 'kun')}`
                                : '-'}
                          </td>
                          <td className="py-2.5 pr-4">
                            <Badge className={sb.cls}>{sb.key ? t(sb.key, sb.fb) : sb.fb}</Badge>
                          </td>
                          <td className="py-2.5 pr-4 text-muted-foreground">
                            {row.created_at ? formatDate(row.created_at) : '-'}
                          </td>
                          <td className="py-2.5 pr-2 text-right">
                            {row.status === 'pending' ? (
                              <button
                                type="button"
                                onClick={() => cancelPending(row.id)}
                                disabled={cancelling === row.id}
                                className="inline-flex items-center gap-1 rounded-md border border-red-500/40 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-500/10 disabled:opacity-50"
                              >
                                {cancelling === row.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                {t('subscription.cancel', 'Bekor qilish')}
                              </button>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {histTotalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t('subscription.pageOf', '{{page}} / {{total}}', { page: histPage, total: histTotalPages })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      disabled={histPage <= 1}
                      onClick={() => loadHistory(histPage - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" /> {t('common.prev', 'Oldingi')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      disabled={histPage >= histTotalPages}
                      onClick={() => loadHistory(histPage + 1)}
                    >
                      {t('common.next', 'Keyingi')} <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {payModal && (
        <PaymeCardModal
          open
          subscriptionId={payModal.subscriptionId}
          planName={payModal.planName}
          amountLabel={payModal.amountLabel}
          onClose={() => setPayModal(null)}
          onSuccess={refreshAll}
        />
      )}
    </div>
  );
}
