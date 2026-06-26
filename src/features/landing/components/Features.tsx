import { useLanding } from '../useLanding'
import { Icon } from './Icon'
import { CONTAINER, BADGE, CARD, H_TITLE, H_SUB } from '../styles'

export function Features({ limit, withHeader = true }: { limit?: number; withHeader?: boolean }) {
  const { t } = useLanding()
  const items = limit ? t.features.items.slice(0, limit) : t.features.items
  return (
    <section className="py-20">
      <div className={CONTAINER}>
        {withHeader && (
          <div className="mx-auto max-w-2xl text-center">
            <span className={BADGE}>{t.features.badge}</span>
            <h2 className={`mt-4 ${H_TITLE}`}>{t.features.title}</h2>
            <p className={`mt-3 ${H_SUB}`}>{t.features.subtitle}</p>
          </div>
        )}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((f) => (
            <div key={f.title} className={`group ${CARD} p-6 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5 dark:hover:border-indigo-500/40`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/10 dark:text-indigo-300 dark:group-hover:bg-indigo-600 dark:group-hover:text-white">
                <Icon name={f.icon} className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
