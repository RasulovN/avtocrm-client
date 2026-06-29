import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './asp.css'
import { buildAspMarkup } from './aspMarkup'
import { getAspDict, type AspDict } from './aspI18n'
import { getLegal, type LegalDoc } from './aspLegal'
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
  const [legalDoc, setLegalDoc] = useState<'privacy' | 'terms' | null>(null)
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
          source: val('source') || undefined, // tanlangan kanal; bo'sh bo'lsa backend "sayt" qiladi
          locale: lang,
        })
        setStatus(t.contact.success, 'var(--green)')
        form.querySelectorAll<HTMLInputElement>('input[data-lead]').forEach((i) => (i.value = ''))
        form.querySelectorAll<HTMLSelectElement>('select[data-lead]').forEach((s) => (s.selectedIndex = 0))
      } catch {
        setStatus(t.contact.error, 'var(--red)')
      } finally {
        button.disabled = false
      }
    }

    const changeLang = (l: LandingLang) => {
      i18n.changeLanguage(l)
      localStorage.setItem('i18nextLng', l)
      const parts = location.pathname.split('/').filter(Boolean)
      if (parts[0] && (LANDING_LANGS as string[]).includes(parts[0])) parts[0] = l
      else parts.unshift(l)
      navigate('/' + parts.join('/'))
    }

    const onClick = (e: Event) => {
      const el = e.target as HTMLElement
      if (el.closest('[data-action="theme"]')) { e.preventDefault(); toggleTheme(); return }
      const leadBtn = el.closest<HTMLElement>('[data-asp-lead-submit]')
      if (leadBtn) { e.preventDefault(); void submitLead(leadBtn); return }
      const legal = el.closest<HTMLElement>('[data-legal]')
      if (legal) { e.preventDefault(); setLegalDoc(legal.getAttribute('data-legal') === 'terms' ? 'terms' : 'privacy'); return }
      const reg = el.closest<HTMLElement>('[data-asp-register]')
      if (reg) { e.preventDefault(); const pid = reg.getAttribute('data-plan'); goRegister(pid ? Number(pid) : undefined); return }
      if (el.closest('[data-asp-login]')) { e.preventDefault(); navigate(LOGIN_PATH); return }
    }
    root.addEventListener('click', onClick)

    // Til tanlash (select)
    const onLangChange = (e: Event) => {
      const sel = (e.target as HTMLElement).closest<HTMLSelectElement>('[data-lang-select]')
      if (sel) changeLang(sel.value as LandingLang)
    }
    root.addEventListener('change', onLangChange)

    // Joriy tilni select'da ko'rsatish
    const langSel = root.querySelector<HTMLSelectElement>('[data-lang-select]')
    if (langSel) langSel.value = lang

    return () => {
      root.removeEventListener('click', onClick)
      root.removeEventListener('change', onLangChange)
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

  return (
    <>
      <div id="asp-root" ref={ref} data-theme={theme} key={rawLang} dangerouslySetInnerHTML={{ __html: markup }} />
      <ScrollTopButton />
      <CookieConsent lang={lang} theme={theme} onMore={() => setLegalDoc('privacy')} />
      {legalDoc && (
        <LegalModal
          doc={getLegal(lang)[legalDoc]}
          closeLabel={getLegal(lang).closeLabel}
          theme={theme}
          onClose={() => setLegalDoc(null)}
        />
      )}
    </>
  )
}

// Cookie roziligi banneri: birinchi tashrifda chiqadi, tanlov localStorage'da saqlanadi.
const COOKIE_KEY = 'zumex_cookie_consent'
function CookieConsent({ lang, theme, onMore }: { lang: LandingLang; theme: string; onMore: () => void }) {
  const [visible, setVisible] = useState(false)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    let stored: string | null = null
    try { stored = localStorage.getItem(COOKIE_KEY) } catch { /* localStorage o'chirilgan bo'lishi mumkin */ }
    if (stored) return
    const tmo = window.setTimeout(() => {
      setVisible(true)
      window.requestAnimationFrame(() => setShown(true))
    }, 700)
    return () => window.clearTimeout(tmo)
  }, [])

  if (!visible) return null

  const choose = (choice: 'accepted' | 'rejected') => {
    try { localStorage.setItem(COOKIE_KEY, JSON.stringify({ choice, ts: new Date().toISOString() })) } catch { /* ignore */ }
    setShown(false)
    window.setTimeout(() => setVisible(false), 280)
  }

  const dark = theme === 'dark'
  const c = {
    card: dark ? '#0d1424' : '#ffffff',
    border: dark ? '#1e293b' : '#e7ebf1',
    ink: dark ? '#f1f5f9' : '#0f172a',
    ink2: dark ? '#cbd5e1' : '#334155',
    soft: dark ? '#111a2e' : '#f1f5f9',
    primary: dark ? '#3b82f6' : '#1d4ed8',
  }
  const t = getLegal(lang).cookie

  return (
    <div
      role="dialog"
      aria-label={t.title}
      style={{
        position: 'fixed', left: 20, bottom: 20, zIndex: 250, width: 'min(420px, calc(100vw - 40px))',
        background: c.card, color: c.ink2, border: `1px solid ${c.border}`, borderRadius: 16,
        boxShadow: '0 24px 60px -20px rgba(0,0,0,.45)', padding: 20,
        fontFamily: "'Golos Text', system-ui, sans-serif",
        opacity: shown ? 1 : 0, transform: shown ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity .28s ease, transform .28s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>🍪</span>
        <h3 style={{ margin: 0, fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 16.5, color: c.ink }}>{t.title}</h3>
      </div>
      <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.55 }}>
        {t.text}{' '}
        <button
          type="button"
          onClick={onMore}
          style={{ background: 'none', border: 0, padding: 0, color: c.primary, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, textDecoration: 'underline' }}
        >
          {t.more}
        </button>
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={() => choose('rejected')}
          style={{
            flex: 1, padding: '11px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
            fontWeight: 600, fontSize: 14, border: `1px solid ${c.border}`, background: c.soft, color: c.ink2,
          }}
        >
          {t.reject}
        </button>
        <button
          type="button"
          onClick={() => choose('accepted')}
          style={{
            flex: 1, padding: '11px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
            fontWeight: 700, fontSize: 14, border: 0, background: c.primary, color: '#fff',
            boxShadow: '0 12px 26px -12px rgba(29,78,216,.7)',
          }}
        >
          {t.accept}
        </button>
      </div>
    </div>
  )
}

// Maxfiylik siyosati / Foydalanish shartlari uchun to'liq matnli modal.
function LegalModal({ doc, closeLabel, theme, onClose }: { doc: LegalDoc; closeLabel: string; theme: string; onClose: () => void }) {
  const dark = theme === 'dark'
  const c = {
    overlay: 'rgba(2,6,23,.62)',
    card: dark ? '#0d1424' : '#ffffff',
    border: dark ? '#1e293b' : '#e7ebf1',
    ink: dark ? '#f1f5f9' : '#0f172a',
    ink2: dark ? '#cbd5e1' : '#334155',
    ink3: dark ? '#94a3b8' : '#64748b',
    soft: dark ? '#111a2e' : '#f8fafc',
    primary: dark ? '#3b82f6' : '#1d4ed8',
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300, background: c.overlay,
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 16,
        fontFamily: "'Golos Text', system-ui, sans-serif",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: c.card, color: c.ink2, border: `1px solid ${c.border}`,
          borderRadius: 18, width: 'min(760px, 100%)', maxHeight: '88vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 40px 90px -30px rgba(0,0,0,.6)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 16, padding: '22px 26px', borderBottom: `1px solid ${c.border}`, background: c.soft,
        }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 22, color: c.ink, letterSpacing: '-.02em' }}>{doc.title}</h2>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: c.ink3 }}>{doc.updated}</p>
          </div>
          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            style={{
              flexShrink: 0, width: 38, height: 38, borderRadius: 10, cursor: 'pointer',
              border: `1px solid ${c.border}`, background: c.card, color: c.ink2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div className="asp-scroll" style={{ padding: '24px 26px', overflowY: 'auto', lineHeight: 1.65, fontSize: 15 }}>
          <p style={{ margin: '0 0 20px', color: c.ink2 }}>{doc.intro}</p>
          {doc.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <h3 style={{ margin: '0 0 8px', fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16, color: c.ink }}>{s.h}</h3>
              {s.p.map((para, j) => (
                <p key={j} style={{ margin: '0 0 8px', color: c.ink2 }}>{para}</p>
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 26px', borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'flex-end', background: c.soft }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: c.primary, color: '#fff', border: 0, padding: '11px 22px',
              borderRadius: 10, fontWeight: 700, fontSize: 14.5, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// Pastga scroll qilinganda paydo bo'lib, bosilganda sahifa tepasiga qaytaradi.
function ScrollTopButton() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <button
      type="button"
      aria-label="Yuqoriga"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed',
        right: 24,
        bottom: 24,
        zIndex: 200,
        width: 50,
        height: 50,
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,.18)',
        background: '#1d4ed8',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 16px 34px -10px rgba(29,78,216,.65)',
        opacity: show ? 1 : 0,
        visibility: show ? 'visible' : 'hidden',
        transform: show ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity .3s ease, transform .3s ease, visibility .3s',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
