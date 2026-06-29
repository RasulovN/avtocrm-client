import { LandingLayout } from './components/LandingLayout'
import { useLanding } from './useLanding'
import { useSeo } from './useSeo'
import { getLegal } from './asp/aspLegal'

type LegalWhich = 'privacy' | 'terms' | 'refund'

// Maxfiylik / Shartlar / Qaytarish siyosati uchun alohida, to'g'ridan-to'g'ri
// ochiladigan sahifa (Paddle va boshqa to'lov provayderlari talab qiladi).
export function LandingLegalPage({ which }: { which: LegalWhich }) {
  const { lang } = useLanding()
  const doc = getLegal(lang)[which]
  useSeo(`${doc.title} — Zumex`, doc.intro.slice(0, 155))

  return (
    <LandingLayout>
      <section className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {doc.title}
        </h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{doc.updated}</p>
        <p className="mt-6 text-base leading-relaxed text-slate-600 dark:text-slate-300">{doc.intro}</p>

        <div className="mt-10 space-y-8">
          {doc.sections.map((s, i) => (
            <div key={i}>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{s.h}</h2>
              <div className="mt-2 space-y-2">
                {s.p.map((para, j) => (
                  <p key={j} className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </LandingLayout>
  )
}
