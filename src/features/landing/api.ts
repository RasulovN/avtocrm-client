import { apiClient } from '../../services/api'
import type { LandingPlan, LandingLang } from './types'

// Public tariflar (autentifikatsiyasiz). 4 til maydonlari bilan keladi.
export async function fetchLandingPlans(): Promise<LandingPlan[]> {
  const res = await apiClient.get<LandingPlan[]>('/plans/public/')
  return res.data
}

// CTA — client ichidagi ro'yxatdan o'tish / kirish yo'llari
export function registerPath(opts?: { trial?: boolean; planId?: number }): string {
  const params = new URLSearchParams()
  if (opts?.trial) params.set('trial', '1')
  if (opts?.planId) params.set('plan', String(opts.planId))
  const qs = params.toString()
  return `/register${qs ? `?${qs}` : ''}`
}
export const LOGIN_PATH = '/login'

export function planName(p: LandingPlan, lang: LandingLang): string {
  if (lang === 'cyrl') return p.name_uz_cyrl || p.name_uz
  if (lang === 'ru') return p.name_ru || p.name_uz
  if (lang === 'en') return p.name_en || p.name_uz
  return p.name_uz
}
export function planDesc(p: LandingPlan, lang: LandingLang): string {
  if (lang === 'cyrl') return p.description_uz_cyrl || p.description_uz || ''
  if (lang === 'ru') return p.description_ru || p.description_uz || ''
  if (lang === 'en') return p.description_en || p.description_uz || ''
  return p.description_uz || ''
}
