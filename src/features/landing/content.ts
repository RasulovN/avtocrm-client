import type { LandingLang } from './types'

export interface Feature { icon: string; title: string; desc: string }
export interface Step { title: string; desc: string }
export interface Faq { q: string; a: string }

export interface Dict {
  langName: string
  nav: { home: string; features: string; pricing: string; how: string; faq: string; login: string; start: string }
  hero: { badge: string; title1: string; title2: string; subtitle: string; ctaTrial: string; ctaPricing: string; note: string }
  stats: { label: string; value: string }[]
  features: { badge: string; title: string; subtitle: string; items: Feature[] }
  how: { badge: string; title: string; subtitle: string; steps: Step[] }
  pricing: {
    badge: string; title: string; subtitle: string; durationDays: string; popular: string; choose: string
    free: string; maxStores: string; maxUsers: string; loading: string; empty: string; guarantee: string
  }
  faq: { badge: string; title: string; items: Faq[] }
  cta: { title: string; subtitle: string; trial: string; login: string }
  footer: { tagline: string; product: string; links: string[]; contact: string; rights: string }
}

const uz: Dict = {
  langName: "O'zbekcha",
  nav: { home: 'Bosh sahifa', features: 'Imkoniyatlar', pricing: 'Tariflar', how: 'Qanday ishlaydi', faq: 'Savollar', login: 'Kirish', start: 'Boshlash' },
  hero: {
    badge: 'Savdo va ombor uchun yagona tizim',
    title1: 'Biznesingizni',
    title2: 'bitta tizimda boshqaring',
    subtitle: "Zumex — sotuv, ombor, kirim, inventarizatsiya, do'konlar va xodimlarni bitta zamonaviy platformada birlashtiradi. Shtrix-kod, hisobotlar va jonli bildirishnomalar bilan.",
    ctaTrial: "Bepul sinab ko'rish",
    ctaPricing: "Tariflarni ko'rish",
    note: 'Karta talab qilinmaydi · bir necha daqiqada ishga tushadi',
  },
  stats: [
    { label: "Faol do'konlar", value: '500+' },
    { label: 'Kunlik operatsiya', value: '50k+' },
    { label: 'Ishlash vaqti', value: '99.9%' },
    { label: "Qo'llab-quvvatlash", value: '24/7' },
  ],
  features: {
    badge: 'Imkoniyatlar',
    title: "Biznes uchun kerak bo'lgan hamma narsa",
    subtitle: 'Mahsulotdan moliyagacha — barcha jarayonlar bitta joyda.',
    items: [
      { icon: 'box', title: 'Mahsulot va ombor', desc: "Mahsulotlar, kategoriyalar, joylashuvlar va o'lchov birliklari. Real vaqtli zaxira nazorati." },
      { icon: 'cart', title: 'Sotuv va qaytarish', desc: 'Tez kassa, qaytarishlar, mijozlar va qarzlarni boshqarish.' },
      { icon: 'barcode', title: 'Shtrix-kod', desc: 'Avtomatik shtrix-kod yaratish, chop etish va skaner orqali sotuv.' },
      { icon: 'transfer', title: "Ko'p do'kon va transfer", desc: "Bir nechta do'kon, do'konlararo ko'chirishlar va markaziy ombor." },
      { icon: 'shield', title: 'Rollar va ruxsatlar', desc: "Har bir xodimga aniq huquqlar. Faollik loglari bilan to'liq nazorat." },
      { icon: 'chart', title: 'Hisobot va tahlil', desc: 'Sotuv, foyda va zaxira bo’yicha aniq hisobotlar va eksport.' },
      { icon: 'bell', title: 'Jonli bildirishnomalar', desc: 'Kam zaxira, transfer va muhim hodisalar haqida darhol xabar.' },
      { icon: 'users', title: "Mijoz va ta'minotchi", desc: "Mijozlar bazasi, ta'minotchilar va to'lov tarixi." },
    ],
  },
  how: {
    badge: 'Qanday ishlaydi',
    title: '3 qadamda ishga tushiring',
    subtitle: 'Ortiqcha sozlamasiz, bir necha daqiqada.',
    steps: [
      { title: "Ro'yxatdan o'ting", desc: 'Bepul akkaunt yarating va kompaniyangizni qo’shing.' },
      { title: 'Sozlang', desc: "Do'kon, mahsulot va xodimlarni qo'shing. Tariflardan birini tanlang." },
      { title: 'Sotishni boshlang', desc: 'Kassa, ombor va hisobotlardan to’liq foydalaning.' },
    ],
  },
  pricing: {
    badge: 'Tariflar', title: 'Biznesingizga mos tarif', subtitle: "Shaffof narxlar. Istalgan vaqtda o'zgartiring.",
    durationDays: 'kun', popular: 'Ommabop', choose: 'Tanlash', free: 'Bepul', maxStores: "do'kon", maxUsers: 'foydalanuvchi',
    loading: 'Tariflar yuklanmoqda...', empty: 'Hozircha tariflar mavjud emas.', guarantee: 'Bepul sinov · istalgan vaqtda bekor qiling',
  },
  faq: {
    badge: 'Savollar', title: "Ko'p so'raladigan savollar",
    items: [
      { q: "Bepul sinab ko'rsam bo'ladimi?", a: "Ha, ro'yxatdan o'tib tizimni bepul sinab ko'rishingiz mumkin. Karta talab qilinmaydi." },
      { q: "Tarifni keyin o'zgartirsam bo'ladimi?", a: 'Albatta. Istalgan vaqtda yuqori yoki past tarifga o’tishingiz mumkin.' },
      { q: "Ma'lumotlarim xavfsizmi?", a: "Ha. Har bir kompaniya ma'lumoti ajratilgan va himoyalangan. Faollik loglari yuritiladi." },
      { q: "Bir nechta do'kon ulasam bo'ladimi?", a: "Ha, tarifga qarab bir nechta do'kon va xodim qo'shishingiz mumkin." },
      { q: "To'lov qanday amalga oshiriladi?", a: "To'lovlar onlayn (Payme) orqali xavfsiz amalga oshiriladi." },
    ],
  },
  cta: { title: 'Bugun bepul boshlang', subtitle: 'Bir necha daqiqada ishga tushiring. Karta kerak emas.', trial: "Bepul sinab ko'rish", login: 'Hisobga kirish' },
  footer: {
    tagline: 'Savdo va ombor boshqaruvi uchun zamonaviy SaaS.',
    product: 'Mahsulot', links: ['Imkoniyatlar', 'Tariflar', 'Qanday ishlaydi', 'Savollar'], contact: 'Aloqa', rights: 'Barcha huquqlar himoyalangan.',
  },
}

const cyrl: Dict = {
  langName: 'Ўзбекча (кирилл)',
  nav: { home: 'Бош саҳифа', features: 'Имкониятлар', pricing: 'Тарифлар', how: 'Қандай ишлайди', faq: 'Саволлар', login: 'Кириш', start: 'Бошлаш' },
  hero: {
    badge: 'Савдо ва омбор учун ягона тизим', title1: 'Бизнесингизни', title2: 'битта тизимда бошқаринг',
    subtitle: 'Zumex — сотув, омбор, кирим, инвентаризация, дўконлар ва ходимларни битта платформада бирлаштиради.',
    ctaTrial: 'Бепул синаб кўриш', ctaPricing: 'Тарифларни кўриш', note: 'Карта талаб қилинмайди',
  },
  stats: [
    { label: 'Фаол дўконлар', value: '500+' }, { label: 'Кунлик операция', value: '50k+' },
    { label: 'Ишлаш вақти', value: '99.9%' }, { label: 'Қўллаб-қувватлаш', value: '24/7' },
  ],
  features: {
    badge: 'Имкониятлар', title: 'Бизнес учун керак бўлган ҳамма нарса', subtitle: 'Маҳсулотдан молиягача — барча жараёнлар битта жойда.',
    items: [
      { icon: 'box', title: 'Маҳсулот ва омбор', desc: 'Маҳсулотлар, категориялар ва реал вақтли захира назорати.' },
      { icon: 'cart', title: 'Сотув ва қайтариш', desc: 'Тез касса, қайтаришлар, мижозлар ва қарзлар.' },
      { icon: 'barcode', title: 'Штрих-код', desc: 'Автоматик штрих-код яратиш, чоп этиш ва сканер.' },
      { icon: 'transfer', title: 'Кўп дўкон ва трансфер', desc: 'Бир неча дўкон ва дўконлараро кўчиришлар.' },
      { icon: 'shield', title: 'Роллар ва рухсатлар', desc: 'Ҳар бир ходимга аниқ ҳуқуқлар ва фаоллик логлари.' },
      { icon: 'chart', title: 'Ҳисобот ва таҳлил', desc: 'Сотув, фойда ва захира ҳисоботлари.' },
      { icon: 'bell', title: 'Жонли билдиришномалар', desc: 'Кам захира ва муҳим ҳодисалар ҳақида дарҳол хабар.' },
      { icon: 'users', title: 'Мижоз ва таъминотчи', desc: 'Мижозлар базаси ва таъминотчилар.' },
    ],
  },
  how: {
    badge: 'Қандай ишлайди', title: '3 қадамда ишга туширинг', subtitle: 'Ортиқча созламасиз, бир неча дақиқада.',
    steps: [
      { title: 'Рўйхатдан ўтинг', desc: 'Бепул аккаунт яратинг.' },
      { title: 'Созланг', desc: 'Дўкон, маҳсулот ва ходимларни қўшинг.' },
      { title: 'Сотишни бошланг', desc: 'Касса, омбор ва ҳисоботлар.' },
    ],
  },
  pricing: {
    badge: 'Тарифлар', title: 'Бизнесингизга мос тариф', subtitle: 'Шаффоф нархлар. Исталган вақтда ўзгартиринг.',
    durationDays: 'кун', popular: 'Оммабоп', choose: 'Танлаш', free: 'Бепул', maxStores: 'дўкон', maxUsers: 'фойдаланувчи',
    loading: 'Тарифлар юкланмоқда...', empty: 'Ҳозирча тарифлар мавжуд эмас.', guarantee: 'Бепул синов · исталган вақтда бекор қилинг',
  },
  faq: {
    badge: 'Саволлар', title: 'Кўп сўраладиган саволлар',
    items: [
      { q: 'Бепул синаб кўрсам бўладими?', a: 'Ҳа, рўйхатдан ўтиб бепул синаб кўришингиз мумкин.' },
      { q: 'Тарифни кейин ўзгартирсам бўладими?', a: 'Албатта, исталган вақтда ўзгартиришингиз мумкин.' },
      { q: 'Маълумотларим хавфсизми?', a: 'Ҳа, ҳар бир компания маълумоти ҳимояланган.' },
      { q: 'Бир неча дўкон уласам бўладими?', a: 'Ҳа, тарифга қараб бир неча дўкон қўшишингиз мумкин.' },
      { q: 'Тўлов қандай амалга оширилади?', a: 'Тўловлар онлайн (Payme) орқали амалга оширилади.' },
    ],
  },
  cta: { title: 'Бугун бепул бошланг', subtitle: 'Бир неча дақиқада ишга туширинг.', trial: 'Бепул синаб кўриш', login: 'Ҳисобга кириш' },
  footer: {
    tagline: 'Савдо ва омбор бошқаруви учун замонавий SaaS.',
    product: 'Маҳсулот', links: ['Имкониятлар', 'Тарифлар', 'Қандай ишлайди', 'Саволлар'], contact: 'Алоқа', rights: 'Барча ҳуқуқлар ҳимояланган.',
  },
}

const ru: Dict = {
  langName: 'Русский',
  nav: { home: 'Главная', features: 'Возможности', pricing: 'Тарифы', how: 'Как это работает', faq: 'Вопросы', login: 'Войти', start: 'Начать' },
  hero: {
    badge: 'Единая система для торговли и склада', title1: 'Управляйте бизнесом', title2: 'в одной системе',
    subtitle: 'Zumex — продажи, склад, приёмка, инвентаризация, магазины и сотрудники на одной современной платформе.',
    ctaTrial: 'Попробовать бесплатно', ctaPricing: 'Смотреть тарифы', note: 'Карта не требуется',
  },
  stats: [
    { label: 'Активных магазинов', value: '500+' }, { label: 'Операций в день', value: '50k+' },
    { label: 'Время работы', value: '99.9%' }, { label: 'Поддержка', value: '24/7' },
  ],
  features: {
    badge: 'Возможности', title: 'Всё необходимое для бизнеса', subtitle: 'От товара до финансов — все процессы в одном месте.',
    items: [
      { icon: 'box', title: 'Товары и склад', desc: 'Товары, категории и контроль остатков в реальном времени.' },
      { icon: 'cart', title: 'Продажи и возвраты', desc: 'Быстрая касса, возвраты, клиенты и долги.' },
      { icon: 'barcode', title: 'Штрих-код', desc: 'Автоматическая генерация, печать и сканер.' },
      { icon: 'transfer', title: 'Мультимагазин и перемещения', desc: 'Несколько магазинов и перемещения между ними.' },
      { icon: 'shield', title: 'Роли и права', desc: 'Точные права для каждого и журнал действий.' },
      { icon: 'chart', title: 'Отчёты и аналитика', desc: 'Отчёты по продажам, прибыли и остаткам.' },
      { icon: 'bell', title: 'Уведомления', desc: 'Мгновенные уведомления о важных событиях.' },
      { icon: 'users', title: 'Клиенты и поставщики', desc: 'База клиентов и поставщиков.' },
    ],
  },
  how: {
    badge: 'Как это работает', title: 'Запуск за 3 шага', subtitle: 'Без лишних настроек, за несколько минут.',
    steps: [
      { title: 'Регистрация', desc: 'Создайте бесплатный аккаунт.' },
      { title: 'Настройка', desc: 'Добавьте магазин, товары и сотрудников.' },
      { title: 'Начните продавать', desc: 'Касса, склад и отчёты.' },
    ],
  },
  pricing: {
    badge: 'Тарифы', title: 'Тариф для вашего бизнеса', subtitle: 'Прозрачные цены. Меняйте когда угодно.',
    durationDays: 'дней', popular: 'Популярный', choose: 'Выбрать', free: 'Бесплатно', maxStores: 'магазинов', maxUsers: 'пользователей',
    loading: 'Загрузка тарифов...', empty: 'Тарифы пока недоступны.', guarantee: 'Бесплатный период · отмена в любое время',
  },
  faq: {
    badge: 'Вопросы', title: 'Частые вопросы',
    items: [
      { q: 'Можно ли попробовать бесплатно?', a: 'Да, после регистрации вы можете протестировать систему бесплатно.' },
      { q: 'Можно ли поменять тариф?', a: 'Конечно, в любое время.' },
      { q: 'Мои данные в безопасности?', a: 'Да, данные каждой компании изолированы и защищены.' },
      { q: 'Можно ли подключить несколько магазинов?', a: 'Да, в зависимости от тарифа.' },
      { q: 'Как происходит оплата?', a: 'Оплата онлайн через Payme.' },
    ],
  },
  cta: { title: 'Начните бесплатно сегодня', subtitle: 'Запуск за несколько минут.', trial: 'Попробовать бесплатно', login: 'Войти' },
  footer: {
    tagline: 'Современный SaaS для торговли и склада.',
    product: 'Продукт', links: ['Возможности', 'Тарифы', 'Как работает', 'Вопросы'], contact: 'Контакты', rights: 'Все права защищены.',
  },
}

const en: Dict = {
  langName: 'English',
  nav: { home: 'Home', features: 'Features', pricing: 'Pricing', how: 'How it works', faq: 'FAQ', login: 'Log in', start: 'Get started' },
  hero: {
    badge: 'One system for sales & inventory', title1: 'Run your business', title2: 'in a single system',
    subtitle: 'Zumex unifies sales, inventory, stock-in, audits, stores and staff in one modern platform — with barcodes, reports and live notifications.',
    ctaTrial: 'Start free trial', ctaPricing: 'See pricing', note: 'No card required · set up in minutes',
  },
  stats: [
    { label: 'Active stores', value: '500+' }, { label: 'Daily operations', value: '50k+' },
    { label: 'Uptime', value: '99.9%' }, { label: 'Support', value: '24/7' },
  ],
  features: {
    badge: 'Features', title: 'Everything your business needs', subtitle: 'From product to finance — every process in one place.',
    items: [
      { icon: 'box', title: 'Products & inventory', desc: 'Products, categories, locations and real-time stock control.' },
      { icon: 'cart', title: 'Sales & returns', desc: 'Fast checkout, returns, customers and debt tracking.' },
      { icon: 'barcode', title: 'Barcodes', desc: 'Auto-generate, print and sell by scanning barcodes.' },
      { icon: 'transfer', title: 'Multi-store & transfers', desc: 'Multiple stores and transfers between them with a central warehouse.' },
      { icon: 'shield', title: 'Roles & permissions', desc: 'Precise rights per employee with full activity logs.' },
      { icon: 'chart', title: 'Reports & analytics', desc: 'Clear reports on sales, profit and stock with export.' },
      { icon: 'bell', title: 'Live notifications', desc: 'Instant alerts on low stock, transfers and key events.' },
      { icon: 'users', title: 'Customers & suppliers', desc: 'Customer base, suppliers and payment history.' },
    ],
  },
  how: {
    badge: 'How it works', title: 'Get started in 3 steps', subtitle: 'No heavy setup, ready in minutes.',
    steps: [
      { title: 'Sign up', desc: 'Create a free account and add your company.' },
      { title: 'Set up', desc: 'Add stores, products and staff. Pick a plan.' },
      { title: 'Start selling', desc: 'Use checkout, inventory and reports fully.' },
    ],
  },
  pricing: {
    badge: 'Pricing', title: 'A plan for your business', subtitle: 'Transparent pricing. Change anytime.',
    durationDays: 'days', popular: 'Popular', choose: 'Choose', free: 'Free', maxStores: 'stores', maxUsers: 'users',
    loading: 'Loading plans...', empty: 'No plans available yet.', guarantee: 'Free trial · cancel anytime',
  },
  faq: {
    badge: 'FAQ', title: 'Frequently asked questions',
    items: [
      { q: 'Can I try it for free?', a: 'Yes, you can test the system for free after signing up. No card required.' },
      { q: 'Can I change my plan later?', a: 'Of course, you can upgrade or downgrade at any time.' },
      { q: 'Is my data secure?', a: 'Yes. Each company’s data is isolated and protected, with activity logs.' },
      { q: 'Can I connect multiple stores?', a: 'Yes, you can add multiple stores and staff depending on your plan.' },
      { q: 'How is payment handled?', a: 'Payments are processed securely online via Payme.' },
    ],
  },
  cta: { title: 'Start free today', subtitle: 'Get up and running in minutes. No card needed.', trial: 'Start free trial', login: 'Log in' },
  footer: {
    tagline: 'A modern SaaS for sales and inventory management.',
    product: 'Product', links: ['Features', 'Pricing', 'How it works', 'FAQ'], contact: 'Contact', rights: 'All rights reserved.',
  },
}

export const DICTS: Record<LandingLang, Dict> = { uz, cyrl, ru, en }
export const LANDING_LANGS: LandingLang[] = ['uz', 'cyrl', 'ru', 'en']

export function normalizeLang(lang: string | undefined): LandingLang {
  const l = (lang || 'uz').toLowerCase()
  if (l.startsWith('cyrl') || l.startsWith('uz-cyrl')) return 'cyrl'
  if (l.startsWith('ru')) return 'ru'
  if (l.startsWith('en')) return 'en'
  return 'uz'
}
