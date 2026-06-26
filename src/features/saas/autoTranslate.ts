import { latinToCyrillic } from '../../utils/transliteration';

// O'zbekcha (lotin) matnni boshqa tillarga avtomatik tayyorlash.
//  - cyrl: mavjud transliteratsiya logikasi (lotin -> kirill), API kerak emas.
//  - ru / en: MyMemory tarjima API orqali.

export function uzToCyrillic(text: string): string {
  return latinToCyrillic(text);
}

// MyMemory tarjima API (bepul). Xato bo'lsa bo'sh string qaytaradi.
export async function translateText(
  text: string,
  source: string,
  target: string,
): Promise<string> {
  const trimmed = (text || '').trim();
  if (!trimmed) return '';
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${source}|${target}`,
    );
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    // API ba'zan xato matnini translatedText sifatida qaytaradi
    if (typeof translated === 'string' && data?.responseStatus === 200) {
      return translated;
    }
    return typeof translated === 'string' ? translated : '';
  } catch {
    return '';
  }
}

// uz dan ru, en, cyrl ni to'ldiradi.
export async function autoFillFromUz(uz: string): Promise<{ ru: string; en: string; cyrl: string }> {
  const cyrl = uzToCyrillic(uz);
  const [ru, en] = await Promise.all([
    translateText(uz, 'uz', 'ru'),
    translateText(uz, 'uz', 'en'),
  ]);
  return { ru, en, cyrl };
}
