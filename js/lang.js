/* Язык сайта: английский по умолчанию, русский кнопкой ru/en. В разметке русский текст лежит рядом
   в атрибуте data-ru, данные и интерфейс в JS берут строки через L(ru, en). Смена языка перезагружает страницу. */
(() => {
  let lang = "en";
  try { lang = localStorage.getItem("dt-lang") || "en"; } catch (_) { /* без памяти */ }
  window.LANG = lang === "ru" ? "ru" : "en";
  document.documentElement.lang = window.LANG;
  window.L = (ru, en) => (window.LANG === "ru" ? ru : en);
  window.applyLang = () => {
    const b = document.querySelector("[data-lang]");
    if (b) {
      b.textContent = window.LANG === "ru" ? "en" : "ru";
      b.setAttribute("aria-label", window.LANG === "ru" ? "English version" : "Русская версия");
      b.addEventListener("click", () => {
        try { localStorage.setItem("dt-lang", window.LANG === "ru" ? "en" : "ru"); } catch (_) { /* без памяти */ }
        location.reload();
      });
    }
    if (window.LANG === "ru") document.querySelectorAll("[data-ru]").forEach((el) => (el.innerHTML = el.dataset.ru));
  };
})();
