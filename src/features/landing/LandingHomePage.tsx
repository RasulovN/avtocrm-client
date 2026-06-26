import { Link } from 'react-router-dom'
import { LandingLayout } from './components/LandingLayout'
import { Hero } from './components/Hero'
import { Stats } from './components/Stats'
import { Features } from './components/Features'
import { HowItWorks } from './components/HowItWorks'
import { CTA } from './components/CTA'
import { Icon } from './components/Icon'
import { useLanding } from './useLanding'
import { useSeo } from './useSeo'

export function LandingHomePage() {
  const { t, rawLang } = useLanding()
  useSeo('AutoCRM — Savdo, ombor va sotuv boshqaruvi', t.hero.subtitle)
  return (
    <LandingLayout>
      <Hero />
      <Stats />
      <Features limit={4} />
      <div className="-mt-8 pb-4 text-center">
        <Link to={`/${rawLang}/features`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 transition-all hover:gap-2.5 dark:text-indigo-300">
          {t.features.title} <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </div>
      <HowItWorks />
      <CTA />
    </LandingLayout>
  )
}
