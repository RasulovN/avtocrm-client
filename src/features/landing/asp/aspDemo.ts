// Mahsulot demo bo'limi — landing'da kompaniya panelining haqiqiy menyularini
// (Boshqaruv paneli, Sotuvlar, Mahsulotlar, ...) va har biriga mos zamonaviy
// "sahifa" ko'rinishini ko'rsatadi. uz/ru/en; cyrl uz dan transliteratsiya.
import { latinToCyrillic } from '../../../utils/transliteration'
import type { LandingLang } from '../types'

// Kompaniya menyusi tartibi (menu.config.ts COMPANY_MENU bilan mos) + SVG ikonkalar.
const MODULES: { key: string; icon: string }[] = [
  { key: 'dashboard', icon: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z' },
  { key: 'sales', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
  { key: 'transfers', icon: 'M16 3l4 4-4 4M20 7H8M8 21l-4-4 4-4M4 17h12' },
  { key: 'products', icon: 'M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7' },
  { key: 'stockentry', icon: 'M12 3v12M8 11l4 4 4-4M5 21h14' },
  { key: 'inventory', icon: 'M9 4h6a1 1 0 011 1 1 1 0 01-1 1H9a1 1 0 01-1-1 1 1 0 011-1zM7 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1M9 14l2 2 4-4' },
  { key: 'customers', icon: 'M16 14a4 4 0 10-8 0M12 3a4 4 0 100 8 4 4 0 000-8zM4 21c0-3.3 3.6-5 8-5s8 1.7 8 5' },
  { key: 'suppliers', icon: 'M3 13l2-5h11l3 5M3 13h16M3 13v4h16v-4M7.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3M16.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3' },
  { key: 'stores', icon: 'M4 9l1.2-5h13.6L20 9M5 9v11h14V9M4 9h16' },
  { key: 'reports', icon: 'M3 3v18h18M7 14v4M12 9v9M17 5v13' },
  { key: 'settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zM4 12a8 8 0 01.2-1.8L2.5 8.9l1.5-2.6 2 .8a8 8 0 011.6-.9l.3-2.2h3l.3 2.2c.6.2 1.1.5 1.6.9l2-.8 1.5 2.6-1.7 1.3c.1.6.1 1.2 0 1.8l1.7 1.3-1.5 2.6-2-.8a8 8 0 01-1.6.9l-.3 2.2h-3l-.3-2.2a8 8 0 01-1.6-.9l-2 .8L2.5 15l1.7-1.3A8 8 0 014 12z' },
]

const STATUS_TONE: Record<string, 'green' | 'amber' | 'red'> = {
  paid: 'green', credit: 'red', pending: 'amber', received: 'green', progress: 'amber',
  done: 'green', instock: 'green', low: 'amber', reorder: 'red', active: 'green',
}
const TONE_COLOR: Record<string, string> = { green: 'var(--green)', amber: 'var(--amber)', red: 'var(--red)' }
const TONE_SOFT: Record<string, string> = { green: 'var(--green-soft)', amber: 'rgba(217,119,6,.13)', red: 'rgba(225,29,72,.1)' }

// Lang-independent demo ma'lumotlari (xususiy nomlar/raqamlar; @token = status).
const DATA = {
  dashboardRecent: [
    ['#10428', 'Alisher X.', '1 240 000', '@paid'],
    ['#10427', 'STO «Motor»', '3 480 000', '@credit'],
    ['#10426', 'Chakana mijoz', '290 000', '@paid'],
    ['#10425', '«ProTyre»', '5 100 000', '@paid'],
  ],
  sales: [
    ['#10428', 'Alisher X.', '3', '1 240 000', '@paid'],
    ['#10427', 'STO «Motor»', '8', '3 480 000', '@credit'],
    ['#10426', 'Chakana mijoz', '1', '290 000', '@paid'],
    ['#10425', '«Logist» avtopark', '12', '5 100 000', '@paid'],
    ['#10424', 'Dilnoza K.', '2', '640 000', '@paid'],
  ],
  transfers: [
    ['#TR-204', 'Markaz → Chilonzor', 'Kolodka Bosch', '120', '@received'],
    ['#TR-203', 'Ombor → Yunusobod', 'Moy 5W-30', '60', '@progress'],
    ['#TR-202', 'Markaz → Yunusobod', 'Filtr Mann', '90', '@received'],
    ['#TR-201', 'Ombor → Markaz', 'Svecha NGK', '200', '@done'],
  ],
  products: [
    ['BR-4471', 'Tormoz kolodkalari Bosch', '420 dona', '180 000', '@instock'],
    ['OIL-530', 'Moy Mobil 5W-30 4l', '38 dona', '240 000', '@low'],
    ['FLT-118', 'Havo filtri Mann', '210 dona', '95 000', '@instock'],
    ['SPK-902', 'Svecha NGK (kompl.)', '6 dona', '320 000', '@reorder'],
    ['BAT-770', 'Akkumulyator Varta 60Ah', '54 dona', '1 450 000', '@instock'],
  ],
  stockentry: [
    ['#KR-88', 'Bosch Distribution', '42', '240 000 000', '@done'],
    ['#KR-87', 'Mobil Lubricants', '18', '94 000 000', '@pending'],
    ['#KR-86', 'Mann+Hummel', '24', '61 000 000', '@done'],
    ['#KR-85', 'Varta Batteries', '12', '110 000 000', '@done'],
  ],
  inventory: [
    ['INV-12', 'Markaz', '1 240 / 1 240', '0', '@done'],
    ['INV-11', 'Chilonzor', '980 / 1 000', '20', '@progress'],
    ['INV-10', 'Yunusobod', '1 500 / 1 500', '0', '@done'],
    ['INV-09', 'Markaziy ombor', '8 900 / 8 940', '40', '@progress'],
  ],
  customers: [
    ['STO «Motor»', '@b2b', '184', '42 000 000', '1.2 mlrd'],
    ['Alisher Hakimov', '@retail', '37', '0', '84 000 000'],
    ['«Logist» avtopark', '@b2b', '291', '118 000 000', '2.4 mlrd'],
    ['Dilnoza Karimova', '@retail', '12', '0', '21 000 000'],
    ['«ProTyre» tarmog‘i', '@partner', '512', '0', '5.1 mlrd'],
  ],
  suppliers: [
    ['Bosch Distribution', 'Tormozlar', '88', '1.8 mlrd', '30 kun'],
    ['Mobil Lubricants', 'Moylar', '54', '940 mln', 'Oldindan'],
    ['Mann+Hummel', 'Filtrlar', '41', '610 mln', '14 kun'],
    ['NGK Spark', 'Elektrika', '33', '420 mln', '30 kun'],
    ['Varta Batteries', 'AKB', '27', '1.1 mlrd', '21 kun'],
  ],
  storesRows: [
    ['@s_central', 'Toshkent, Amir Temur', '8', '18.4 mln'],
    ['@s_yunus', 'Toshkent, Yunusobod', '5', '9.2 mln'],
    ['@s_chilon', 'Toshkent, Chilonzor', '4', '7.1 mln'],
    ['@s_wh', 'Toshkent, Sergeli', '6', '—'],
  ],
  bars: [42, 55, 48, 63, 71, 66, 78, 84, 79, 92, 88, 100],
}

interface Lang {
  tabs: Record<string, string>
  status: Record<string, string>
  kpi: Record<string, string>
  cols: Record<string, string[]>
  title: Record<string, string>
  count: Record<string, string>
  settings: { title: string; desc: string }[]
}

const UZ: Lang = {
  tabs: {
    dashboard: 'Boshqaruv paneli', sales: 'Sotuvlar', transfers: 'Ko‘chirishlar', products: 'Mahsulotlar',
    stockentry: 'Kirimlar', inventory: 'Inventarizatsiya', customers: 'Mijozlar', suppliers: 'Ta’minotchilar',
    stores: 'Do‘konlar', reports: 'Hisobotlar', settings: 'Sozlamalar',
  },
  status: {
    paid: 'To‘langan', credit: 'Qarzga', pending: 'Kutilmoqda', received: 'Qabul qilindi', progress: 'Jarayonda',
    done: 'Yakunlandi', instock: 'Mavjud', low: 'Kam', reorder: 'Buyurtma', active: 'Faol',
    b2b: 'B2B', retail: 'Chakana', partner: 'Hamkor',
    s_central: 'Markaz do‘kon', s_yunus: 'Yunusobod', s_chilon: 'Chilonzor', s_wh: 'Markaziy ombor',
  },
  kpi: {
    todaySales: 'Bugungi savdo', profit: 'Sof foyda', orders: 'Buyurtmalar', lowStock: 'Kam zaxira',
    revenue: 'Oylik daromad', avgCheck: 'O‘rtacha chek', returns: 'Qaytarishlar', debtors: 'Qarzdorlar',
  },
  cols: {
    dashboard: ['Chek', 'Mijoz', 'Summa', 'To‘lov'],
    sales: ['Chek №', 'Mijoz', 'Pozitsiya', 'Summa', 'To‘lov'],
    transfers: ['№', 'Yo‘nalish', 'Mahsulot', 'Soni', 'Holat'],
    products: ['Artikul', 'Nomi', 'Qoldiq', 'Narx', 'Holat'],
    stockentry: ['№', 'Ta’minotchi', 'Pozitsiya', 'Summa', 'Holat'],
    inventory: ['Sessiya', 'Do‘kon', 'Tekshirildi', 'Kamomad', 'Holat'],
    customers: ['Mijoz', 'Turi', 'Xaridlar', 'Qarz', 'LTV'],
    suppliers: ['Ta’minotchi', 'Kategoriya', 'Buyurtma', 'Aylanma', 'Shart'],
    stores: ['Do‘kon', 'Manzil', 'Xodimlar', 'Bugungi savdo'],
  },
  title: {
    dashboard: 'Boshqaruv paneli', sales: 'Sotuvlar', transfers: 'Ko‘chirishlar', products: 'Mahsulotlar',
    stockentry: 'Kirimlar', inventory: 'Inventarizatsiya', customers: 'Mijozlar', suppliers: 'Ta’minotchilar',
    stores: 'Do‘konlar', reports: 'Hisobotlar', settings: 'Sozlamalar', recent: 'So‘nggi sotuvlar', monthly: 'Oylik savdo',
  },
  count: {
    dashboard: 'Bugun', sales: 'Bugun · 42', transfers: '12 faol', products: '8 940 SKU', stockentry: 'Bu oy · 88',
    inventory: '4 sessiya', customers: '12 480 kontakt', suppliers: '64 faol', stores: '4 ta nuqta', reports: 'Dekabr 2025',
  },
  settings: [
    { title: 'Rollar va ruxsatlar', desc: 'Kassir, omborchi, menejer, direktor' },
    { title: 'Xodimlar', desc: '12 faol foydalanuvchi' },
    { title: 'Kompaniya profili', desc: 'Nom, logo, aloqa, manzil, xarita' },
    { title: 'Obuna', desc: 'GOLD · 23 kun qoldi' },
  ],
}

const RU: Lang = {
  tabs: {
    dashboard: 'Панель', sales: 'Продажи', transfers: 'Перемещения', products: 'Товары',
    stockentry: 'Приходы', inventory: 'Инвентаризация', customers: 'Клиенты', suppliers: 'Поставщики',
    stores: 'Магазины', reports: 'Отчёты', settings: 'Настройки',
  },
  status: {
    paid: 'Оплачена', credit: 'В долг', pending: 'Ожидает', received: 'Принято', progress: 'В процессе',
    done: 'Завершено', instock: 'В наличии', low: 'Мало', reorder: 'Заказать', active: 'Активен',
    b2b: 'B2B', retail: 'Розница', partner: 'Партнёр',
    s_central: 'Центральный', s_yunus: 'Юнусабад', s_chilon: 'Чиланзар', s_wh: 'Центр. склад',
  },
  kpi: {
    todaySales: 'Выручка сегодня', profit: 'Чистая прибыль', orders: 'Заказы', lowStock: 'Низкий остаток',
    revenue: 'Выручка за месяц', avgCheck: 'Средний чек', returns: 'Возвраты', debtors: 'Должники',
  },
  cols: {
    dashboard: ['Чек', 'Клиент', 'Сумма', 'Оплата'],
    sales: ['Чек №', 'Клиент', 'Позиций', 'Сумма', 'Оплата'],
    transfers: ['№', 'Направление', 'Товар', 'Кол-во', 'Статус'],
    products: ['Артикул', 'Наименование', 'Остаток', 'Цена', 'Статус'],
    stockentry: ['№', 'Поставщик', 'Позиций', 'Сумма', 'Статус'],
    inventory: ['Сессия', 'Магазин', 'Проверено', 'Недостача', 'Статус'],
    customers: ['Клиент', 'Тип', 'Покупок', 'Долг', 'LTV'],
    suppliers: ['Поставщик', 'Категория', 'Заказов', 'Оборот', 'Условия'],
    stores: ['Магазин', 'Адрес', 'Сотрудники', 'Выручка сегодня'],
  },
  title: {
    dashboard: 'Панель управления', sales: 'Продажи', transfers: 'Перемещения', products: 'Товары',
    stockentry: 'Приходы', inventory: 'Инвентаризация', customers: 'Клиенты', suppliers: 'Поставщики',
    stores: 'Магазины', reports: 'Отчёты', settings: 'Настройки', recent: 'Последние продажи', monthly: 'Продажи по месяцам',
  },
  count: {
    dashboard: 'Сегодня', sales: 'Сегодня · 42', transfers: '12 активных', products: '8 940 SKU', stockentry: 'За месяц · 88',
    inventory: '4 сессии', customers: '12 480 контактов', suppliers: '64 активных', stores: '4 точки', reports: 'Декабрь 2025',
  },
  settings: [
    { title: 'Роли и права', desc: 'Кассир, кладовщик, менеджер, директор' },
    { title: 'Сотрудники', desc: '12 активных пользователей' },
    { title: 'Профиль компании', desc: 'Название, логотип, контакты, карта' },
    { title: 'Подписка', desc: 'GOLD · осталось 23 дня' },
  ],
}

const EN: Lang = {
  tabs: {
    dashboard: 'Dashboard', sales: 'Sales', transfers: 'Transfers', products: 'Products',
    stockentry: 'Stock-in', inventory: 'Inventory', customers: 'Customers', suppliers: 'Suppliers',
    stores: 'Stores', reports: 'Reports', settings: 'Settings',
  },
  status: {
    paid: 'Paid', credit: 'On credit', pending: 'Pending', received: 'Received', progress: 'In progress',
    done: 'Done', instock: 'In stock', low: 'Low', reorder: 'Reorder', active: 'Active',
    b2b: 'B2B', retail: 'Retail', partner: 'Partner',
    s_central: 'Central store', s_yunus: 'Yunusabad', s_chilon: 'Chilanzar', s_wh: 'Main warehouse',
  },
  kpi: {
    todaySales: 'Revenue today', profit: 'Net profit', orders: 'Orders', lowStock: 'Low stock',
    revenue: 'Revenue this month', avgCheck: 'Average check', returns: 'Returns', debtors: 'Debtors',
  },
  cols: {
    dashboard: ['Receipt', 'Customer', 'Amount', 'Payment'],
    sales: ['Receipt #', 'Customer', 'Items', 'Amount', 'Payment'],
    transfers: ['#', 'Route', 'Product', 'Qty', 'Status'],
    products: ['SKU', 'Name', 'Stock', 'Price', 'Status'],
    stockentry: ['#', 'Supplier', 'Items', 'Amount', 'Status'],
    inventory: ['Session', 'Store', 'Checked', 'Shortage', 'Status'],
    customers: ['Customer', 'Type', 'Purchases', 'Debt', 'LTV'],
    suppliers: ['Supplier', 'Category', 'Orders', 'Turnover', 'Terms'],
    stores: ['Store', 'Address', 'Staff', 'Revenue today'],
  },
  title: {
    dashboard: 'Dashboard', sales: 'Sales', transfers: 'Transfers', products: 'Products',
    stockentry: 'Stock-in', inventory: 'Inventory', customers: 'Customers', suppliers: 'Suppliers',
    stores: 'Stores', reports: 'Reports', settings: 'Settings', recent: 'Recent sales', monthly: 'Sales by month',
  },
  count: {
    dashboard: 'Today', sales: 'Today · 42', transfers: '12 active', products: '8 940 SKU', stockentry: 'This month · 88',
    inventory: '4 sessions', customers: '12 480 contacts', suppliers: '64 active', stores: '4 locations', reports: 'December 2025',
  },
  settings: [
    { title: 'Roles & permissions', desc: 'Cashier, storekeeper, manager, director' },
    { title: 'Team', desc: '12 active users' },
    { title: 'Company profile', desc: 'Name, logo, contacts, map' },
    { title: 'Subscription', desc: 'GOLD · 23 days left' },
  ],
}

function translitDeep<T>(v: T): T {
  if (typeof v === 'string') return latinToCyrillic(v) as unknown as T
  if (Array.isArray(v)) return v.map(translitDeep) as unknown as T
  if (v && typeof v === 'object') {
    const o: Record<string, unknown> = {}
    for (const k of Object.keys(v as Record<string, unknown>)) o[k] = translitDeep((v as Record<string, unknown>)[k])
    return o as unknown as T
  }
  return v
}

function dict(lang: LandingLang): Lang {
  if (lang === 'ru') return RU
  if (lang === 'en') return EN
  if (lang === 'cyrl') return translitDeep(UZ)
  return UZ
}

// ───────── renderers ─────────
const TH = 'text-align:left;padding:11px 12px;font-size:11.5px;font-weight:600;color:var(--ink-3);text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid var(--line)'
const TD = 'padding:13px 12px;font-size:14px;color:var(--ink-2);border-bottom:1px solid var(--line)'

function cell(c: string, L: Lang, first: boolean): string {
  if (c.startsWith('@')) {
    const tok = c.slice(1)
    const tone = STATUS_TONE[tok]
    const label = L.status[tok] ?? tok
    if (tone) return `<td style="${TD}"><span style="font-size:12px;font-weight:600;color:${TONE_COLOR[tone]};background:${TONE_SOFT[tone]};padding:3px 9px;border-radius:6px">${label}</span></td>`
    return `<td style="${TD}">${label}</td>`
  }
  return `<td style="${TD}${first ? ';color:var(--ink);font-weight:600' : ''}">${c}</td>`
}

function table(cols: string[], rows: string[][], L: Lang): string {
  return `<div class="asp-table-wrap"><table><thead><tr>${cols
    .map((c) => `<th style="${TH}">${c}</th>`)
    .join('')}</tr></thead><tbody>${rows
    .map((r, i) => `<tr style="${i % 2 ? 'background:var(--bg-soft)' : ''}">${r.map((c, j) => cell(c, L, j === 0)).join('')}</tr>`)
    .join('')}</tbody></table></div>`
}

function head(title: string, sub: string): string {
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h3 style="font-size:19px;font-weight:800">${title}</h3><span style="font-size:13px;color:var(--ink-3)">${sub}</span></div>`
}

function kpiCards(items: { label: string; value: string; delta?: string; tone?: string }[]): string {
  return `<div class="asp-kpi-grid">${items
    .map(
      (k) => `<div style="background:var(--bg-soft);border:1px solid var(--line);border-radius:12px;padding:14px"><div style="font-size:12px;color:var(--ink-3)">${k.label}</div><div style="font-family:'Manrope';font-weight:800;font-size:21px;color:var(--ink);margin-top:3px">${k.value}</div>${k.delta ? `<div style="font-size:11.5px;font-weight:600;margin-top:3px;color:${k.tone === 'red' ? 'var(--red)' : k.tone === 'amber' ? 'var(--amber)' : 'var(--green)'}">${k.delta}</div>` : ''}</div>`,
    )
    .join('')}</div>`
}

function barsChart(): string {
  return `<div style="background:var(--bg-soft);border:1px solid var(--line);border-radius:12px;padding:16px"><div style="display:flex;align-items:flex-end;gap:8px;height:150px">${DATA.bars
    .map(
      (v, i, a) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end"><div style="width:100%;height:${v}%;background:${i === a.length - 1 ? 'linear-gradient(var(--primary),#0ea5e9)' : 'var(--primary-soft)'};border:1px solid ${i === a.length - 1 ? 'transparent' : 'var(--primary)'};border-radius:6px 6px 3px 3px"></div><span style="font-size:10px;color:var(--ink-4)">${i + 1}</span></div>`,
    )
    .join('')}</div></div>`
}

function panelFor(key: string, L: Lang): string {
  switch (key) {
    case 'dashboard':
      return (
        kpiCards([
          { label: L.kpi.todaySales, value: '18.4 mln', delta: '▲ 12%', tone: 'green' },
          { label: L.kpi.profit, value: '6.1 mln', delta: '▲ 8%', tone: 'green' },
          { label: L.kpi.orders, value: '128', delta: '▲ 5', tone: 'green' },
          { label: L.kpi.lowStock, value: '14 SKU', delta: '!', tone: 'amber' },
        ]) +
        `<h3 style="font-size:14px;font-weight:700;margin:4px 0 10px">${L.title.recent}</h3>` +
        table(L.cols.dashboard, DATA.dashboardRecent, L)
      )
    case 'sales':
      return head(L.title.sales, L.count.sales) + table(L.cols.sales, DATA.sales, L)
    case 'transfers':
      return head(L.title.transfers, L.count.transfers) + table(L.cols.transfers, DATA.transfers, L)
    case 'products':
      return head(L.title.products, L.count.products) + table(L.cols.products, DATA.products, L)
    case 'stockentry':
      return head(L.title.stockentry, L.count.stockentry) + table(L.cols.stockentry, DATA.stockentry, L)
    case 'inventory':
      return head(L.title.inventory, L.count.inventory) + table(L.cols.inventory, DATA.inventory, L)
    case 'customers':
      return head(L.title.customers, L.count.customers) + table(L.cols.customers, DATA.customers, L)
    case 'suppliers':
      return head(L.title.suppliers, L.count.suppliers) + table(L.cols.suppliers, DATA.suppliers, L)
    case 'stores':
      return head(L.title.stores, L.count.stores) + table(L.cols.stores, DATA.storesRows, L)
    case 'reports':
      return (
        head(L.title.reports, L.count.reports) +
        kpiCards([
          { label: L.kpi.revenue, value: '142 mln', delta: '▲ 18%', tone: 'green' },
          { label: L.kpi.profit, value: '38 mln', delta: '▲ 12%', tone: 'green' },
          { label: L.kpi.avgCheck, value: '320 000', delta: '▲ 4%', tone: 'green' },
          { label: L.kpi.returns, value: '1.2%', delta: '▼ 0.3%', tone: 'green' },
        ]) +
        `<h3 style="font-size:14px;font-weight:700;margin:4px 0 10px">${L.title.monthly}</h3>` +
        barsChart()
      )
    case 'settings':
      return (
        head(L.title.settings, '') +
        `<div class="asp-mini-grid">${L.settings
          .map(
            (s) => `<div style="background:var(--bg-soft);border:1px solid var(--line);border-radius:12px;padding:16px"><div style="font-weight:700;font-size:15px;color:var(--ink)">${s.title}</div><div style="font-size:13px;color:var(--ink-3);margin-top:4px">${s.desc}</div></div>`,
          )
          .join('')}</div>`
      )
    default:
      return ''
  }
}

// Sidebar tablari (kompaniya menyusi) + panellar HTML'i.
export function buildDemo(lang: LandingLang): { tabs: string; panels: string } {
  const L = dict(lang)
  const tabs = MODULES.map(
    (m, i) =>
      `<button data-tab="${m.key}" class="asp-demo-tab${i === 0 ? ' is-active' : ''}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="${m.icon}" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>${L.tabs[m.key]}</button>`,
  ).join('')
  const panels = MODULES.map(
    (m, i) => `<div data-panel="${m.key}" style="display:${i === 0 ? 'block' : 'none'}">${panelFor(m.key, L)}</div>`,
  ).join('')
  return { tabs, panels }
}
