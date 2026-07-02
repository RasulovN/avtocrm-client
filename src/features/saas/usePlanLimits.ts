import { useCallback, useEffect, useState } from 'react';
import { subscriptionsApi, type PlanLimitUsage } from './services';

// Joriy tarif limiti + foydalanishni yuklaydigan hook.
// `storeFull` / `userFull` — mos limit to'lgan bo'lsa true (max=null => cheksiz, hech qachon to'lmaydi).
export function usePlanLimits() {
  const [limits, setLimits] = useState<PlanLimitUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setLimits(await subscriptionsApi.limits());
    } catch {
      // Limitlarni olib bo'lmasa — bloklamaymiz (backend baribir majburiy tekshiradi).
      setLimits(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const atMax = (u: { used: number; max: number | null } | undefined) =>
    !!u && u.max !== null && u.used >= u.max;

  return {
    limits,
    loading,
    reload,
    storeFull: atMax(limits?.stores),
    userFull: atMax(limits?.users),
  };
}
