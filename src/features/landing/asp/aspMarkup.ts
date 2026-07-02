// Builds the full landing markup (inner HTML of #asp-root) from a translation
// dictionary and the API-driven pricing cards. Rendered via dangerouslySetInnerHTML
// and animated by aspScript.ts. Barcha vizual stil asp.css klasslarida —
// inline stil faqat bir martalik mayda layout/SVG detallari uchun.
import type { AspDict } from './aspI18n'
import type { ContactInfo } from '../../saas/contact.types'
import type { LandingLang } from '../types'
import { buildDemo } from './aspDemo'

// Editable contact + social config (from backend site-settings, fallback JSON).
export type LandingCfg = ContactInfo

// SVG path per social network (footer icons), matched by name (lowercased).
const GENERIC_SOCIAL = 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2c3 3 3 17 0 20'
const SOCIAL_ICONS: Record<string, string> = {
  telegram: 'M21 4L3 11l5 2 2 6 3-4 5 4 3-15z',
  instagram: 'M4 4h16v16H4zM12 9a3 3 0 100 6 3 3 0 000-6zM17 6.5h.01',
  facebook: 'M16 8a5 5 0 015 5v6h-4v-6a1 1 0 00-2 0v6h-4v-10h4v1.5A4 4 0 0116 8z',
  youtube: 'M22 12s0-3-.4-4.4a2.5 2.5 0 00-1.7-1.7C18.4 5.5 12 5.5 12 5.5s-6.4 0-7.9.4A2.5 2.5 0 002.4 7.6C2 9 2 12 2 12s0 3 .4 4.4a2.5 2.5 0 001.7 1.7c1.5.4 7.9.4 7.9.4s6.4 0 7.9-.4a2.5 2.5 0 001.7-1.7C22 15 22 12 22 12zM10 15V9l5 3-5 3z',
  linkedin: 'M16 8a5 5 0 015 5v6h-4v-6a1 1 0 00-2 0v6h-4v-10h4v1.5A4 4 0 0116 8zM6 9H2v10h4V9zM4 6a2 2 0 100-4 2 2 0 000 4z',
}

const FEAT_ICONS = [
  'M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7',
  'M4 7h16v13H4zM4 7l3-4h10l3 4M9 11h6',
  'M3 10h18M7 15h4M5 6h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z',
  'M12 11a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  'M3 13l2-5h11l3 5M3 13h16M3 13v4h16v-4',
  'M4 19V5M4 19h16M8 15l3-4 3 2 4-6',
  'M6 3h9l4 4v14H6zM9 12h7M9 16h5',
  'M3 7l9-4 9 4M3 7v10l9 4 9-4V7M3 7l9 4 9-4M12 11v9',
  'M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z',
  'M5 4h2l1 2M3 6h4l2 12h9l2-8H7',
  'M12 8v8M8 12h8M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'M3 3v18h18M7 14l3-3 3 2 5-6',
]
const IND_ICONS = [
  'M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7',
  'M12 2a10 10 0 100 20 10 10 0 000-20zM12 7v5l3 3',
  'M3 9h18v9H3zM3 9l2-5h14l2 5M8 18v2M16 18v2',
  'M3 13l2-5h11l3 5M3 13h16M5 17h2m10 0h2',
  'M4 7h16v13H4zM4 7l3-4h10l3 4',
  'M5 21V8l7-5 7 5v13M9 21v-6h6v6',
  'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2c3 3 3 17 0 20',
  'M12 4a8 8 0 100 16 8 8 0 000-16zM12 8v4l2 2',
  'M6 3h8l4 5v13H6zM10 3v5h8',
  'M4 6h16v10H4zM8 20h8M9 9h6v4H9z',
  'M3 7l9-4 9 4-9 4-9-4zM12 11v9',
  'M4 19V5M4 19h16M8 15l3-4 3 2 4-6',
]
const AI_ICONS = [
  'M3 17l5-5 4 3 8-9',
  'M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7',
  'M4 19V5M4 19h16M8 14l3-3 3 2 4-5',
  'M6 3h9l4 4v14H6zM9 12h7M9 16h5',
]
const SEC_ICONS = [
  'M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z',
  'M4 12a8 8 0 1116 0M4 12l-2-2M4 12l2-2M20 12l-2-2M20 12l2-2M12 12v6',
  'M12 8a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM5 20c0-3 3-5 7-5s7 2 7 5',
  'M5 4h14v16H5zM9 9h6M9 13h6M9 17h3',
]

const svgIcon = (path: string, size = 22, stroke = 'var(--primary)', width = 1.7) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="${path}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const check = (c = 'var(--green)') => svgIcon('M20 6L9 17l-5-5', 17, c, 2.4)

const iconFor = (name: string) => {
  const k = (name || '').toLowerCase()
  const hit = Object.keys(SOCIAL_ICONS).find((key) => k.includes(key))
  return hit ? SOCIAL_ICONS[hit] : GENERIC_SOCIAL
}

// Lead manba kodlari (i18n sourceOpts tartibiga mos). Bu kodlar backendga
// yuboriladi — cyrl transliteratsiyasidan himoyalanishi uchun shu yerda saqlanadi.
const LANDING_SOURCE_CODES = ['instagram', 'telegram', 'facebook', 'youtube', 'google', 'referral', 'website', 'other'] as const

// Bo'lim sarlavhasi (eyebrow + h2 + sub) — landing bo'ylab yagona naqsh.
function secHead(eyebrow: string, title: string, sub?: string, center = false): string {
  return `<div data-reveal class="asp-sec-head${center ? ' asp-sec-head--center' : ''}">
    <span class="asp-eyebrow">${eyebrow}</span>
    <h2 class="asp-h2">${title}</h2>
    ${sub ? `<p class="asp-sub">${sub}</p>` : ''}
  </div>`
}

export function buildAspMarkup(t: AspDict, plansHtml: string, cfg: LandingCfg, lang: LandingLang): string {
  const demo = buildDemo(lang)
  const c = cfg
  const socials = Array.isArray(cfg.socials) ? cfg.socials.filter((s) => s && s.url) : []
  const primarySocial = socials.find((s) => /telegram/i.test(s.name)) || socials[0] || null
  const socialLinks = socials
    .map((s) => `<a class="asp-footer-social" href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}" title="${s.name}">${svgIcon(iconFor(s.name), 16, '#94a3b8', 1.5)}</a>`)
    .join('')

  // Xarita: dekorativ fon + pin. Koordinata bo'lsa — Yandex iframe faqat
  // "Xaritani ochish" bosilgandagina yuklanadi (facade). Bu uchinchi tomon
  // iframe'i sahifa yuklanishini sekinlashtirishi va cookie o'rnatishining
  // oldini oladi (Lighthouse Performance + Best Practices).
  const mapDecor = `<div aria-hidden="true" style="position:absolute;inset:0;opacity:.5;background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:28px 28px"></div><div aria-hidden="true" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-100%);color:var(--primary)"><svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" stroke="var(--primary)" stroke-width="1.8" fill="var(--primary-soft)"/><circle cx="12" cy="10" r="2.5" fill="var(--primary)"/></svg></div><span style="position:absolute;bottom:10px;left:12px;font-size:12px;color:var(--ink-3);background:var(--card);padding:3px 8px;border-radius:6px;border:1px solid var(--line)">${c.address}</span>`
  const mapHtml = c.location
    ? `${mapDecor}<button type="button" data-asp-map-load data-lat="${c.location.lat}" data-lng="${c.location.lng}" data-title="${c.address || t.contact.title}" style="position:absolute;left:50%;top:50%;transform:translate(-50%,12px);display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:600 14px 'Golos Text',system-ui,sans-serif;cursor:pointer;box-shadow:var(--shadow-sm)">${svgIcon('M9 20l-6-2V4l6 2m0 14l6-2m-6 2V6m6 12l6 2V6l-6-2m0 14V4M9 6l6-2', 16, 'var(--primary)', 1.8)}${t.contact.mapOpen}</button>`
    : mapDecor

  /* ---------- kartochkalar ---------- */
  const challengeCards = t.ch.cards.map((cc) => `
    <div class="asp-card asp-card--tight asp-card--hover">
      <div class="asp-problem-head"><i></i><h3>${cc.p}</h3></div>
      <div class="asp-problem-fix">${check()}${cc.fix}</div>
    </div>`).join('')

  const featCards = t.feat.items.map((f, i) => `
    <div class="asp-card asp-card--hover asp-feat">
      <span class="asp-chip">${svgIcon(FEAT_ICONS[i])}</span>
      <h3>${f.title}</h3>
      <p>${f.desc}</p>
    </div>`).join('')

  const indCards = t.ind.items.map((label, i) => `
    <div class="asp-card asp-card--tight asp-card--hover asp-ind">
      <span class="asp-chip asp-chip--sm">${svgIcon(IND_ICONS[i], 20)}</span>
      <span>${label}</span>
    </div>`).join('')

  const bars = [42, 55, 48, 63, 71, 66, 78, 84, 79, 92, 88, 100].map((v, i, a) => `
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end">
      <div style="width:100%;height:${v}%;background:${i === a.length - 1 ? 'var(--grad)' : 'var(--primary-soft)'};border:1px solid ${i === a.length - 1 ? 'transparent' : 'var(--primary)'};border-radius:6px 6px 3px 3px;transform-origin:bottom;animation:growbar .8s ${i * 0.05}s both cubic-bezier(.16,1,.3,1)"></div>
      <span style="font-size:11px;color:var(--ink-4)">${i + 1}</span>
    </div>`).join('')

  const donutColors = ['var(--primary)', '#0ea5e9', 'var(--green)', '#fbbf24']
  const storeLegend = t.ceo.stores.map((s, i) => `<div style="display:flex;align-items:center;gap:8px"><span style="width:10px;height:10px;border-radius:3px;background:${donutColors[i]};flex-shrink:0"></span>${s.label} · ${s.pct}</div>`).join('')
  const topRows = t.ceo.top.map((p) => `<div style="display:flex;align-items:center;gap:12px"><span style="font-size:13px;width:120px;flex-shrink:0">${p.name}</span><div style="flex:1;height:8px;background:var(--line);border-radius:5px;overflow:hidden"><div style="width:${p.pct}%;height:100%;background:var(--primary);border-radius:5px"></div></div><span style="font-size:12.5px;font-weight:600;color:var(--ink)">${p.val}</span></div>`).join('')
  const attBg = ['rgba(225,29,72,.12)', 'rgba(217,119,6,.13)', 'var(--green-soft)']
  const attColor = ['var(--red)', 'var(--amber)', 'var(--green)']
  const attIcons = ['!', '$', '▲']
  const attRows = t.ceo.att.map((a, i) => `<div style="display:flex;align-items:center;gap:11px;padding:11px;background:var(--card);border:1px solid var(--line);border-radius:10px"><span style="width:30px;height:30px;flex-shrink:0;border-radius:8px;background:${attBg[i]};color:${attColor[i]};display:flex;align-items:center;justify-content:center;font-weight:700">${attIcons[i]}</span><div style="font-size:13.5px">${a}</div></div>`).join('')

  const aiItems = t.ai.items.map((it, i) => `
    <div style="display:flex;gap:11px;align-items:flex-start">
      <span style="width:34px;height:34px;flex-shrink:0;border-radius:9px;background:var(--card);border:1px solid var(--line);display:flex;align-items:center;justify-content:center">${svgIcon(AI_ICONS[i], 17, 'var(--primary)', 1.8)}</span>
      <div><div style="font-weight:700;font-size:15px;color:var(--ink)">${it.title}</div><div style="font-size:13px;color:var(--ink-3)">${it.desc}</div></div>
    </div>`).join('')
  const aiInsightBg = ['var(--green-soft)', 'rgba(225,29,72,.08)', 'var(--primary-soft)']
  const aiInsightMark = ['<span style="color:var(--green);font-weight:700">▲</span>', '<span style="color:var(--red);font-weight:700">!</span>', '<span style="color:var(--primary);font-weight:700">◆</span>']
  const aiInsights = t.ai.insights.map((ins, i) => `<div style="display:flex;gap:10px;align-items:flex-start;padding:11px;background:${aiInsightBg[i]};border-radius:10px">${aiInsightMark[i]}<div style="font-size:13px;color:var(--ink-2)">${ins}</div></div>`).join('')

  const benStats = t.ben.stats.map((s) => `<div class="asp-dark-stat"><b>${s.v}</b><span>${s.l}</span></div>`).join('')
  const benChecks = t.ben.checks.map((cc) => `<div class="asp-dark-check">${check('#60a5fa')}${cc}</div>`).join('')

  const numCards = t.num.items.map((n) => `<div class="asp-stat"><b>${n.v}</b><span>${n.l}</span></div>`).join('')

  /* ---------- taqqoslash jadvali ---------- */
  const yes = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="var(--green-soft)"/><path d="M8 12.5l2.5 2.5L16 9" stroke="var(--green)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  const no = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="var(--bg-soft2)"/><path d="M9 9l6 6M15 9l-6 6" stroke="var(--ink-4)" stroke-width="2" stroke-linecap="round"/></svg>`
  let cmp = `<div class="asp-cmp">`
  cmp += `<div class="asp-cmp-cell asp-cmp-cell--head asp-cmp-cell--label" style="font-weight:600;color:var(--ink-3)">${t.cmp.feature}</div>`
  t.cmp.cols.forEach((cc) => (cmp += `<div class="asp-cmp-cell asp-cmp-cell--head">${cc}</div>`))
  cmp += `<div class="asp-cmp-cell asp-cmp-cell--brand">Zumex</div>`
  t.cmp.rows.forEach((r, i) => {
    const last = i === t.cmp.rows.length - 1 ? ' asp-cmp-cell--last' : ''
    cmp += `<div class="asp-cmp-cell asp-cmp-cell--label${last}">${r.label}</div>`
    r.vals.forEach((v) => (cmp += `<div class="asp-cmp-cell${last}">${v ? yes : no}</div>`))
    cmp += `<div class="asp-cmp-cell asp-cmp-cell--hit${last}">${yes}</div>`
  })
  cmp += `</div>`

  const timeline = t.impl.steps.map((s, i) => `
    <div class="asp-card asp-card--tight asp-card--hover">
      <div style="width:34px;height:34px;border-radius:10px;background:var(--grad);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Manrope';font-weight:800;font-size:14px">${i + 1}</div>
      <h3 style="font-size:16.5px;font-weight:700;margin:13px 0 6px">${s.t}</h3>
      <p style="font-size:13.5px;color:var(--ink-3);line-height:1.5">${s.d}</p>
    </div>`).join('')

  const secCards = t.sec.items.map((label, i) => `
    <div class="asp-card asp-card--tight">
      ${svgIcon(SEC_ICONS[i])}
      <div style="font-weight:700;margin-top:10px;color:var(--ink)">${label}</div>
    </div>`).join('')

  const storyGrad = ['linear-gradient(135deg,var(--primary),#0ea5e9)', 'linear-gradient(135deg,#0ea5e9,var(--green))', 'linear-gradient(135deg,#6366f1,var(--primary))']
  const stories = t.story.items.map((s, i) => `
    <div class="asp-card asp-card--hover" style="padding:28px">
      <div style="display:flex;gap:3px;color:#fbbf24" aria-hidden="true">★★★★★</div>
      <p style="font-size:16px;color:var(--ink);margin:14px 0 18px;line-height:1.5">${s.quote}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px">${s.m.map((mm) => `<div style="background:var(--bg-soft);border-radius:10px;padding:12px"><div style="font-size:12px;color:var(--ink-3)">${mm.l}</div><div style="font-weight:800;font-family:'Manrope';color:var(--green)">${mm.v}</div></div>`).join('')}</div>
      <div style="display:flex;align-items:center;gap:11px"><span style="width:42px;height:42px;flex-shrink:0;border-radius:50%;background:${storyGrad[i]};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:'Manrope'">${s.initials}</span><div><div style="font-weight:700;font-size:14px;color:var(--ink)">${s.name}</div><div style="font-size:12.5px;color:var(--ink-3)">${s.role}</div></div></div>
    </div>`).join('')

  const faq = t.faq.items.map((qa) => `
    <div class="asp-faq-item">
      <button data-faq class="asp-faq-q"><b>${qa.q}</b><span class="faq-ic" aria-hidden="true">+</span></button>
      <div class="asp-faq-a"><p>${qa.a}</p></div>
    </div>`).join('')

  /* ---------- navigatsiya ---------- */
  const NAV_ITEMS: Array<[string, string]> = [
    ['features', t.nav.features],
    ['product', t.nav.product],
    ['industries', t.nav.industries],
    ['pricing', t.nav.pricing],
    ['stories', t.nav.stories],
    ['faq', t.nav.faq],
  ]
  const navLinks = NAV_ITEMS.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')
  const chevron = svgIcon('M9 6l6 6-6 6', 16, 'currentColor', 2)
  const mobileLinks = NAV_ITEMS.map(([id, label]) => `<a href="#${id}">${label}${chevron}</a>`).join('')

  const langOpt = (code: string, label: string) => `<option value="${code}">${label}</option>`
  const langSelect = `<select data-lang-select class="asp-lang" aria-label="Til">${langOpt('uz', "O'zbekcha")}${langOpt('cyrl', 'Ўзбекча')}${langOpt('ru', 'Русский')}${langOpt('en', 'English')}</select>`

  /* ---------- to'lov usullari ---------- */
  const payBadge = (inner: string) => `<span class="asp-pay-badge">${inner}</span>`
  const mcLogo = `<span style="display:inline-flex;align-items:center"><span style="width:19px;height:19px;border-radius:50%;background:#eb001b"></span><span style="width:19px;height:19px;border-radius:50%;background:#ff9e0f;margin-left:-8px;mix-blend-mode:multiply"></span></span>`
  const payments = [
    payBadge('<span style="color:#0e7490">Payme</span>'),
    payBadge('<span style="color:#0369a1">Click</span>'),
    payBadge('<span style="color:#1d4ed8">Uzcard</span>'),
    payBadge('<span style="color:#0f766e">Humo</span>'),
    payBadge('<span style="color:#1a1f71;font-style:italic;font-size:18px;letter-spacing:.04em">VISA</span>'),
    payBadge(mcLogo),
  ].join('')

  const trustNames = ['SavdoPlus', 'MegaStore', 'OptomBaza', 'TradeHub', 'RetailPro', 'SkladCity', 'MarketOne']
  const marqueeGroup = (hidden: boolean) =>
    trustNames.map((n) => `<span${hidden ? ' class="asp-dup" aria-hidden="true"' : ''}>${n}</span>`).join('')

  return `
<div aria-hidden="true" style="position:fixed;inset:0;z-index:-1;background:var(--bg);transition:background .45s ease"></div>

<header class="asp-header">
  <nav class="asp-nav" aria-label="Asosiy">
    <a href="#top" aria-label="Zumex" style="display:flex;align-items:center;flex-shrink:0">
      <img class="asp-logo asp-logo-light" src="/images/logo-light.png" alt="Zumex" width="52" height="52" fetchpriority="high" decoding="async" style="height:48px;width:auto">
      <img class="asp-logo asp-logo-dark" src="/images/logo-dark.png" alt="Zumex" width="52" height="52" decoding="async" style="height:48px;width:auto">
    </a>
    <div class="asp-nav-links">${navLinks}</div>
    <div class="asp-nav-actions">
      ${langSelect}
      <button data-action="theme" class="asp-icon-btn" aria-label="Mavzu">
        <svg id="ic-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" style="display:block" aria-hidden="true"><path d="M21 12.8A8.5 8.5 0 1111.2 3a6.5 6.5 0 009.8 9.8z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
        <svg id="ic-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" style="display:none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
      </button>
      <a href="#" data-asp-login class="asp-login-link">${t.nav.login}</a>
      <a href="#" data-asp-register class="asp-btn asp-btn--primary asp-nav-cta">${t.nav.cta}</a>
      <button data-asp-nav-toggle class="asp-icon-btn asp-burger" aria-label="Menu" aria-expanded="false" aria-controls="asp-mobile-nav"><span class="bar"></span></button>
    </div>
  </nav>
  <div id="asp-mobile-nav" class="asp-mobile-nav">
    <div>
      <nav aria-label="Mobil">
        ${mobileLinks}
        <a href="#" data-asp-login>${t.nav.login}${chevron}</a>
        <a href="#" data-asp-register class="asp-btn asp-btn--primary" style="border-bottom:0">${t.nav.cta}</a>
      </nav>
    </div>
  </div>
</header>

<a id="top"></a>
<section data-screen-label="Hero" class="asp-hero">
  <div class="asp-hero-bg" aria-hidden="true"></div>
  <div class="asp-wrap">
    <div class="asp-hero-grid">
      <div>
        <span data-reveal class="asp-hero-badge"><span class="asp-live-dot"></span><span>${t.hero.eyebrow}</span></span>
        <h1 data-reveal class="asp-h1">${t.hero.h1}</h1>
        <p data-reveal class="asp-hero-sub">${t.hero.sub}</p>
        <div data-reveal class="asp-hero-ctas">
          <a href="#" data-asp-register class="asp-btn asp-btn--primary asp-btn--lg">${t.hero.ctaDemo} ${svgIcon('M5 12h14M13 6l6 6-6 6', 17, '#fff', 2)}</a>
          <a href="#product" class="asp-btn asp-btn--ghost asp-btn--lg"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M10 9l5 3-5 3V9z" fill="currentColor"/></svg> ${t.hero.ctaWatch}</a>
          <a href="#roi" class="asp-btn asp-btn--link asp-btn--lg">${svgIcon('M9 7h6M9 11h6M9 15h3M6 3h12v18H6z', 17, 'currentColor', 1.7)}${t.hero.ctaRoi}</a>
        </div>
        <div data-reveal class="asp-hero-stats">
          <div class="asp-hero-stat"><b><span data-count="37" data-suffix="%" data-prefix="+">+37%</span></b><span>${t.hero.s1}</span></div>
          <div class="asp-hero-stat"><b><span data-count="99.8" data-suffix="%">99.8%</span></b><span>${t.hero.s2}</span></div>
          <div class="asp-hero-stat"><b>12</b><span>${t.hero.s3}</span></div>
        </div>
      </div>
      <div data-reveal style="position:relative">
        <div aria-hidden="true" style="position:absolute;inset:-34px;z-index:0;background:radial-gradient(58% 52% at 72% 26%,var(--primary-soft),transparent 70%),radial-gradient(46% 46% at 18% 88%,rgba(14,165,233,.12),transparent 72%);filter:blur(6px);pointer-events:none"></div>
        <div class="asp-window">
          <div class="asp-window-bar">
            <span class="asp-dot asp-dot--r"></span><span class="asp-dot asp-dot--y"></span><span class="asp-dot asp-dot--g"></span>
            <span class="asp-window-title">${t.dash.caption}</span>
            <span class="asp-window-live"><span class="asp-live-dot" style="width:6px;height:6px"></span>${t.dash.live}</span>
          </div>
          <div style="padding:18px">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:14px;gap:10px;flex-wrap:wrap">
              <div><div style="font-size:12px;color:var(--ink-3);font-weight:500">${t.dash.revenueToday}</div><div style="font-family:'Manrope';font-weight:800;font-size:clamp(24px,3vw,30px);color:var(--ink);letter-spacing:-.02em">184 920 000</div></div>
              <div style="text-align:right"><span style="display:inline-flex;align-items:center;gap:4px;background:var(--green-soft);color:var(--green);font-weight:700;font-size:12.5px;padding:4px 9px;border-radius:7px">▲ 18.4%</span><div style="font-size:11.5px;color:var(--ink-4);margin-top:5px">${t.dash.vsYesterday}</div></div>
            </div>
            <svg viewBox="0 0 520 170" style="width:100%;height:auto;display:block" aria-hidden="true">
              <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--primary)" stop-opacity=".28"/><stop offset="1" stop-color="var(--primary)" stop-opacity="0"/></linearGradient></defs>
              <path d="M0,130 C40,122 64,96 104,98 C150,100 168,66 210,72 C252,78 270,44 312,40 C356,36 376,70 420,46 C456,28 486,22 520,14 L520,170 L0,170 Z" fill="url(#hg)"/>
              <path d="M0,130 C40,122 64,96 104,98 C150,100 168,66 210,72 C252,78 270,44 312,40 C356,36 376,70 420,46 C456,28 486,22 520,14" fill="none" stroke="var(--primary)" stroke-width="2.6" stroke-linecap="round"/>
              <circle cx="520" cy="14" r="4.5" fill="var(--primary)"/><circle cx="520" cy="14" r="8" fill="var(--primary)" opacity=".25"/>
            </svg>
            <div class="asp-mini-tiles">
              <div class="asp-mini-tile"><i>${t.dash.orders}</i><b>1 284</b></div>
              <div class="asp-mini-tile"><i>${t.dash.profit}</i><b style="color:var(--green)">61.2M</b></div>
              <div class="asp-mini-tile"><i>${t.dash.stock}</i><b>8 940</b></div>
            </div>
          </div>
        </div>
        <div class="asp-float-card anim-floatA" style="top:136px;right:-34px"><div style="font-size:11px;color:var(--ink-3)">${t.dash.clients}</div><div style="font-family:'Manrope';font-weight:800;font-size:20px;color:var(--ink)">12 480</div><div style="font-size:11px;color:var(--green);font-weight:600">${t.dash.clientsGrow}</div></div>
        <div class="asp-float-card anim-floatB" style="bottom:152px;left:-34px"><div style="display:flex;align-items:center;gap:8px"><span style="width:30px;height:30px;border-radius:8px;background:var(--green-soft);display:flex;align-items:center;justify-content:center">${check()}</span><div><div style="font-size:11px;color:var(--ink-3)">${t.dash.expensesCtl}</div><div style="font-family:'Manrope';font-weight:700;font-size:14px;color:var(--ink)">${t.dash.expensesVal}</div></div></div></div>
        <div class="asp-float-card asp-float-card--grad anim-floatB" style="bottom:-48px;right:-14px;animation-duration:7s"><span style="width:34px;height:34px;flex-shrink:0;border-radius:9px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center">${svgIcon('M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10', 17, '#fff')}</span><div><div style="font-size:11px;opacity:.9">${t.dash.stockRt}</div><div style="font-family:'Manrope';font-weight:800;font-size:18px">${t.dash.stockAcc}</div></div></div>
      </div>
    </div>
  </div>
</section>

<section class="asp-section--tight" style="padding-top:10px">
  <div class="asp-wrap">
    <p data-reveal style="text-align:center;font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-4)">${t.trust.kicker}</p>
    <div data-reveal class="asp-marquee" style="margin:26px 0 36px">
      <div class="asp-marquee-track">${marqueeGroup(false)}${marqueeGroup(true)}</div>
    </div>
    <div data-reveal class="asp-grid asp-grid--stats" style="--cols:5;gap:14px">
      <div class="asp-stat"><b><span data-count="99.9" data-suffix="%">99.9%</span></b><span>${t.trust.uptime}</span></div>
      <div class="asp-stat"><b><span data-count="500" data-suffix="+">500+</span></b><span>${t.trust.stores}</span></div>
      <div class="asp-stat"><b>4.9<span style="font-size:18px;color:var(--ink-3)">/5</span></b><span>${t.trust.csat}</span></div>
      <div class="asp-stat"><b><span data-count="98" data-suffix="%">98%</span></b><span>${t.trust.impl}</span></div>
      <div class="asp-stat"><b>24/7</b><span>${t.trust.support}</span></div>
    </div>
  </div>
</section>

<section class="asp-section asp-section--soft">
  <div class="asp-wrap">
    ${secHead(t.ch.eyebrow, t.ch.title, t.ch.sub)}
    <div data-reveal class="asp-grid asp-grid--4" style="margin-top:42px">${challengeCards}</div>
  </div>
</section>

<section class="asp-section">
  <div class="asp-wrap">
    ${secHead(t.erp.eyebrow, t.erp.title, t.erp.sub, true)}
    <div data-reveal class="asp-erp">
      <div class="asp-card asp-card--hover" style="padding:30px">
        <span class="asp-chip">${svgIcon('M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7', 22, 'var(--primary)', 1.8)}</span>
        <h3 style="font-size:22px;font-weight:800;margin:16px 0 8px">${t.erp.erpTitle}</h3>
        <p style="font-size:15px;color:var(--ink-3)">${t.erp.erpDesc}</p>
        <ul class="asp-list">${t.erp.erpList.map((x) => `<li><span style="color:var(--primary)">●</span>${x}</li>`).join('')}</ul>
      </div>
      <div class="asp-erp-plus" aria-hidden="true">+</div>
      <div class="asp-card asp-card--hover" style="padding:30px">
        <span class="asp-chip asp-chip--green">${svgIcon('M16 14a4 4 0 10-8 0M12 3a4 4 0 100 8 4 4 0 000-8zM4 21c0-3.3 3.6-5 8-5s8 1.7 8 5', 22, 'var(--green)', 1.8)}</span>
        <h3 style="font-size:22px;font-weight:800;margin:16px 0 8px">${t.erp.crmTitle}</h3>
        <p style="font-size:15px;color:var(--ink-3)">${t.erp.crmDesc}</p>
        <ul class="asp-list">${t.erp.crmList.map((x) => `<li><span style="color:var(--green)">●</span>${x}</li>`).join('')}</ul>
      </div>
    </div>
  </div>
</section>

<section id="features" data-screen-label="Features" class="asp-section asp-section--soft">
  <div class="asp-wrap">
    ${secHead(t.feat.eyebrow, t.feat.title, t.feat.sub)}
    <div data-reveal class="asp-grid asp-grid--3" style="margin-top:42px">${featCards}</div>
  </div>
</section>

<section id="product" data-screen-label="Product demo" class="asp-section">
  <div class="asp-wrap">
    ${secHead(t.prod.eyebrow, t.prod.title, t.prod.sub, true)}
    <div data-reveal class="asp-window" style="margin-top:38px">
      <div class="asp-window-bar">
        <span class="asp-dot asp-dot--r"></span><span class="asp-dot asp-dot--y"></span><span class="asp-dot asp-dot--g"></span>
        <span class="asp-window-title">app.zumex.uz</span>
      </div>
      <div class="asp-demo-body">
        <aside class="asp-demo-aside asp-scroll">
          <div class="asp-demo-kicker">Zumex CRM</div>
          <div id="demo-tabs" class="asp-demo-tabs">${demo.tabs}</div>
          <div class="asp-demo-lowstock"><div style="font-size:12px;color:var(--primary-ink);font-weight:600">${t.prod.lowStock}</div><div style="font-family:'Manrope';font-weight:800;font-size:22px;color:var(--primary)">${t.prod.lowStockSku}</div><div style="font-size:11.5px;color:var(--ink-3)">${t.prod.lowStockNote}</div></div>
        </aside>
        <div id="demo-panels" class="asp-demo-panels asp-scroll">${demo.panels}</div>
      </div>
    </div>
  </div>
</section>

<section data-screen-label="CEO Dashboard" class="asp-section">
  <div class="asp-wrap">
    ${secHead(t.ceo.eyebrow, t.ceo.title, t.ceo.sub)}
    <div data-reveal class="asp-panel" style="margin-top:36px">
      <div class="asp-ceo-kpis">
        <div class="asp-ceo-kpi"><i>${t.ceo.revMonth}</i><b>${t.ceo.revV}</b><em style="color:var(--green)">${t.ceo.revD}</em></div>
        <div class="asp-ceo-kpi"><i>${t.ceo.netProfit}</i><b style="color:var(--green)">${t.ceo.netV}</b><em style="color:var(--green)">${t.ceo.netD}</em></div>
        <div class="asp-ceo-kpi"><i>${t.ceo.expenses}</i><b>${t.ceo.expV}</b><em style="color:var(--red)">${t.ceo.expD}</em></div>
        <div class="asp-ceo-kpi"><i>${t.ceo.stockValue}</i><b>${t.ceo.stockV}</b><em style="color:var(--ink-3)">${t.ceo.stockD}</em></div>
      </div>
      <div class="asp-ceo-row asp-ceo-row--wide">
        <div class="asp-subcard">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h3 style="font-size:15px;font-weight:700">${t.ceo.profitByMonth}</h3><span style="font-size:12px;color:var(--ink-3)">${t.ceo.year}</span></div>
          <div style="display:flex;align-items:flex-end;gap:10px;height:170px">${bars}</div>
        </div>
        <div class="asp-subcard">
          <h3 style="font-size:15px;font-weight:700;margin-bottom:10px">${t.ceo.salesByStore}</h3>
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
            <svg width="118" height="118" viewBox="0 0 140 140" style="transform:rotate(-90deg);flex-shrink:0" aria-hidden="true"><circle cx="70" cy="70" r="54" fill="none" stroke="var(--line)" stroke-width="18"/><circle cx="70" cy="70" r="54" fill="none" stroke="var(--primary)" stroke-width="18" stroke-dasharray="135.7 339.3" stroke-dashoffset="0"/><circle cx="70" cy="70" r="54" fill="none" stroke="#0ea5e9" stroke-width="18" stroke-dasharray="84.8 339.3" stroke-dashoffset="-135.7"/><circle cx="70" cy="70" r="54" fill="none" stroke="var(--green)" stroke-width="18" stroke-dasharray="67.9 339.3" stroke-dashoffset="-220.5"/><circle cx="70" cy="70" r="54" fill="none" stroke="#fbbf24" stroke-width="18" stroke-dasharray="50.9 339.3" stroke-dashoffset="-288.4"/></svg>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:13px">${storeLegend}</div>
          </div>
        </div>
      </div>
      <div class="asp-ceo-row asp-ceo-row--half">
        <div class="asp-subcard"><h3 style="font-size:15px;font-weight:700;margin-bottom:12px">${t.ceo.topProducts}</h3><div style="display:flex;flex-direction:column;gap:11px">${topRows}</div></div>
        <div class="asp-subcard"><h3 style="font-size:15px;font-weight:700;margin-bottom:12px">${t.ceo.attention}</h3><div style="display:flex;flex-direction:column;gap:10px">${attRows}</div></div>
      </div>
    </div>
  </div>
</section>

<section data-screen-label="AI" class="asp-section" style="padding-top:0">
  <div class="asp-wrap">
    <div class="asp-ai-shell">
      <div class="asp-split">
        <div data-reveal>
          <span class="asp-eyebrow"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" fill="var(--primary)"/></svg><span>${t.ai.eyebrow}</span></span>
          <h2 class="asp-h2">${t.ai.title}</h2>
          <p class="asp-sub">${t.ai.sub}</p>
          <div class="asp-ai-items">${aiItems}</div>
        </div>
        <div data-reveal class="asp-window">
          <div style="display:flex;align-items:center;gap:9px;padding:14px 18px;border-bottom:1px solid var(--line)"><span style="width:30px;height:30px;flex-shrink:0;border-radius:8px;background:var(--grad);display:flex;align-items:center;justify-content:center"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" fill="#fff"/></svg></span><span style="font-weight:700;font-size:14.5px;color:var(--ink)">${t.ai.panelTitle}</span><span style="margin-left:auto;font-size:11.5px;color:var(--primary);font-weight:600;background:var(--primary-soft);padding:3px 9px;border-radius:6px;white-space:nowrap">${t.ai.updated}</span></div>
          <div style="padding:18px">
            <div style="font-size:12.5px;color:var(--ink-3);margin-bottom:4px">${t.ai.forecastLabel}</div>
            <svg viewBox="0 0 460 130" style="width:100%;height:auto;display:block" aria-hidden="true"><defs><linearGradient id="aig" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--primary)" stop-opacity=".22"/><stop offset="1" stop-color="var(--primary)" stop-opacity="0"/></linearGradient></defs><path d="M0,95 C50,90 70,72 110,76 C150,80 168,52 210,58 L210,58 L210,110 L0,110 Z" fill="url(#aig)"/><path d="M0,95 C50,90 70,72 110,76 C150,80 168,52 210,58" fill="none" stroke="var(--primary)" stroke-width="2.4" stroke-linecap="round"/><path d="M210,58 C250,64 270,40 312,34 C356,28 380,42 460,18" fill="none" stroke="var(--primary)" stroke-width="2.4" stroke-dasharray="5 5" stroke-linecap="round" opacity=".75"/><circle cx="210" cy="58" r="4" fill="var(--primary)"/><text x="218" y="50" font-size="11" fill="var(--ink-3)" font-family="Golos Text">${t.ai.forecastTag}</text></svg>
            <div style="display:flex;flex-direction:column;gap:9px;margin-top:14px">${aiInsights}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="asp-dark-band">
  <div class="asp-wrap">
    <div data-reveal class="asp-sec-head">
      <span class="asp-eyebrow">${t.ben.eyebrow}</span>
      <h2 class="asp-h2">${t.ben.title}</h2>
    </div>
    <div data-reveal class="asp-grid asp-grid--stats" style="--cols:4;margin-top:42px">${benStats}</div>
    <div data-reveal class="asp-grid asp-grid--3" style="gap:14px;margin-top:16px">${benChecks}</div>
  </div>
</div>

<section data-screen-label="Numbers" class="asp-section--tight asp-section">
  <div class="asp-wrap" style="text-align:center">
    <span class="asp-eyebrow">${t.num.eyebrow}</span>
    <h2 class="asp-h2" style="font-size:clamp(26px,3.6vw,40px)">${t.num.title}</h2>
    <div data-reveal class="asp-grid asp-grid--stats" style="--cols:6;gap:14px;margin-top:40px">${numCards}</div>
  </div>
</section>

<section id="industries" data-screen-label="Industries" class="asp-section asp-section--soft">
  <div class="asp-wrap">
    ${secHead(t.ind.eyebrow, t.ind.title)}
    <div data-reveal class="asp-grid asp-grid--4" style="gap:14px;margin-top:40px">${indCards}</div>
  </div>
</section>

<section data-screen-label="Comparison" class="asp-section">
  <div class="asp-wrap" style="max-width:1100px">
    ${secHead(t.cmp.eyebrow, t.cmp.title, t.cmp.sub, true)}
    <div data-reveal class="asp-scroll" style="margin-top:38px;overflow-x:auto">${cmp}</div>
  </div>
</section>

<section id="roi" data-screen-label="ROI" class="asp-section asp-section--soft">
  <div class="asp-wrap" style="max-width:1100px">
    ${secHead(t.roi.eyebrow, t.roi.title, t.roi.sub, true)}
    <div data-reveal class="asp-roi-card">
      <div style="display:flex;flex-direction:column;gap:30px;justify-content:center">
        <div><div style="display:flex;justify-content:space-between;align-items:baseline;font-weight:600;color:var(--ink);gap:12px"><span>${t.roi.storesLabel}</span><span id="roi-stores-v" style="color:var(--primary);font-family:'Manrope';font-weight:800;font-size:22px">5</span></div><input data-roi type="range" id="roi-stores" aria-label="${t.roi.storesLabel}" min="1" max="30" value="5" style="margin-top:12px"></div>
        <div><div style="display:flex;justify-content:space-between;align-items:baseline;font-weight:600;color:var(--ink);gap:12px"><span>${t.roi.revLabel}</span><span id="roi-rev-v" style="color:var(--primary);font-family:'Manrope';font-weight:800;font-size:22px">120</span></div><input data-roi type="range" id="roi-rev" aria-label="${t.roi.revLabel}" min="20" max="600" step="10" value="120" style="margin-top:12px"></div>
      </div>
      <div class="asp-roi-result">
        <div style="font-size:14px;opacity:.85">${t.roi.savings}</div>
        <div id="roi-save" style="font-family:'Manrope';font-weight:800;font-size:clamp(28px,4vw,42px);letter-spacing:-.02em;line-height:1.1">—</div>
        <div style="height:1px;background:rgba(255,255,255,.25);margin:18px 0"></div>
        <div style="display:flex;justify-content:space-between;font-size:14px;gap:12px"><span style="opacity:.9">${t.roi.extra}</span><b id="roi-extra">—</b></div>
        <div style="display:flex;justify-content:space-between;font-size:14px;margin-top:8px;gap:12px"><span style="opacity:.9">${t.roi.payback}</span><b id="roi-payback">—</b></div>
        <a href="#" data-asp-register class="asp-btn asp-btn--white" style="margin-top:22px">${t.roi.cta}</a>
      </div>
    </div>
  </div>
</section>

<section id="pricing" data-screen-label="Pricing" class="asp-section asp-section--soft">
  <div class="asp-wrap">
    ${secHead(t.price.eyebrow, t.price.title, t.price.sub, true)}
    <div id="asp-pricing-grid" data-reveal class="asp-pricing-grid">${plansHtml}</div>
    <div data-reveal class="asp-card" style="margin-top:24px;display:flex;flex-wrap:wrap;align-items:center;gap:16px 28px;justify-content:center;padding:22px 26px">
      <span style="font-weight:700;color:var(--ink)">${t.price.allIncl}</span>
      ${t.price.allItems.map((x) => `<span style="display:flex;align-items:center;gap:8px;font-size:14.5px;color:var(--ink-2)">${check()}${x}</span>`).join('')}
    </div>
    <p data-reveal style="text-align:center;font-size:13.5px;color:var(--ink-4);margin-top:14px">${t.price.note}</p>
  </div>
</section>

<section class="asp-section">
  <div class="asp-wrap">
    ${secHead(t.impl.eyebrow, t.impl.title)}
    <div data-reveal class="asp-grid asp-grid--4" style="margin-top:40px">${timeline}</div>
    <div data-reveal class="asp-split" style="margin-top:56px;background:var(--bg-soft);border:1px solid var(--line);border-radius:var(--r-xl);padding:28px">
      <div>
        <span class="asp-eyebrow">${t.sec.eyebrow}</span>
        <h3 style="font-size:clamp(22px,3vw,28px);font-weight:800;margin:12px 0 10px">${t.sec.title}</h3>
        <p style="font-size:16px;color:var(--ink-3)">${t.sec.desc}</p>
      </div>
      <div class="asp-mini-grid">${secCards}</div>
    </div>
  </div>
</section>

<section id="stories" data-screen-label="Stories" class="asp-section asp-section--soft">
  <div class="asp-wrap">
    ${secHead(t.story.eyebrow, t.story.title)}
    <div data-reveal class="asp-grid asp-grid--3" style="gap:18px;margin-top:40px">${stories}</div>
  </div>
</section>

<section id="faq" data-screen-label="FAQ" class="asp-section">
  <div class="asp-wrap" style="max-width:880px">
    ${secHead(t.faq.eyebrow, t.faq.title, undefined, true)}
    <div data-reveal style="margin-top:40px;display:flex;flex-direction:column;gap:10px">${faq}</div>
  </div>
</section>

<section id="contact" data-screen-label="Contact" class="asp-section asp-section--soft">
  <div class="asp-wrap">
    <div class="asp-split asp-split--start">
      <div data-reveal>
        <span class="asp-eyebrow">${t.contact.eyebrow}</span>
        <h2 class="asp-h2">${t.contact.title}</h2>
        <p class="asp-sub">${t.contact.sub}</p>
        <div style="display:flex;flex-direction:column;gap:14px;margin-top:28px">
          <a href="tel:${c.phoneHref}" class="asp-contact-item">
            <span class="asp-chip asp-chip--sm">${svgIcon('M6 4h3l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v3a2 2 0 01-2 2A16 16 0 014 6a2 2 0 012-2z', 18)}</span>
            <div><i>${t.contact.phoneLabel}</i><b style="font-weight:700">${c.phone}</b></div>
          </a>
          <div class="asp-form-row">
            <a href="mailto:${c.email}" class="asp-contact-item">
              <span class="asp-chip asp-chip--sm">${svgIcon('M4 6h16v12H4zM4 7l8 6 8-6', 17)}</span>
              <div><i>${t.contact.emailLabel}</i><b style="font-weight:600">${c.email}</b></div>
            </a>
            ${primarySocial ? `<a href="${primarySocial.url}" target="_blank" rel="noopener" class="asp-contact-item">
              <span class="asp-chip asp-chip--sm" style="background:rgba(14,165,233,.12)">${svgIcon(iconFor(primarySocial.name), 17, 'var(--accent)')}</span>
              <div><i>${primarySocial.name}</i><b style="font-weight:600">${primarySocial.url.replace(/^https?:\/\//, '')}</b></div>
            </a>` : ''}
          </div>
          <div class="asp-map">${mapHtml}</div>
        </div>
      </div>
      <form data-reveal data-asp-lead-form onsubmit="return false" class="asp-form">
        <h3 style="font-size:22px;font-weight:800;margin-bottom:6px">${t.contact.formTitle}</h3>
        <p style="font-size:14px;color:var(--ink-3);margin-bottom:20px">${t.contact.formNote}</p>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="asp-form-row">
            <div><label for="lead-name" class="asp-label">${t.contact.name}</label><input id="lead-name" data-lead="name" placeholder="${t.contact.namePh}" class="asp-input" autocomplete="name"></div>
            <div><label for="lead-phone" class="asp-label">${t.contact.phoneL}</label><input id="lead-phone" data-lead="phone" placeholder="${t.contact.phonePh}" class="asp-input" autocomplete="tel" inputmode="tel"></div>
          </div>
          <div><label for="lead-email" class="asp-label">${t.contact.emailLabel}</label><input id="lead-email" data-lead="email" type="email" placeholder="${t.contact.emailPh}" class="asp-input" autocomplete="email"></div>
          <div><label for="lead-company" class="asp-label">${t.contact.company}</label><input id="lead-company" data-lead="company" placeholder="${t.contact.companyPh}" class="asp-input" autocomplete="organization"></div>
          <div class="asp-form-row">
            <div><label for="lead-stores" class="asp-label">${t.contact.storesL}</label><select id="lead-stores" data-lead="stores_range" class="asp-select">${t.contact.storeOpts.map((o) => `<option>${o}</option>`).join('')}</select></div>
            <div><label for="lead-source" class="asp-label">${t.contact.sourceL}</label><select id="lead-source" data-lead="source" class="asp-select"><option value="">—</option>${t.contact.sourceOpts.map((o, i) => `<option value="${LANDING_SOURCE_CODES[i] ?? ''}">${o.l}</option>`).join('')}</select></div>
          </div>
          <button data-asp-lead-submit class="asp-btn asp-btn--primary asp-btn--lg" style="margin-top:6px;width:100%">${t.contact.submit}</button>
          <p data-lead-status style="font-size:13px;text-align:center;min-height:18px;margin:0" role="status" aria-live="polite"></p>
          <p style="font-size:12px;color:var(--ink-4);text-align:center">${t.contact.privacy}</p>
        </div>
      </form>
    </div>
  </div>
</section>

<section data-screen-label="Payments" style="padding:48px 0;background:var(--bg-soft);border-top:1px solid var(--line);border-bottom:1px solid var(--line);overflow:hidden">
  <div data-reveal class="asp-wrap" style="margin-bottom:26px;text-align:center"><span style="font-size:12.5px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:var(--ink-4)">${t.footer.payTitle}</span></div>
  <div class="asp-pay-mask">
    <div class="asp-pay-track">
      <div class="asp-pay-group">${payments}</div>
      <div class="asp-pay-group" aria-hidden="true">${payments}</div>
    </div>
  </div>
</section>

<footer class="asp-footer">
  <div class="asp-wrap">
    <div class="asp-footer-grid">
      <div class="asp-footer-col">
        <div style="display:flex;align-items:center"><img src="/images/logo-dark.png" alt="Zumex" width="56" height="56" decoding="async" style="height:56px;width:auto;display:block"></div>
        <p style="font-size:14px;margin-top:14px;max-width:300px;line-height:1.6">${t.footer.tagline}</p>
        ${socialLinks ? `<div style="display:flex;gap:10px;margin-top:18px">${socialLinks}</div>` : ''}
      </div>
      <div class="asp-footer-col"><b>${t.footer.product}</b><nav aria-label="${t.footer.product}"><a href="#features">${t.footer.productLinks[0]}</a><a href="#product">${t.footer.productLinks[1]}</a><a href="#pricing">${t.footer.productLinks[2]}</a><a href="#">${t.footer.productLinks[3]}</a></nav></div>
      <div class="asp-footer-col"><b>${t.footer.industries}</b><nav aria-label="${t.footer.industries}">${t.footer.industryLinks.map((x) => `<a href="#industries">${x}</a>`).join('')}</nav></div>
      <div class="asp-footer-col"><b>${t.footer.company}</b><nav aria-label="${t.footer.company}"><a href="#stories">${t.footer.companyLinks[0]}</a><a href="#contact">${t.footer.companyLinks[1]}</a><a href="#">${t.footer.companyLinks[2]}</a><a href="#">${t.footer.companyLinks[3]}</a></nav></div>
    </div>
    <div class="asp-footer-bottom">
      <span>${t.footer.rights}</span>
      <div style="display:flex;gap:22px;flex-wrap:wrap"><a href="/privacy">${t.footer.privacy}</a><a href="/terms">${t.footer.terms}</a><a href="/refunds">${t.footer.refund}</a></div>
    </div>
  </div>
</footer>
`
}
