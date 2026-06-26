import { useLanding } from '../useLanding'
import { CONTAINER, BADGE, CARD, H_TITLE, H_SUB } from '../styles'

export function HowItWorks() {
  const { t } = useLanding()
  return (
    <section className="bg-slate-50 py-20 dark:bg-slate-900/40">
      <div className={CONTAINER}>
        <div className="mx-auto max-w-2xl text-center">
          <span className={BADGE}>{t.how.badge}</span>
          <h2 className={`mt-4 ${H_TITLE}`}>{t.how.title}</h2>
          <p className={`mt-3 ${H_SUB}`}>{t.how.subtitle}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {t.how.steps.map((s, i) => (
            <div key={s.title} className={`relative ${CARD} p-7`}>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">{i + 1}</div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{s.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{s.desc}</p>
              {i < t.how.steps.length - 1 && (
                <div className="absolute right-5 top-9 hidden text-slate-300 dark:text-slate-600 md:block">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
