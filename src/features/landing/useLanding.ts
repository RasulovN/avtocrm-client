import { useTranslation } from 'react-i18next'
import { DICTS, normalizeLang, type Dict } from './content'
import type { LandingLang } from './types'

// Joriy til + tarjima lug'ati (client i18next bilan integratsiya)
export function useLanding(): { lang: LandingLang; t: Dict; rawLang: string } {
  const { i18n } = useTranslation()
  const lang = normalizeLang(i18n.language)
  return { lang, t: DICTS[lang], rawLang: i18n.language || 'uz' }
}
