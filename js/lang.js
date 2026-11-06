/* Язык сайта: английский по умолчанию, русский и иврит переключателем EN / RU / עב. В разметке перевод лежит
   в атрибутах data-ru и data-he, в JS строки идут через L(ru, en[, he]): иврит берётся третьим аргументом
   или из словаря window.HE по английской строке (js/he.js). ?lang=he в ссылке сразу открывает нужный язык.
   Иврит пишется справа налево: на <html> ставится dir="rtl". Смена языка перезагружает страницу. */
(() => {
  const LANGS = ["en", "ru", "he"];
  let lang = "en";
  try { lang = localStorage.getItem("dt-lang") || "en"; } catch (_) { /* без памяти */ }
  const q = new URLSearchParams(location.search).get("lang");
  if (LANGS.includes(q)) {
    lang = q;
    try { localStorage.setItem("dt-lang", q); } catch (_) { /* без памяти */ }
  }
  window.LANG = LANGS.includes(lang) ? lang : "en";
  document.documentElement.lang = window.LANG;
  document.documentElement.dir = window.LANG === "he" ? "rtl" : "ltr";
  window.L = (ru, en, he) => (window.LANG === "ru" ? ru : window.LANG === "he" ? he ?? (window.HE && window.HE[en]) ?? en : en);
  window.applyLang = () => {
    const box = document.querySelector("[data-lang]");
    if (box) {
      box.innerHTML = LANGS.map((l) => `<button type="button" data-l="${l}" lang="${l}" aria-pressed="${l === window.LANG}">${{ en: "EN", ru: "RU", he: "עב" }[l]}</button>`).join("");
      box.addEventListener("click", (e) => {
        const b = e.target.closest("[data-l]");
        if (!b || b.dataset.l === window.LANG) return;
        try { localStorage.setItem("dt-lang", b.dataset.l); } catch (_) { /* без памяти */ }
        const u = new URL(location.href);
        u.searchParams.set("lang", b.dataset.l);
        location.replace(u.pathname + u.search + u.hash);
      });
    }
    if (window.LANG !== "en") document.querySelectorAll(`[data-${window.LANG}]`).forEach((el) => (el.innerHTML = el.dataset[window.LANG]));
  };
})();
