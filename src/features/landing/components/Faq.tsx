import { useState } from 'react'
import { useLanding } from '../useLanding'
import { CONTAINER, BADGE, H_TITLE } from '../styles'

export function Faq() {
  const { t } = useLanding()
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="py-20">
      <div className={`${CONTAINER} max-w-3xl`}>
        <div className="text-center">
          <span className={BADGE}>{t.faq.badge}</span>
          <h2 className={`mt-4 ${H_TITLE}`}>{t.faq.title}</h2>
        </div>
        <div className="mt-10 space-y-3">
          {t.faq.items.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="font-semibold text-slate-900 dark:text-white">{item.q}</span>
                  <span className={`shrink-0 text-xl text-indigo-600 transition-transform dark:text-indigo-400 ${isOpen ? 'rotate-45' : ''}`}>+</span>
                </button>
                {isOpen && <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.a}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
