import { useLanding } from '../useLanding'
import { CONTAINER } from '../styles'

export function Stats() {
  const { t } = useLanding()
  return (
    <section className="border-y border-slate-100 bg-slate-50/60 dark:border-slate-800/60 dark:bg-slate-900/30">
      <div className={`${CONTAINER} grid grid-cols-2 gap-6 py-8 sm:grid-cols-4`}>
        {t.stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300 sm:text-3xl">{s.value}</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
