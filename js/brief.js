/* Бриф за минуту: формат → 2–3 вопроса под него → срок, бюджет, контакт → готовый текст в Telegram.
   Сервера нет: клиент отправляет бриф сам из своего Telegram. */
window.BRIEF = (() => {
  const S = window.SITE;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const name = (id) => (window.FORMATS.find((f) => f.id === id) || { name: L("Другое", "Something else") }).name;

  // ответы кнопками, чтобы бриф проходился за минуту
  const QS = {
    ad: [
      { id: "where", q: L("Где выйдет", "Where it runs"), a: [L("соцсети", "social"), L("сайт", "website"), L("таргет", "paid ads"), L("ТВ и экраны", "TV & screens"), L("пока не знаю", "not sure yet")], multi: true },
      { id: "len", q: L("Длина", "Length"), a: [L("15 с", "15 s"), L("30 с", "30 s"), L("60 с", "60 s"), L("серия роликов", "a series")] },
      { id: "script", q: L("Сценарий", "Script"), a: [L("готов", "ready"), L("есть идея", "just an idea"), L("нужен с нуля", "need one from scratch")] },
    ],
    wedding: [
      { id: "date", q: L("Дата свадьбы", "Wedding date"), input: L("например, 14 июня", "e.g. June 14") },
      { id: "place", q: L("Где", "Where"), input: L("город, площадка", "city, venue") },
      { id: "need", q: L("Что нужно", "What you need"), a: [L("клип дня", "film of the day"), L("полный фильм", "full-length film"), L("рилсы", "reels"), L("дрон", "drone"), L("тизер на следующий день", "next-day teaser")], multi: true },
    ],
    event: [
      { id: "what", q: L("Что за событие", "What’s the event"), a: [L("фестиваль", "festival"), L("конференция", "conference"), L("спорт", "sport"), L("концерт", "concert"), L("корпоратив", "corporate party")] },
      { id: "hours", q: L("Сколько часов", "How long"), a: [L("до 3", "up to 3 h"), L("3–6", "3–6 h"), L("весь день", "all day"), L("несколько дней", "several days")] },
      { id: "need", q: L("Что нужно", "What you need"), a: [L("ролик-отчёт", "recap film"), L("рилсы", "reels"), L("ролик на следующий день", "next-day recap"), L("интервью гостей", "guest interviews")], multi: true },
    ],
    reels: [
      { id: "count", q: L("Сколько", "How many"), a: ["4", "8", "12", L("каждый месяц", "every month")] },
      { id: "who", q: L("Кто в кадре", "Who’s on camera"), a: [L("эксперт", "an expert"), L("команда", "the team"), L("продукт", "the product"), L("заведение", "a venue"), L("без людей", "no people")] },
    ],
    youtube: [
      { id: "what", q: L("Что снимаем", "What we’re shooting"), a: [L("выпуск канала", "channel episode"), L("интервью", "interview"), L("экспертный ролик", "expert video"), L("корпоративный фильм", "corporate film"), L("документальный", "documentary")] },
      { id: "eps", q: L("Сколько выпусков", "How many episodes"), a: ["1", "2–4", L("регулярно", "ongoing")] },
    ],
    podcast: [
      { id: "where", q: L("Где записываем", "Where we record"), a: [L("у вас", "at your place"), L("в студии", "in a studio"), L("пока не знаю", "not sure yet")] },
      { id: "guests", q: L("Человек в кадре", "People on camera"), a: ["1", "2", L("3 и больше", "3+")] },
      { id: "need", q: L("Что нужно", "What you need"), a: [L("полный выпуск", "full episode"), L("нарезка на рилсы", "reels cut-downs"), L("обложки", "thumbnails")], multi: true },
    ],
    other: [],
  };
  const COMMON = [
    { id: "when", q: L("Когда", "When"), a: [L("на этой неделе", "this week"), L("в этом месяце", "this month"), L("через 1–3 месяца", "in 1–3 months"), L("дата не выбрана", "no date yet")] },
    { id: "budget", q: L("Бюджет", "Budget"), a: [`${L("до", "under")} ${MONEY(3000)}`, `${MONEY(3000)}–${MONEY(8000)}`, `${L("от", "over")} ${MONEY(8000)}`, L("пока не знаю", "not sure yet")] },
  ];
  const TASKS = [...window.FORMATS.map((f) => ({ id: f.id, name: f.name })), { id: "other", name: L("Другое", "Something else") }];
  const STEPS = [L("формат", "format"), L("детали", "details"), L("сроки", "timing"), L("готово", "done")];

  const box = document.querySelector(".brief");
  const body = box.querySelector(".brief__body");
  const st = { step: 0, task: null, ans: {}, name: "", contact: "", note: "", ref: "", calc: "" };
  const qs = () => QS[st.task] || [];
  const refTitle = () => { const w = window.WORKS.find((x) => x.id === st.ref); return w ? `${w.title} (${w.kind})` : ""; };

  const answer = (q) => {
    const v = st.ans[q.id];
    if (q.input) return (v || "").trim();
    if (!v || !v.length) return "";
    return v.map((i) => q.a[i]).join(", ");
  };
  const message = () => {
    const rows = [L("Здравствуйте! Бриф с сайта DOUBLE TAKE", "Hi! A brief from the DOUBLE TAKE site"), "", `${L("Формат", "Format")}: ${name(st.task)}`];
    if (refTitle()) rows.push(`${L("Как в работе", "Like this one")}: ${refTitle()}`);
    [...qs(), ...COMMON].forEach((q) => { const a = answer(q); if (a) rows.push(`${q.q}: ${a}`); });
    if (st.calc) rows.push("", L("С сайта:", "From the site:"), st.calc);
    if (st.name.trim()) rows.push("", `${L("Имя", "Name")}: ${st.name.trim()}`);
    if (st.contact.trim()) rows.push(`${L("Связь", "Contact")}: ${st.contact.trim()}`);
    if (st.note.trim()) rows.push("", st.note.trim());
    return rows.join("\n");
  };

  const chips = (q) => {
    const on = st.ans[q.id] || [];
    return q.a.map((a, i) => `<button type="button" class="chip${on.includes(i) ? " is-on" : ""}" data-pick="${q.id}:${i}" aria-pressed="${on.includes(i)}">${esc(a)}</button>`).join("");
  };
  const field = (q) => {
    if (q.input) return `<label class="brief__q"><span>${esc(q.q)}</span><input class="brief__input" id="b-${q.id}" data-field="${q.id}" maxlength="80" placeholder="${esc(q.input)}" value="${esc(st.ans[q.id] || "")}"></label>`;
    return `<fieldset class="brief__q"><legend>${esc(q.q)}${q.multi ? ` <em>${L("можно несколько", "pick any")}</em>` : ""}</legend><div class="brief__chips">${chips(q)}</div></fieldset>`;
  };

  const views = [
    () => `<h2 class="brief__title" id="brief-title">${L("Что снимаем?", "What are we shooting?")}</h2>
      ${refTitle() ? `<p class="brief__ref">${L("Как в работе", "Like this one")}: <b>${esc(refTitle())}</b><button type="button" data-unref>${L("убрать", "remove")}</button></p>` : ""}
      ${st.calc ? `<p class="brief__ref">${L("Ваш запрос с сайта уже в брифе", "Your request from the site is already in the brief")}</p>` : ""}
      <div class="brief__chips brief__chips--tasks">${TASKS.map((x) => `<button type="button" class="chip${st.task === x.id ? " is-on" : ""}" data-task="${x.id}" aria-pressed="${st.task === x.id}">${esc(x.name)}</button>`).join("")}</div>`,
    () => `<h2 class="brief__title" id="brief-title">${esc(name(st.task))}</h2>${qs().map(field).join("")}`,
    () => `<h2 class="brief__title" id="brief-title">${L("Сроки и связь", "Timing and contact")}</h2>${COMMON.map(field).join("")}
      <label class="brief__q"><span>${L("Как вас зовут", "Your name")}</span><input class="brief__input" id="b-name" data-field="name" maxlength="80" autocomplete="name" value="${esc(st.name)}"></label>
      <label class="brief__q"><span>${L("Телефон или ник, если удобнее не в Telegram", "Phone or handle, if not Telegram")}</span><input class="brief__input" id="b-contact" data-field="contact" maxlength="80" value="${esc(st.contact)}"></label>
      <label class="brief__q"><span>${L("Детали", "Details")}</span><textarea class="brief__input" id="b-note" data-field="note" rows="3" maxlength="600" placeholder="${L("ссылки, референсы, идея", "links, references, the idea")}">${esc(st.note)}</textarea></label>`,
    () => {
      const text = message();
      return `<h2 class="brief__title" id="brief-title">${L("Бриф готов", "Your brief is ready")}</h2>
        <pre class="brief__msg">${esc(text)}</pre>
        <div class="brief__send">
          <a class="btn btn--rec" href="https://t.me/${S.tg}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">${L("Отправить в Telegram", "Send on Telegram")}</a>
          ${S.mail ? `<a class="btn btn--line" href="mailto:${S.mail}?subject=${encodeURIComponent(`${L("Бриф", "Brief")}: ${name(st.task)}`)}&body=${encodeURIComponent(text)}">${L("На почту", "By email")}</a>` : ""}
          <button type="button" class="btn btn--line" data-copy>${L("Скопировать", "Copy")}</button>
        </div>
        <p class="brief__how">${L("Откроется чат, бриф уже вписан. Останется нажать «отправить».", "A chat opens with the brief already typed in. Just hit send.")}</p>`;
    },
  ];

  const foot = () => {
    const back = st.step > 0
      ? `<button type="button" class="ghost mono" data-go="-1">${L("← назад", "← back")}</button>`
      : `<p class="brief__hi">${L("Или просто напишите:", "Or just message us:")} <a href="https://t.me/${S.tg}" target="_blank" rel="noopener">@${esc(S.tg)}</a></p>`;
    let next = "";
    if ((st.step === 0 && st.task) || st.step === 1) next = `<button type="button" class="btn btn--light brief__nav--next" data-go="1">${L("Дальше", "Next")}</button>`;
    if (st.step === 2) next = `<button type="button" class="btn btn--light brief__nav--next" data-go="1">${L("Собрать бриф", "Build the brief")}</button>`;
    return back + next;
  };

  const paint = (focus) => {
    const shown = STEPS.map((s, i) => [s, i]).filter(([, i]) => i !== 1 || !st.task || qs().length);
    box.querySelector(".brief__steps").innerHTML = shown.map(([s, i]) => `<span class="${i === st.step ? "is-now" : i < st.step ? "is-done" : ""}">${s}</span>`).join("<i>→</i>");
    body.innerHTML = views[st.step]();
    box.querySelector(".brief__foot").innerHTML = foot();
    body.classList.remove("is-in"); void body.offsetWidth; body.classList.add("is-in");
    body.scrollTop = 0;
    if (focus) { const first = body.querySelector("button, a"); if (first) first.focus({ preventScroll: true }); }
  };
  const go = (by) => {
    let next = st.step + by;
    if (next === 1 && !qs().length) next += by;
    st.step = Math.max(0, Math.min(3, next));
    paint(true);
  };

  box.addEventListener("click", async (e) => {
    if (e.target === box) { box.close(); return; }
    const el = e.target.closest("[data-task],[data-pick],[data-go],[data-copy],[data-unref],.brief__close");
    if (!el) return;
    if (el.classList.contains("brief__close")) { box.close(); return; }
    if (el.hasAttribute("data-unref")) { st.ref = ""; paint(true); return; }
    if (el.dataset.task) {
      if (st.task !== el.dataset.task) st.ans = {};
      st.task = el.dataset.task;
      el.parentElement.querySelectorAll("[data-task]").forEach((b) => { const on = b === el; b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on); });
      setTimeout(() => go(1), 160);
    } else if (el.dataset.pick) {
      const [id, i] = el.dataset.pick.split(":");
      const q = [...qs(), ...COMMON].find((x) => x.id === id);
      const cur = st.ans[id] || [];
      const n = +i;
      st.ans[id] = q.multi ? (cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]) : (cur.includes(n) ? [] : [n]);
      el.parentElement.querySelectorAll("[data-pick]").forEach((b) => { const on = st.ans[id].includes(+b.dataset.pick.split(":")[1]); b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on); });
    } else if (el.dataset.go) {
      go(+el.dataset.go);
    } else if (el.hasAttribute("data-copy")) {
      const text = message();
      try { await navigator.clipboard.writeText(text); el.textContent = L("Скопировано", "Copied"); }
      catch (_) { const pre = body.querySelector(".brief__msg"); const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    }
  });
  box.addEventListener("input", (e) => {
    const f = e.target.dataset.field;
    if (!f) return;
    if (f === "name" || f === "note" || f === "contact") st[f] = e.target.value;
    else st.ans[f] = e.target.value;
  });
  box.addEventListener("close", () => window.SITE.lock && window.SITE.lock(false));

  const open = (o = {}) => {
    st.ref = o.ref || "";
    st.calc = o.calc || "";
    if (o.task && o.task !== st.task) { st.task = o.task; st.ans = {}; }
    st.step = o.task ? (QS[o.task] && QS[o.task].length ? 1 : 2) : 0;
    paint(false);
    if (!box.open) box.showModal();
    window.SITE.lock && window.SITE.lock(true);
  };
  return { open };
})();
