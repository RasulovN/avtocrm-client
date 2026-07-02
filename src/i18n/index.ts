import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Faqat standart (fallback) til sinxron bundle'da — qolganlari kerak bo'lganda
// dinamik chunk sifatida yuklanadi. Bu asosiy bundle'ni ~190KB ga kichraytiradi.
import uz from './locales/uz.json';

type AppLanguage = 'uz' | 'cyrl' | 'en' | 'ru';

const LAZY_LOCALES: Record<Exclude<AppLanguage, 'uz'>, () => Promise<{ default: Record<string, unknown> }>> = {
  cyrl: () => import('./locales/cyrl.json'),
  en: () => import('./locales/en.json'),
  ru: () => import('./locales/ru.json'),
};

const normalizeLanguage = (lang: string | null | undefined): AppLanguage => {
  if (!lang) return 'uz';
  const lower = lang.toLowerCase();
  if (lower.startsWith('uz-cyrl') || lower.startsWith('cyrl')) return 'cyrl';
  if (lower.startsWith('ru')) return 'ru';
  if (lower.startsWith('en')) return 'en';
  if (lower.startsWith('uz')) return 'uz';
  return 'uz';
};

// Til paketi hali yuklanmagan bo'lsa — yuklab i18next'ga qo'shadi.
// react-i18next `bindI18nStore: 'added'` orqali komponentlarni qayta chizadi.
const loadingLocales = new Map<AppLanguage, Promise<void>>();
export const ensureLocale = (lang: string): Promise<void> => {
  const norm = normalizeLanguage(lang);
  if (norm === 'uz' || i18n.hasResourceBundle(norm, 'translation')) return Promise.resolve();
  let p = loadingLocales.get(norm);
  if (!p) {
    p = LAZY_LOCALES[norm]()
      .then((m) => {
        i18n.addResourceBundle(norm, 'translation', m.default, true, true);
      })
      .catch(() => {
        loadingLocales.delete(norm); // keyingi urinishga ruxsat
      });
    loadingLocales.set(norm, p);
  }
  return p;
};

const isBrowser = typeof window !== 'undefined';
// Get saved language from localStorage or default to 'uz'
const savedLanguage = isBrowser ? localStorage.getItem('i18nextLng') : null;
const normalizedLanguage = normalizeLanguage(savedLanguage);
if (isBrowser && savedLanguage !== normalizedLanguage) {
  localStorage.setItem('i18nextLng', normalizedLanguage);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { uz: { translation: uz } },
    partialBundledLanguages: true,
    fallbackLng: 'uz',
    supportedLngs: ['uz', 'cyrl', 'en', 'ru'],
    lng: normalizedLanguage,
    interpolation: {
      escapeValue: false,
    },
    react: {
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      convertDetectedLanguage: (lng: string) => normalizeLanguage(lng),
    },
  });

// Saqlangan til uz bo'lmasa — paketini darhol (parallel) yuklaymiz.
if (normalizedLanguage !== 'uz') void ensureLocale(normalizedLanguage);
// Til almashganda (masalan, landing'dagi select) paketi yuklanishini kafolatlaymiz.
i18n.on('languageChanged', (lng) => { void ensureLocale(lng); });

export default i18n;

export const changeLanguage = (lang: string) => {
  const normalized = normalizeLanguage(lang);
  void ensureLocale(normalized).then(() => i18n.changeLanguage(normalized));
  if (isBrowser) {
    localStorage.setItem('i18nextLng', normalized);
  }
};
