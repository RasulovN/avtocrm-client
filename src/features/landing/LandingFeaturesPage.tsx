import { LandingLayout } from './components/LandingLayout'
import { PageHero } from './components/PageHero'
import { Features } from './components/Features'
import { HowItWorks } from './components/HowItWorks'
import { CTA } from './components/CTA'
import { useLanding } from './useLanding'
import { useSeo } from './useSeo'

export function LandingFeaturesPage() {
  const { t } = useLanding()
  useSeo(`${t.features.title} — Zumex`, t.features.subtitle)
  return (
    <LandingLayout>
      <PageHero badge={t.features.badge} title={t.features.title} subtitle={t.features.subtitle} />
      <Features withHeader={false} />
      <HowItWorks />
      <CTA />
    </LandingLayout>
  )
}
