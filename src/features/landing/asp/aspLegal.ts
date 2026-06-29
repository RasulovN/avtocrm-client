// Maxfiylik siyosati va Foydalanish shartlari — landing footer modallari uchun
// to'liq matn. ru / uz / en qo'lda, cyrl varianti uz(latin)dan runtime'da olinadi.
import { latinToCyrillic } from '../../../utils/transliteration'
import type { LandingLang } from '../types'

export interface LegalSection { h: string; p: string[] }
export interface LegalDoc { title: string; updated: string; intro: string; sections: LegalSection[] }
export interface CookieText { title: string; text: string; accept: string; reject: string; more: string }
export interface LegalDict { closeLabel: string; cookie: CookieText; privacy: LegalDoc; terms: LegalDoc }

const RU: LegalDict = {
  closeLabel: 'Закрыть',
  cookie: {
    title: 'Мы используем файлы cookie',
    text: 'Этот сайт использует cookie для работы основных функций, запоминания настроек (язык, тема) и аналитики. Вы можете принять все cookie или оставить только необходимые.',
    accept: 'Принять все',
    reject: 'Только необходимые',
    more: 'Подробнее',
  },
  privacy: {
    title: 'Политика конфиденциальности',
    updated: 'Последнее обновление: 1 января 2026 г.',
    intro:
      'Настоящая Политика конфиденциальности описывает, как платформа Zumex («мы», «нас») собирает, использует, хранит и защищает персональные данные пользователей сайта и сервиса. Используя наш сайт и сервис, вы соглашаетесь с условиями настоящей Политики.',
    sections: [
      { h: '1. Общие положения', p: [
        'Оператором персональных данных является компания Zumex, предоставляющая облачную ERP/CRM-платформу для управления автобизнесом.',
        'Мы обрабатываем данные в соответствии с законодательством Республики Узбекистан о персональных данных и общепринятыми стандартами безопасности.',
      ] },
      { h: '2. Какие данные мы собираем', p: [
        'Контактные данные: имя, номер телефона, адрес электронной почты, название компании, которые вы указываете в формах заявки и регистрации.',
        'Технические данные: IP-адрес, тип устройства и браузера, файлы cookie, страницы и действия на сайте.',
        'Данные сервиса: информация, которую вы вносите при работе в системе (товары, клиенты, заказы, финансовые показатели).',
      ] },
      { h: '3. Цели обработки данных', p: [
        'Предоставление доступа к сервису, обработка заявок и обращений, выставление счетов и сопровождение подписки.',
        'Улучшение качества продукта, аналитика использования, обеспечение технической поддержки и безопасности.',
        'Информирование о новостях, обновлениях и предложениях (только при наличии вашего согласия).',
      ] },
      { h: '4. Хранение и защита данных', p: [
        'Данные хранятся на защищённых серверах с ограниченным доступом и шифрованием при передаче (HTTPS/TLS).',
        'Мы применяем организационные и технические меры для предотвращения несанкционированного доступа, изменения или утраты данных.',
        'Данные хранятся в течение срока, необходимого для целей обработки, либо до отзыва вашего согласия.',
      ] },
      { h: '5. Передача третьим лицам', p: [
        'Мы не продаём персональные данные. Передача возможна только проверенным подрядчикам (хостинг, платёжные системы, сервисы рассылок) в объёме, необходимом для работы сервиса.',
        'Данные также могут быть раскрыты по законному требованию уполномоченных государственных органов.',
      ] },
      { h: '6. Файлы cookie', p: [
        'Сайт использует cookie для сохранения настроек (язык, тема), аналитики и повышения удобства. Вы можете отключить cookie в настройках браузера, однако часть функций может работать некорректно.',
      ] },
      { h: '7. Права пользователя', p: [
        'Вы вправе запросить доступ к своим данным, их исправление или удаление, а также отозвать согласие на обработку.',
        'Для реализации своих прав свяжитесь с нами по контактам, указанным на сайте.',
      ] },
      { h: '8. Изменения и контакты', p: [
        'Мы можем периодически обновлять настоящую Политику. Актуальная версия всегда доступна на этой странице.',
        'По вопросам конфиденциальности обращайтесь к нам через контактную форму или по электронной почте, указанной в разделе «Контакты».',
      ] },
    ],
  },
  terms: {
    title: 'Условия использования',
    updated: 'Последнее обновление: 1 января 2026 г.',
    intro:
      'Настоящие Условия использования регулируют отношения между платформой Zumex и пользователями сервиса. Регистрируясь или используя сервис, вы принимаете данные Условия в полном объёме.',
    sections: [
      { h: '1. Общие положения', p: [
        'Zumex предоставляет облачный сервис (SaaS) для управления автобизнесом — ERP и CRM функционал по модели подписки.',
        'Используя сервис, вы подтверждаете, что обладаете необходимыми полномочиями и дееспособностью для заключения соглашения.',
      ] },
      { h: '2. Использование сервиса', p: [
        'Вы обязуетесь использовать сервис в законных целях и не нарушать права третьих лиц.',
        'Запрещается вмешательство в работу сервиса, попытки несанкционированного доступа, распространение вредоносного кода и иные противоправные действия.',
      ] },
      { h: '3. Учётная запись и безопасность', p: [
        'Вы несёте ответственность за сохранность данных для входа и за все действия, совершённые под вашей учётной записью.',
        'При обнаружении несанкционированного доступа необходимо незамедлительно уведомить нас.',
      ] },
      { h: '4. Оплата и подписка', p: [
        'Доступ к платным тарифам предоставляется на условиях подписки. Стоимость и состав тарифов указаны на сайте.',
        'Оплата возможна через поддерживаемые платёжные системы (Payme, Click, банковские карты Uzcard, Humo, Visa, Mastercard).',
        'При неоплате подписки доступ к платным функциям может быть ограничен или приостановлен.',
      ] },
      { h: '5. Интеллектуальная собственность', p: [
        'Все права на программное обеспечение, дизайн, товарные знаки и контент сервиса принадлежат Zumex.',
        'Данные, которые вы вносите в систему, остаются вашей собственностью; мы обрабатываем их только для предоставления сервиса.',
      ] },
      { h: '6. Ограничение ответственности', p: [
        'Сервис предоставляется «как есть». Мы стремимся обеспечить бесперебойную работу, но не гарантируем отсутствие технических сбоев.',
        'Мы не несём ответственности за косвенные убытки, возникшие в результате использования или невозможности использования сервиса.',
      ] },
      { h: '7. Приостановление и прекращение', p: [
        'Мы вправе приостановить или прекратить доступ при нарушении настоящих Условий.',
        'Вы можете прекратить использование сервиса в любой момент, отказавшись от подписки.',
      ] },
      { h: '8. Заключительные положения', p: [
        'К настоящим Условиям применяется законодательство Республики Узбекистан.',
        'Мы можем изменять Условия; продолжение использования сервиса означает согласие с обновлённой редакцией. По всем вопросам обращайтесь через раздел «Контакты».',
      ] },
    ],
  },
}

const UZ: LegalDict = {
  closeLabel: 'Yopish',
  cookie: {
    title: 'Biz cookie fayllardan foydalanamiz',
    text: 'Ushbu sayt asosiy funksiyalar ishlashi, sozlamalarni (til, mavzu) eslab qolish va tahlil uchun cookie ishlatadi. Siz barcha cookie’larni qabul qilishingiz yoki faqat zarurlarini qoldirishingiz mumkin.',
    accept: 'Barchasini qabul qilish',
    reject: 'Faqat zarurlari',
    more: 'Batafsil',
  },
  privacy: {
    title: 'Maxfiylik siyosati',
    updated: 'Oxirgi yangilanish: 2026-yil 1-yanvar',
    intro:
      'Ushbu Maxfiylik siyosati Zumex platformasi («biz») sayt va xizmat foydalanuvchilarining shaxsiy ma’lumotlarini qanday yig‘ishi, ishlatishi, saqlashi va himoya qilishini tavsiflaydi. Saytdan va xizmatdan foydalanish orqali siz ushbu siyosat shartlariga rozilik bildirasiz.',
    sections: [
      { h: '1. Umumiy qoidalar', p: [
        'Shaxsiy ma’lumotlar operatori — avtobiznesni boshqarish uchun bulutli ERP/CRM platformasini taqdim etuvchi Zumex kompaniyasi.',
        'Biz ma’lumotlarni O‘zbekiston Respublikasining shaxsiy ma’lumotlar to‘g‘risidagi qonunchiligi va umumqabul qilingan xavfsizlik standartlariga muvofiq qayta ishlaymiz.',
      ] },
      { h: '2. Qanday ma’lumotlarni yig‘amiz', p: [
        'Aloqa ma’lumotlari: zayavka va ro‘yxatdan o‘tish shakllarida ko‘rsatadigan ism, telefon raqami, elektron pochta, kompaniya nomi.',
        'Texnik ma’lumotlar: IP-manzil, qurilma va brauzer turi, cookie fayllari, saytdagi sahifa va harakatlar.',
        'Xizmat ma’lumotlari: tizimda ishlash jarayonida kiritadigan ma’lumotlar (tovarlar, mijozlar, buyurtmalar, moliyaviy ko‘rsatkichlar).',
      ] },
      { h: '3. Ma’lumotlardan foydalanish maqsadi', p: [
        'Xizmatga kirishni ta’minlash, zayavka va murojaatlarni qayta ishlash, hisob-fakturalar va obunani qo‘llab-quvvatlash.',
        'Mahsulot sifatini yaxshilash, foydalanish tahlili, texnik yordam va xavfsizlikni ta’minlash.',
        'Yangiliklar, yangilanishlar va takliflar haqida xabardor qilish (faqat sizning roziligingiz bilan).',
      ] },
      { h: '4. Ma’lumotlarni saqlash va himoya', p: [
        'Ma’lumotlar cheklangan kirishli himoyalangan serverlarda saqlanadi va uzatishda shifrlanadi (HTTPS/TLS).',
        'Biz ruxsatsiz kirish, o‘zgartirish yoki yo‘qotishning oldini olish uchun tashkiliy va texnik choralar qo‘llaymiz.',
        'Ma’lumotlar qayta ishlash maqsadlari uchun zarur bo‘lgan muddat davomida yoki rozilik qaytarib olinmaguncha saqlanadi.',
      ] },
      { h: '5. Uchinchi tomonlarga uzatish', p: [
        'Biz shaxsiy ma’lumotlarni sotmaymiz. Uzatish faqat ishonchli pudratchilarga (xosting, to‘lov tizimlari, xabar yuborish xizmatlari) xizmat ishlashi uchun zarur hajmda amalga oshiriladi.',
        'Ma’lumotlar vakolatli davlat organlarining qonuniy talabi asosida ham oshkor qilinishi mumkin.',
      ] },
      { h: '6. Cookie fayllari', p: [
        'Sayt sozlamalarni saqlash (til, mavzu), tahlil va qulaylik uchun cookie ishlatadi. Cookie’larni brauzer sozlamalarida o‘chirishingiz mumkin, biroq ayrim funksiyalar to‘g‘ri ishlamasligi mumkin.',
      ] },
      { h: '7. Foydalanuvchi huquqlari', p: [
        'Siz o‘z ma’lumotlaringizga kirish, ularni to‘g‘rilash yoki o‘chirishni so‘rashga, shuningdek qayta ishlashga bergan rozilikni qaytarib olishga haqlisiz.',
        'Huquqlaringizni amalga oshirish uchun saytda ko‘rsatilgan kontaktlar orqali biz bilan bog‘laning.',
      ] },
      { h: '8. O‘zgartirishlar va aloqa', p: [
        'Biz ushbu siyosatni vaqti-vaqti bilan yangilab turishimiz mumkin. Joriy versiya doimo ushbu sahifada mavjud.',
        'Maxfiylik bo‘yicha savollar uchun aloqa shakli yoki «Kontaktlar» bo‘limidagi pochta orqali murojaat qiling.',
      ] },
    ],
  },
  terms: {
    title: 'Foydalanish shartlari',
    updated: 'Oxirgi yangilanish: 2026-yil 1-yanvar',
    intro:
      'Ushbu Foydalanish shartlari Zumex platformasi va xizmat foydalanuvchilari o‘rtasidagi munosabatlarni tartibga soladi. Ro‘yxatdan o‘tish yoki xizmatdan foydalanish orqali siz ushbu shartlarni to‘liq qabul qilasiz.',
    sections: [
      { h: '1. Umumiy qoidalar', p: [
        'Zumex avtobiznesni boshqarish uchun bulutli xizmat (SaaS) — obuna modeli asosidagi ERP va CRM funksiyalarini taqdim etadi.',
        'Xizmatdan foydalanib, siz kelishuv tuzish uchun zarur vakolat va layoqatga ega ekanligingizni tasdiqlaysiz.',
      ] },
      { h: '2. Xizmatdan foydalanish', p: [
        'Siz xizmatdan faqat qonuniy maqsadlarda foydalanish va uchinchi tomon huquqlarini buzmaslik majburiyatini olasiz.',
        'Xizmat ishiga aralashish, ruxsatsiz kirishga urinish, zararli kod tarqatish va boshqa noqonuniy harakatlar taqiqlanadi.',
      ] },
      { h: '3. Hisob va xavfsizlik', p: [
        'Kirish ma’lumotlarining saqlanishi va hisobingiz ostida amalga oshirilgan barcha harakatlar uchun siz javobgarsiz.',
        'Ruxsatsiz kirish aniqlangan taqdirda darhol bizni xabardor qilishingiz lozim.',
      ] },
      { h: '4. To‘lov va obuna', p: [
        'Pulli tariflarga kirish obuna shartlari asosida beriladi. Tariflar narxi va tarkibi saytda ko‘rsatilgan.',
        'To‘lov qo‘llab-quvvatlanadigan to‘lov tizimlari orqali amalga oshiriladi (Payme, Click, Uzcard, Humo, Visa, Mastercard kartalari).',
        'Obuna to‘lanmagan taqdirda pulli funksiyalarga kirish cheklanishi yoki to‘xtatilishi mumkin.',
      ] },
      { h: '5. Intellektual mulk', p: [
        'Dasturiy ta’minot, dizayn, tovar belgilari va xizmat kontentiga bo‘lgan barcha huquqlar Zumex’ga tegishli.',
        'Tizimga kiritgan ma’lumotlaringiz o‘zingizniki bo‘lib qoladi; biz ularni faqat xizmatni taqdim etish uchun qayta ishlaymiz.',
      ] },
      { h: '6. Javobgarlik chegaralari', p: [
        'Xizmat «borligicha» taqdim etiladi. Biz uzluksiz ishlashga intilamiz, biroq texnik nosozliklar yo‘qligini kafolatlamaymiz.',
        'Xizmatdan foydalanish yoki foydalana olmaslik natijasida yuzaga kelgan bilvosita zararlar uchun biz javobgar emasmiz.',
      ] },
      { h: '7. Xizmatni to‘xtatish', p: [
        'Ushbu shartlar buzilgan taqdirda biz kirishni to‘xtatish yoki tugatish huquqiga egamiz.',
        'Siz istalgan vaqtda obunadan voz kechib, xizmatdan foydalanishni to‘xtatishingiz mumkin.',
      ] },
      { h: '8. Yakuniy qoidalar', p: [
        'Ushbu shartlarga O‘zbekiston Respublikasi qonunchiligi qo‘llaniladi.',
        'Biz shartlarni o‘zgartirishimiz mumkin; xizmatdan foydalanishda davom etish yangilangan tahrirga rozilik hisoblanadi. Barcha savollar bo‘yicha «Kontaktlar» bo‘limi orqali murojaat qiling.',
      ] },
    ],
  },
}

const EN: LegalDict = {
  closeLabel: 'Close',
  cookie: {
    title: 'We use cookies',
    text: 'This site uses cookies to run core features, remember your preferences (language, theme) and for analytics. You can accept all cookies or keep only the necessary ones.',
    accept: 'Accept all',
    reject: 'Necessary only',
    more: 'Learn more',
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'Last updated: January 1, 2026',
    intro:
      'This Privacy Policy describes how the Zumex platform (“we”, “us”) collects, uses, stores and protects the personal data of website and service users. By using our website and service, you agree to the terms of this Policy.',
    sections: [
      { h: '1. General provisions', p: [
        'The data controller is Zumex, a company providing a cloud ERP/CRM platform for managing auto businesses.',
        'We process data in accordance with the personal data legislation of the Republic of Uzbekistan and commonly accepted security standards.',
      ] },
      { h: '2. What data we collect', p: [
        'Contact data: name, phone number, email address and company name that you provide in request and registration forms.',
        'Technical data: IP address, device and browser type, cookies, pages and actions on the site.',
        'Service data: information you enter while working in the system (products, customers, orders, financial figures).',
      ] },
      { h: '3. Purposes of processing', p: [
        'Providing access to the service, processing requests and enquiries, invoicing and supporting your subscription.',
        'Improving product quality, usage analytics, technical support and security.',
        'Informing you about news, updates and offers (only with your consent).',
      ] },
      { h: '4. Storage and protection', p: [
        'Data is stored on secured servers with restricted access and encrypted in transit (HTTPS/TLS).',
        'We apply organisational and technical measures to prevent unauthorised access, alteration or loss of data.',
        'Data is retained for as long as necessary for the processing purposes or until you withdraw your consent.',
      ] },
      { h: '5. Sharing with third parties', p: [
        'We do not sell personal data. Sharing only occurs with trusted contractors (hosting, payment systems, messaging services) to the extent necessary to operate the service.',
        'Data may also be disclosed upon a lawful request from authorised government bodies.',
      ] },
      { h: '6. Cookies', p: [
        'The site uses cookies to store preferences (language, theme), for analytics and convenience. You can disable cookies in your browser settings, but some features may not work correctly.',
      ] },
      { h: '7. Your rights', p: [
        'You may request access to your data, its correction or deletion, and withdraw your consent to processing.',
        'To exercise your rights, contact us using the details provided on the website.',
      ] },
      { h: '8. Changes and contact', p: [
        'We may update this Policy from time to time. The current version is always available on this page.',
        'For privacy matters, contact us via the contact form or the email listed in the “Contacts” section.',
      ] },
    ],
  },
  terms: {
    title: 'Terms of Use',
    updated: 'Last updated: January 1, 2026',
    intro:
      'These Terms of Use govern the relationship between the Zumex platform and the users of the service. By registering or using the service, you accept these Terms in full.',
    sections: [
      { h: '1. General provisions', p: [
        'Zumex provides a cloud service (SaaS) for managing auto businesses — ERP and CRM functionality on a subscription model.',
        'By using the service, you confirm that you have the authority and legal capacity to enter into this agreement.',
      ] },
      { h: '2. Use of the service', p: [
        'You agree to use the service for lawful purposes only and not to infringe the rights of third parties.',
        'Interfering with the service, attempting unauthorised access, distributing malicious code and other unlawful actions are prohibited.',
      ] },
      { h: '3. Account and security', p: [
        'You are responsible for keeping your login credentials safe and for all actions performed under your account.',
        'If you detect unauthorised access, you must notify us immediately.',
      ] },
      { h: '4. Payment and subscription', p: [
        'Access to paid plans is granted on a subscription basis. Plan prices and contents are listed on the website.',
        'Payment is made through supported payment systems (Payme, Click, Uzcard, Humo, Visa, Mastercard cards).',
        'If the subscription is not paid, access to paid features may be limited or suspended.',
      ] },
      { h: '5. Intellectual property', p: [
        'All rights to the software, design, trademarks and service content belong to Zumex.',
        'The data you enter into the system remains yours; we process it solely to provide the service.',
      ] },
      { h: '6. Limitation of liability', p: [
        'The service is provided “as is”. We strive for uninterrupted operation but do not guarantee the absence of technical failures.',
        'We are not liable for indirect damages arising from the use of or inability to use the service.',
      ] },
      { h: '7. Suspension and termination', p: [
        'We may suspend or terminate access in the event of a breach of these Terms.',
        'You may stop using the service at any time by cancelling your subscription.',
      ] },
      { h: '8. Final provisions', p: [
        'These Terms are governed by the legislation of the Republic of Uzbekistan.',
        'We may amend the Terms; continued use of the service constitutes acceptance of the updated version. For any questions, reach out via the “Contacts” section.',
      ] },
    ],
  },
}

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

export function getLegal(lang: LandingLang): LegalDict {
  switch (lang) {
    case 'ru': return RU
    case 'en': return EN
    case 'cyrl': return translitDeep(UZ)
    case 'uz':
    default: return UZ
  }
}
