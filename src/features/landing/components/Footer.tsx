import { Link } from 'react-router-dom'
import { useLanding } from '../useLanding'
import { CONTAINER } from '../styles'

export function Footer() {
  const { t, rawLang } = useLanding()
  const year = new Date().getFullYear()
  const to = [`/${rawLang}/features`, `/${rawLang}/pricing`, `/${rawLang}/features`, `/${rawLang}/pricing`]
  return (
    <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-950">
      <div className={`${CONTAINER} grid gap-8 sm:grid-cols-2 lg:grid-cols-4`}>
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 font-bold text-white">A</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">Zumex</span>
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
      <div className={`${CONTAINER} mt-10 border-t border-slate-100 pt-6 text-center text-sm text-slate-400 dark:border-slate-800/60 dark:text-slate-500`}>
        © {year} Zumex. {t.footer.rights}
      </div>
    </footer>
  )
}
