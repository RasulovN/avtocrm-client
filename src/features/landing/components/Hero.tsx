import { Link } from 'react-router-dom'
import { useLanding } from '../useLanding'
import { Icon } from './Icon'
import { registerPath } from '../api'
import { BTN_PRIMARY, BTN_GHOST, BADGE, CONTAINER } from '../styles'

export function Hero() {
  const { t, rawLang } = useLanding()
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-100 via-indigo-50 to-transparent opacity-70 blur-3xl dark:from-indigo-500/20 dark:via-indigo-500/5 dark:opacity-100" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-200/40 to-transparent blur-3xl dark:from-indigo-500/10" />
      </div>

      <div className={`${CONTAINER} grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24`}>
        <div className="lp-fade-up">
          <span className={BADGE}><Icon name="spark" className="h-3.5 w-3.5" /> {t.hero.badge}</span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            {t.hero.title1}{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">{t.hero.title2}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">{t.hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={registerPath({ trial: true })} className={BTN_PRIMARY}>
              {t.hero.ctaTrial} <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <Link to={`/${rawLang}/pricing`} className={BTN_GHOST}>{t.hero.ctaPricing}</Link>
          </div>
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Icon name="check" className="h-4 w-4 text-emerald-500" /> {t.hero.note}
          </p>
        </div>

        <div className="lp-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="relative mx-auto max-w-md">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-indigo-200/50 to-transparent blur-2xl dark:from-indigo-500/20" />
            <div className="lp-float rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-indigo-900/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40">
              <div className="flex items-center gap-1.5 pb-3">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['box', 'cart', 'chart'].map((ic, i) => (
                  <div key={ic} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                      <Icon name={ic} className="h-4 w-4" />
                    </div>
                    <div className="mt-3 h-2 w-12 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="mt-1.5 h-4 w-16 rounded bg-slate-300 dark:bg-slate-600" />
                    <div className="mt-2 h-1.5 rounded bg-indigo-200 dark:bg-indigo-500/40" style={{ width: i === 1 ? 40 : 32 }} />
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <div className="flex items-end gap-1.5">
                  {[40, 65, 50, 80, 60, 95, 72].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-indigo-600 to-indigo-400" style={{ height: h }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
