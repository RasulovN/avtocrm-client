import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './asp.css'
import { buildAspMarkup } from './aspMarkup'
import { getAspDict, type AspDict } from './aspI18n'
import { initAsp, type AspController } from './aspScript'
import landingDefaults from './landingData.json'
import { normalizeContact, type ContactInfo } from '../../saas/contact.types'
import { useThemeStore } from '../../../app/store'
import { useLanding } from '../useLanding'
import { fetchLandingPlans, registerPath, LOGIN_PATH, planName, planDesc } from '../api'
import { leadsApi, siteSettingsApi } from '../../saas/services'
import { LANDING_LANGS } from '../content'
import type { LandingLang, LandingPlan } from '../types'

function formatPrice(price: string, lang: LandingLang): { value: string; free: boolean } {
  const n = Number(price)
  if (!n || n <= 0) return { value: '', free: true }
  const locale = lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'uz-UZ'
  return { value: new Intl.NumberFormat(locale).format(n), free: false }
}
function planFeatures(features: unknown): string[] {
  return Array.isArray(features) ? (features.filter((x) => typeof x === 'string') as string[]) : []
}

// Pricing cards (API-driven), styled to match the landing design.
function buildPlansHtml(plans: LandingPlan[], lang: LandingLang, t: AspDict, loading: boolean): string {
  if (loading) {
    return [0, 1, 2]
      .map(
        () =>
          `<div style="background:var(--card);border:1px solid var(--line);border-radius:20px;padding:30px;box-shadow:var(--shadow-sm);min-height:340px"><div style="height:18px;width:120px;border-radius:6px;background:var(--bg-soft2)"></div><div style="height:34px;width:160px;border-radius:8px;background:var(--bg-soft2);margin-top:18px"></div><div style="height:44px;border-radius:11px;background:var(--bg-soft2);margin-top:20px"></div></div>`,
      )
      .join('')
  }
  if (!plans.length) {
    return `<div style="grid-column:1/-1;text-align:center;color:var(--ink-3);font-size:16px;padding:40px 0">${t.price.empty}</div>`
  }
  const popularIdx = plans.length >= 3 ? 1 : -1
  return plans
    .map((p, i) => {
      const popular = i === popularIdx
      const price = formatPrice(p.price, lang)
      const feats = planFeatures(p.features)
      const li = (text: string) => `<li style="display:flex;gap:9px"><span style="color:var(--green)">✓</span>${text}</li>`
      const priceBlock = price.free
        ? `<span style="font-family:'Manrope';font-weight:800;font-size:38px;color:var(--ink)">${t.price.free}</span>`
        : `<span style="font-family:'Manrope';font-weight:800;font-size:38px;color:var(--ink)">${price.value}</span><span style="color:var(--ink-3);font-size:15px">${t.price.perMonth}</span>`
      return `
      <div style="background:var(--card);border:${popular ? '2px solid var(--primary)' : '1px solid var(--line)'};border-radius:20px;padding:30px;box-shadow:${popular ? 'var(--shadow-lg)' : 'var(--shadow-sm)'};position:relative">
        ${popular ? `<span style="position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--primary);color:#fff;font-size:12px;font-weight:700;padding:5px 14px;border-radius:100px">${t.price.popular}</span>` : ''}
        <h3 style="font-family:'Manrope';font-weight:800;font-size:15px;letter-spacing:.06em;color:${popular ? 'var(--primary)' : 'var(--ink-3)'}">${planName(p, lang)}</h3>
        ${planDesc(p, lang) ? `<p style="font-size:14px;color:var(--ink-3);margin-top:6px">${planDesc(p, lang)}</p>` : ''}
        <div style="margin:18px 0 4px;display:flex;align-items:baseline;gap:6px">${priceBlock}</div>
        <a href="#" data-asp-register data-plan="${p.id}" style="display:block;text-align:center;margin-top:20px;background:${popular ? 'var(--primary)' : 'var(--card)'};border:1px solid ${popular ? 'var(--primary)' : 'var(--line-2)'};color:${popular ? '#fff' : 'var(--ink)'};padding:12px;border-radius:11px;font-weight:600${popular ? ';box-shadow:0 12px 26px -10px var(--primary)' : ''}">${popular ? t.price.demo : t.price.choose}</a>
        <ul style="list-style:none;margin-top:22px;display:flex;flex-direction:column;gap:11px;font-size:14.5px">
          ${p.max_stores != null ? li(`${p.max_stores} ${t.price.maxStores}`) : ''}
          ${p.max_users != null ? li(`${p.max_users} ${t.price.maxUsers}`) : ''}
          ${feats.map(li).join('')}
        </ul>
      </div>`
    })
    .join('')
}

export function AspLanding() {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { i18n } = useTranslation()
  const { lang, rawLang } = useLanding()
  const { theme, toggleTheme } = useThemeStore()

  const [plans, setPlans] = useState<LandingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [cfg, setCfg] = useState<ContactInfo>(() => normalizeContact(landingDefaults))
  const prevTheme = useRef(theme)

  // Editable contact + socials from backend (fallback: bundled landingData.json).
  useEffect(() => {
    let cancelled = false
    siteSettingsApi
      .getPublic()
      .then((s) => {
        if (cancelled || !s) return
        setCfg(normalizeContact(s, normalizeContact(landingDefaults)))
      })
      .catch(() => { /* keep JSON defaults */ })
    return () => { cancelled = true }
  }, [])

  // Route is the source of truth for language: /uz · /ru · /en · /<cyrl>.
  useEffect(() => {
    const seg = location.pathname.split('/').filter(Boolean)[0]
    if (seg && (LANDING_LANGS as string[]).includes(seg) && seg !== i18n.language) {
      i18n.changeLanguage(seg)
      localStorage.setItem('i18nextLng', seg)
    }
  }, [location.pathname, i18n])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchLandingPlans()
      .then((p) => !cancelled && setPlans(p))
      .catch(() => !cancelled && setPlans([]))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  const t = useMemo(() => getAspDict(lang), [lang])
  const markup = useMemo(() => buildAspMarkup(t, buildPlansHtml(plans, lang, t, loading), cfg, lang), [t, plans, lang, loading, cfg])

  // Wire interactivity + theme + language + CTA after each (re)render of markup.
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const ctrl: AspController = initAsp(root, t)

    const goRegister = (planId?: number) => navigate(registerPath(planId ? { planId } : { trial: true }))

    // Landing "Demo so'rash" formasi -> backend leads
    const submitLead = async (btn: HTMLElement) => {
      const form = root.querySelector<HTMLElement>('[data-asp-lead-form]')
      if (!form) return
      const val = (k: string) =>
        (form.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-lead="${k}"]`)?.value || '').trim()
      const status = form.querySelector<HTMLElement>('[data-lead-status]')
      const setStatus = (msg: string, color: string) => { if (status) { status.textContent = msg; status.style.color = color } }
      const name = val('name'), phone = val('phone'), email = val('email')
      if (!name || !phone || !email) { setStatus(t.contact.error, 'var(--red)'); return }
      const button = btn as HTMLButtonElement
      button.disabled = true
      setStatus(t.contact.sending, 'var(--ink-3)')
      try {
        await leadsApi.create({
          name, phone, email,
          company: val('company') || undefined,
          stores_range: val('stores_range') || undefined,
          locale: lang,
        })
        setStatus(t.contact.success, 'var(--green)')
        form.querySelectorAll<HTMLInputElement>('input[data-lead]').forEach((i) => (i.value = ''))
      } catch {
        setStatus(t.contact.error, 'var(--red)')
      } finally {
        button.disabled = false
      }
    }

    const onClick = (e: Event) => {
      const el = e.target as HTMLElement
      if (el.closest('[data-action="theme"]')) { e.preventDefault(); toggleTheme(); return }
      const leadBtn = el.closest<HTMLElement>('[data-asp-lead-submit]')
      if (leadBtn) { e.preventDefault(); void submitLead(leadBtn); return }
      const langBtn = el.closest<HTMLElement>('[data-lang]')
      if (langBtn) {
        e.preventDefault()
        const l = (langBtn.getAttribute('data-lang') || 'uz') as LandingLang
        i18n.changeLanguage(l)
        localStorage.setItem('i18nextLng', l)
        const parts = location.pathname.split('/').filter(Boolean)
        if (parts[0] && (LANDING_LANGS as string[]).includes(parts[0])) parts[0] = l
        else parts.unshift(l)
        navigate('/' + parts.join('/'))
        return
      }
      const reg = el.closest<HTMLElement>('[data-asp-register]')
      if (reg) { e.preventDefault(); const pid = reg.getAttribute('data-plan'); goRegister(pid ? Number(pid) : undefined); return }
      if (el.closest('[data-asp-login]')) { e.preventDefault(); navigate(LOGIN_PATH); return }
    }
    root.addEventListener('click', onClick)

    // Active language button styling
    root.querySelectorAll<HTMLElement>('[data-lang]').forEach((b) => {
      const on = b.getAttribute('data-lang') === lang
      b.style.background = on ? 'var(--primary)' : 'transparent'
      b.style.color = on ? '#fff' : 'var(--ink-3)'
    })

    return () => {
      root.removeEventListener('click', onClick)
      ctrl.destroy()
    }
  }, [markup, t, lang, navigate, location.pathname, i18n, toggleTheme])

  // Sync design theme + sun/moon icons + map theme with the app theme store.
  useEffect(() => {
    const root = ref.current
    if (!root) return
    root.setAttribute('data-theme', theme)
    const sun = root.querySelector<HTMLElement>('#ic-sun')
    const moon = root.querySelector<HTMLElement>('#ic-moon')
    if (sun) sun.style.display = theme === 'dark' ? 'block' : 'none'
    if (moon) moon.style.display = theme === 'dark' ? 'none' : 'block'
    // Yandex map widget: theme'ga mos (dark/light)
    const map = root.querySelector<HTMLIFrameElement>('iframe[data-asp-map]')
    if (map) {
      const lat = map.getAttribute('data-lat')
      const lng = map.getAttribute('data-lng')
      const want = `https://yandex.uz/map-widget/v1/?ll=${lng}%2C${lat}&z=16&pt=${lng},${lat},pm2rdm&theme=${theme}`
      if (map.getAttribute('src') !== want) map.setAttribute('src', want)
    }
    // Faqat haqiqiy mavzu almashuvida (mount/markup yangilanishida emas) hech bir
    // element yo'qolib qolmasin: barchasini darhol ko'rsatamiz. Birinchi yuklashda
    // scroll animatsiyasi saqlanib qoladi.
    if (prevTheme.current !== theme) {
      root.querySelectorAll<HTMLElement>('[data-reveal]:not(.in)').forEach((el) => el.classList.add('in'))
      prevTheme.current = theme
    }
  }, [theme, markup])

  // Landing har doim tepadan boshlansin (login->logout kabi SPA o'tishlardan keyin
  // skroll pastda qolib, reveal elementlari ko'rinmay qolishining oldini oladi).
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0)
  }, [])

  return <div id="asp-root" ref={ref} data-theme={theme} key={rawLang} dangerouslySetInnerHTML={{ __html: markup }} />
}
