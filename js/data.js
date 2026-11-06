/* Всё, что правится руками: контакты, валюта, работы, форматы и прайс калькулятора.
   Строки двуязычные: L("по-русски", "in English"). ЦЕНЫ — ориентир-заглушка (04.11.2026), поправить под свои. */
window.SITE = {
  tg: "jdrobyshev",          // Telegram, куда уходит бриф
  mail: "",                  // почта студии; пусто — кнопка почты скрыта
  cur: "₪",                  // валюта: "₪" или "₽" (тогда поменять и цены ниже)
};
const pl = (n, one, few, many) => L(n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many, "");

// cat: ad | wedding | event | film  (фильтр «Работы»)
window.WORKS = [
  { id: "kick", cat: "event", title: L("Чемпионат России по кикбоксингу", "Russian Kickboxing Championship"), kind: L("репортаж", "event film"), where: L("Пермь", "Perm"), year: 2023 },
  { id: "akmaral", cat: "wedding", title: L("Илья и Акмарал", "Ilya & Akmaral"), kind: L("свадебный клип", "wedding film"), where: L("Израиль", "Israel"), year: 2026 },
  { id: "klej", cat: "ad", title: L("Завод клея", "Glue factory"), kind: L("имиджевый ролик", "brand film"), year: 2023 },
  { id: "prosvet", cat: "event", title: L("Просвет", "Prosvet"), kind: L("фестиваль света", "light festival"), where: L("Хабаровск", "Khabarovsk"), year: 2023 },
  { id: "stayclean", cat: "ad", title: "Stay Clean", kind: L("ролик для химчистки обуви", "ad for a sneaker-care studio"), year: 2023 },
  { id: "roman", cat: "wedding", title: L("Роман и Мария", "Roman & Maria"), kind: L("свадебный клип", "wedding film"), year: 2023 },
  { id: "dolya", cat: "film", title: L("Женская доля", "A Woman’s Lot"), kind: L("документальный фильм, фрагмент", "documentary, excerpt"), full: "25:30", year: 2026 },
  { id: "sport", cat: "ad", title: L("Номинация «Спорт»", "Award: Sport"), kind: L("ролик к церемонии награждения", "awards ceremony film"), year: 2023 },
  { id: "lampa", cat: "event", title: "LAMPA 2026", kind: L("фильм-отчёт кинофестиваля", "film festival recap"), role: L("монтаж", "edit"), where: L("Пермь", "Perm"), year: 2026 },
  { id: "kiyana", cat: "film", title: L("Кияна", "Kiyana"), kind: L("сцена игрового кино", "scene from a feature"), year: 2023 },
  { id: "vniibt", cat: "film", title: L("ВНИИБТ", "VNIIBT"), kind: L("корпоративный фильм, фрагмент", "corporate film, excerpt"), full: "18:48", year: 2023 },
  { id: "imall", cat: "ad", title: "LAMPA × iMall", kind: L("партнёрский ролик", "partner ad"), year: 2026 },
  { id: "kickme", cat: "film", title: L("Для меня кикбоксинг это…", "Kickboxing to me is…"), kind: L("интервью спортсменов", "athlete interviews"), year: 2023 },
];
window.CATS = [
  { id: "all", name: L("Все", "All") },
  { id: "ad", name: L("Реклама", "Ads") },
  { id: "wedding", name: L("Свадьбы", "Weddings") },
  { id: "event", name: L("Репортажи", "Events") },
  { id: "film", name: L("Интервью и кино", "Interviews & film") },
];

// первый экран: кадры по очереди, work — какая работа открывается по «смотреть работу»
window.HERO = [
  { id: "h_klej", work: "klej" },
  { id: "h_kick", work: "kick" },
  { id: "h_veil", work: "akmaral" },
  { id: "h_prosvet", work: "prosvet" },
  { id: "h_hearts", work: "akmaral" },
  { id: "h_kiyana", work: "kiyana" },
  { id: "h_shoe", work: "stayclean" },
  { id: "h_slowmo", work: "kick" },
  { id: "h_fire", work: "roman" },
  { id: "h_sport", work: "sport" },
];

/* Форматы и калькулятор. base — цена базового набора, opts — что докручивается.
   range: [min, max, шаг, по умолчанию], price(v) — сколько добавляет значение.
   pick: варианты кнопками, add — надбавка. flag: галочка, add — надбавка. */
const reels = (n) => `${n} ${L(`рилс${pl(n, "", "а", "ов")}`, n === 1 ? "reel" : "reels")}`;
const eps = (n) => `${n} ${L(`выпуск${pl(n, "", "а", "ов")}`, n === 1 ? "episode" : "episodes")}`;
window.FORMATS = [
  {
    id: "ad", name: L("Реклама и промо", "Ads & promo"), short: L("Реклама", "Ad"), ar: 16 / 9, clip: "klej",
    lines: [L("Ролик для сайта, таргета и экранов", "Films for your site, paid social and screens"), L("Сценарий, съёмка, монтаж, цвет, звук", "Script, shoot, edit, colour, sound"), L("Версии под вертикаль", "Vertical cut-downs")],
    base: 7900, days: L("10–14 дней", "10–14 days"), works: "ad",
    opts: [
      { id: "len", label: L("Длина ролика", "Video length"), pick: [[L("15 с", "15 s"), -900], [L("30 с", "30 s"), 0], [L("60 с", "60 s"), 2200]], def: 1 },
      { id: "shoot", label: L("Съёмочных дней", "Shoot days"), range: [1, 3, 1, 1], price: (v) => (v - 1) * 4200, unit: (v) => L(v === 1 ? "день" : "дня", v === 1 ? "day" : "days") },
      { id: "cuts", label: L("Вертикальных версий", "Vertical versions"), range: [0, 5, 1, 2], price: (v) => v * 450 },
      { id: "actors", label: L("Актёры и кастинг", "Actors & casting"), flag: true, add: 2800 },
      { id: "drone", label: L("Съёмка с дрона", "Drone footage"), flag: true, add: 1200 },
    ],
    out: (o) => [L(`ролик ${["15", "30", "60"][o.len]} с`, `${["15", "30", "60"][o.len]}-second film`), o.cuts ? L(`${o.cuts} вертикальн${o.cuts === 1 ? "ая версия" : o.cuts < 5 ? "ые версии" : "ых версий"}`, `${o.cuts} vertical version${o.cuts === 1 ? "" : "s"}`) : ""],
  },
  {
    id: "wedding", name: L("Свадьбы", "Weddings"), short: L("Свадьба", "Wedding"), ar: 2.39, clip: "roman",
    lines: [L("Клип дня на 3–5 минут", "A 3–5 minute film of the day"), L("Полный фильм и рилсы для соцсетей", "Full-length film and reels for socials"), L("Два оператора: ни одного пропущенного взгляда", "Two shooters, not a single glance missed")],
    base: 4900, days: L("21–30 дней", "21–30 days"), works: "wedding",
    opts: [
      { id: "hours", label: L("Часов съёмки", "Hours of filming"), range: [4, 14, 1, 8], price: (v) => (v - 6) * 380, unit: () => L("ч", "h") },
      { id: "ops", label: L("Операторов", "Shooters"), pick: [["1", 0], ["2", 1900]], def: 1 },
      { id: "film", label: L("Полный фильм дня", "Full-length film"), flag: true, add: 1600, on: true },
      { id: "reels", label: L("Рилсов", "Reels"), range: [0, 6, 1, 3], price: (v) => v * 280 },
      { id: "drone", label: L("Дрон", "Drone"), flag: true, add: 1300 },
      { id: "teaser", label: L("Тизер на следующий день", "Teaser the next day"), flag: true, add: 650 },
    ],
    out: (o) => [L("клип 3–5 мин", "3–5 min film"), o.film ? L("полный фильм", "full-length film") : "", o.reels ? reels(o.reels) : "", o.teaser ? L("тизер через день", "next-day teaser") : ""],
  },
  {
    id: "event", name: L("Репортажи и ивенты", "Events & reportage"), short: L("Репортаж", "Event"), ar: 16 / 9, clip: "kick",
    lines: [L("Фестивали, спорт, конференции, концерты", "Festivals, sport, conferences, concerts"), L("Ролик-отчёт на 1–3 минуты", "A 1–3 minute recap"), L("Рилсы по горячим следам", "Reels while it’s still hot")],
    base: 2400, days: L("5–7 дней", "5–7 days"), works: "event",
    opts: [
      { id: "hours", label: L("Часов съёмки", "Hours of filming"), range: [2, 12, 1, 4], price: (v) => (v - 3) * 420, unit: () => L("ч", "h") },
      { id: "ops", label: L("Операторов", "Shooters"), pick: [["1", 0], ["2", 1600], ["3", 3200]], def: 0 },
      { id: "reels", label: L("Рилсов", "Reels"), range: [0, 6, 1, 2], price: (v) => v * 300 },
      { id: "rush", label: L("Ролик на следующий день", "Next-day recap"), flag: true, add: 850 },
    ],
    out: (o) => [L("ролик-отчёт 1–3 мин", "1–3 min recap"), o.reels ? reels(o.reels) : ""],
    rushDays: L("1 день", "1 day"),
  },
  {
    id: "reels", name: L("Рилсы и контент", "Reels & content"), short: L("Рилсы", "Reels"), ar: 9 / 16, clip: "akmaral",
    lines: [L("Пакет вертикальных роликов за один день", "A pack of vertical videos in one day"), L("Сценарии, съёмка, монтаж, субтитры", "Scripts, shoot, edit, subtitles"), L("Для бренда, эксперта, заведения", "For brands, experts, venues")],
    base: 0, days: L("7 дней", "7 days"), works: "ad",
    opts: [
      { id: "count", label: L("Роликов в пакете", "Videos in the pack"), pick: [["4", 2400], ["8", 3900], ["12", 5300], ["20", 7900]], def: 1 },
      { id: "script", label: L("Сценарии пишем мы", "We write the scripts"), flag: true, add: 900, on: true },
      { id: "subs", label: L("Субтитры", "Subtitles"), flag: true, add: 350, on: true },
      { id: "day2", label: L("Второй съёмочный день", "Second shoot day"), flag: true, add: 1800 },
    ],
    out: (o) => [L(`${["4", "8", "12", "20"][o.count]} рилсов 9:16`, `${["4", "8", "12", "20"][o.count]} reels, 9:16`), o.subs ? L("с субтитрами", "with subtitles") : ""],
  },
  {
    id: "youtube", name: L("YouTube и интервью", "YouTube & interviews"), short: "YouTube", ar: 16 / 9, clip: "stayclean",
    lines: [L("Выпуски, интервью, экспертные ролики", "Episodes, interviews, expert videos"), L("Корпоративное и документальное кино", "Corporate and documentary films"), L("Монтаж с графикой и перебивками", "Edited with graphics and b-roll")],
    base: 600, days: L("5 дней на выпуск", "5 days per episode"), works: "film",
    opts: [
      { id: "eps", label: L("Выпусков", "Episodes"), range: [1, 8, 1, 1], price: (v) => 1900 * v },
      { id: "cams", label: L("Камер", "Cameras"), pick: [["1", 0], ["2", 550], ["3", 1000]], def: 1, perEp: true },
      { id: "gfx", label: L("Графика и титры", "Graphics & titles"), flag: true, add: 750, perEp: true },
    ],
    out: (o) => [eps(o.eps), L(`${o.cams + 1} камер${o.cams ? "ы" : "а"}`, `${o.cams + 1} camera${o.cams ? "s" : ""}`)],
  },
  {
    id: "podcast", name: L("Подкасты", "Podcasts"), short: L("Подкаст", "Podcast"), ar: 16 / 9, clip: "kickme",
    lines: [L("2–3 камеры, свет, звук на каждого", "2–3 cameras, lighting, a mic on everyone"), L("Полный выпуск для YouTube", "The full episode for YouTube"), L("Нарезка на рилсы с субтитрами", "Subtitled reels cut from it")],
    base: 400, days: L("4 дня на выпуск", "4 days per episode"), works: "film",
    opts: [
      { id: "eps", label: L("Выпусков", "Episodes"), range: [1, 8, 1, 1], price: (v) => 1450 * v },
      { id: "len", label: L("Длина выпуска", "Episode length"), pick: [[L("до 1 ч", "up to 1 h"), 0], [L("до 2 ч", "up to 2 h"), 650]], def: 0, perEp: true },
      { id: "cams", label: L("Камер", "Cameras"), pick: [["2", 0], ["3", 450]], def: 1, perEp: true },
      { id: "cuts", label: L("Рилсов с выпуска", "Reels per episode"), range: [0, 10, 1, 3], price: (v) => v * 180, perEp: true },
    ],
    out: (o) => [eps(o.eps), o.cuts ? L(`по ${o.cuts} рилс${o.cuts === 1 ? "у" : "ов"} с выпуска`, `${o.cuts} reel${o.cuts === 1 ? "" : "s"} per episode`) : ""],
  },
];

// вопросы перепиской: [вопрос клиента, ответ студии]
window.FAQ = [
  [L("Здравствуйте! А сколько стоит?", "Hi! So how much is it?"), L("Зависит от часов, камер и того, что нужно на выходе. Калькулятор выше даёт честный ориентир, точную сумму фиксируем после брифа, до съёмки.", "Depends on the hours, cameras and what you need at the end. The calculator above gives an honest ballpark; we lock the exact number after the brief, before the shoot.")],
  [L("Когда будет готово?", "When will it be ready?"), L("Сроки написаны у каждого формата. Рилсы и тизер можем отдать на следующий день, если договоримся заранее.", "Each format lists its turnaround. Reels and teasers can land the next day if we agree on it upfront.")],
  [L("А если что-то не понравится?", "What if we don’t like something?"), L("Два круга правок по монтажу уже в цене. Обычно хватает одного.", "Two rounds of edit revisions are already in the price. One is usually enough.")],
  [L("Исходники отдаёте?", "Do we get the raw footage?"), L("Да. Скинем всё отснятое на ваш диск или в облако.", "Yes. We’ll drop everything we shot onto your drive or a cloud folder.")],
  [L("Как забронировать дату?", "How do we book a date?"), L("Напишите нам: подтвердим дату и сумму, после предоплаты дата ваша.", "Message us: we confirm the date and price, and once the deposit is in, the date is yours.")],
  [L("Музыку в рекламе не заблокируют?", "Will the music get our ad blocked?"), L("Берём треки с лицензией под нужную площадку.", "We use tracks licensed for the platform you need.")],
];
