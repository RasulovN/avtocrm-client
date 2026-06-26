export type LandingLang = 'uz' | 'cyrl' | 'ru' | 'en'

export interface LandingPlan {
  id: number
  name: string
  description: string | null
  name_uz: string
  name_ru: string | null
  name_en: string | null
  name_uz_cyrl: string | null
  description_uz: string | null
  description_ru: string | null
  description_en: string | null
  description_uz_cyrl: string | null
  price: string
  duration_days: number
  features: unknown
  max_stores: number | null
  max_users: number | null
}
