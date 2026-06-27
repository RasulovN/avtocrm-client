import { AspLanding } from './asp/AspLanding'
import { getAspDict } from './asp/aspI18n'
import { useLanding } from './useLanding'
import { useSeo } from './useSeo'

export function LandingHomePage() {
  const { lang } = useLanding()
  const t = getAspDict(lang)
  useSeo(`Zumex — ${t.hero.eyebrow}`, t.hero.sub)
  return <AspLanding />
}
