import { CONTAINER, BADGE, H_SUB } from '../styles'

export function PageHero({ badge, title, subtitle }: { badge: string; title: string; subtitle: string }) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 left-1/2 h-72 w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-100 to-transparent opacity-70 blur-3xl dark:from-indigo-500/15 dark:opacity-100" />
      </div>
      <div className={`${CONTAINER} lp-fade-up py-16 text-center`}>
        <span className={BADGE}>{badge}</span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">{title}</h1>
        <p className={`mx-auto mt-3 max-w-2xl text-lg ${H_SUB}`}>{subtitle}</p>
      </div>
    </section>
  )
}
