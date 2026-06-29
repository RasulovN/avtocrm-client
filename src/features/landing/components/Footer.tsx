import { Link } from 'react-router-dom'
import { useLanding } from '../useLanding'
import { Logo } from '../../../components/shared/Logo'
import { getLegal } from '../asp/aspLegal'
import { CONTAINER } from '../styles'

export function Footer() {
  const { t, rawLang, lang } = useLanding()
  const year = new Date().getFullYear()
  const to = [`/${rawLang}/features`, `/${rawLang}/pricing`, `/${rawLang}/features`, `/${rawLang}/pricing`]
  const legal = getLegal(lang)
  const legalLinks = [
    { to: '/privacy', label: legal.privacy.title },
    { to: '/terms', label: legal.terms.title },
    { to: '/refunds', label: legal.refund.title },
  ]
  return (
    <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-950">
      <div className={`${CONTAINER} grid gap-8 sm:grid-cols-2 lg:grid-cols-4`}>
        <div className="lg:col-span-2">
          <div className="flex items-center">
            <Logo className="h-12 w-auto" />
          </div>
          <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-slate-400">{t.footer.tagline}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t.footer.product}</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            {t.footer.links.map((l, i) => (
              <li key={l}><Link to={to[i]} className="hover:text-indigo-700 dark:hover:text-indigo-300">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t.footer.contact}</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="mailto:info@zumex.uz" className="hover:text-indigo-700 dark:hover:text-indigo-300">info@zumex.uz</a></li>
            <li><a href="tel:+998000000000" className="hover:text-indigo-700 dark:hover:text-indigo-300">+998 00 000 00 00</a></li>
          </ul>
        </div>
      </div>
      <div className={`${CONTAINER} mt-10 flex flex-col items-center gap-4 border-t border-slate-100 pt-6 text-sm text-slate-400 dark:border-slate-800/60 dark:text-slate-500 sm:flex-row sm:justify-between`}>
        <span>© {year} Zumex. {t.footer.rights}</span>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {legalLinks.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-indigo-700 dark:hover:text-indigo-300">{l.label}</Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
