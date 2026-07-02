// Interactivity for the Zumex landing — runs on the mounted #asp-root after
// the markup is injected. Content and translations live in the markup builder;
// this only wires reveal animations, counters, FAQ, demo tabs and the ROI slider.
import type { AspDict } from './aspI18n'

export interface AspController {
  revealVisible: () => void
  destroy: () => void
}

export function initAsp(root: HTMLElement, t: AspDict): AspController {
  const $ = (id: string) => root.querySelector<HTMLElement>('#' + id)
  const observers: IntersectionObserver[] = []

  /* ---------- DEMO TABS ---------- */
  function setTab(tab: string) {
    root.querySelectorAll<HTMLElement>('#demo-tabs [data-tab]').forEach((b) => {
      b.classList.toggle('is-active', b.getAttribute('data-tab') === tab)
    })
    root.querySelectorAll<HTMLElement>('#demo-panels [data-panel]').forEach((p) => {
      p.style.display = p.getAttribute('data-panel') === tab ? 'block' : 'none'
    })
  }

  /* ---------- MOBIL MENYU ---------- */
  function setMobileNav(open: boolean) {
    const panel = root.querySelector<HTMLElement>('#asp-mobile-nav')
    const btn = root.querySelector<HTMLElement>('[data-asp-nav-toggle]')
    if (!panel || !btn) return
    panel.classList.toggle('open', open)
    btn.setAttribute('aria-expanded', String(open))
  }

  /* ---------- FAQ ---------- */
  function toggleFaq(row: HTMLElement) {
    const ans = row.nextElementSibling as HTMLElement | null
    if (!ans) return
    const icon = row.querySelector<HTMLElement>('.faq-ic')
    const open = ans.style.maxHeight && ans.style.maxHeight !== '0px'
    if (open) {
      ans.style.maxHeight = '0px'; ans.style.opacity = '0'
      if (icon) icon.style.transform = 'rotate(0deg)'
    } else {
      ans.style.maxHeight = ans.scrollHeight + 40 + 'px'; ans.style.opacity = '1'
      if (icon) icon.style.transform = 'rotate(45deg)'
    }
  }

  /* ---------- ROI ---------- */
  function computeRoi() {
    const sEl = $('roi-stores') as HTMLInputElement | null
    const rEl = $('roi-rev') as HTMLInputElement | null
    if (!sEl || !rEl) return
    const stores = +sEl.value
    const rev = +rEl.value
    const sv = $('roi-stores-v'); if (sv) sv.textContent = String(stores)
    const rv = $('roi-rev-v'); if (rv) rv.textContent = String(rev)
    // Sliderning to'ldirilgan qismini (--fill) qiymatga moslab yangilash
    const setFill = (el: HTMLInputElement) => {
      const min = +el.min || 0, max = +el.max || 100
      const pct = max > min ? ((+el.value - min) / (max - min)) * 100 : 0
      el.style.setProperty('--fill', pct + '%')
    }
    setFill(sEl); setFill(rEl)
    const annualRev = stores * rev * 12
    const savings = annualRev * 0.03
    const extra = annualRev * 0.09
    const costMonthly = Math.max(0.49, stores * 0.49)
    const payback = Math.max(1, Math.round((costMonthly * 12) / Math.max(1, savings) * 12))
    const fmt = (m: number) =>
      m >= 1000 ? (m / 1000).toFixed(1).replace('.0', '') + ' ' + t.roi.mlrd : Math.round(m).toLocaleString('ru-RU') + ' ' + t.roi.mln
    const save = $('roi-save'); if (save) save.textContent = fmt(savings)
    const ex = $('roi-extra'); if (ex) ex.textContent = fmt(extra)
    const pb = $('roi-payback'); if (pb) pb.textContent = payback <= 1 ? t.roi.month : '≈ ' + payback + ' ' + t.roi.months
  }

  /* ---------- REVEAL / COUNTERS ---------- */
  // Instantly show every section (used on in-page navigation so jumping to an
  // anchor never leaves skipped-over sections stuck invisible).
  function revealAll() {
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => el.classList.add('in'))
  }
  // Reveal anything currently in/above the viewport. Reads the LIVE DOM each time,
  // so it survives markup re-renders (theme/lang) and odd scroll positions —
  // whatever the user can see is guaranteed visible (no "stuck hidden" sections).
  function revealVisible() {
    const vh = window.innerHeight || 800
    root.querySelectorAll<HTMLElement>('[data-reveal]:not(.in)').forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.95) el.classList.add('in')
    })
  }

  function initReveal() {
    const els = root.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return }
    // Arm the hidden state only now — before this, [data-reveal] is fully visible,
    // so a script failure can never leave the page blank.
    root.classList.add('asp-reveal')
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target) } })
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' })
    els.forEach((el) => io.observe(el))
    observers.push(io)
    // Above-the-fold content: reveal synchronously (DOM is laid out by now) so the
    // hero never depends on a rAF/observer tick that may be skipped. Then once more
    // after layout settles for anything that shifted.
    revealVisible()
    requestAnimationFrame(revealVisible)
  }

  function initCounters() {
    const els = root.querySelectorAll<HTMLElement>('[data-count]')
    const run = (el: HTMLElement) => {
      const raw = el.getAttribute('data-count') || '0'
      const target = parseFloat(raw)
      const dec = raw.indexOf('.') >= 0 ? 1 : 0
      const pre = el.getAttribute('data-prefix') || ''
      const suf = el.getAttribute('data-suffix') || ''
      const dur = 1300; const t0 = performance.now()
      const fmt = (n: number) => (dec ? n.toFixed(1) : Math.round(n).toLocaleString('ru-RU'))
      const step = (ts: number) => {
        const p = Math.min(1, (ts - t0) / dur)
        const e = 1 - Math.pow(1 - p, 3)
        el.textContent = pre + fmt(target * e) + suf
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }
    if (!('IntersectionObserver' in window)) { els.forEach(run); return }
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) { run(en.target as HTMLElement); io.unobserve(en.target) } })
    }, { threshold: 0.6 })
    els.forEach((el) => io.observe(el))
    observers.push(io)
  }

  /* ---------- EVENTS ---------- */
  const onClick = (e: Event) => {
    const target = e.target as HTMLElement
    // Hamburger: mobil menyuni ochish/yopish.
    const navToggle = target.closest<HTMLElement>('[data-asp-nav-toggle]')
    if (navToggle) {
      setMobileNav(navToggle.getAttribute('aria-expanded') !== 'true')
      return
    }
    // Mobil menyu ichidagi havola bosilganda menyu yopiladi.
    if (target.closest('#asp-mobile-nav a')) setMobileNav(false)
    // In-page anchor (nav menu): reveal everything so no skipped section stays hidden.
    if (target.closest('a[href^="#"]')) revealAll()
    const tab = target.closest<HTMLElement>('[data-tab]')
    if (tab) { setTab(tab.getAttribute('data-tab') || 'products'); return }
    const faq = target.closest<HTMLElement>('[data-faq]')
    if (faq) { toggleFaq(faq); return }
  }
  const onInput = (e: Event) => {
    if ((e.target as HTMLElement).closest('[data-roi]')) computeRoi()
  }

  const onScroll = () => revealVisible()
  root.addEventListener('click', onClick)
  root.addEventListener('input', onInput)
  window.addEventListener('hashchange', revealAll)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  computeRoi()
  initReveal()
  initCounters()
  // If the page opened directly on a #section, reveal everything immediately.
  if (window.location.hash && window.location.hash !== '#top') revealAll()

  return {
    revealVisible,
    destroy() {
      root.removeEventListener('click', onClick)
      root.removeEventListener('input', onInput)
      window.removeEventListener('hashchange', revealAll)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      observers.forEach((o) => o.disconnect())
    },
  }
}
