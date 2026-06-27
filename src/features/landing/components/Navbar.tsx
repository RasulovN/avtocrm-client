import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useLanding } from '../useLanding'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { Icon } from './Icon'
import { registerPath, LOGIN_PATH } from '../api'
import { BTN_PRIMARY, BTN_GHOST, CONTAINER } from '../styles'

export function Navbar() {
  const { t, rawLang } = useLanding()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => setMenuOpen(false), [location.pathname])

  const links = [
    { to: `/${rawLang}`, label: t.nav.home, end: true },
    { to: `/${rawLang}/features`, label: t.nav.features, end: false },
    { to: `/${rawLang}/pricing`, label: t.nav.pricing, end: false },
  ]
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition ${
      isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-300'
    }`

  return (
    <header
      className={`sticky top-0 z-40 transition-colors ${
        scrolled
          ? 'border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80'
          : 'border-b border-transparent'
      }`}
    >
      <div className={`${CONTAINER} flex h-16 items-center justify-between`}>
        <Link to={`/${rawLang}`} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 font-bold text-white shadow-lg shadow-indigo-600/30">A</span>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Zumex</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>{l.label}</NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link to={LOGIN_PATH} className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-700 dark:text-slate-200 dark:hover:text-indigo-300 sm:inline-flex">
            {t.nav.login}
          </Link>
          <Link to={registerPath({ trial: true })} className={`hidden sm:inline-flex ${BTN_PRIMARY} !px-4 !py-2`}>
            {t.nav.start}
          </Link>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300 md:hidden"
          >
            <Icon name={menuOpen ? 'close' : 'menu'} className="h-5 w-5" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <Link to={LOGIN_PATH} className={`${BTN_GHOST} justify-center`}>{t.nav.login}</Link>
              <Link to={registerPath({ trial: true })} className={`${BTN_PRIMARY} justify-center`}>{t.nav.start}</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
