// Full i18n dictionary for the Zumex marketing landing.
// Authored in ru / uz / en; the Cyrillic (cyrl) variant is derived from uz at
// runtime via the project's latinToCyrillic transliterator.
import { latinToCyrillic } from '../../../utils/transliteration'
import type { LandingLang } from '../types'

export interface AspDict {
  nav: { features: string; product: string; industries: string; pricing: string; stories: string; faq: string; cta: string; login: string }
  hero: { eyebrow: string; h1: string; sub: string; ctaDemo: string; ctaWatch: string; ctaRoi: string; s1: string; s2: string; s3: string }
  dash: { caption: string; live: string; revenueToday: string; vsYesterday: string; orders: string; profit: string; stock: string; clients: string; clientsGrow: string; expensesCtl: string; expensesVal: string; stockRt: string; stockAcc: string }
  trust: { kicker: string; uptime: string; stores: string; csat: string; impl: string; support: string }
  ch: { eyebrow: string; title: string; sub: string; cards: { p: string; fix: string }[] }
  erp: { eyebrow: string; title: string; sub: string; erpTitle: string; erpDesc: string; erpList: string[]; crmTitle: string; crmDesc: string; crmList: string[] }
  feat: { eyebrow: string; title: string; sub: string; items: { title: string; desc: string }[] }
  prod: { eyebrow: string; title: string; sub: string; tabs: { products: string; customers: string; suppliers: string; invoices: string; finance: string }; lowStock: string; lowStockSku: string; lowStockNote: string }
  panels: {
    products: { title: string; count: string; cols: string[]; rows: string[][] }
    customers: { title: string; count: string; cols: string[]; rows: string[][] }
    suppliers: { title: string; count: string; cols: string[]; rows: string[][] }
    invoices: { title: string; count: string; cols: string[]; rows: string[][] }
    finance: { title: string; count: string; cash: string; bank: string; net: string; cashV: string; bankV: string; netV: string; cols: string[]; rows: string[][] }
  }
  ceo: { eyebrow: string; title: string; sub: string; revMonth: string; netProfit: string; expenses: string; stockValue: string; revV: string; netV: string; expV: string; stockV: string; revD: string; netD: string; expD: string; stockD: string; profitByMonth: string; year: string; salesByStore: string; stores: { label: string; pct: string }[]; topProducts: string; top: { name: string; val: string; pct: number }[]; attention: string; att: string[] }
  ai: { eyebrow: string; title: string; sub: string; items: { title: string; desc: string }[]; panelTitle: string; updated: string; forecastLabel: string; forecastTag: string; insights: string[] }
  ben: { eyebrow: string; title: string; stats: { v: string; l: string }[]; checks: string[] }
  num: { eyebrow: string; title: string; items: { v: string; l: string }[] }
  ind: { eyebrow: string; title: string; items: string[] }
  cmp: { eyebrow: string; title: string; sub: string; feature: string; cols: string[]; rows: { label: string; vals: number[] }[] }
  roi: { eyebrow: string; title: string; sub: string; storesLabel: string; revLabel: string; savings: string; extra: string; payback: string; cta: string; perYear: string; mln: string; mlrd: string; month: string; months: string }
  price: { eyebrow: string; title: string; sub: string; popular: string; choose: string; demo: string; contactUs: string; free: string; perMonth: string; allIncl: string; allItems: string[]; note: string; loading: string; empty: string; durationDays: string; maxStores: string; maxUsers: string }
  impl: { eyebrow: string; title: string; steps: { t: string; d: string }[] }
  sec: { eyebrow: string; title: string; desc: string; items: string[] }
  story: { eyebrow: string; title: string; items: { quote: string; m: { l: string; v: string }[]; name: string; role: string; initials: string }[] }
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] }
  contact: { eyebrow: string; title: string; sub: string; phoneLabel: string; phone: string; emailLabel: string; email: string; emailPh: string; tgLabel: string; tg: string; mapLabel: string; formTitle: string; formNote: string; name: string; namePh: string; phoneL: string; phonePh: string; company: string; companyPh: string; storesL: string; storeOpts: string[]; sourceL: string; sourceOpts: { v: string; l: string }[]; submit: string; privacy: string; sending: string; success: string; error: string }
  footer: { tagline: string; product: string; productLinks: string[]; industries: string; industryLinks: string[]; company: string; companyLinks: string[]; payTitle: string; rights: string; privacy: string; terms: string; refund: string }
}

export const RU: AspDict = {
  nav: { features: 'Возможности', product: 'Продукт', industries: 'Отрасли', pricing: 'Тарифы', stories: 'Истории успеха', faq: 'FAQ', cta: 'Запросить демо', login: 'Войти' },
  hero: {
    eyebrow: 'Retail ERP + CRM для автобизнеса',
    h1: 'Управляйте всем\nавтобизнесом из\nодной системы',
    sub: 'Zumex объединяет склад, продажи, финансы и клиентов в единой облачной платформе. Контролируйте сеть магазинов, ускоряйте продажи и принимайте решения на основе данных — в реальном времени.',
    ctaDemo: 'Запросить демо', ctaWatch: 'Смотреть демо продукта', ctaRoi: 'Рассчитать ROI',
    s1: 'рост продаж', s2: 'точность склада', s3: 'экономия в неделю',
  },
  dash: { caption: 'CEO Dashboard · Zumex', live: 'Live', revenueToday: 'Выручка сегодня', vsYesterday: 'vs вчера', orders: 'Заказы', profit: 'Прибыль', stock: 'Остатки', clients: 'Клиенты', clientsGrow: '▲ 6.2% за месяц', expensesCtl: 'Расходы под контролем', expensesVal: '−14% издержек', stockRt: 'Склад · реальное время', stockAcc: '99.8% точность' },
  trust: { kicker: 'Нам доверяют автобизнесы по всему региону', uptime: 'Аптайм системы', stores: 'Магазинов на платформе', csat: 'Удовлетворённость', impl: 'Успешных внедрений', support: 'Поддержка и SLA' },
  ch: {
    eyebrow: 'Проблема', title: 'Бизнес теряет деньги там, где нет контроля',
    sub: 'Excel, разрозненные программы и «учёт в тетради» приводят к потерям, которые не видно до конца месяца. Zumex закрывает каждую из этих дыр.',
    cards: [
      { p: 'Потери на складе', fix: 'Учёт остатков в реальном времени' },
      { p: 'Учёт в Excel', fix: 'Единая база и автоматизация' },
      { p: 'Путаница в деньгах', fix: 'Финансы и P&L онлайн' },
      { p: 'Ошибки склада', fix: 'Штрихкоды и QR-приёмка' },
      { p: 'Упущенные продажи', fix: 'Авто-заказ по минимуму' },
      { p: 'Долги клиентов', fix: 'Управление дебиторкой' },
      { p: 'Слабая отчётность', fix: 'Отчёты в один клик' },
      { p: 'Нет прозрачности', fix: 'CEO Dashboard 24/7' },
    ],
  },
  erp: {
    eyebrow: 'Что такое Zumex', title: 'ERP и CRM в одной платформе',
    sub: 'ERP управляет ресурсами — складом, закупками, финансами. CRM управляет отношениями — клиентами, продажами, лояльностью. Вместе они дают полную картину и единый контроль.',
    erpTitle: 'ERP — ресурсы', erpDesc: 'Склад, остатки, закупки, перемещения, финансы, расходы и прибыль — всё считается автоматически и точно.',
    erpList: ['Складской учёт в реальном времени', 'Закупки и поставщики', 'Финансы, касса и банк'],
    crmTitle: 'CRM — отношения', crmDesc: 'Клиенты, история покупок, долги, программы лояльности и продажи — всё в одной карточке клиента.',
    crmList: ['База клиентов и история', 'Долги и рассрочки', 'Лояльность и продажи'],
  },
  feat: {
    eyebrow: 'Возможности', title: 'Почему компании выбирают Zumex',
    sub: 'Один продукт закрывает весь цикл автобизнеса — от приёмки на склад до решения собственника.',
    items: [
      { title: 'Склад в реальном времени', desc: 'Никогда не теряйте товар и не затоваривайтесь — точные остатки по всем точкам экономят деньги на каждой закупке.' },
      { title: 'Автоматизация склада', desc: 'Приёмка и инвентаризация в разы быстрее и без пересортицы — меньше потерь, меньше ручного труда.' },
      { title: 'POS / Касса', desc: 'Продавайте за секунды на любом устройстве — короче очереди, выше средний чек, ноль ошибок кассира.' },
      { title: 'База клиентов', desc: 'Знайте каждого клиента и возвращайте его снова — повторные продажи и лояльность растут сами.' },
      { title: 'Поставщики и закупки', desc: 'Заказывайте вовремя и по лучшей цене — меньше денег заморожено на складе, больше оборота.' },
      { title: 'Финансы и прибыль', desc: 'Видите прибыль, расходы и денежный поток за секунды — решения на цифрах, а не на догадках.' },
      { title: 'Дебиторка и долги', desc: 'Контролируйте каждый долг — деньги возвращаются в бизнес, а не зависают у клиентов.' },
      { title: 'Мульти-магазин', desc: 'Управляйте сетью как единым целым — перемещения и сравнение точек без хаоса и Excel.' },
      { title: 'Роли и права', desc: 'Каждый сотрудник видит только своё — порядок и безопасность при любом размере штата.' },
      { title: 'Штрихкоды и QR', desc: 'Сканируйте вместо ручного ввода — ноль ошибок и часы сэкономленного времени каждую неделю.' },
      { title: 'Уведомления', desc: 'Узнавайте о низких остатках и долгах раньше, чем они превратятся в упущенную выручку.' },
      { title: 'CEO Dashboard', desc: 'Весь бизнес на одном экране — принимайте решения за минуты, а не за дни ожидания отчётов.' },
    ],
  },
  prod: {
    eyebrow: 'Демонстрация продукта', title: 'Реальная система, а не картинки',
    sub: 'Так выглядит рабочий день в Zumex. Переключайтесь между модулями.',
    tabs: { products: 'Товары', customers: 'Клиенты', suppliers: 'Поставщики', invoices: 'Накладные', finance: 'Финансы' },
    lowStock: 'Низкий остаток', lowStockSku: '14 SKU', lowStockNote: 'требуют закупки',
  },
  panels: {
    products: { title: 'Товары', count: '8 940 SKU', cols: ['Артикул', 'Наименование', 'Остаток', 'Цена', 'Статус'], rows: [
      ['BR-4471', 'Тормозные колодки Bosch', '420 шт', '180 000', 'В наличии'],
      ['OIL-530', 'Масло Mobil 5W-30 4л', '38 шт', '240 000', 'Мало'],
      ['FLT-118', 'Фильтр воздушный Mann', '210 шт', '95 000', 'В наличии'],
      ['SPK-902', 'Свечи NGK (компл.)', '6 шт', '320 000', 'Заказать'],
      ['BAT-770', 'Аккумулятор Varta 60Ah', '54 шт', '1 450 000', 'В наличии'],
    ] },
    customers: { title: 'Клиенты', count: '12 480 контактов', cols: ['Клиент', 'Тип', 'Покупок', 'Долг', 'LTV'], rows: [
      ['СТО «Мотор»', 'B2B', '184', '42 000 000', '1.2 млрд'],
      ['Алишер Хакимов', 'Розница', '37', '0', '84 000 000'],
      ['Автопарк «Логист»', 'B2B', '291', '118 000 000', '2.4 млрд'],
      ['Дилноза Каримова', 'Розница', '12', '0', '21 000 000'],
      ['Сеть «ProTyre»', 'Партнёр', '512', '0', '5.1 млрд'],
    ] },
    suppliers: { title: 'Поставщики', count: '64 активных', cols: ['Поставщик', 'Категория', 'Заказов', 'Оборот', 'Условия'], rows: [
      ['Bosch Distribution', 'Тормоза', '88', '1.8 млрд', '30 дней'],
      ['Mobil Lubricants', 'Масла', '54', '940 млн', 'Предоплата'],
      ['Mann+Hummel', 'Фильтры', '41', '610 млн', '14 дней'],
      ['NGK Spark', 'Электрика', '33', '420 млн', '30 дней'],
      ['Varta Batteries', 'АКБ', '27', '1.1 млрд', '21 день'],
    ] },
    invoices: { title: 'Накладные', count: 'Сегодня · 42', cols: ['№', 'Контрагент', 'Тип', 'Сумма', 'Статус'], rows: [
      ['#10428', 'СТО «Мотор»', 'Продажа', '18 400 000', 'Оплачена'],
      ['#10427', 'Bosch Distribution', 'Закупка', '240 000 000', 'Ожидает'],
      ['#10426', 'Автопарк «Логист»', 'Продажа', '61 200 000', 'В долг'],
      ['#10425', 'Розничный клиент', 'Продажа', '2 340 000', 'Оплачена'],
      ['#10424', 'Перемещение → Чиланзар', 'Трансфер', '88 000 000', 'Принято'],
    ] },
    finance: { title: 'Финансы', count: 'Декабрь 2025', cash: 'Касса', bank: 'Банк', net: 'Чистая прибыль', cashV: '482 000 000', bankV: '1.94 млрд', netV: '1.61 млрд', cols: ['Статья', 'Тип', 'Сумма'], rows: [
      ['Выручка от продаж', 'Доход', '4 820 000 000'],
      ['Закупка товара', 'Расход', '2 410 000 000'],
      ['Зарплата', 'Расход', '540 000 000'],
      ['Аренда', 'Расход', '180 000 000'],
      ['Прочие доходы', 'Доход', '80 000 000'],
    ] },
  },
  ceo: {
    eyebrow: 'CEO Analytics', title: 'Весь бизнес на одном экране',
    sub: 'Выручка, прибыль, расходы, склад и долги — в реальном времени, на любом устройстве.',
    revMonth: 'Выручка за месяц', netProfit: 'Чистая прибыль', expenses: 'Расходы', stockValue: 'Стоимость склада',
    revV: '4.82 млрд', netV: '1.61 млрд', expV: '3.21 млрд', stockV: '9.40 млрд',
    revD: '▲ 18.4% MoM', netD: '▲ 12.0%', expD: '▼ 14.0% издержек', stockD: '8 940 позиций',
    profitByMonth: 'Прибыль по месяцам', year: '2025', salesByStore: 'Продажи по магазинам',
    stores: [{ label: 'Центр', pct: '40%' }, { label: 'Юнусабад', pct: '25%' }, { label: 'Чиланзар', pct: '20%' }, { label: 'Склад', pct: '15%' }],
    topProducts: 'Топ товаров',
    top: [{ name: 'Тормозные колодки', val: '1 240', pct: 88 }, { name: 'Масло 5W-30', val: '1 010', pct: 72 }, { name: 'Фильтр воздушный', val: '820', pct: 58 }, { name: 'Свечи зажигания', val: '615', pct: 44 }],
    attention: 'Внимание руководителя',
    att: ['<b>14 SKU</b> ниже минимума', 'Дебиторка <b>312 млн</b> · 8 клиентов', 'Юнусабад <b>+24%</b> к плану'],
  },
  ai: {
    eyebrow: 'AI внутри', title: 'Интеллект, который растит вашу прибыль',
    sub: 'Zumex анализирует ваши продажи и склад и подсказывает, что закупить, что продвигать и где вы теряете деньги — ещё до того, как это случится.',
    items: [
      { title: 'AI-прогноз продаж', desc: 'Видите спрос наперёд' },
      { title: 'Умные закупки', desc: 'Что и сколько заказать' },
      { title: 'Прогноз спроса', desc: 'Сезоны и тренды' },
      { title: 'Предиктивные отчёты', desc: 'Решения на опережение' },
    ],
    panelTitle: 'AI Insights', updated: 'обновлено сейчас', forecastLabel: 'Прогноз продаж · следующие 7 дней', forecastTag: 'прогноз AI',
    insights: [
      'Закупите <b>«Масло 5W-30»</b> — спрос вырастет на 18% к выходным',
      '<b>«Свечи NGK»</b> закончатся через 4 дня — пора заказать',
      'Продвигайте <b>«Колодки Bosch»</b> — маржа выше на 12%',
    ],
  },
  ben: {
    eyebrow: 'Бизнес-результат', title: 'Не функции — а деньги и время',
    stats: [{ v: '+37%', l: 'рост продаж за счёт наличия и скорости' }, { v: '−14%', l: 'операционных издержек' }, { v: '12 ч', l: 'экономии времени сотрудников в неделю' }, { v: '99.8%', l: 'точность остатков, минус потери' }],
    checks: ['Быстрые решения на данных', 'Лояльность и удержание клиентов', 'Масштабирование на сеть магазинов', 'Прозрачность для собственника', 'Меньше финансовых утечек', 'Ноль ошибок ручного учёта'],
  },
  num: {
    eyebrow: 'В цифрах', title: 'Нам доверяют в масштабе',
    items: [{ v: '500+', l: 'магазинов' }, { v: '4.8 млн', l: 'заказов обработано' }, { v: '12.6 млн', l: 'транзакций' }, { v: '38 млн', l: 'складских операций' }, { v: '3', l: 'страны' }, { v: '8+', l: 'лет на рынке' }],
  },
  ind: {
    eyebrow: 'Отрасли', title: 'Создано для автобизнеса любого масштаба',
    items: ['Магазины автозапчастей', 'Автоаксессуары', 'Розничные сети', 'Дистрибьюторы', 'Оптовые склады', 'Складская логистика', 'Автосервисы', 'Шинные центры', 'Магазины масел', 'Автоэлектроника', 'Франшизные сети', 'Wholesale-трейдеры'],
  },
  cmp: {
    eyebrow: 'Сравнение', title: 'Почему переходят на Zumex',
    sub: 'Excel, разрозненные программы и базовый POS не дают целостной картины — и тихо съедают прибыль.',
    feature: 'Возможность', cols: ['Excel', 'Базовый POS', 'Разрозненный софт'],
    rows: [
      { label: 'Единая платформа', vals: [0, 0, 0] },
      { label: 'Остатки в реальном времени', vals: [0, 1, 1] },
      { label: 'Мульти-магазин и перемещения', vals: [0, 0, 1] },
      { label: 'Финансы, прибыль, дебиторка', vals: [1, 0, 1] },
      { label: 'CEO-аналитика и дашборды', vals: [0, 0, 0] },
      { label: 'Облачный доступ 24/7', vals: [0, 1, 1] },
      { label: 'Роли, права и аудит', vals: [0, 0, 1] },
      { label: 'AI-подсказки и прогнозы', vals: [0, 0, 0] },
    ],
  },
  roi: {
    eyebrow: 'Калькулятор выгоды', title: 'Сколько вы экономите с Zumex',
    sub: 'Подвигайте ползунки под свой бизнес. Расчёт примерный — на основе среднего эффекта у клиентов.',
    storesLabel: 'Количество магазинов', revLabel: 'Выручка на магазин, млн сум/мес',
    savings: 'Потенциальная экономия в год', extra: 'Доп. выручка от роста продаж', payback: 'Окупаемость подписки', cta: 'Начать сейчас',
    perYear: 'в год', mln: 'млн сум', mlrd: 'млрд сум', month: '≈ 1 месяц', months: 'мес',
  },
  price: {
    eyebrow: 'Тарифы', title: 'Прозрачные планы под ваш масштаб',
    sub: 'Выберите тариф под размер бизнеса. Поможем рассчитать окупаемость до старта.',
    popular: 'Популярный выбор', choose: 'Начать', demo: 'Запросить демо', contactUs: 'Связаться с нами',
    free: 'Бесплатно', perMonth: 'сум/мес',
    allIncl: 'Во всех тарифах:', allItems: ['Облачный хостинг', 'Регулярные обновления', 'Онбординг и обучение', 'Поддержка 24/7', 'Ежедневные бэкапы'],
    note: 'Поможем рассчитать окупаемость до старта и подберём оптимальный тариф под ваш бизнес.',
    loading: 'Загружаем тарифы…', empty: 'Тарифы скоро появятся. Свяжитесь с нами для расчёта.',
    durationDays: 'дней', maxStores: 'магазинов', maxUsers: 'пользователей',
  },
  impl: {
    eyebrow: 'Внедрение', title: 'Запуск за недели, а не месяцы',
    steps: [
      { t: 'Анализ', d: 'Изучаем процессы и цели бизнеса.' },
      { t: 'Настройка', d: 'Конфигурируем систему под вас.' },
      { t: 'Миграция', d: 'Переносим товары, остатки, клиентов.' },
      { t: 'Обучение', d: 'Готовим команду к работе.' },
      { t: 'Тестирование', d: 'Проверяем все сценарии.' },
      { t: 'Запуск', d: 'Запускаем в продуктив.' },
      { t: 'Поддержка', d: 'Сопровождаем 24/7.' },
      { t: 'Успех', d: 'Растём вместе с вами.' },
    ],
  },
  sec: {
    eyebrow: 'Безопасность', title: 'Корпоративный уровень защиты',
    desc: 'Ваши данные шифруются, резервируются и доступны только тем, кому вы разрешили. Полный аудит каждого действия.',
    items: ['Шифрование БД', 'Ежедневные бэкапы', 'Роли и права', 'Журнал аудита'],
  },
  story: {
    eyebrow: 'Истории успеха', title: 'Цифры до и после внедрения',
    items: [
      { quote: '«Впервые вижу прибыль по каждому магазину в реальном времени. Потери на складе упали почти до нуля.»', m: [{ l: 'Продажи', v: '+41%' }, { l: 'Потери', v: '−92%' }], name: 'Алишер Х.', role: 'Владелец, сеть AutoMax', initials: 'АХ' },
      { quote: '«Перешли с Excel за неделю. Команда экономит десятки часов, а отчёты собираются сами.»', m: [{ l: 'Время', v: '−15ч/нед' }, { l: 'Издержки', v: '−18%' }], name: 'Дилноза К.', role: 'Операционный директор, DETALI.uz', initials: 'ДК' },
      { quote: '«Масштабировали с 2 до 9 точек без хаоса. CEO Dashboard — то, чего нам не хватало годами.»', m: [{ l: 'Точки', v: '2 → 9' }, { l: 'ROI', v: '7 мес' }], name: 'Сардор Р.', role: 'CEO, ProTyre Network', initials: 'СР' },
    ],
  },
  faq: {
    eyebrow: 'Вопросы и ответы', title: 'Что чаще всего спрашивают руководители',
    items: [
      { q: 'Чем Zumex отличается от обычной учётной программы?', a: 'Это единая ERP + CRM: склад, продажи, финансы и клиенты работают в одной системе, а руководитель видит весь бизнес в реальном времени.' },
      { q: 'Сколько времени занимает внедрение?', a: 'В среднем от одной до трёх недель в зависимости от числа магазинов и объёма данных. Миграцию и обучение мы берём на себя.' },
      { q: 'Можно ли перенести данные из Excel или 1С?', a: 'Да. Мы импортируем товары, остатки, цены, клиентов и поставщиков, чтобы вы стартовали без потери истории.' },
      { q: 'Подходит ли система для сети магазинов?', a: 'Да. Мульти-магазин, перемещения между точками и складами и единая аналитика — ключевые сценарии платформы.' },
      { q: 'Работает ли система в облаке?', a: 'Да, это облачное решение с доступом из браузера и с мобильных устройств. Локальное развёртывание возможно на тарифе Premium.' },
      { q: 'Насколько защищены наши данные?', a: 'Данные шифруются, ежедневно резервируются, доступ разграничен по ролям, а каждое действие фиксируется в журнале аудита.' },
      { q: 'Есть ли мобильный доступ?', a: 'Да. Руководитель и сотрудники могут работать с телефона и планшета — продажи, склад и дашборды доступны везде.' },
      { q: 'Поддерживаются ли штрихкоды и QR?', a: 'Да. Сканирование ускоряет приёмку, продажу и инвентаризацию и исключает ошибки ручного ввода.' },
      { q: 'Как считается прибыль?', a: 'Система автоматически учитывает себестоимость, продажи, скидки и расходы, формируя P&L по магазинам и периодам.' },
      { q: 'Можно ли ограничить права сотрудников?', a: 'Да, гибкая ролевая модель: кассир, кладовщик, менеджер, бухгалтер, директор — у каждого свой доступ.' },
      { q: 'Что с долгами клиентов?', a: 'Дебиторка под полным контролем: лимиты, рассрочки, напоминания и отчёты по задолженности.' },
      { q: 'Есть ли интеграции и API?', a: 'На тарифе Premium доступен REST API и интеграции с маркетплейсами, бухгалтерией и платёжными сервисами.' },
      { q: 'Получим ли мы обучение команды?', a: 'Да, обучение входит во внедрение. Также есть база знаний и поддержка 24/7.' },
      { q: 'Что если у нас вырастет число магазинов?', a: 'Платформа масштабируется: добавляйте точки, склады и пользователей без смены системы.' },
      { q: 'Можно ли начать с одного магазина?', a: 'Да, тариф Standard рассчитан на один магазин, а перейти на Gold или Premium можно в любой момент.' },
      { q: 'Сколько стоит и есть ли пробный период?', a: 'Тарифы прозрачны и зависят от масштаба. Мы проводим демо и помогаем рассчитать окупаемость до старта.' },
      { q: 'Будет ли поддержка после запуска?', a: 'Да, сопровождение 24/7, обновления и помощь персонального менеджера на старших тарифах.' },
      { q: 'Поможет ли система снизить потери?', a: 'Точный учёт остатков и аудит снижают недостачи и пересортицу — клиенты фиксируют падение потерь в разы.' },
      { q: 'Поддерживаются ли несколько языков?', a: 'Да, интерфейс доступен на русском, узбекском и английском с мгновенным переключением.' },
      { q: 'С чего начать?', a: 'Запросите демо — мы покажем систему на ваших процессах и подготовим план внедрения под ваш бизнес.' },
    ],
  },
  contact: {
    eyebrow: 'Свяжитесь с нами', title: 'Посмотрите Zumex в деле',
    sub: 'Покажем систему на ваших процессах за 30 минут. Персональная демонстрация и расчёт окупаемости.',
    phoneLabel: 'Телефон', phone: '+998 (00) 000-00-00', emailLabel: 'Email', email: 'sales@zumex.uz', emailPh: 'Ваш email', tgLabel: 'Telegram', tg: '@zumex', mapLabel: 'Ташкент · офис продаж',
    formTitle: 'Запросить демо', formNote: 'Ответим в течение рабочего дня.',
    name: 'Имя', namePh: 'Ваше имя', phoneL: 'Телефон', phonePh: '+998', company: 'Компания', companyPh: 'Название компании',
    storesL: 'Количество магазинов', storeOpts: ['1 магазин', '2–5 магазинов', '6–15 магазинов', '16+ / сеть'],
    sourceL: 'Откуда вы о нас узнали?',
    sourceOpts: [
      { v: 'instagram', l: 'Instagram' }, { v: 'telegram', l: 'Telegram' }, { v: 'facebook', l: 'Facebook' },
      { v: 'youtube', l: 'YouTube' }, { v: 'google', l: 'Поиск Google' }, { v: 'referral', l: 'Рекомендация' },
      { v: 'website', l: 'Сайт' }, { v: 'other', l: 'Другое' },
    ],
    submit: 'Получить демонстрацию', privacy: 'Нажимая, вы соглашаетесь с политикой конфиденциальности.',
    sending: 'Отправляем…', success: 'Спасибо! Мы свяжемся с вами в ближайшее время.', error: 'Не удалось отправить. Попробуйте позже.',
  },
  footer: {
    tagline: 'Облачная ERP и CRM платформа для управления и масштабирования автобизнеса.',
    product: 'Продукт', productLinks: ['Возможности', 'Демо продукта', 'Тарифы', 'Документация'],
    industries: 'Отрасли', industryLinks: ['Магазины автозапчастей', 'Шинные центры', 'Дистрибьюторы', 'Франшизы'],
    company: 'Компания', companyLinks: ['Истории успеха', 'Контакты', 'Безопасность', 'Поддержка'],
    payTitle: 'Способы оплаты',
    rights: '© 2026 Zumex. Все права защищены.', privacy: 'Политика конфиденциальности', terms: 'Условия использования', refund: 'Политика возврата',
  },
}

export const UZ: AspDict = {
  nav: { features: 'Imkoniyatlar', product: 'Mahsulot', industries: 'Sohalar', pricing: 'Tariflar', stories: 'Muvaffaqiyat tarixi', faq: 'FAQ', cta: 'Demo so\'rash', login: 'Kirish' },
  hero: {
    eyebrow: 'Avtobiznes uchun Retail ERP + CRM',
    h1: 'Butun\navtobiznesni bitta\ntizimdan boshqaring',
    sub: 'Zumex ombor, sotuv, moliya va mijozlarni yagona bulutli platformada birlashtiradi. Do\'konlar tarmog\'ini nazorat qiling, sotuvni tezlashtiring va ma\'lumotlarga asoslangan qarorlar qabul qiling — real vaqtda.',
    ctaDemo: 'Demo so\'rash', ctaWatch: 'Mahsulot demosini ko\'rish', ctaRoi: 'ROI hisoblash',
    s1: 'sotuv o\'sishi', s2: 'ombor aniqligi', s3: 'haftalik tejam',
  },
  dash: { caption: 'CEO Dashboard · Zumex', live: 'Live', revenueToday: 'Bugungi tushum', vsYesterday: 'kechagiga nisbatan', orders: 'Buyurtmalar', profit: 'Foyda', stock: 'Qoldiqlar', clients: 'Mijozlar', clientsGrow: '▲ 6.2% oyiga', expensesCtl: 'Xarajatlar nazoratda', expensesVal: '−14% xarajat', stockRt: 'Ombor · real vaqt', stockAcc: '99.8% aniqlik' },
  trust: { kicker: 'Mintaqadagi avtobizneslar bizga ishonadi', uptime: 'Tizim uptime', stores: 'Platformadagi do\'konlar', csat: 'Mamnunlik', impl: 'Muvaffaqiyatli joriy etish', support: 'Qo\'llab-quvvatlash va SLA' },
  ch: {
    eyebrow: 'Muammo', title: 'Nazorat yo\'q joyda biznes pul yo\'qotadi',
    sub: 'Excel, tarqoq dasturlar va «daftarda hisob» oy oxirigacha ko\'rinmaydigan yo\'qotishlarga olib keladi. Zumex bu teshiklarning har birini yopadi.',
    cards: [
      { p: 'Omborda yo\'qotishlar', fix: 'Real vaqtda qoldiqlar hisobi' },
      { p: 'Excelda hisob', fix: 'Yagona baza va avtomatlashtirish' },
      { p: 'Pulda chalkashlik', fix: 'Moliya va P&L onlayn' },
      { p: 'Ombor xatolari', fix: 'Shtrix-kod va QR-qabul' },
      { p: 'Qo\'ldan ketgan sotuvlar', fix: 'Minimum bo\'yicha avto-buyurtma' },
      { p: 'Mijozlar qarzlari', fix: 'Debitorlik boshqaruvi' },
      { p: 'Zaif hisobot', fix: 'Bir bosishda hisobotlar' },
      { p: 'Shaffoflik yo\'q', fix: 'CEO Dashboard 24/7' },
    ],
  },
  erp: {
    eyebrow: 'Zumex nima', title: 'ERP va CRM bitta platformada',
    sub: 'ERP resurslarni — ombor, xaridlar, moliyani boshqaradi. CRM munosabatlarni — mijozlar, sotuv, sodiqlikni boshqaradi. Birgalikda ular to\'liq manzara va yagona nazorat beradi.',
    erpTitle: 'ERP — resurslar', erpDesc: 'Ombor, qoldiqlar, xaridlar, ko\'chirishlar, moliya, xarajatlar va foyda — hammasi avtomatik va aniq hisoblanadi.',
    erpList: ['Real vaqtda ombor hisobi', 'Xaridlar va yetkazib beruvchilar', 'Moliya, kassa va bank'],
    crmTitle: 'CRM — munosabatlar', crmDesc: 'Mijozlar, xaridlar tarixi, qarzlar, sodiqlik dasturlari va sotuvlar — hammasi bitta mijoz kartochkasida.',
    crmList: ['Mijozlar bazasi va tarixi', 'Qarzlar va bo\'lib to\'lash', 'Sodiqlik va sotuvlar'],
  },
  feat: {
    eyebrow: 'Imkoniyatlar', title: 'Nega kompaniyalar Zumex ni tanlaydi',
    sub: 'Bitta mahsulot avtobiznesning butun siklini qamrab oladi — omborga qabuldan tortib egasining qaroriga qadar.',
    items: [
      { title: 'Real vaqtda ombor', desc: 'Hech qachon tovarni yo\'qotmang va ortiqcha zaxira to\'plamang — barcha nuqtalar bo\'yicha aniq qoldiqlar har bir xaridda pul tejaydi.' },
      { title: 'Ombor avtomatlashtirish', desc: 'Qabul va inventarizatsiya bir necha barobar tezroq va saralash xatosiz — kamroq yo\'qotish, kamroq qo\'l mehnati.' },
      { title: 'POS / Kassa', desc: 'Istalgan qurilmada bir necha soniyada soting — qisqaroq navbat, yuqoriroq o\'rtacha chek, kassir xatosi nol.' },
      { title: 'Mijozlar bazasi', desc: 'Har bir mijozni biling va uni qayta qaytaring — takroriy sotuvlar va sodiqlik o\'z-o\'zidan o\'sadi.' },
      { title: 'Yetkazib beruvchilar va xaridlar', desc: 'O\'z vaqtida va eng yaxshi narxda buyurtma bering — omborda kamroq pul muzlatiladi, ko\'proq aylanma.' },
      { title: 'Moliya va foyda', desc: 'Foyda, xarajatlar va pul oqimini bir necha soniyada ko\'ring — taxminga emas, raqamga asoslangan qarorlar.' },
      { title: 'Debitorlik va qarzlar', desc: 'Har bir qarzni nazorat qiling — pul mijozlarda osilib qolmasdan, biznesga qaytadi.' },
      { title: 'Multi-do\'kon', desc: 'Tarmoqni yagona bir butun sifatida boshqaring — ko\'chirishlar va nuqtalarni taqqoslash xaossiz va Excelsiz.' },
      { title: 'Rollar va huquqlar', desc: 'Har bir xodim faqat o\'ziniknigina ko\'radi — istalgan shtat hajmida tartib va xavfsizlik.' },
      { title: 'Shtrix-kod va QR', desc: 'Qo\'lda kiritish o\'rniga skanerlang — nol xato va har hafta tejalgan soatlar.' },
      { title: 'Bildirishnomalar', desc: 'Past qoldiqlar va qarzlar haqida ular qo\'ldan ketgan tushumga aylanmasdan oldin biling.' },
      { title: 'CEO Dashboard', desc: 'Butun biznes bitta ekranda — hisobotlarni kunlab kutmasdan, daqiqalarda qaror qabul qiling.' },
    ],
  },
  prod: {
    eyebrow: 'Mahsulot namoyishi', title: 'Rasmlar emas, haqiqiy tizim',
    sub: 'Zumex dagi ish kuni shunday ko\'rinadi. Modullar orasida almashing.',
    tabs: { products: 'Tovarlar', customers: 'Mijozlar', suppliers: 'Yetkazib beruvchilar', invoices: 'Yuk xatlari', finance: 'Moliya' },
    lowStock: 'Past qoldiq', lowStockSku: '14 SKU', lowStockNote: 'xarid talab qiladi',
  },
  panels: {
    products: { title: 'Tovarlar', count: '8 940 SKU', cols: ['Artikul', 'Nomi', 'Qoldiq', 'Narx', 'Holat'], rows: [
      ['BR-4471', 'Bosch tormoz kolodkalari', '420 dona', '180 000', 'Mavjud'],
      ['OIL-530', 'Mobil 5W-30 moyi 4l', '38 dona', '240 000', 'Kam'],
      ['FLT-118', 'Mann havo filtri', '210 dona', '95 000', 'Mavjud'],
      ['SPK-902', 'NGK svechalari (kompl.)', '6 dona', '320 000', 'Buyurtma'],
      ['BAT-770', 'Varta 60Ah akkumulyatori', '54 dona', '1 450 000', 'Mavjud'],
    ] },
    customers: { title: 'Mijozlar', count: '12 480 kontakt', cols: ['Mijoz', 'Turi', 'Xaridlar', 'Qarz', 'LTV'], rows: [
      ['«Motor» STX', 'B2B', '184', '42 000 000', '1.2 mlrd'],
      ['Alisher Hakimov', 'Chakana', '37', '0', '84 000 000'],
      ['«Logist» avtopark', 'B2B', '291', '118 000 000', '2.4 mlrd'],
      ['Dilnoza Karimova', 'Chakana', '12', '0', '21 000 000'],
      ['«ProTyre» tarmog\'i', 'Hamkor', '512', '0', '5.1 mlrd'],
    ] },
    suppliers: { title: 'Yetkazib beruvchilar', count: '64 faol', cols: ['Yetkazib beruvchi', 'Kategoriya', 'Buyurtmalar', 'Aylanma', 'Shartlar'], rows: [
      ['Bosch Distribution', 'Tormozlar', '88', '1.8 mlrd', '30 kun'],
      ['Mobil Lubricants', 'Moylar', '54', '940 mln', 'Oldindan to\'lov'],
      ['Mann+Hummel', 'Filtrlar', '41', '610 mln', '14 kun'],
      ['NGK Spark', 'Elektrika', '33', '420 mln', '30 kun'],
      ['Varta Batteries', 'AKB', '27', '1.1 mlrd', '21 kun'],
    ] },
    invoices: { title: 'Yuk xatlari', count: 'Bugun · 42', cols: ['№', 'Kontragent', 'Turi', 'Summa', 'Holat'], rows: [
      ['#10428', '«Motor» STX', 'Sotuv', '18 400 000', 'To\'langan'],
      ['#10427', 'Bosch Distribution', 'Xarid', '240 000 000', 'Kutilmoqda'],
      ['#10426', '«Logist» avtopark', 'Sotuv', '61 200 000', 'Qarzga'],
      ['#10425', 'Chakana mijoz', 'Sotuv', '2 340 000', 'To\'langan'],
      ['#10424', 'Ko\'chirish → Chilonzor', 'Transfer', '88 000 000', 'Qabul qilindi'],
    ] },
    finance: { title: 'Moliya', count: 'Dekabr 2025', cash: 'Kassa', bank: 'Bank', net: 'Sof foyda', cashV: '482 000 000', bankV: '1.94 mlrd', netV: '1.61 mlrd', cols: ['Modda', 'Turi', 'Summa'], rows: [
      ['Sotuvdan tushum', 'Daromad', '4 820 000 000'],
      ['Tovar xaridi', 'Xarajat', '2 410 000 000'],
      ['Ish haqi', 'Xarajat', '540 000 000'],
      ['Ijara', 'Xarajat', '180 000 000'],
      ['Boshqa daromadlar', 'Daromad', '80 000 000'],
    ] },
  },
  ceo: {
    eyebrow: 'CEO Analytics', title: 'Butun biznes bitta ekranda',
    sub: 'Tushum, foyda, xarajatlar, ombor va qarzlar — real vaqtda, istalgan qurilmada.',
    revMonth: 'Oylik tushum', netProfit: 'Sof foyda', expenses: 'Xarajatlar', stockValue: 'Ombor qiymati',
    revV: '4.82 mlrd', netV: '1.61 mlrd', expV: '3.21 mlrd', stockV: '9.40 mlrd',
    revD: '▲ 18.4% MoM', netD: '▲ 12.0%', expD: '▼ 14.0% xarajat', stockD: '8 940 pozitsiya',
    profitByMonth: 'Oylar bo\'yicha foyda', year: '2025', salesByStore: 'Do\'konlar bo\'yicha sotuvlar',
    stores: [{ label: 'Markaz', pct: '40%' }, { label: 'Yunusobod', pct: '25%' }, { label: 'Chilonzor', pct: '20%' }, { label: 'Ombor', pct: '15%' }],
    topProducts: 'Eng yaxshi tovarlar',
    top: [{ name: 'Tormoz kolodkalari', val: '1 240', pct: 88 }, { name: 'Moy 5W-30', val: '1 010', pct: 72 }, { name: 'Havo filtri', val: '820', pct: 58 }, { name: 'Yondirish svechalari', val: '615', pct: 44 }],
    attention: 'Rahbar e\'tibori',
    att: ['<b>14 SKU</b> minimumdan past', 'Debitorlik <b>312 mln</b> · 8 mijoz', 'Yunusobod <b>+24%</b> rejaga nisbatan'],
  },
  ai: {
    eyebrow: 'Ichida AI', title: 'Foydangizni o\'stiradigan aql',
    sub: 'Zumex sotuvlaringiz va omboringizni tahlil qiladi hamda nimani xarid qilish, nimani targ\'ib qilish va qayerda pul yo\'qotayotganingizni — bu sodir bo\'lishidan oldin aytib beradi.',
    items: [
      { title: 'AI-sotuv prognozi', desc: 'Talabni oldindan ko\'rasiz' },
      { title: 'Aqlli xaridlar', desc: 'Nimani va qancha buyurtma qilish' },
      { title: 'Talab prognozi', desc: 'Mavsumlar va trendlar' },
      { title: 'Prediktiv hisobotlar', desc: 'Vaziyatni ilg\'ab qarorlar' },
    ],
    panelTitle: 'AI Insights', updated: 'hozir yangilandi', forecastLabel: 'Sotuv prognozi · keyingi 7 kun', forecastTag: 'AI prognozi',
    insights: [
      '<b>«Moy 5W-30»</b> ni xarid qiling — talab dam olish kunlariga 18% oshadi',
      '<b>«NGK svechalari»</b> 4 kundan keyin tugaydi — buyurtma berish vaqti',
      '<b>«Bosch kolodkalari»</b> ni targ\'ib qiling — marja 12% yuqoriroq',
    ],
  },
  ben: {
    eyebrow: 'Biznes natijasi', title: 'Funksiyalar emas — pul va vaqt',
    stats: [{ v: '+37%', l: 'mavjudlik va tezlik hisobiga sotuv o\'sishi' }, { v: '−14%', l: 'operatsion xarajatlar' }, { v: '12 soat', l: 'haftada xodimlar vaqtini tejash' }, { v: '99.8%', l: 'qoldiqlar aniqligi, yo\'qotishlar kamayadi' }],
    checks: ['Ma\'lumotlarga asoslangan tezkor qarorlar', 'Mijozlar sodiqligi va ushlab turish', 'Do\'konlar tarmog\'iga masshtablash', 'Egasi uchun shaffoflik', 'Kamroq moliyaviy oqib ketishlar', 'Qo\'lda hisob xatolari nol'],
  },
  num: {
    eyebrow: 'Raqamlarda', title: 'Bizga keng miqyosda ishonishadi',
    items: [{ v: '500+', l: 'do\'kon' }, { v: '4.8 mln', l: 'buyurtma qayta ishlangan' }, { v: '12.6 mln', l: 'tranzaksiya' }, { v: '38 mln', l: 'ombor operatsiyasi' }, { v: '3', l: 'mamlakat' }, { v: '8+', l: 'yil bozorda' }],
  },
  ind: {
    eyebrow: 'Sohalar', title: 'Istalgan miqyosdagi avtobiznes uchun yaratilgan',
    items: ['Avtoehtiyot qismlar do\'konlari', 'Avtoaksessuarlar', 'Chakana tarmoqlar', 'Distribyutorlar', 'Ulgurji omborlar', 'Ombor logistikasi', 'Avtoservislar', 'Shina markazlari', 'Moy do\'konlari', 'Avtoelektronika', 'Franshiza tarmoqlari', 'Wholesale-treyderlar'],
  },
  cmp: {
    eyebrow: 'Taqqoslash', title: 'Nega Zumex ga o\'tishadi',
    sub: 'Excel, tarqoq dasturlar va oddiy POS yaxlit manzara bermaydi — va jimgina foydani yeb qo\'yadi.',
    feature: 'Imkoniyat', cols: ['Excel', 'Oddiy POS', 'Tarqoq dastur'],
    rows: [
      { label: 'Yagona platforma', vals: [0, 0, 0] },
      { label: 'Real vaqtda qoldiqlar', vals: [0, 1, 1] },
      { label: 'Multi-do\'kon va ko\'chirishlar', vals: [0, 0, 1] },
      { label: 'Moliya, foyda, debitorlik', vals: [1, 0, 1] },
      { label: 'CEO-analitika va dashbordlar', vals: [0, 0, 0] },
      { label: 'Bulutli kirish 24/7', vals: [0, 1, 1] },
      { label: 'Rollar, huquqlar va audit', vals: [0, 0, 1] },
      { label: 'AI-maslahatlar va prognozlar', vals: [0, 0, 0] },
    ],
  },
  roi: {
    eyebrow: 'Foyda kalkulyatori', title: 'Zumex bilan qancha tejaysiz',
    sub: 'Slayderlarni o\'z biznesingizga moslang. Hisob taxminiy — mijozlardagi o\'rtacha samaraga asoslangan.',
    storesLabel: 'Do\'konlar soni', revLabel: 'Bir do\'kondagi tushum, mln so\'m/oy',
    savings: 'Yiliga potensial tejam', extra: 'Sotuv o\'sishidan qo\'shimcha tushum', payback: 'Obuna qoplanishi', cta: 'Hoziroq boshlash',
    perYear: 'yiliga', mln: 'mln so\'m', mlrd: 'mlrd so\'m', month: '≈ 1 oy', months: 'oy',
  },
  price: {
    eyebrow: 'Tariflar', title: 'Miqyosingizga mos shaffof rejalar',
    sub: 'Biznes hajmiga mos tarifni tanlang. Startdan oldin qoplanishni hisoblashga yordam beramiz.',
    popular: 'Ommabop tanlov', choose: 'Boshlash', demo: 'Demo so\'rash', contactUs: 'Biz bilan bog\'lanish',
    free: 'Bepul', perMonth: 'so\'m/oy',
    allIncl: 'Barcha tariflarda:', allItems: ['Bulutli xosting', 'Muntazam yangilanishlar', 'Onboarding va o\'qitish', 'Qo\'llab-quvvatlash 24/7', 'Kunlik zaxira nusxalar'],
    note: 'Startdan oldin qoplanishni hisoblashga yordam beramiz va biznesingizga eng maqbul tarifni tanlaymiz.',
    loading: 'Tariflar yuklanmoqda…', empty: 'Tariflar tez orada paydo bo\'ladi. Hisob uchun biz bilan bog\'laning.',
    durationDays: 'kun', maxStores: 'do\'kon', maxUsers: 'foydalanuvchi',
  },
  impl: {
    eyebrow: 'Joriy etish', title: 'Oylar emas, haftalarda ishga tushirish',
    steps: [
      { t: 'Tahlil', d: 'Biznes jarayonlari va maqsadlarini o\'rganamiz.' },
      { t: 'Sozlash', d: 'Tizimni siz uchun konfiguratsiya qilamiz.' },
      { t: 'Migratsiya', d: 'Tovarlar, qoldiqlar, mijozlarni ko\'chiramiz.' },
      { t: 'O\'qitish', d: 'Jamoani ishga tayyorlaymiz.' },
      { t: 'Testlash', d: 'Barcha stsenariylarni tekshiramiz.' },
      { t: 'Ishga tushirish', d: 'Produktivga chiqaramiz.' },
      { t: 'Qo\'llab-quvvatlash', d: 'Doimiy 24/7 hamrohlik qilamiz.' },
      { t: 'Muvaffaqiyat', d: 'Siz bilan birga o\'samiz.' },
    ],
  },
  sec: {
    eyebrow: 'Xavfsizlik', title: 'Korporativ darajadagi himoya',
    desc: 'Ma\'lumotlaringiz shifrlanadi, zaxiralanadi va faqat siz ruxsat berganlar uchun ochiq. Har bir amalning to\'liq auditi.',
    items: ['Ma\'lumotlar bazasini shifrlash', 'Kunlik zaxira nusxalar', 'Rollar va huquqlar', 'Audit jurnali'],
  },
  story: {
    eyebrow: 'Muvaffaqiyat tarixi', title: 'Joriy etishdan oldin va keyin raqamlar',
    items: [
      { quote: '«Birinchi marta har bir do\'kon bo\'yicha foydani real vaqtda ko\'ryapman. Omborda yo\'qotishlar deyarli nolga tushdi.»', m: [{ l: 'Sotuvlar', v: '+41%' }, { l: 'Yo\'qotishlar', v: '−92%' }], name: 'Alisher X.', role: 'Egasi, AutoMax tarmog\'i', initials: 'AX' },
      { quote: '«Bir haftada Exceldan o\'tdik. Jamoa o\'nlab soatlarni tejaydi, hisobotlar esa o\'zi yig\'iladi.»', m: [{ l: 'Vaqt', v: '−15soat/hafta' }, { l: 'Xarajatlar', v: '−18%' }], name: 'Dilnoza K.', role: 'Operatsion direktor, DETALI.uz', initials: 'DK' },
      { quote: '«2 dan 9 ta nuqtaga xaossiz masshtabladik. CEO Dashboard — yillar davomida bizga yetishmagan narsa.»', m: [{ l: 'Nuqtalar', v: '2 → 9' }, { l: 'ROI', v: '7 oy' }], name: 'Sardor R.', role: 'CEO, ProTyre Network', initials: 'SR' },
    ],
  },
  faq: {
    eyebrow: 'Savol va javoblar', title: 'Rahbarlar eng ko\'p nimani so\'rashadi',
    items: [
      { q: 'Zumex oddiy hisob dasturidan nimasi bilan farq qiladi?', a: 'Bu yagona ERP + CRM: ombor, sotuv, moliya va mijozlar bitta tizimda ishlaydi, rahbar esa butun biznesni real vaqtda ko\'radi.' },
      { q: 'Joriy etish qancha vaqt oladi?', a: 'Do\'konlar soni va ma\'lumotlar hajmiga qarab o\'rtacha bir haftadan uch haftagacha. Migratsiya va o\'qitishni o\'z zimmamizga olamiz.' },
      { q: 'Ma\'lumotlarni Excel yoki 1C dan ko\'chirish mumkinmi?', a: 'Ha. Biz tovarlar, qoldiqlar, narxlar, mijozlar va yetkazib beruvchilarni import qilamiz, shunda siz tarixni yo\'qotmasdan boshlaysiz.' },
      { q: 'Tizim do\'konlar tarmog\'i uchun mosmi?', a: 'Ha. Multi-do\'kon, nuqtalar va omborlar o\'rtasida ko\'chirishlar hamda yagona analitika — platformaning asosiy stsenariylari.' },
      { q: 'Tizim bulutda ishlaydimi?', a: 'Ha, bu bulutli yechim bo\'lib, brauzer va mobil qurilmalardan kirish mumkin. Lokal joylashtirish Premium tarifida mumkin.' },
      { q: 'Bizning ma\'lumotlarimiz qanchalik himoyalangan?', a: 'Ma\'lumotlar shifrlanadi, har kuni zaxiralanadi, kirish rollar bo\'yicha taqsimlanadi, har bir amal esa audit jurnalida qayd etiladi.' },
      { q: 'Mobil kirish bormi?', a: 'Ha. Rahbar va xodimlar telefon va planshetdan ishlashi mumkin — sotuv, ombor va dashbordlar hamma joyda mavjud.' },
      { q: 'Shtrix-kod va QR qo\'llab-quvvatlanadimi?', a: 'Ha. Skanerlash qabul, sotuv va inventarizatsiyani tezlashtiradi hamda qo\'lda kiritish xatolarini bartaraf etadi.' },
      { q: 'Foyda qanday hisoblanadi?', a: 'Tizim avtomatik ravishda tannarx, sotuvlar, chegirmalar va xarajatlarni hisobga oladi, do\'konlar va davrlar bo\'yicha P&L shakllantiradi.' },
      { q: 'Xodimlar huquqlarini cheklash mumkinmi?', a: 'Ha, moslashuvchan rollar modeli: kassir, omborchi, menejer, buxgalter, direktor — har birining o\'z kirishi bor.' },
      { q: 'Mijozlar qarzlari bilan nima bo\'ladi?', a: 'Debitorlik to\'liq nazoratda: limitlar, bo\'lib to\'lashlar, eslatmalar va qarzdorlik bo\'yicha hisobotlar.' },
      { q: 'Integratsiyalar va API bormi?', a: 'Premium tarifida REST API va marketpleyslar, buxgalteriya hamda to\'lov xizmatlari bilan integratsiyalar mavjud.' },
      { q: 'Jamoamizga o\'qitish olamizmi?', a: 'Ha, o\'qitish joriy etish tarkibiga kiradi. Shuningdek, bilimlar bazasi va 24/7 qo\'llab-quvvatlash bor.' },
      { q: 'Do\'konlar sonimiz oshsa-chi?', a: 'Platforma masshtablanadi: tizimni o\'zgartirmasdan nuqtalar, omborlar va foydalanuvchilarni qo\'shing.' },
      { q: 'Bitta do\'kondan boshlasa bo\'ladimi?', a: 'Ha, Standard tarifi bitta do\'kon uchun mo\'ljallangan, Gold yoki Premium ga esa istalgan vaqtda o\'tish mumkin.' },
      { q: 'Narxi qancha va sinov davri bormi?', a: 'Tariflar shaffof va miqyosga bog\'liq. Biz demo o\'tkazamiz va startdan oldin qoplanishni hisoblashga yordam beramiz.' },
      { q: 'Ishga tushirishdan keyin qo\'llab-quvvatlash bo\'ladimi?', a: 'Ha, 24/7 hamrohlik, yangilanishlar va yuqori tariflarda shaxsiy menejer yordami.' },
      { q: 'Tizim yo\'qotishlarni kamaytirishga yordam beradimi?', a: 'Aniq qoldiqlar hisobi va audit kamomad va saralash xatolarini kamaytiradi — mijozlar yo\'qotishlar bir necha barobar kamayganini qayd etadi.' },
      { q: 'Bir nechta til qo\'llab-quvvatlanadimi?', a: 'Ha, interfeys rus, o\'zbek va ingliz tillarida bir zumda almashish bilan mavjud.' },
      { q: 'Nimadan boshlash kerak?', a: 'Demo so\'rang — tizimni sizning jarayonlaringizda ko\'rsatamiz va biznesingizga mos joriy etish rejasini tayyorlaymiz.' },
    ],
  },
  contact: {
    eyebrow: 'Biz bilan bog\'laning', title: 'Zumex ni ish jarayonida ko\'ring',
    sub: '30 daqiqada tizimni sizning jarayonlaringizda ko\'rsatamiz. Shaxsiy namoyish va qoplanish hisobi.',
    phoneLabel: 'Telefon', phone: '+998 (00) 000-00-00', emailLabel: 'Email', email: 'sales@zumex.uz', emailPh: 'Email manzilingiz', tgLabel: 'Telegram', tg: '@zumex', mapLabel: 'Toshkent · sotuv ofisi',
    formTitle: 'Demo so\'rash', formNote: 'Ish kuni davomida javob beramiz.',
    name: 'Ism', namePh: 'Ismingiz', phoneL: 'Telefon', phonePh: '+998', company: 'Kompaniya', companyPh: 'Kompaniya nomi',
    storesL: 'Do\'konlar soni', storeOpts: ['1 do\'kon', '2–5 do\'kon', '6–15 do\'kon', '16+ / tarmoq'],
    sourceL: 'Bizni qayerdan bildingiz?',
    sourceOpts: [
      { v: 'instagram', l: 'Instagram' }, { v: 'telegram', l: 'Telegram' }, { v: 'facebook', l: 'Facebook' },
      { v: 'youtube', l: 'YouTube' }, { v: 'google', l: 'Google qidiruv' }, { v: 'referral', l: 'Tavsiya orqali' },
      { v: 'website', l: 'Sayt' }, { v: 'other', l: 'Boshqa' },
    ],
    submit: 'Namoyish olish', privacy: 'Bosish orqali siz maxfiylik siyosatiga rozilik bildirasiz.',
    sending: 'Yuborilmoqda…', success: 'Rahmat! Tez orada siz bilan bog\'lanamiz.', error: 'Yuborib bo\'lmadi. Keyinroq urinib ko\'ring.',
  },
  footer: {
    tagline: 'Avtobiznesni boshqarish va masshtablash uchun bulutli ERP va CRM platformasi.',
    product: 'Mahsulot', productLinks: ['Imkoniyatlar', 'Mahsulot demosi', 'Tariflar', 'Hujjatlar'],
    industries: 'Sohalar', industryLinks: ['Avtoehtiyot qismlar do\'konlari', 'Shina markazlari', 'Distribyutorlar', 'Franshizalar'],
    company: 'Kompaniya', companyLinks: ['Muvaffaqiyat tarixi', 'Kontaktlar', 'Xavfsizlik', 'Qo\'llab-quvvatlash'],
    payTitle: 'To\'lov usullari',
    rights: '© 2026 Zumex. Barcha huquqlar himoyalangan.', privacy: 'Maxfiylik siyosati', terms: 'Foydalanish shartlari', refund: 'Pulni qaytarish siyosati',
  },
}

export const EN: AspDict = {
  nav: { features: 'Features', product: 'Product', industries: 'Industries', pricing: 'Pricing', stories: 'Success Stories', faq: 'FAQ', cta: 'Request a Demo', login: 'Log In' },
  hero: {
    eyebrow: 'Retail ERP + CRM for the auto business',
    h1: 'Run your entire\nauto business from\none system',
    sub: 'Zumex unites warehouse, sales, finance and customers in a single cloud platform. Control your store network, speed up sales and make data-driven decisions — in real time.',
    ctaDemo: 'Request a Demo', ctaWatch: 'Watch product demo', ctaRoi: 'Calculate ROI',
    s1: 'sales growth', s2: 'inventory accuracy', s3: 'savings per week',
  },
  dash: { caption: 'CEO Dashboard · Zumex', live: 'Live', revenueToday: 'Revenue today', vsYesterday: 'vs yesterday', orders: 'Orders', profit: 'Profit', stock: 'Stock', clients: 'Customers', clientsGrow: '▲ 6.2% this month', expensesCtl: 'Expenses under control', expensesVal: '−14% costs', stockRt: 'Warehouse · real time', stockAcc: '99.8% accuracy' },
  trust: { kicker: 'Trusted by auto businesses across the region', uptime: 'System uptime', stores: 'Stores on the platform', csat: 'Satisfaction', impl: 'Successful rollouts', support: 'Support & SLA' },
  ch: {
    eyebrow: 'The Problem', title: 'Business loses money where there is no control',
    sub: 'Excel, scattered programs and "pen-and-paper accounting" lead to losses that stay invisible until the end of the month. Zumex closes every one of these gaps.',
    cards: [
      { p: 'Warehouse losses', fix: 'Real-time inventory tracking' },
      { p: 'Accounting in Excel', fix: 'Unified database and automation' },
      { p: 'Confusion over money', fix: 'Finance and P&L online' },
      { p: 'Warehouse errors', fix: 'Barcode and QR receiving' },
      { p: 'Missed sales', fix: 'Auto-ordering at minimum stock' },
      { p: 'Customer debts', fix: 'Accounts receivable management' },
      { p: 'Weak reporting', fix: 'Reports in one click' },
      { p: 'No transparency', fix: 'CEO Dashboard 24/7' },
    ],
  },
  erp: {
    eyebrow: 'What is Zumex', title: 'ERP and CRM in one platform',
    sub: 'ERP manages resources — warehouse, purchasing, finance. CRM manages relationships — customers, sales, loyalty. Together they give a complete picture and unified control.',
    erpTitle: 'ERP — resources', erpDesc: 'Warehouse, stock, purchasing, transfers, finance, expenses and profit — all calculated automatically and accurately.',
    erpList: ['Real-time inventory tracking', 'Purchasing and suppliers', 'Finance, cash and bank'],
    crmTitle: 'CRM — relationships', crmDesc: 'Customers, purchase history, debts, loyalty programs and sales — all in a single customer profile.',
    crmList: ['Customer base and history', 'Debts and installments', 'Loyalty and sales'],
  },
  feat: {
    eyebrow: 'Features', title: 'Why companies choose Zumex',
    sub: 'One product covers the entire auto-business cycle — from warehouse receiving to the owner\'s decision.',
    items: [
      { title: 'Real-time warehouse', desc: 'Never lose stock or overstock — accurate inventory across all locations saves money on every purchase.' },
      { title: 'Warehouse automation', desc: 'Receiving and stocktaking many times faster and without mismatches — fewer losses, less manual work.' },
      { title: 'POS / Checkout', desc: 'Sell in seconds on any device — shorter lines, higher average check, zero cashier errors.' },
      { title: 'Customer base', desc: 'Know every customer and bring them back again — repeat sales and loyalty grow on their own.' },
      { title: 'Suppliers and purchasing', desc: 'Order on time and at the best price — less money frozen in stock, more turnover.' },
      { title: 'Finance and profit', desc: 'See profit, expenses and cash flow in seconds — decisions based on numbers, not guesses.' },
      { title: 'Receivables and debts', desc: 'Control every debt — money comes back into the business instead of getting stuck with customers.' },
      { title: 'Multi-store', desc: 'Manage your network as a single whole — transfers and store comparison without chaos or Excel.' },
      { title: 'Roles and permissions', desc: 'Each employee sees only their own area — order and security at any team size.' },
      { title: 'Barcodes and QR', desc: 'Scan instead of typing manually — zero errors and hours saved every week.' },
      { title: 'Notifications', desc: 'Learn about low stock and debts before they turn into lost revenue.' },
      { title: 'CEO Dashboard', desc: 'Your whole business on one screen — make decisions in minutes, not days of waiting for reports.' },
    ],
  },
  prod: {
    eyebrow: 'Product demo', title: 'A real system, not mockups',
    sub: 'This is what a working day in Zumex looks like. Switch between modules.',
    tabs: { products: 'Products', customers: 'Customers', suppliers: 'Suppliers', invoices: 'Invoices', finance: 'Finance' },
    lowStock: 'Low stock', lowStockSku: '14 SKU', lowStockNote: 'need reordering',
  },
  panels: {
    products: { title: 'Products', count: '8 940 SKU', cols: ['SKU', 'Name', 'Stock', 'Price', 'Status'], rows: [
      ['BR-4471', 'Bosch brake pads', '420 pcs', '180 000', 'In stock'],
      ['OIL-530', 'Mobil 5W-30 oil 4L', '38 pcs', '240 000', 'Low'],
      ['FLT-118', 'Mann air filter', '210 pcs', '95 000', 'In stock'],
      ['SPK-902', 'NGK spark plugs (set)', '6 pcs', '320 000', 'Reorder'],
      ['BAT-770', 'Varta 60Ah battery', '54 pcs', '1 450 000', 'In stock'],
    ] },
    customers: { title: 'Customers', count: '12 480 contacts', cols: ['Customer', 'Type', 'Purchases', 'Debt', 'LTV'], rows: [
      ['Motor service station', 'B2B', '184', '42 000 000', '1.2 bn'],
      ['Alisher Khakimov', 'Retail', '37', '0', '84 000 000'],
      ['Logist fleet', 'B2B', '291', '118 000 000', '2.4 bn'],
      ['Dilnoza Karimova', 'Retail', '12', '0', '21 000 000'],
      ['ProTyre network', 'Partner', '512', '0', '5.1 bn'],
    ] },
    suppliers: { title: 'Suppliers', count: '64 active', cols: ['Supplier', 'Category', 'Orders', 'Turnover', 'Terms'], rows: [
      ['Bosch Distribution', 'Brakes', '88', '1.8 bn', '30 days'],
      ['Mobil Lubricants', 'Oils', '54', '940 mln', 'Prepaid'],
      ['Mann+Hummel', 'Filters', '41', '610 mln', '14 days'],
      ['NGK Spark', 'Electrics', '33', '420 mln', '30 days'],
      ['Varta Batteries', 'Batteries', '27', '1.1 bn', '21 days'],
    ] },
    invoices: { title: 'Invoices', count: 'Today · 42', cols: ['No.', 'Counterparty', 'Type', 'Amount', 'Status'], rows: [
      ['#10428', 'Motor service station', 'Sale', '18 400 000', 'Paid'],
      ['#10427', 'Bosch Distribution', 'Purchase', '240 000 000', 'Pending'],
      ['#10426', 'Logist fleet', 'Sale', '61 200 000', 'On credit'],
      ['#10425', 'Retail customer', 'Sale', '2 340 000', 'Paid'],
      ['#10424', 'Transfer → Chilanzar', 'Transfer', '88 000 000', 'Received'],
    ] },
    finance: { title: 'Finance', count: 'December 2025', cash: 'Cash', bank: 'Bank', net: 'Net profit', cashV: '482 000 000', bankV: '1.94 bn', netV: '1.61 bn', cols: ['Item', 'Type', 'Amount'], rows: [
      ['Sales revenue', 'Income', '4 820 000 000'],
      ['Goods purchase', 'Expense', '2 410 000 000'],
      ['Payroll', 'Expense', '540 000 000'],
      ['Rent', 'Expense', '180 000 000'],
      ['Other income', 'Income', '80 000 000'],
    ] },
  },
  ceo: {
    eyebrow: 'CEO Analytics', title: 'Your whole business on one screen',
    sub: 'Revenue, profit, expenses, warehouse and debts — in real time, on any device.',
    revMonth: 'Revenue this month', netProfit: 'Net profit', expenses: 'Expenses', stockValue: 'Inventory value',
    revV: '4.82 bn', netV: '1.61 bn', expV: '3.21 bn', stockV: '9.40 bn',
    revD: '▲ 18.4% MoM', netD: '▲ 12.0%', expD: '▼ 14.0% costs', stockD: '8 940 items',
    profitByMonth: 'Profit by month', year: '2025', salesByStore: 'Sales by store',
    stores: [{ label: 'Center', pct: '40%' }, { label: 'Yunusabad', pct: '25%' }, { label: 'Chilanzar', pct: '20%' }, { label: 'Warehouse', pct: '15%' }],
    topProducts: 'Top products',
    top: [{ name: 'Brake pads', val: '1 240', pct: 88 }, { name: '5W-30 oil', val: '1 010', pct: 72 }, { name: 'Air filter', val: '820', pct: 58 }, { name: 'Spark plugs', val: '615', pct: 44 }],
    attention: 'Needs your attention',
    att: ['<b>14 SKU</b> below minimum', 'Receivables <b>312 mln</b> · 8 customers', 'Yunusabad <b>+24%</b> vs plan'],
  },
  ai: {
    eyebrow: 'AI inside', title: 'Intelligence that grows your profit',
    sub: 'Zumex analyzes your sales and inventory and tells you what to buy, what to promote and where you are losing money — before it even happens.',
    items: [
      { title: 'AI sales forecast', desc: 'See demand ahead' },
      { title: 'Smart purchasing', desc: 'What and how much to order' },
      { title: 'Demand forecast', desc: 'Seasons and trends' },
      { title: 'Predictive reports', desc: 'Stay ahead of decisions' },
    ],
    panelTitle: 'AI Insights', updated: 'updated now', forecastLabel: 'Sales forecast · next 7 days', forecastTag: 'AI forecast',
    insights: [
      'Order <b>"5W-30 oil"</b> — demand will rise 18% by the weekend',
      '<b>"NGK spark plugs"</b> will run out in 4 days — time to order',
      'Promote <b>"Bosch brake pads"</b> — margin is 12% higher',
    ],
  },
  ben: {
    eyebrow: 'Business outcome', title: 'Not features — money and time',
    stats: [{ v: '+37%', l: 'sales growth from availability and speed' }, { v: '−14%', l: 'operating costs' }, { v: '12 h', l: 'of employee time saved per week' }, { v: '99.8%', l: 'inventory accuracy, fewer losses' }],
    checks: ['Fast data-driven decisions', 'Customer loyalty and retention', 'Scaling across a store network', 'Transparency for the owner', 'Fewer financial leaks', 'Zero manual accounting errors'],
  },
  num: {
    eyebrow: 'By the numbers', title: 'Trusted at scale',
    items: [{ v: '500+', l: 'stores' }, { v: '4.8 mln', l: 'orders processed' }, { v: '12.6 mln', l: 'transactions' }, { v: '38 mln', l: 'warehouse operations' }, { v: '3', l: 'countries' }, { v: '8+', l: 'years on the market' }],
  },
  ind: {
    eyebrow: 'Industries', title: 'Built for auto businesses of any size',
    items: ['Auto parts stores', 'Auto accessories', 'Retail chains', 'Distributors', 'Wholesale warehouses', 'Warehouse logistics', 'Auto service centers', 'Tire centers', 'Oil stores', 'Auto electronics', 'Franchise networks', 'Wholesale traders'],
  },
  cmp: {
    eyebrow: 'Comparison', title: 'Why businesses switch to Zumex',
    sub: 'Excel, scattered programs and basic POS do not give a complete picture — and quietly eat into profit.',
    feature: 'Capability', cols: ['Excel', 'Basic POS', 'Scattered software'],
    rows: [
      { label: 'Unified platform', vals: [0, 0, 0] },
      { label: 'Real-time stock', vals: [0, 1, 1] },
      { label: 'Multi-store and transfers', vals: [0, 0, 1] },
      { label: 'Finance, profit, receivables', vals: [1, 0, 1] },
      { label: 'CEO analytics and dashboards', vals: [0, 0, 0] },
      { label: 'Cloud access 24/7', vals: [0, 1, 1] },
      { label: 'Roles, permissions and audit', vals: [0, 0, 1] },
      { label: 'AI suggestions and forecasts', vals: [0, 0, 0] },
    ],
  },
  roi: {
    eyebrow: 'Savings calculator', title: 'How much you save with Zumex',
    sub: 'Move the sliders to match your business. The estimate is approximate — based on the average effect among our customers.',
    storesLabel: 'Number of stores', revLabel: 'Revenue per store, mln UZS/mo',
    savings: 'Potential savings per year', extra: 'Extra revenue from sales growth', payback: 'Subscription payback', cta: 'Start now',
    perYear: 'per year', mln: 'mln UZS', mlrd: 'bn UZS', month: '≈ 1 month', months: 'mo',
  },
  price: {
    eyebrow: 'Pricing', title: 'Transparent plans for your scale',
    sub: 'Choose a plan to match your business size. We will help you calculate the payback before you start.',
    popular: 'Popular choice', choose: 'Get started', demo: 'Request a Demo', contactUs: 'Contact us',
    free: 'Free', perMonth: 'UZS/mo',
    allIncl: 'Included in all plans:', allItems: ['Cloud hosting', 'Regular updates', 'Onboarding and training', '24/7 support', 'Daily backups'],
    note: 'We will help calculate the payback before you start and pick the optimal plan for your business.',
    loading: 'Loading plans…', empty: 'Plans coming soon. Contact us for a calculation.',
    durationDays: 'days', maxStores: 'stores', maxUsers: 'users',
  },
  impl: {
    eyebrow: 'Implementation', title: 'Launch in weeks, not months',
    steps: [
      { t: 'Analysis', d: 'We study your processes and business goals.' },
      { t: 'Setup', d: 'We configure the system for you.' },
      { t: 'Migration', d: 'We transfer products, stock and customers.' },
      { t: 'Training', d: 'We get your team ready to work.' },
      { t: 'Testing', d: 'We check all scenarios.' },
      { t: 'Launch', d: 'We go live in production.' },
      { t: 'Support', d: 'We support you 24/7.' },
      { t: 'Success', d: 'We grow together with you.' },
    ],
  },
  sec: {
    eyebrow: 'Security', title: 'Enterprise-grade protection',
    desc: 'Your data is encrypted, backed up and accessible only to those you authorize. Full audit of every action.',
    items: ['Database encryption', 'Daily backups', 'Roles and permissions', 'Audit log'],
  },
  story: {
    eyebrow: 'Success Stories', title: 'The numbers before and after rollout',
    items: [
      { quote: '"For the first time I can see profit for each store in real time. Warehouse losses dropped almost to zero."', m: [{ l: 'Sales', v: '+41%' }, { l: 'Losses', v: '−92%' }], name: 'Alisher Kh.', role: 'Owner, AutoMax network', initials: 'AK' },
      { quote: '"We moved off Excel in a week. The team saves dozens of hours, and reports build themselves."', m: [{ l: 'Time', v: '−15h/wk' }, { l: 'Costs', v: '−18%' }], name: 'Dilnoza K.', role: 'Operations Director, DETALI.uz', initials: 'DK' },
      { quote: '"We scaled from 2 to 9 locations without chaos. The CEO Dashboard is what we had been missing for years."', m: [{ l: 'Locations', v: '2 → 9' }, { l: 'ROI', v: '7 mo' }], name: 'Sardor R.', role: 'CEO, ProTyre Network', initials: 'SR' },
    ],
  },
  faq: {
    eyebrow: 'Q&A', title: 'What executives ask most often',
    items: [
      { q: 'How is Zumex different from an ordinary accounting program?', a: 'It is a unified ERP + CRM: warehouse, sales, finance and customers work in one system, and the owner sees the entire business in real time.' },
      { q: 'How long does implementation take?', a: 'On average one to three weeks depending on the number of stores and the volume of data. We handle migration and training ourselves.' },
      { q: 'Can data be imported from Excel or 1C?', a: 'Yes. We import products, stock, prices, customers and suppliers so you start without losing your history.' },
      { q: 'Is the system suitable for a store network?', a: 'Yes. Multi-store, transfers between locations and warehouses, and unified analytics are core scenarios of the platform.' },
      { q: 'Does the system run in the cloud?', a: 'Yes, it is a cloud solution with access from a browser and mobile devices. On-premise deployment is available on the Premium plan.' },
      { q: 'How secure is our data?', a: 'Data is encrypted, backed up daily, access is segmented by roles, and every action is recorded in the audit log.' },
      { q: 'Is there mobile access?', a: 'Yes. The owner and employees can work from a phone or tablet — sales, warehouse and dashboards are available everywhere.' },
      { q: 'Are barcodes and QR supported?', a: 'Yes. Scanning speeds up receiving, sales and stocktaking and eliminates manual entry errors.' },
      { q: 'How is profit calculated?', a: 'The system automatically accounts for cost, sales, discounts and expenses, generating P&L by store and period.' },
      { q: 'Can employee permissions be restricted?', a: 'Yes, a flexible role model: cashier, storekeeper, manager, accountant, director — each with their own access.' },
      { q: 'What about customer debts?', a: 'Receivables are fully under control: limits, installments, reminders and debt reports.' },
      { q: 'Are there integrations and an API?', a: 'On the Premium plan a REST API and integrations with marketplaces, accounting and payment services are available.' },
      { q: 'Will we get team training?', a: 'Yes, training is part of the implementation. There is also a knowledge base and 24/7 support.' },
      { q: 'What if our number of stores grows?', a: 'The platform scales: add locations, warehouses and users without switching systems.' },
      { q: 'Can we start with a single store?', a: 'Yes, the Standard plan is designed for one store, and you can upgrade to Gold or Premium at any time.' },
      { q: 'How much does it cost and is there a trial period?', a: 'Pricing is transparent and depends on scale. We run a demo and help calculate the payback before you start.' },
      { q: 'Will there be support after launch?', a: 'Yes, 24/7 support, updates and the help of a personal manager on higher plans.' },
      { q: 'Will the system help reduce losses?', a: 'Accurate inventory tracking and auditing reduce shortages and mismatches — customers report losses dropping severalfold.' },
      { q: 'Are multiple languages supported?', a: 'Yes, the interface is available in Russian, Uzbek and English with instant switching.' },
      { q: 'Where do we start?', a: 'Request a demo — we will show the system on your processes and prepare an implementation plan for your business.' },
    ],
  },
  contact: {
    eyebrow: 'Contact us', title: 'See Zumex in action',
    sub: 'We will show the system on your processes in 30 minutes. A personal demo and payback calculation.',
    phoneLabel: 'Phone', phone: '+998 (00) 000-00-00', emailLabel: 'Email', email: 'sales@zumex.uz', emailPh: 'Your email', tgLabel: 'Telegram', tg: '@zumex', mapLabel: 'Tashkent · sales office',
    formTitle: 'Request a Demo', formNote: 'We will reply within one business day.',
    name: 'Name', namePh: 'Your name', phoneL: 'Phone', phonePh: '+998', company: 'Company', companyPh: 'Company name',
    storesL: 'Number of stores', storeOpts: ['1 store', '2–5 stores', '6–15 stores', '16+ / network'],
    sourceL: 'How did you hear about us?',
    sourceOpts: [
      { v: 'instagram', l: 'Instagram' }, { v: 'telegram', l: 'Telegram' }, { v: 'facebook', l: 'Facebook' },
      { v: 'youtube', l: 'YouTube' }, { v: 'google', l: 'Google search' }, { v: 'referral', l: 'Referral' },
      { v: 'website', l: 'Website' }, { v: 'other', l: 'Other' },
    ],
    submit: 'Get a demo', privacy: 'By clicking, you agree to the privacy policy.',
    sending: 'Sending…', success: 'Thank you! We will contact you shortly.', error: 'Could not send. Please try again later.',
  },
  footer: {
    tagline: 'A cloud ERP and CRM platform for managing and scaling your auto business.',
    product: 'Product', productLinks: ['Features', 'Product demo', 'Pricing', 'Documentation'],
    industries: 'Industries', industryLinks: ['Auto parts stores', 'Tire centers', 'Distributors', 'Franchises'],
    company: 'Company', companyLinks: ['Success Stories', 'Contacts', 'Security', 'Support'],
    payTitle: 'Payment methods',
    rights: '© 2026 Zumex. All rights reserved.', privacy: 'Privacy Policy', terms: 'Terms of Use', refund: 'Refund Policy',
  },
}

// Deep transliteration uz(latin) -> uz(cyrl) for every string in the dict.
function translitDeep<T>(v: T): T {
  if (typeof v === 'string') return latinToCyrillic(v) as unknown as T
  if (Array.isArray(v)) return v.map((x) => translitDeep(x)) as unknown as T
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(v as Record<string, unknown>)) out[k] = translitDeep((v as Record<string, unknown>)[k])
    return out as unknown as T
  }
  return v
}

export function getAspDict(lang: LandingLang): AspDict {
  switch (lang) {
    case 'ru': return RU
    case 'en': return EN
    case 'cyrl': return translitDeep(UZ)
    case 'uz':
    default: return UZ
  }
}
