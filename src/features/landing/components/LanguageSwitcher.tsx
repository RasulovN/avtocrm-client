import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DICTS, LANDING_LANGS, normalizeLang } from '../content'
import { Icon } from './Icon'
import type { LandingLang } from '../types'

const SHORT: Record<LandingLang, string> = { uz: "O'z", cyrl: 'Ўз', ru: 'Ру', en: 'En' }

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const current = normalizeLang(i18n.language)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const change = (l: LandingLang) => {
    i18n.changeLanguage(l)
    localStorage.setItem('i18nextLng', l)
    const parts = location.pathname.split('/').filter(Boolean)
    if (parts[0] && (LANDING_LANGS as string[]).includes(parts[0])) {
      parts[0] = l
      navigate('/' + parts.join('/'))
    }
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Til"
        className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
      >
        <Icon name="globe" className="h-4 w-4" />
        <span>{SHORT[current]}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 dark:border-slate-700 dark:bg-slate-900">
          {LANDING_LANGS.map((l) => (
            <button
              key={l}
              onClick={() => change(l)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                current === l
                  ? 'bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {DICTS[l].langName}
              <span className="text-xs text-slate-400">{SHORT[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
