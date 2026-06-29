// Builds the full landing markup (inner HTML of #asp-root) from a translation
// dictionary and the API-driven pricing cards. Rendered via dangerouslySetInnerHTML
// and animated by aspScript.ts.
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
const check = (c = 'var(--green)') => `<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const iconFor = (name: string) => {
  const k = (name || '').toLowerCase()
  const hit = Object.keys(SOCIAL_ICONS).find((key) => k.includes(key))
  return hit ? SOCIAL_ICONS[hit] : GENERIC_SOCIAL
}

// Lead manba kodlari (i18n sourceOpts tartibiga mos). Bu kodlar backendga
// yuboriladi — cyrl transliteratsiyasidan himoyalanishi uchun shu yerda saqlanadi.
const LANDING_SOURCE_CODES = ['instagram', 'telegram', 'facebook', 'youtube', 'google', 'referral', 'website', 'other'] as const

export function buildAspMarkup(t: AspDict, plansHtml: string, cfg: LandingCfg, lang: LandingLang): string {
  const sect = 'scroll-margin-top:84px'
  const demo = buildDemo(lang)
  const c = cfg
  const socials = Array.isArray(cfg.socials) ? cfg.socials.filter((s) => s && s.url) : []
  const primarySocial = socials.find((s) => /telegram/i.test(s.name)) || socials[0] || null
  const socialLinks = socials
    .map((s) => `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}" title="${s.name}" style="width:36px;height:36px;border-radius:9px;border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="${iconFor(s.name)}" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`)
    .join('')
  // Xarita: koordinata bo'lsa Yandex map-widget iframe; bo'lmasa — placeholder.
  const mapHtml = c.location
    ? `<iframe data-asp-map data-lat="${c.location.lat}" data-lng="${c.location.lng}" src="https://yandex.uz/map-widget/v1/?ll=${c.location.lng}%2C${c.location.lat}&z=16&pt=${c.location.lng},${c.location.lat},pm2rdm" width="100%" height="100%" frameborder="0" allowfullscreen="true" title="${c.address || t.contact.title}" style="border:0;position:absolute;inset:0" loading="lazy"></iframe>`
    : `<div style="position:absolute;inset:0;opacity:.5;background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:28px 28px"></div><div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-100%);color:var(--primary)"><svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" stroke="var(--primary)" stroke-width="1.8" fill="var(--primary-soft)"/><circle cx="12" cy="10" r="2.5" fill="var(--primary)"/></svg></div><span style="position:absolute;bottom:10px;left:12px;font-size:12px;color:var(--ink-3);background:var(--card);padding:3px 8px;border-radius:6px;border:1px solid var(--line)">${c.address}</span>`

  const challengeCards = t.ch.cards.map((c) => `
    <div style="background:var(--card);border:1px solid var(--line);border-radius:16px;padding:22px;box-shadow:var(--shadow-sm)"><div style="display:flex;align-items:center;gap:10px"><span style="width:9px;height:9px;border-radius:50%;background:var(--red)"></span><h3 style="font-size:16px;font-weight:700">${c.p}</h3></div><div style="display:flex;align-items:center;gap:7px;margin-top:14px;padding-top:12px;border-top:1px solid var(--line);font-size:13px;color:var(--green);font-weight:600">${check()}${c.fix}</div></div>`).join('')

  const featCards = t.feat.items.map((f, i) => `
    <div style="background:var(--card);border:1px solid var(--line);border-radius:16px;padding:24px;box-shadow:var(--shadow-sm);transition:transform .25s,box-shadow .25s,border-color .25s" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='var(--shadow)';this.style.borderColor='var(--primary)'" onmouseout="this.style.transform='none';this.style.boxShadow='var(--shadow-sm)';this.style.borderColor='var(--line)'">
      <span style="display:inline-flex;width:46px;height:46px;border-radius:12px;background:var(--primary-soft);align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="${FEAT_ICONS[i]}" stroke="var(--primary)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      <h3 style="font-size:18px;font-weight:700;margin:16px 0 7px">${f.title}</h3>
      <p style="font-size:14.5px;color:var(--ink-3);line-height:1.5">${f.desc}</p>
    </div>`).join('')

  const indCards = t.ind.items.map((label, i) => `
    <div style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;display:flex;align-items:center;gap:13px;box-shadow:var(--shadow-sm)">
      <span style="display:inline-flex;width:40px;height:40px;border-radius:10px;background:var(--primary-soft);align-items:center;justify-content:center;flex-shrink:0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="${IND_ICONS[i]}" stroke="var(--primary)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      <span style="font-weight:600;font-size:15px;color:var(--ink)">${label}</span>
    </div>`).join('')

  const bars = [42, 55, 48, 63, 71, 66, 78, 84, 79, 92, 88, 100].map((v, i, a) => `
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end">
      <div style="width:100%;height:${v}%;background:${i === a.length - 1 ? 'linear-gradient(var(--primary),#0ea5e9)' : 'var(--primary-soft)'};border:1px solid ${i === a.length - 1 ? 'transparent' : 'var(--primary)'};border-radius:6px 6px 3px 3px;transform-origin:bottom;animation:growbar .8s ${i * 0.05}s both cubic-bezier(.16,1,.3,1)"></div>
      <span style="font-size:11px;color:var(--ink-4)">${i + 1}</span>
    </div>`).join('')

  const donutColors = ['var(--primary)', '#0ea5e9', 'var(--green)', '#fbbf24']
  const storeLegend = t.ceo.stores.map((s, i) => `<div style="display:flex;align-items:center;gap:8px"><span style="width:10px;height:10px;border-radius:3px;background:${donutColors[i]}"></span>${s.label} · ${s.pct}</div>`).join('')
  const topRows = t.ceo.top.map((p) => `<div style="display:flex;align-items:center;gap:12px"><span style="font-size:13px;width:120px">${p.name}</span><div style="flex:1;height:8px;background:var(--line);border-radius:5px;overflow:hidden"><div style="width:${p.pct}%;height:100%;background:var(--primary);border-radius:5px"></div></div><span style="font-size:12.5px;font-weight:600;color:var(--ink)">${p.val}</span></div>`).join('')
  const attBg = ['rgba(225,29,72,.12)', 'rgba(217,119,6,.13)', 'var(--green-soft)']
  const attColor = ['var(--red)', 'var(--amber)', 'var(--green)']
  const attIcons = ['!', '$', '▲']
  const attRows = t.ceo.att.map((a, i) => `<div style="display:flex;align-items:center;gap:11px;padding:11px;background:var(--card);border:1px solid var(--line);border-radius:10px"><span style="width:30px;height:30px;border-radius:8px;background:${attBg[i]};color:${attColor[i]};display:flex;align-items:center;justify-content:center;font-weight:700">${attIcons[i]}</span><div style="font-size:13.5px">${a}</div></div>`).join('')

  const aiItems = t.ai.items.map((it, i) => `<div style="display:flex;gap:11px;align-items:flex-start"><span style="width:34px;height:34px;border-radius:9px;background:var(--card);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="${AI_ICONS[i]}" stroke="var(--primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div><div style="font-weight:700;font-size:15px;color:var(--ink)">${it.title}</div><div style="font-size:13px;color:var(--ink-3)">${it.desc}</div></div></div>`).join('')
  const aiInsightBg = ['var(--green-soft)', 'rgba(225,29,72,.08)', 'var(--primary-soft)']
  const aiInsightMark = ['<span style="color:var(--green);font-weight:700">▲</span>', '<span style="color:var(--red);font-weight:700">!</span>', '<span style="color:var(--primary);font-weight:700">◆</span>']
  const aiInsights = t.ai.insights.map((ins, i) => `<div style="display:flex;gap:10px;align-items:flex-start;padding:11px;background:${aiInsightBg[i]};border-radius:10px">${aiInsightMark[i]}<div style="font-size:13px;color:var(--ink-2)">${ins}</div></div>`).join('')

  const benStats = t.ben.stats.map((s) => `<div style="border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:24px;background:rgba(255,255,255,.03)"><div style="font-family:'Manrope';font-weight:800;font-size:38px;color:#fff">${s.v}</div><div style="font-size:15px;margin-top:6px">${s.l}</div></div>`).join('')
  const benChecks = t.ben.checks.map((c) => `<div style="display:flex;gap:11px;align-items:center;font-size:15px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#60a5fa" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>${c}</div>`).join('')

  const numCards = t.num.items.map((n) => `<div style="padding:22px 10px;border:1px solid var(--line);border-radius:16px;background:var(--card);box-shadow:var(--shadow-sm)"><div style="font-family:'Manrope';font-weight:800;font-size:30px;color:var(--ink)">${n.v}</div><div style="font-size:13px;color:var(--ink-3);margin-top:3px">${n.l}</div></div>`).join('')

  const yes = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="var(--green-soft)"/><path d="M8 12.5l2.5 2.5L16 9" stroke="var(--green)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  const no = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="var(--bg-soft2)"/><path d="M9 9l6 6M15 9l-6 6" stroke="var(--ink-4)" stroke-width="2" stroke-linecap="round"/></svg>`
  const cmpCell = 'display:flex;align-items:center;justify-content:center;padding:16px 10px;border-bottom:1px solid var(--line)'
  let cmp = `<div style="min-width:680px;display:grid;grid-template-columns:1.6fr repeat(4,1fr);background:var(--card);border:1px solid var(--line);border-radius:20px;box-shadow:var(--shadow);overflow:hidden">`
  cmp += `<div style="padding:18px;font-size:13px;font-weight:600;color:var(--ink-3);border-bottom:1px solid var(--line)">${t.cmp.feature}</div>`
  t.cmp.cols.forEach((c) => (cmp += `<div style="${cmpCell};font-size:13px;font-weight:600;color:var(--ink-3)">${c}</div>`))
  cmp += `<div style="${cmpCell};background:var(--primary);color:#fff;font-weight:800;font-size:13.5px;font-family:'Manrope'">Zumex</div>`
  t.cmp.rows.forEach((r, i) => {
    const last = i === t.cmp.rows.length - 1
    cmp += `<div style="display:flex;align-items:center;padding:16px 18px;font-size:14.5px;font-weight:600;color:var(--ink);border-bottom:${last ? '0' : '1px solid var(--line)'}">${r.label}</div>`
    r.vals.forEach((v) => (cmp += `<div style="${cmpCell};${last ? 'border-bottom:0' : ''}">${v ? yes : no}</div>`))
    cmp += `<div style="${cmpCell};${last ? 'border-bottom:0' : ''};background:var(--primary-soft)">${yes}</div>`
  })
  cmp += `</div>`

  const timeline = t.impl.steps.map((s, i) => `
    <div style="position:relative;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:22px;box-shadow:var(--shadow-sm)">
      <div style="width:34px;height:34px;border-radius:10px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Manrope';font-weight:800;font-size:14px">${i + 1}</div>
      <h3 style="font-size:16.5px;font-weight:700;margin:13px 0 6px">${s.t}</h3>
      <p style="font-size:13.5px;color:var(--ink-3);line-height:1.5">${s.d}</p>
    </div>`).join('')

  const secCards = t.sec.items.map((label, i) => `<div style="background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="${SEC_ICONS[i]}" stroke="var(--primary)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><div style="font-weight:700;margin-top:10px">${label}</div></div>`).join('')

  const storyGrad = ['linear-gradient(135deg,var(--primary),#0ea5e9)', 'linear-gradient(135deg,#0ea5e9,var(--green))', 'linear-gradient(135deg,#6366f1,var(--primary))']
  const stories = t.story.items.map((s, i) => `
    <div style="background:var(--card);border:1px solid var(--line);border-radius:20px;padding:28px;box-shadow:var(--shadow-sm)">
      <div style="display:flex;gap:3px;color:#fbbf24">★★★★★</div>
      <p style="font-size:16px;color:var(--ink);margin:14px 0 18px;line-height:1.5">${s.quote}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px">${s.m.map((mm) => `<div style="background:var(--bg-soft);border-radius:10px;padding:12px"><div style="font-size:12px;color:var(--ink-3)">${mm.l}</div><div style="font-weight:800;font-family:'Manrope';color:var(--green)">${mm.v}</div></div>`).join('')}</div>
      <div style="display:flex;align-items:center;gap:11px"><span style="width:42px;height:42px;border-radius:50%;background:${storyGrad[i]};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-family:'Manrope'">${s.initials}</span><div><div style="font-weight:700;font-size:14px">${s.name}</div><div style="font-size:12.5px;color:var(--ink-3)">${s.role}</div></div></div>
    </div>`).join('')

  const faq = t.faq.items.map((qa) => `
    <div style="background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;box-shadow:var(--shadow-sm)">
      <button data-faq style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;text-align:left;border:0;background:transparent;padding:18px 22px;cursor:pointer;font-family:inherit">
        <span style="font-weight:600;font-size:16px;color:var(--ink)">${qa.q}</span>
        <span class="faq-ic" style="flex-shrink:0;color:var(--primary);transition:transform .3s;font-size:22px;font-weight:300;line-height:1">+</span>
      </button>
      <div style="max-height:0;opacity:0;overflow:hidden;transition:max-height .35s ease,opacity .3s ease"><p style="padding:0 22px 20px;font-size:15px;color:var(--ink-3);line-height:1.6">${qa.a}</p></div>
    </div>`).join('')

  const navLink = (id: string, label: string) => `<a href="#${id}">${label}</a>`
  const langOpt = (code: string, label: string) => `<option value="${code}">${label}</option>`
  const langSelect = () => `<select data-lang-select aria-label="Til" style="appearance:none;-webkit-appearance:none;border:1px solid var(--line);background:var(--bg-soft2);color:var(--ink-2);padding:8px 30px 8px 12px;border-radius:9px;cursor:pointer;font-family:inherit;font-size:13.5px;font-weight:600;background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2394a3b8%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>');background-repeat:no-repeat;background-position:right 10px center">${langOpt('uz', "O'zbekcha")}${langOpt('cyrl', 'Ўзбекча')}${langOpt('ru', 'Русский')}${langOpt('en', 'English')}</select>`

  // To'lov usullari — oq kartochkalar (logo strip)
  const payBadge = (inner: string) => `<span style="flex:0 0 auto;height:50px;min-width:118px;display:inline-flex;align-items:center;justify-content:center;padding:0 24px;background:var(--card);border:1px solid var(--line);border-radius:13px;box-shadow:var(--shadow-sm);font-family:'Manrope';font-weight:800;font-size:17px;line-height:1;letter-spacing:.01em">${inner}</span>`
  const mcLogo = `<span style="display:inline-flex;align-items:center"><span style="width:19px;height:19px;border-radius:50%;background:#eb001b"></span><span style="width:19px;height:19px;border-radius:50%;background:#ff9e0f;margin-left:-8px;mix-blend-mode:multiply"></span></span>`
  const payments = [
    payBadge('<span style="color:#0e7490">Payme</span>'),
    payBadge('<span style="color:#0369a1">Click</span>'),
    payBadge('<span style="color:#1d4ed8">Uzcard</span>'),
    payBadge('<span style="color:#0f766e">Humo</span>'),
    payBadge('<span style="color:#1a1f71;font-style:italic;font-size:18px;letter-spacing:.04em">VISA</span>'),
    payBadge(mcLogo),
  ].join('')

  return `
<div aria-hidden="true" style="position:fixed;inset:0;z-index:-1;background:var(--bg);transition:background .45s ease"></div>

<header style="position:sticky;top:0;z-index:90;backdrop-filter:saturate(180%) blur(18px);background:var(--glass);border-bottom:1px solid var(--line)">
  <nav style="max-width:1240px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;gap:28px">
    <a href="#top" aria-label="Zumex" style="display:flex;align-items:center">
      <img class="asp-logo asp-logo-light" src="/images/logo-light.png" alt="Zumex" width="52" height="52" fetchpriority="high" decoding="async" style="height:52px;width:auto">
      <img class="asp-logo asp-logo-dark" src="/images/logo-dark.png" alt="Zumex" width="52" height="52" decoding="async" style="height:52px;width:auto">
    </a>
    <div class="hide-mob" style="display:flex;align-items:center;gap:26px;font-size:15px;font-weight:500;color:var(--ink-2)">
      ${navLink('features', t.nav.features)}${navLink('product', t.nav.product)}${navLink('industries', t.nav.industries)}${navLink('pricing', t.nav.pricing)}${navLink('stories', t.nav.stories)}${navLink('faq', t.nav.faq)}
    </div>
    <div style="margin-left:auto;display:flex;align-items:center;gap:10px">
      ${langSelect()}
      <button data-action="theme" aria-label="Theme" style="width:38px;height:38px;border:1px solid var(--line);background:var(--card);border-radius:9px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--ink-2)">
        <svg id="ic-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" style="display:block"><path d="M21 12.8A8.5 8.5 0 1111.2 3a6.5 6.5 0 009.8 9.8z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
        <svg id="ic-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" style="display:none"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
      </button>
      <a href="#" data-asp-login class="hide-mob" style="font-size:14.5px;font-weight:600;color:var(--ink-2);padding:8px 6px">${t.nav.login}</a>
      <a href="#" data-asp-register style="background:var(--primary);color:#fff;padding:10px 18px;border-radius:9px;font-weight:600;font-size:14.5px;box-shadow:0 8px 20px -8px var(--primary)">${t.nav.cta}</a>
    </div>
  </nav>
</header>

<a id="top"></a>
<section data-screen-label="Hero" style="position:relative;padding:88px 24px 70px;overflow:hidden">
  <div style="position:absolute;inset:0;z-index:0;background:radial-gradient(900px 460px at 78% -8%,var(--primary-soft),transparent 60%),radial-gradient(700px 420px at 8% 12%,rgba(14,165,233,.10),transparent 55%)"></div>
  <div style="position:relative;z-index:1;max-width:1240px;margin:0 auto;display:grid;grid-template-columns:1.05fr 1fr;gap:54px;align-items:center">
    <div>
      <span data-reveal style="display:inline-flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow-sm);padding:7px 14px;border-radius:100px;font-size:13.5px;font-weight:600;color:var(--ink-2)"><span style="width:7px;height:7px;border-radius:50%;background:var(--green);animation:pulseDot 1.8s infinite"></span><span>${t.hero.eyebrow}</span></span>
      <h1 data-reveal style="font-size:clamp(38px,5vw,62px);font-weight:800;color:var(--ink);margin:20px 0 0;letter-spacing:-.035em;white-space:pre-line">${t.hero.h1}</h1>
      <p data-reveal style="font-size:19px;color:var(--ink-3);margin:22px 0 0;max-width:540px;line-height:1.55">${t.hero.sub}</p>
      <div data-reveal style="display:flex;flex-wrap:wrap;gap:12px;margin-top:30px">
        <a href="#" data-asp-register style="background:var(--primary);color:#fff;padding:14px 24px;border-radius:11px;font-weight:600;font-size:16px;box-shadow:0 14px 30px -10px var(--primary);display:inline-flex;align-items:center;gap:9px">${t.hero.ctaDemo} <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
        <a href="#product" style="background:var(--card);color:var(--ink);padding:14px 22px;border-radius:11px;font-weight:600;font-size:16px;border:1px solid var(--line);box-shadow:var(--shadow-sm);display:inline-flex;align-items:center;gap:9px"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M10 9l5 3-5 3V9z" fill="currentColor"/></svg> ${t.hero.ctaWatch}</a>
        <a href="#roi" style="background:transparent;color:var(--primary);padding:14px 18px;border-radius:11px;font-weight:600;font-size:16px;display:inline-flex;align-items:center;gap:8px"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M9 7h6M9 11h6M9 15h3M6 3h12v18H6z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>${t.hero.ctaRoi}</a>
      </div>
      <div data-reveal style="display:flex;gap:30px;margin-top:38px;flex-wrap:wrap">
        <div><div style="font-family:'Manrope';font-weight:800;font-size:26px;color:var(--ink)"><span data-count="37" data-suffix="%" data-prefix="+">+37%</span></div><div style="font-size:13.5px;color:var(--ink-3)">${t.hero.s1}</div></div>
        <div style="width:1px;background:var(--line)"></div>
        <div><div style="font-family:'Manrope';font-weight:800;font-size:26px;color:var(--ink)"><span data-count="99.8" data-suffix="%">99.8%</span></div><div style="font-size:13.5px;color:var(--ink-3)">${t.hero.s2}</div></div>
        <div style="width:1px;background:var(--line)"></div>
        <div><div style="font-family:'Manrope';font-weight:800;font-size:26px;color:var(--ink)"><span>12</span></div><div style="font-size:13.5px;color:var(--ink-3)">${t.hero.s3}</div></div>
      </div>
    </div>
    <div data-reveal style="position:relative">
      <div aria-hidden="true" style="position:absolute;inset:-34px;z-index:0;background:radial-gradient(58% 52% at 72% 26%,var(--primary-soft),transparent 70%),radial-gradient(46% 46% at 18% 88%,rgba(14,165,233,.12),transparent 72%);filter:blur(6px);pointer-events:none"></div>
      <div style="position:relative;z-index:2;background:var(--card);border:1px solid var(--line);border-radius:20px;box-shadow:var(--shadow-lg);overflow:hidden">
        <div style="display:flex;align-items:center;gap:8px;padding:13px 16px;border-bottom:1px solid var(--line);background:var(--bg-soft)">
          <span style="width:11px;height:11px;border-radius:50%;background:#fb7185"></span><span style="width:11px;height:11px;border-radius:50%;background:#fbbf24"></span><span style="width:11px;height:11px;border-radius:50%;background:#34d399"></span>
          <span style="margin-left:10px;font-size:12.5px;color:var(--ink-3);font-weight:500">${t.dash.caption}</span>
          <span style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-size:11.5px;color:var(--green);font-weight:600"><span style="width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulseDot 1.6s infinite"></span>${t.dash.live}</span>
        </div>
        <div style="padding:18px">
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:14px">
            <div><div style="font-size:12px;color:var(--ink-3);font-weight:500">${t.dash.revenueToday}</div><div style="font-family:'Manrope';font-weight:800;font-size:30px;color:var(--ink);letter-spacing:-.02em">184 920 000</div></div>
            <div style="text-align:right"><span style="display:inline-flex;align-items:center;gap:4px;background:var(--green-soft);color:var(--green);font-weight:700;font-size:12.5px;padding:4px 9px;border-radius:7px">▲ 18.4%</span><div style="font-size:11.5px;color:var(--ink-4);margin-top:5px">${t.dash.vsYesterday}</div></div>
          </div>
          <svg viewBox="0 0 520 170" style="width:100%;height:auto;display:block">
            <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--primary)" stop-opacity=".28"/><stop offset="1" stop-color="var(--primary)" stop-opacity="0"/></linearGradient></defs>
            <path d="M0,130 C40,122 64,96 104,98 C150,100 168,66 210,72 C252,78 270,44 312,40 C356,36 376,70 420,46 C456,28 486,22 520,14 L520,170 L0,170 Z" fill="url(#hg)"/>
            <path d="M0,130 C40,122 64,96 104,98 C150,100 168,66 210,72 C252,78 270,44 312,40 C356,36 376,70 420,46 C456,28 486,22 520,14" fill="none" stroke="var(--primary)" stroke-width="2.6" stroke-linecap="round"/>
            <circle cx="520" cy="14" r="4.5" fill="var(--primary)"/><circle cx="520" cy="14" r="8" fill="var(--primary)" opacity=".25"/>
          </svg>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px">
            <div style="background:var(--bg-soft);border:1px solid var(--line);border-radius:11px;padding:11px"><div style="font-size:11px;color:var(--ink-3)">${t.dash.orders}</div><div style="font-family:'Manrope';font-weight:700;font-size:18px;color:var(--ink)">1 284</div></div>
            <div style="background:var(--bg-soft);border:1px solid var(--line);border-radius:11px;padding:11px"><div style="font-size:11px;color:var(--ink-3)">${t.dash.profit}</div><div style="font-family:'Manrope';font-weight:700;font-size:18px;color:var(--green)">61.2M</div></div>
            <div style="background:var(--bg-soft);border:1px solid var(--line);border-radius:11px;padding:11px"><div style="font-size:11px;color:var(--ink-3)">${t.dash.stock}</div><div style="font-family:'Manrope';font-weight:700;font-size:18px;color:var(--ink)">8 940</div></div>
          </div>
        </div>
      </div>
      <div class="hide-mob" style="position:absolute;z-index:3;top:-26px;right:-26px;background:var(--glass);backdrop-filter:saturate(180%) blur(12px);border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow-lg);padding:12px 15px;animation:floatA 5s ease-in-out infinite"><div style="font-size:11px;color:var(--ink-3)">${t.dash.clients}</div><div style="font-family:'Manrope';font-weight:800;font-size:20px;color:var(--ink)">12 480</div><div style="font-size:11px;color:var(--green);font-weight:600">${t.dash.clientsGrow}</div></div>
      <div class="hide-mob" style="position:absolute;z-index:3;bottom:44px;left:-40px;background:var(--glass);backdrop-filter:saturate(180%) blur(12px);border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow-lg);padding:12px 15px;animation:floatB 6s ease-in-out infinite"><div style="display:flex;align-items:center;gap:8px"><span style="width:30px;height:30px;border-radius:8px;background:var(--green-soft);display:flex;align-items:center;justify-content:center"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="var(--green)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div><div style="font-size:11px;color:var(--ink-3)">${t.dash.expensesCtl}</div><div style="font-family:'Manrope';font-weight:700;font-size:14px;color:var(--ink)">${t.dash.expensesVal}</div></div></div></div>
      <div class="hide-mob" style="position:absolute;z-index:3;bottom:-26px;right:-22px;display:flex;align-items:center;gap:11px;background:linear-gradient(135deg,var(--primary),#0ea5e9);color:#fff;border-radius:14px;box-shadow:0 18px 38px -14px var(--primary);padding:12px 16px;animation:floatA 7s ease-in-out infinite"><span style="width:34px;height:34px;flex-shrink:0;border-radius:9px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div><div style="font-size:11px;opacity:.9">${t.dash.stockRt}</div><div style="font-family:'Manrope';font-weight:800;font-size:18px">${t.dash.stockAcc}</div></div></div>
    </div>
  </div>
</section>

<section style="padding:18px 24px 64px">
  <div style="max-width:1240px;margin:0 auto">
    <p data-reveal style="text-align:center;font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-4)">${t.trust.kicker}</p>
    <div data-reveal style="overflow:hidden;margin:26px 0 40px;-webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)">
      <div style="display:flex;gap:54px;width:max-content;animation:marquee 26s linear infinite;align-items:center;opacity:.85">
        ${['AutoMax', 'DETALI.uz', 'ProTyre', 'MotorHub', 'OilCity', 'AvtoSet', 'CarParts+', 'AutoMax', 'DETALI.uz', 'ProTyre', 'MotorHub', 'OilCity', 'AvtoSet', 'CarParts+'].map((n) => `<span style="font-family:'Manrope';font-weight:800;font-size:23px;color:var(--ink-3);letter-spacing:-.02em">${n}</span>`).join('')}
      </div>
    </div>
    <div data-reveal style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px">
      <div style="text-align:center;padding:22px 12px;background:var(--card);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow-sm)"><div style="font-family:'Manrope';font-weight:800;font-size:30px;color:var(--ink)"><span data-count="99.9" data-suffix="%">99.9%</span></div><div style="font-size:13px;color:var(--ink-3);margin-top:3px">${t.trust.uptime}</div></div>
      <div style="text-align:center;padding:22px 12px;background:var(--card);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow-sm)"><div style="font-family:'Manrope';font-weight:800;font-size:30px;color:var(--ink)"><span data-count="500" data-suffix="+">500+</span></div><div style="font-size:13px;color:var(--ink-3);margin-top:3px">${t.trust.stores}</div></div>
      <div style="text-align:center;padding:22px 12px;background:var(--card);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow-sm)"><div style="font-family:'Manrope';font-weight:800;font-size:30px;color:var(--ink)">4.9<span style="font-size:18px;color:var(--ink-3)">/5</span></div><div style="font-size:13px;color:var(--ink-3);margin-top:3px">${t.trust.csat}</div></div>
      <div style="text-align:center;padding:22px 12px;background:var(--card);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow-sm)"><div style="font-family:'Manrope';font-weight:800;font-size:30px;color:var(--ink)"><span data-count="98" data-suffix="%">98%</span></div><div style="font-size:13px;color:var(--ink-3);margin-top:3px">${t.trust.impl}</div></div>
      <div style="text-align:center;padding:22px 12px;background:var(--card);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow-sm)"><div style="font-family:'Manrope';font-weight:800;font-size:30px;color:var(--ink)">24/7</div><div style="font-size:13px;color:var(--ink-3);margin-top:3px">${t.trust.support}</div></div>
    </div>
  </div>
</section>

<section style="padding:96px 24px;background:var(--bg-soft);${sect}">
  <div style="max-width:1240px;margin:0 auto">
    <div data-reveal style="max-width:720px">
      <span style="font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--primary)">${t.ch.eyebrow}</span>
      <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;margin:14px 0 0">${t.ch.title}</h2>
      <p style="font-size:18px;color:var(--ink-3);margin-top:14px">${t.ch.sub}</p>
    </div>
    <div data-reveal style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:42px">${challengeCards}</div>
  </div>
</section>

<section style="padding:96px 24px">
  <div style="max-width:1240px;margin:0 auto">
    <div data-reveal style="text-align:center;max-width:720px;margin:0 auto">
      <span style="font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--primary)">${t.erp.eyebrow}</span>
      <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;margin:14px 0 0">${t.erp.title}</h2>
      <p style="font-size:18px;color:var(--ink-3);margin-top:14px">${t.erp.sub}</p>
    </div>
    <div data-reveal style="display:grid;grid-template-columns:1fr auto 1fr;gap:24px;align-items:center;margin-top:48px">
      <div style="background:var(--card);border:1px solid var(--line);border-radius:20px;padding:30px;box-shadow:var(--shadow-sm)">
        <span style="display:inline-flex;width:46px;height:46px;border-radius:12px;background:var(--primary-soft);align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7" stroke="var(--primary)" stroke-width="1.8" stroke-linejoin="round"/></svg></span>
        <h3 style="font-size:22px;font-weight:800;margin:16px 0 8px">${t.erp.erpTitle}</h3>
        <p style="font-size:15px;color:var(--ink-3)">${t.erp.erpDesc}</p>
        <ul style="list-style:none;margin-top:16px;display:flex;flex-direction:column;gap:9px;font-size:14.5px;color:var(--ink-2)">${t.erp.erpList.map((x) => `<li style="display:flex;gap:9px;align-items:center"><span style="color:var(--primary)">●</span>${x}</li>`).join('')}</ul>
      </div>
      <div class="hide-mob" style="font-family:'Manrope';font-weight:800;font-size:28px;color:var(--ink-4);display:flex;align-items:center;justify-content:center">+</div>
      <div style="background:var(--card);border:1px solid var(--line);border-radius:20px;padding:30px;box-shadow:var(--shadow-sm)">
        <span style="display:inline-flex;width:46px;height:46px;border-radius:12px;background:var(--green-soft);align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M16 14a4 4 0 10-8 0M12 3a4 4 0 100 8 4 4 0 000-8zM4 21c0-3.3 3.6-5 8-5s8 1.7 8 5" stroke="var(--green)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        <h3 style="font-size:22px;font-weight:800;margin:16px 0 8px">${t.erp.crmTitle}</h3>
        <p style="font-size:15px;color:var(--ink-3)">${t.erp.crmDesc}</p>
        <ul style="list-style:none;margin-top:16px;display:flex;flex-direction:column;gap:9px;font-size:14.5px;color:var(--ink-2)">${t.erp.crmList.map((x) => `<li style="display:flex;gap:9px;align-items:center"><span style="color:var(--green)">●</span>${x}</li>`).join('')}</ul>
      </div>
    </div>
  </div>
</section>

<section id="features" data-screen-label="Features" style="padding:96px 24px;background:var(--bg-soft);${sect}">
  <div style="max-width:1240px;margin:0 auto">
    <div data-reveal style="max-width:720px">
      <span style="font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--primary)">${t.feat.eyebrow}</span>
      <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;margin:14px 0 0">${t.feat.title}</h2>
      <p style="font-size:18px;color:var(--ink-3);margin-top:14px">${t.feat.sub}</p>
    </div>
    <div data-reveal style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:42px">${featCards}</div>
  </div>
</section>

<section id="product" data-screen-label="Product demo" style="padding:96px 24px;${sect}">
  <div style="max-width:1240px;margin:0 auto">
    <div data-reveal style="text-align:center;max-width:720px;margin:0 auto">
      <span style="font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--primary)">${t.prod.eyebrow}</span>
      <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;margin:14px 0 0">${t.prod.title}</h2>
      <p style="font-size:18px;color:var(--ink-3);margin-top:14px">${t.prod.sub}</p>
    </div>
    <div data-reveal style="margin-top:38px;background:var(--card);border:1px solid var(--line);border-radius:20px;box-shadow:var(--shadow-lg);overflow:hidden">
      <div style="display:flex;align-items:center;gap:8px;padding:13px 16px;border-bottom:1px solid var(--line);background:var(--bg-soft)">
        <span style="width:11px;height:11px;border-radius:50%;background:#fb7185"></span><span style="width:11px;height:11px;border-radius:50%;background:#fbbf24"></span><span style="width:11px;height:11px;border-radius:50%;background:#34d399"></span>
        <span style="margin-left:10px;font-size:12.5px;color:var(--ink-3)">app.zumex.uz</span>
      </div>
      <div style="display:grid;grid-template-columns:220px 1fr;min-height:480px">
        <aside class="hide-mob asp-scroll" style="border-right:1px solid var(--line);padding:14px 12px;background:var(--bg-soft);max-height:560px;overflow:auto">
          <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-4);padding:4px 10px 8px">Zumex CRM</div>
          <div id="demo-tabs" style="display:flex;flex-direction:column;gap:2px">${demo.tabs}</div>
          <div style="margin-top:18px;padding:14px;background:var(--primary-soft);border-radius:12px"><div style="font-size:12px;color:var(--primary-ink);font-weight:600">${t.prod.lowStock}</div><div style="font-family:'Manrope';font-weight:800;font-size:22px;color:var(--primary)">${t.prod.lowStockSku}</div><div style="font-size:11.5px;color:var(--ink-3)">${t.prod.lowStockNote}</div></div>
        </aside>
        <div id="demo-panels" class="asp-scroll" style="padding:22px;overflow:auto;max-height:560px">${demo.panels}</div>
      </div>
    </div>
  </div>
</section>

<section data-screen-label="CEO Dashboard" style="padding:96px 24px">
  <div style="max-width:1240px;margin:0 auto">
    <div data-reveal style="max-width:760px">
      <span style="font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--primary)">${t.ceo.eyebrow}</span>
      <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;margin:14px 0 0">${t.ceo.title}</h2>
      <p style="font-size:18px;color:var(--ink-3);margin-top:14px">${t.ceo.sub}</p>
    </div>
    <div data-reveal style="margin-top:36px;background:var(--card);border:1px solid var(--line);border-radius:22px;box-shadow:var(--shadow-lg);padding:24px">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
        <div style="background:var(--bg-soft);border:1px solid var(--line);border-radius:14px;padding:16px"><div style="font-size:12.5px;color:var(--ink-3)">${t.ceo.revMonth}</div><div style="font-family:'Manrope';font-weight:800;font-size:26px;color:var(--ink);margin-top:4px">${t.ceo.revV}</div><div style="font-size:12px;color:var(--green);font-weight:600;margin-top:4px">${t.ceo.revD}</div></div>
        <div style="background:var(--bg-soft);border:1px solid var(--line);border-radius:14px;padding:16px"><div style="font-size:12.5px;color:var(--ink-3)">${t.ceo.netProfit}</div><div style="font-family:'Manrope';font-weight:800;font-size:26px;color:var(--green);margin-top:4px">${t.ceo.netV}</div><div style="font-size:12px;color:var(--green);font-weight:600;margin-top:4px">${t.ceo.netD}</div></div>
        <div style="background:var(--bg-soft);border:1px solid var(--line);border-radius:14px;padding:16px"><div style="font-size:12.5px;color:var(--ink-3)">${t.ceo.expenses}</div><div style="font-family:'Manrope';font-weight:800;font-size:26px;color:var(--ink);margin-top:4px">${t.ceo.expV}</div><div style="font-size:12px;color:var(--red);font-weight:600;margin-top:4px">${t.ceo.expD}</div></div>
        <div style="background:var(--bg-soft);border:1px solid var(--line);border-radius:14px;padding:16px"><div style="font-size:12.5px;color:var(--ink-3)">${t.ceo.stockValue}</div><div style="font-family:'Manrope';font-weight:800;font-size:26px;color:var(--ink);margin-top:4px">${t.ceo.stockV}</div><div style="font-size:12px;color:var(--ink-3);margin-top:4px">${t.ceo.stockD}</div></div>
      </div>
      <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:14px;margin-top:14px">
        <div style="background:var(--bg-soft);border:1px solid var(--line);border-radius:14px;padding:18px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h3 style="font-size:15px;font-weight:700">${t.ceo.profitByMonth}</h3><span style="font-size:12px;color:var(--ink-3)">${t.ceo.year}</span></div>
          <div style="display:flex;align-items:flex-end;gap:10px;height:170px">${bars}</div>
        </div>
        <div style="background:var(--bg-soft);border:1px solid var(--line);border-radius:14px;padding:18px">
          <h3 style="font-size:15px;font-weight:700;margin-bottom:10px">${t.ceo.salesByStore}</h3>
          <div style="display:flex;align-items:center;gap:16px">
            <svg width="118" height="118" viewBox="0 0 140 140" style="transform:rotate(-90deg)"><circle cx="70" cy="70" r="54" fill="none" stroke="var(--line)" stroke-width="18"/><circle cx="70" cy="70" r="54" fill="none" stroke="var(--primary)" stroke-width="18" stroke-dasharray="135.7 339.3" stroke-dashoffset="0"/><circle cx="70" cy="70" r="54" fill="none" stroke="#0ea5e9" stroke-width="18" stroke-dasharray="84.8 339.3" stroke-dashoffset="-135.7"/><circle cx="70" cy="70" r="54" fill="none" stroke="var(--green)" stroke-width="18" stroke-dasharray="67.9 339.3" stroke-dashoffset="-220.5"/><circle cx="70" cy="70" r="54" fill="none" stroke="#fbbf24" stroke-width="18" stroke-dasharray="50.9 339.3" stroke-dashoffset="-288.4"/></svg>
            <div style="display:flex;flex-direction:column;gap:8px;font-size:13px">${storeLegend}</div>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px">
        <div style="background:var(--bg-soft);border:1px solid var(--line);border-radius:14px;padding:18px"><h3 style="font-size:15px;font-weight:700;margin-bottom:12px">${t.ceo.topProducts}</h3><div style="display:flex;flex-direction:column;gap:11px">${topRows}</div></div>
        <div style="background:var(--bg-soft);border:1px solid var(--line);border-radius:14px;padding:18px"><h3 style="font-size:15px;font-weight:700;margin-bottom:12px">${t.ceo.attention}</h3><div style="display:flex;flex-direction:column;gap:10px">${attRows}</div></div>
      </div>
    </div>
  </div>
</section>

<section data-screen-label="AI" style="padding:96px 24px">
  <div style="max-width:1240px;margin:0 auto;background:linear-gradient(135deg,var(--primary-soft),transparent 70%);border:1px solid var(--line);border-radius:26px;padding:48px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:center">
      <div data-reveal>
        <span style="display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--primary)"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" fill="var(--primary)"/></svg><span>${t.ai.eyebrow}</span></span>
        <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;margin:14px 0 0">${t.ai.title}</h2>
        <p style="font-size:18px;color:var(--ink-3);margin-top:14px">${t.ai.sub}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:26px">${aiItems}</div>
      </div>
      <div data-reveal style="background:var(--card);border:1px solid var(--line);border-radius:18px;box-shadow:var(--shadow-lg);overflow:hidden">
        <div style="display:flex;align-items:center;gap:9px;padding:14px 18px;border-bottom:1px solid var(--line)"><span style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,var(--primary),#0ea5e9);display:flex;align-items:center;justify-content:center"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" fill="#fff"/></svg></span><span style="font-weight:700;font-size:14.5px;color:var(--ink)">${t.ai.panelTitle}</span><span style="margin-left:auto;font-size:11.5px;color:var(--primary);font-weight:600;background:var(--primary-soft);padding:3px 9px;border-radius:6px">${t.ai.updated}</span></div>
        <div style="padding:18px">
          <div style="font-size:12.5px;color:var(--ink-3);margin-bottom:4px">${t.ai.forecastLabel}</div>
          <svg viewBox="0 0 460 130" style="width:100%;height:auto;display:block"><defs><linearGradient id="aig" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--primary)" stop-opacity=".22"/><stop offset="1" stop-color="var(--primary)" stop-opacity="0"/></linearGradient></defs><path d="M0,95 C50,90 70,72 110,76 C150,80 168,52 210,58 L210,58 L210,110 L0,110 Z" fill="url(#aig)"/><path d="M0,95 C50,90 70,72 110,76 C150,80 168,52 210,58" fill="none" stroke="var(--primary)" stroke-width="2.4" stroke-linecap="round"/><path d="M210,58 C250,64 270,40 312,34 C356,28 380,42 460,18" fill="none" stroke="var(--primary)" stroke-width="2.4" stroke-dasharray="5 5" stroke-linecap="round" opacity=".75"/><circle cx="210" cy="58" r="4" fill="var(--primary)"/><text x="218" y="50" font-size="11" fill="var(--ink-3)" font-family="Golos Text">${t.ai.forecastTag}</text></svg>
          <div style="display:flex;flex-direction:column;gap:9px;margin-top:14px">${aiInsights}</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section style="padding:96px 24px;background:#0a0f1d;color:#cbd5e1">
  <div style="max-width:1240px;margin:0 auto">
    <div data-reveal style="max-width:720px">
      <span style="font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#60a5fa">${t.ben.eyebrow}</span>
      <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;margin:14px 0 0;color:#fff">${t.ben.title}</h2>
    </div>
    <div data-reveal style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:42px">${benStats}</div>
    <div data-reveal style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:16px">${benChecks}</div>
  </div>
</section>

<section data-screen-label="Numbers" style="padding:84px 24px">
  <div style="max-width:1240px;margin:0 auto;text-align:center">
    <span style="font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--primary)">${t.num.eyebrow}</span>
    <h2 style="font-size:clamp(26px,3.6vw,40px);font-weight:800;margin:12px 0 0">${t.num.title}</h2>
    <div data-reveal style="display:grid;grid-template-columns:repeat(6,1fr);gap:14px;margin-top:40px">${numCards}</div>
  </div>
</section>

<section id="industries" data-screen-label="Industries" style="padding:96px 24px;${sect}">
  <div style="max-width:1240px;margin:0 auto">
    <div data-reveal style="max-width:720px">
      <span style="font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--primary)">${t.ind.eyebrow}</span>
      <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;margin:14px 0 0">${t.ind.title}</h2>
    </div>
    <div data-reveal style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:40px">${indCards}</div>
  </div>
</section>

<section data-screen-label="Comparison" style="padding:96px 24px;background:var(--bg-soft)">
  <div style="max-width:1100px;margin:0 auto">
    <div data-reveal style="text-align:center;max-width:720px;margin:0 auto">
      <span style="font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--primary)">${t.cmp.eyebrow}</span>
      <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;margin:14px 0 0">${t.cmp.title}</h2>
      <p style="font-size:18px;color:var(--ink-3);margin-top:14px">${t.cmp.sub}</p>
    </div>
    <div data-reveal class="asp-scroll" style="margin-top:38px;overflow-x:auto">${cmp}</div>
  </div>
</section>

<section id="roi" data-screen-label="ROI" style="padding:96px 24px;${sect}">
  <div style="max-width:1100px;margin:0 auto">
    <div data-reveal style="text-align:center;max-width:720px;margin:0 auto">
      <span style="font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--primary)">${t.roi.eyebrow}</span>
      <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;margin:14px 0 0">${t.roi.title}</h2>
      <p style="font-size:18px;color:var(--ink-3);margin-top:14px">${t.roi.sub}</p>
    </div>
    <div data-reveal style="margin-top:36px;display:grid;grid-template-columns:1fr 1fr;gap:18px;background:var(--card);border:1px solid var(--line);border-radius:22px;box-shadow:var(--shadow);padding:32px">
      <div style="display:flex;flex-direction:column;gap:30px;justify-content:center">
        <div><div style="display:flex;justify-content:space-between;align-items:baseline;font-weight:600;color:var(--ink)"><span>${t.roi.storesLabel}</span><span id="roi-stores-v" style="color:var(--primary);font-family:'Manrope';font-weight:800;font-size:22px">5</span></div><input data-roi type="range" id="roi-stores" aria-label="${t.roi.storesLabel}" min="1" max="30" value="5" style="width:100%;margin-top:12px;accent-color:var(--primary)"></div>
        <div><div style="display:flex;justify-content:space-between;align-items:baseline;font-weight:600;color:var(--ink)"><span>${t.roi.revLabel}</span><span id="roi-rev-v" style="color:var(--primary);font-family:'Manrope';font-weight:800;font-size:22px">120</span></div><input data-roi type="range" id="roi-rev" aria-label="${t.roi.revLabel}" min="20" max="600" step="10" value="120" style="width:100%;margin-top:12px;accent-color:var(--primary)"></div>
      </div>
      <div style="background:linear-gradient(135deg,var(--primary),#0ea5e9);border-radius:18px;padding:28px;color:#fff;display:flex;flex-direction:column;justify-content:center">
        <div style="font-size:14px;opacity:.85">${t.roi.savings}</div>
        <div id="roi-save" style="font-family:'Manrope';font-weight:800;font-size:clamp(28px,4vw,42px);letter-spacing:-.02em;line-height:1.1">—</div>
        <div style="height:1px;background:rgba(255,255,255,.25);margin:18px 0"></div>
        <div style="display:flex;justify-content:space-between;font-size:14px;gap:12px"><span style="opacity:.9">${t.roi.extra}</span><b id="roi-extra">—</b></div>
        <div style="display:flex;justify-content:space-between;font-size:14px;margin-top:8px;gap:12px"><span style="opacity:.9">${t.roi.payback}</span><b id="roi-payback">—</b></div>
        <a href="#" data-asp-register class="asp-roi-cta" style="margin-top:22px;background:#fff;color:var(--primary);text-align:center;padding:13px;border-radius:11px;font-weight:700">${t.roi.cta}</a>
      </div>
    </div>
  </div>
</section>

<section id="pricing" data-screen-label="Pricing" style="padding:96px 24px;background:var(--bg-soft);${sect}">
  <div style="max-width:1240px;margin:0 auto">
    <div data-reveal style="text-align:center;max-width:720px;margin:0 auto">
      <span style="font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--primary)">${t.price.eyebrow}</span>
      <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;margin:14px 0 0">${t.price.title}</h2>
      <p style="font-size:18px;color:var(--ink-3);margin-top:14px">${t.price.sub}</p>
    </div>
    <div id="asp-pricing-grid" data-reveal style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:40px;align-items:start">${plansHtml}</div>
    <div data-reveal style="margin-top:24px;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:22px 26px;display:flex;flex-wrap:wrap;align-items:center;gap:16px 28px;justify-content:center;box-shadow:var(--shadow-sm)">
      <span style="font-weight:700;color:var(--ink)">${t.price.allIncl}</span>
      ${t.price.allItems.map((x) => `<span style="display:flex;align-items:center;gap:8px;font-size:14.5px;color:var(--ink-2)">${check()}${x}</span>`).join('')}
    </div>
    <p data-reveal style="text-align:center;font-size:13.5px;color:var(--ink-4);margin-top:14px">${t.price.note}</p>
  </div>
</section>

<section style="padding:96px 24px">
  <div style="max-width:1240px;margin:0 auto">
    <div data-reveal style="max-width:720px">
      <span style="font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--primary)">${t.impl.eyebrow}</span>
      <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;margin:14px 0 0">${t.impl.title}</h2>
    </div>
    <div data-reveal style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:40px">${timeline}</div>
    <div data-reveal style="margin-top:56px;display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:center;background:var(--bg-soft);border:1px solid var(--line);border-radius:22px;padding:34px">
      <div>
        <span style="font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--primary)">${t.sec.eyebrow}</span>
        <h3 style="font-size:28px;font-weight:800;margin:12px 0 10px">${t.sec.title}</h3>
        <p style="font-size:16px;color:var(--ink-3)">${t.sec.desc}</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${secCards}</div>
    </div>
  </div>
</section>

<section id="stories" data-screen-label="Stories" style="padding:96px 24px;background:var(--bg-soft);${sect}">
  <div style="max-width:1240px;margin:0 auto">
    <div data-reveal style="max-width:720px">
      <span style="font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--primary)">${t.story.eyebrow}</span>
      <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;margin:14px 0 0">${t.story.title}</h2>
    </div>
    <div data-reveal style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:40px">${stories}</div>
  </div>
</section>

<section id="faq" data-screen-label="FAQ" style="padding:96px 24px;${sect}">
  <div style="max-width:880px;margin:0 auto">
    <div data-reveal style="text-align:center">
      <span style="font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--primary)">${t.faq.eyebrow}</span>
      <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;margin:14px 0 0">${t.faq.title}</h2>
    </div>
    <div data-reveal style="margin-top:40px;display:flex;flex-direction:column;gap:10px">${faq}</div>
  </div>
</section>

<section id="contact" data-screen-label="Contact" style="padding:96px 24px;background:var(--bg-soft);${sect}">
  <div style="max-width:1240px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:42px;align-items:start">
    <div data-reveal>
      <span style="font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--primary)">${t.contact.eyebrow}</span>
      <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;margin:14px 0 14px">${t.contact.title}</h2>
      <p style="font-size:18px;color:var(--ink-3)">${t.contact.sub}</p>
      <div style="display:flex;flex-direction:column;gap:14px;margin-top:28px">
        <a href="tel:${c.phoneHref}" style="display:flex;align-items:center;gap:13px;background:var(--card);border:1px solid var(--line);border-radius:13px;padding:15px"><span style="width:40px;height:40px;border-radius:10px;background:var(--primary-soft);display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 4h3l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v3a2 2 0 01-2 2A16 16 0 014 6a2 2 0 012-2z" stroke="var(--primary)" stroke-width="1.7" stroke-linejoin="round"/></svg></span><div><div style="font-size:12.5px;color:var(--ink-3)">${t.contact.phoneLabel}</div><div style="font-weight:700;color:var(--ink)">${c.phone}</div></div></a>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <a href="mailto:${c.email}" style="display:flex;align-items:center;gap:11px;background:var(--card);border:1px solid var(--line);border-radius:13px;padding:15px"><span style="width:38px;height:38px;border-radius:10px;background:var(--primary-soft);display:flex;align-items:center;justify-content:center"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v12H4zM4 7l8 6 8-6" stroke="var(--primary)" stroke-width="1.7" stroke-linejoin="round"/></svg></span><div><div style="font-size:11px;color:var(--ink-3)">${t.contact.emailLabel}</div><div style="font-weight:600;font-size:13.5px;color:var(--ink)">${c.email}</div></div></a>
          ${primarySocial ? `<a href="${primarySocial.url}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:11px;background:var(--card);border:1px solid var(--line);border-radius:13px;padding:15px"><span style="width:38px;height:38px;border-radius:10px;background:rgba(14,165,233,.12);display:flex;align-items:center;justify-content:center"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="${iconFor(primarySocial.name)}" stroke="var(--accent)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span><div><div style="font-size:11px;color:var(--ink-3)">${primarySocial.name}</div><div style="font-weight:600;font-size:13.5px;color:var(--ink);word-break:break-all">${primarySocial.url.replace(/^https?:\/\//, '')}</div></div></a>` : ''}
        </div>
        <div style="height:200px;border-radius:13px;border:1px solid var(--line);overflow:hidden;position:relative;background:linear-gradient(135deg,var(--bg-soft2),var(--card))">
          ${mapHtml}
        </div>
      </div>
    </div>
    <form data-reveal data-asp-lead-form onsubmit="return false" style="background:var(--card);border:1px solid var(--line);border-radius:22px;padding:32px;box-shadow:var(--shadow)">
      <h3 style="font-size:22px;font-weight:800;margin-bottom:6px">${t.contact.formTitle}</h3>
      <p style="font-size:14px;color:var(--ink-3);margin-bottom:20px">${t.contact.formNote}</p>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div><label for="lead-name" style="font-size:13px;font-weight:600;color:var(--ink-2)">${t.contact.name}</label><input id="lead-name" data-lead="name" placeholder="${t.contact.namePh}" style="width:100%;margin-top:6px;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:var(--bg-soft);color:var(--ink);font-family:inherit;font-size:14.5px"></div>
          <div><label for="lead-phone" style="font-size:13px;font-weight:600;color:var(--ink-2)">${t.contact.phoneL}</label><input id="lead-phone" data-lead="phone" placeholder="${t.contact.phonePh}" style="width:100%;margin-top:6px;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:var(--bg-soft);color:var(--ink);font-family:inherit;font-size:14.5px"></div>
        </div>
        <div><label for="lead-email" style="font-size:13px;font-weight:600;color:var(--ink-2)">${t.contact.emailLabel}</label><input id="lead-email" data-lead="email" type="email" placeholder="${t.contact.emailPh}" style="width:100%;margin-top:6px;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:var(--bg-soft);color:var(--ink);font-family:inherit;font-size:14.5px"></div>
        <div><label for="lead-company" style="font-size:13px;font-weight:600;color:var(--ink-2)">${t.contact.company}</label><input id="lead-company" data-lead="company" placeholder="${t.contact.companyPh}" style="width:100%;margin-top:6px;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:var(--bg-soft);color:var(--ink);font-family:inherit;font-size:14.5px"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div><label for="lead-stores" style="font-size:13px;font-weight:600;color:var(--ink-2)">${t.contact.storesL}</label><select id="lead-stores" data-lead="stores_range" style="width:100%;margin-top:6px;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:var(--bg-soft);color:var(--ink);font-family:inherit;font-size:14.5px">${t.contact.storeOpts.map((o) => `<option>${o}</option>`).join('')}</select></div>
          <div><label for="lead-source" style="font-size:13px;font-weight:600;color:var(--ink-2)">${t.contact.sourceL}</label><select id="lead-source" data-lead="source" style="width:100%;margin-top:6px;padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:var(--bg-soft);color:var(--ink);font-family:inherit;font-size:14.5px"><option value="">—</option>${t.contact.sourceOpts.map((o, i) => `<option value="${LANDING_SOURCE_CODES[i] ?? ''}">${o.l}</option>`).join('')}</select></div>
        </div>
        <button data-asp-lead-submit style="margin-top:6px;background:var(--primary);color:#fff;border:0;padding:14px;border-radius:11px;font-weight:700;font-size:15.5px;cursor:pointer;font-family:inherit;box-shadow:0 14px 30px -10px var(--primary)">${t.contact.submit}</button>
        <p data-lead-status style="font-size:13px;text-align:center;min-height:18px;margin:0"></p>
        <p style="font-size:12px;color:var(--ink-4);text-align:center">${t.contact.privacy}</p>
      </div>
    </form>
  </div>
</section>

<section data-screen-label="Payments" style="padding:48px 0;background:var(--bg-soft);border-top:1px solid var(--line);border-bottom:1px solid var(--line);overflow:hidden">
  <div data-reveal style="max-width:1240px;margin:0 auto 26px;padding:0 24px;text-align:center"><span style="font-size:12.5px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:var(--ink-4)">${t.footer.payTitle}</span></div>
  <div class="asp-pay-mask">
    <div class="asp-pay-track">
      <div class="asp-pay-group">${payments}</div>
      <div class="asp-pay-group" aria-hidden="true">${payments}</div>
    </div>
  </div>
</section>

<footer style="background:#070b16;color:#94a3b8;padding:64px 24px 34px">
  <div style="max-width:1240px;margin:0 auto">
    <div style="display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:32px;padding-bottom:40px;border-bottom:1px solid rgba(255,255,255,.08)">
      <div>
        <div style="display:flex;align-items:center"><img src="/images/logo-dark.png" alt="Zumex" width="56" height="56" decoding="async" style="height:56px;width:auto;display:block"></div>
        <p style="font-size:14px;margin-top:14px;max-width:300px;line-height:1.6">${t.footer.tagline}</p>
        ${socialLinks ? `<div style="display:flex;gap:10px;margin-top:18px">${socialLinks}</div>` : ''}
      </div>
      <div><div style="color:#fff;font-weight:700;font-size:14px;margin-bottom:14px">${t.footer.product}</div><div style="display:flex;flex-direction:column;gap:10px;font-size:14px"><a href="#features">${t.footer.productLinks[0]}</a><a href="#product">${t.footer.productLinks[1]}</a><a href="#pricing">${t.footer.productLinks[2]}</a><a href="#">${t.footer.productLinks[3]}</a></div></div>
      <div><div style="color:#fff;font-weight:700;font-size:14px;margin-bottom:14px">${t.footer.industries}</div><div style="display:flex;flex-direction:column;gap:10px;font-size:14px">${t.footer.industryLinks.map((x) => `<a href="#industries">${x}</a>`).join('')}</div></div>
      <div><div style="color:#fff;font-weight:700;font-size:14px;margin-bottom:14px">${t.footer.company}</div><div style="display:flex;flex-direction:column;gap:10px;font-size:14px"><a href="#stories">${t.footer.companyLinks[0]}</a><a href="#contact">${t.footer.companyLinks[1]}</a><a href="#">${t.footer.companyLinks[2]}</a><a href="#">${t.footer.companyLinks[3]}</a></div></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:24px;font-size:13px;flex-wrap:wrap;gap:12px">
      <span>${t.footer.rights}</span>
      <div style="display:flex;gap:22px;flex-wrap:wrap"><a href="/privacy">${t.footer.privacy}</a><a href="/terms">${t.footer.terms}</a><a href="/refunds">${t.footer.refund}</a></div>
    </div>
  </div>
</footer>
`
}
