const MULTI_CHAR_MAP: Array<[string, string]> = [
  ['O‘', 'Ў'],
  ['o‘', 'ў'],
  ['G‘', 'Ғ'],
  ['g‘', 'ғ'],
  ["O'", 'Ў'],
  ["o'", 'ў'],
  ["G'", 'Ғ'],
  ["g'", 'ғ'],
  ['Sh', 'Ш'],
  ['sh', 'ш'],
  ['Ch', 'Ч'],
  ['ch', 'ч'],
  ['Yo', 'Ё'],
  ['yo', 'ё'],
  ['Yu', 'Ю'],
  ['yu', 'ю'],
  ['Ya', 'Я'],
  ['ya', 'я'],
  ['Ts', 'Ц'],
  ['ts', 'ц'],
];

const SINGLE_CHAR_MAP: Record<string, string> = {
  A: 'А',
  a: 'а',
  B: 'Б',
  b: 'б',
  D: 'Д',
  d: 'д',
  E: 'Е',
  e: 'е',
  F: 'Ф',
  f: 'ф',
  G: 'Г',
  g: 'г',
  H: 'Ҳ',
  h: 'ҳ',
  I: 'И',
  i: 'и',
  J: 'Ж',
  j: 'ж',
  K: 'К',
  k: 'к',
  L: 'Л',
  l: 'л',
  M: 'М',
  m: 'м',
  N: 'Н',
  n: 'н',
  O: 'О',
  o: 'о',
  P: 'П',
  p: 'п',
  Q: 'Қ',
  q: 'қ',
  R: 'Р',
  r: 'р',
  S: 'С',
  s: 'с',
  T: 'Т',
  t: 'т',
  U: 'У',
  u: 'у',
  V: 'В',
  v: 'в',
  X: 'Х',
  x: 'х',
  Y: 'Й',
  y: 'й',
  Z: 'З',
  z: 'з',
};

export function latinToCyrillic(text: string): string {
  let result = text;

  for (const [latin, cyrillic] of MULTI_CHAR_MAP) {
    result = result.split(latin).join(cyrillic);
  }

  return Array.from(result)
    .map((char) => SINGLE_CHAR_MAP[char] ?? char)
    .join('');
}

// ─────────────────────────────────────────────
// Lotin -> Rus kirill (joy nomlari uchun taxminiy transliteratsiya).
// Ўзбекчага хос ҳарфлар (Ў, Ғ, Қ, Ҳ) рус алифбосидаги яқин ҳарфларга ўтказилади.
// ─────────────────────────────────────────────
const RU_MULTI_MAP: Array<[string, string]> = [
  ['O‘', 'У'], ['o‘', 'у'], ['G‘', 'Г'], ['g‘', 'г'],
  ["O'", 'У'], ["o'", 'у'], ["G'", 'Г'], ["g'", 'г'],
  ['Sh', 'Ш'], ['sh', 'ш'], ['Ch', 'Ч'], ['ch', 'ч'],
  ['Yo', 'Ё'], ['yo', 'ё'], ['Yu', 'Ю'], ['yu', 'ю'],
  ['Ya', 'Я'], ['ya', 'я'], ['Ts', 'Ц'], ['ts', 'ц'],
];

const RU_SINGLE_MAP: Record<string, string> = {
  A: 'А', a: 'а', B: 'Б', b: 'б', D: 'Д', d: 'д', E: 'Е', e: 'е', F: 'Ф', f: 'ф',
  G: 'Г', g: 'г', H: 'Х', h: 'х', I: 'И', i: 'и', J: 'Ж', j: 'ж', K: 'К', k: 'к',
  L: 'Л', l: 'л', M: 'М', m: 'м', N: 'Н', n: 'н', O: 'О', o: 'о', P: 'П', p: 'п',
  Q: 'К', q: 'к', R: 'Р', r: 'р', S: 'С', s: 'с', T: 'Т', t: 'т', U: 'У', u: 'у',
  V: 'В', v: 'в', X: 'Х', x: 'х', Y: 'Й', y: 'й', Z: 'З', z: 'з',
};

export function latinToRussian(text: string): string {
  let result = text;
  for (const [latin, cyr] of RU_MULTI_MAP) {
    result = result.split(latin).join(cyr);
  }
  return Array.from(result)
    .map((char) => RU_SINGLE_MAP[char] ?? char)
    .join('');
}

// ─────────────────────────────────────────────
// Lotin -> Inglizcha (lotin) shakl: o'zbekча maxsus belgilar (ʻ, ') olib tashlanadi.
// Masalan "Qo'qon" -> "Qoqon", "G'uzor" -> "Guzor".
// ─────────────────────────────────────────────
export function latinToEnglish(text: string): string {
  return text
    .replace(/([OoGg])[‘'ʻ`]/g, '$1') // O'/o'/G'/g' -> O/o/G/g
    .replace(/[‘'ʻ`]/g, '');
}
