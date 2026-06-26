import { Link } from 'react-router-dom'
import { useLanding } from '../useLanding'
import { Icon } from './Icon'
import { registerPath, LOGIN_PATH } from '../api'
import { CONTAINER } from '../styles'

export function CTA() {
  const { t } = useLanding()
  return (
    <section className="py-20">
      <div className={CONTAINER}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 to-indigo-500 px-8 py-14 text-center shadow-2xl shadow-indigo-900/20">
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white blur-2xl" />
          </div>
          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">{t.cta.title}</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-indigo-50">{t.cta.subtitle}</p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to={registerPath({ trial: true })} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50 active:scale-[0.98]">
              {t.cta.trial} <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <Link to={LOGIN_PATH} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              {t.cta.login}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
