import { LandingLayout } from './components/LandingLayout'
import { PageHero } from './components/PageHero'
import { Pricing } from './components/Pricing'
import { Faq } from './components/Faq'
import { CTA } from './components/CTA'
import { useLanding } from './useLanding'
import { useSeo } from './useSeo'

export function LandingPricingPage() {
  const { t } = useLanding()
  useSeo(`${t.pricing.title} — Zumex`, t.pricing.subtitle)
  return (
    <LandingLayout>
      <PageHero badge={t.pricing.badge} title={t.pricing.title} subtitle={t.pricing.subtitle} />
      <Pricing withHeader={false} />
      <Faq />
      <CTA />
    </LandingLayout>
  )
}
