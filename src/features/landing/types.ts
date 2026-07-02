export type LandingLang = 'uz' | 'cyrl' | 'ru' | 'en'

// Bir muddat (1/3/6/12 oy) uchun backend hisoblab bergan narx varianti.
export interface PricingOption {
  months: number
  discount_percent: number
  gross: string // chegirmasiz jami (price * months)
  total: string // chegirma bilan jami
  monthly: string // oylik ekvivalent (total / months)
}

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
  // Uzoq muddat chegirmalari (%) va har muddat bo'yicha hisoblangan narxlar.
  discount_3: number
  discount_6: number
  discount_12: number
  pricing: PricingOption[]
  features: unknown
  max_stores: number | null
  max_users: number | null
}
