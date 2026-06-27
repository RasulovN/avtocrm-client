// Yagona ContactInfo modeli — landing (site-settings) va kompaniya sozlamalari
// uchun bir xil ishlatiladi (backend `common/contact.ts` bilan mos).

export interface SocialLink {
  name: string;
  url: string;
}

export interface ContactInfo {
  phone: string;
  phoneHref: string;
  email: string;
  address: string;
  location: { lat: number; lng: number } | null;
  socials: SocialLink[];
}

export const EMPTY_CONTACT: ContactInfo = {
  phone: '',
  phoneHref: '',
  email: '',
  address: '',
  location: null,
  socials: [],
};

// Har qanday (eski/qisman) qiymatni to'liq ContactInfo'ga keltiradi.
export function normalizeContact(raw: unknown, defaults: ContactInfo = EMPTY_CONTACT): ContactInfo {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const c = (r.contact && typeof r.contact === 'object' ? (r.contact as Record<string, unknown>) : r) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === 'string' ? v : '');

  let socials: SocialLink[] = [];
  const rawSoc = (r.socials ?? c.socials) as unknown;
  if (Array.isArray(rawSoc)) {
    socials = rawSoc
      .map((s) => ({ name: str((s as SocialLink)?.name).trim(), url: str((s as SocialLink)?.url).trim() }))
      .filter((s) => s.name && s.url);
  } else if (rawSoc && typeof rawSoc === 'object') {
    socials = Object.entries(rawSoc as Record<string, unknown>)
      .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), url: str(v).trim() }))
      .filter((s) => s.url);
  }
  const tgUrl = str(c.telegramUrl);
  if (tgUrl && !socials.some((s) => /telegram/i.test(s.name))) socials.unshift({ name: 'Telegram', url: tgUrl });

  let location: ContactInfo['location'] = defaults.location;
  const loc = c.location as Record<string, unknown> | null | undefined;
  if (loc && typeof loc === 'object') {
    const lat = Number(loc.lat), lng = Number(loc.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) location = { lat, lng };
  }

  return {
    phone: str(c.phone) || defaults.phone,
    phoneHref: str(c.phoneHref) || defaults.phoneHref,
    email: str(c.email) || defaults.email,
    address: str(c.address) || defaults.address,
    location,
    socials: socials.length ? socials : defaults.socials,
  };
}
