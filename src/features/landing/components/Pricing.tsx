import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanding } from '../useLanding'
import { fetchLandingPlans, registerPath, planName, planDesc } from '../api'
import { Icon } from './Icon'
import { CONTAINER, BADGE, BTN_PRIMARY, BTN_GHOST, CARD, H_TITLE, H_SUB } from '../styles'
import type { LandingPlan } from '../types'

function formatPrice(price: string, lang: string): { value: string; free: boolean } {
  const n = Number(price)
  if (!n || n <= 0) return { value: '', free: true }
  const locale = lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ'
  return { value: new Intl.NumberFormat(locale).format(n), free: false }
}
function planFeatures(features: unknown): string[] {
  return Array.isArray(features) ? (features.filter((x) => typeof x === 'string') as string[]) : []
}

export function Pricing({ withHeader = true }: { withHeader?: boolean }) {
  const { t, lang } = useLanding()
  const [plans, setPlans] = useState<LandingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError(false)
    fetchLandingPlans()
      .then((p) => !cancelled && setPlans(p))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  const popularIdx = plans.length >= 3 ? 1 : -1

  return (
    <section className="py-20">
      <div className={CONTAINER}>
        {withHeader && (
          <div className="mx-auto max-w-2xl text-center">
            <span className={BADGE}>{t.pricing.badge}</span>
            <h2 className={`mt-4 ${H_TITLE}`}>{t.pricing.title}</h2>
            <p className={`mt-3 ${H_SUB}`}>{t.pricing.subtitle}</p>
          </div>
        )}

        {loading ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`${CARD} h-80 animate-pulse p-7`}>
                <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-4 h-8 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-6 space-y-3">
                  <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 w-5/6 rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : error || plans.length === 0 ? (
          <p className="mt-16 text-center text-slate-500 dark:text-slate-400">{t.pricing.empty}</p>
        ) : (
          <div className="mt-12 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((p, i) => {
              const price = formatPrice(p.price, lang)
              const popular = i === popularIdx
              const feats = planFeatures(p.features)
              return (
                <div
                  key={p.id}
                  className={`relative flex flex-col rounded-2xl border bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 ${
                    popular ? 'border-indigo-500 shadow-xl shadow-indigo-900/10 ring-1 ring-indigo-500 lg:-mt-2 lg:mb-2' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                      {t.pricing.popular}
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{planName(p, lang)}</h3>
                  {planDesc(p, lang) && <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{planDesc(p, lang)}</p>}
                  <div className="mt-5">
                    {price.free ? (
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{t.pricing.free}</span>
                    ) : (
                      <>
                        <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{price.value}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400"> {lang === 'en' ? 'UZS' : "so'm"}</span>
                        <span className="text-sm text-slate-400 dark:text-slate-500"> / {p.duration_days} {t.pricing.durationDays}</span>
                      </>
                    )}
                  </div>
                  <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                    {p.max_stores != null && (
                      <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Icon name="check" className="h-4 w-4 shrink-0 text-emerald-500" /> {p.max_stores} {t.pricing.maxStores}
                      </li>
                    )}
                    {p.max_users != null && (
                      <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Icon name="check" className="h-4 w-4 shrink-0 text-emerald-500" /> {p.max_users} {t.pricing.maxUsers}
                      </li>
                    )}
                    {feats.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Icon name="check" className="h-4 w-4 shrink-0 text-emerald-500" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={registerPath({ planId: p.id })} className={`mt-7 w-full justify-center ${popular ? BTN_PRIMARY : BTN_GHOST}`}>
                    {t.pricing.choose}
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        <p className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Icon name="check" className="h-4 w-4 text-emerald-500" /> {t.pricing.guarantee}
        </p>
      </div>
    </section>
  )
}
