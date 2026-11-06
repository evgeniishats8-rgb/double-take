/* DOUBLE TAKE: видоискатель первого экрана, форматы, работы, до/после, рефрейм, калькулятор, таймлайн. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const M = window.MEDIA || {};
  const S = window.SITE;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const money = (n) => `${S.cur} ${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
  const work = (id) => window.WORKS.find((w) => w.id === id);
  const vid = (id) => `assets/video/${id}.mp4`;
  const pos = (id) => `assets/poster/${id}.jpg`;
  const has = (id) => !!M[id];

  /* ---------- плавный скролл ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.9 });
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  } else if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const hdr = () => $(".bar").offsetHeight;
  const goTo = (target) => {
    const el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -hdr() - 8, duration: 1.2 });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2) { e.preventDefault(); lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: "smooth" }); return; }
    if ($(id)) { e.preventDefault(); goTo(id); }
  });
  window.SITE.lock = (on) => { if (lenis) on ? lenis.stop() : lenis.start(); };

  /* ---------- видео-капсулы в заголовке ---------- */
  $$("[data-pill]").forEach((el) => {
    const id = el.dataset.pill;
    if (!has(id)) return;
    const v = document.createElement("video");
    Object.assign(v, { muted: true, loop: true, playsInline: true, autoplay: true, preload: "auto", poster: pos(id), src: vid(id) });
    v.setAttribute("aria-hidden", "true");
    el.appendChild(v);
    v.play().catch(() => {});
  });

  /* ---------- строка-промпт для съёмки: текст, чипы, светящаяся кнопка → готовый бриф ---------- */
  (() => {
    const form = $("[data-composer]");
    if (!form) return;
    const h = new Date().getHours();
    const hello = $("[data-hello]");
    if (hello) hello.textContent = h < 5 ? L("Доброй ночи", "Good night") : h < 12 ? L("Доброе утро", "Good morning") : h < 18 ? L("Добрый день", "Good afternoon") : L("Добрый вечер", "Good evening");
    const input = $("[data-c-text]");
    const EX = [
      L("свадебный фильм в Тель-Авиве, июнь", "a wedding film in Tel Aviv this June"),
      L("8 рилсов для нашей кофейни", "8 reels for our coffee shop"),
      L("подкаст на три камеры, 4 выпуска", "a 3-camera podcast, 4 episodes"),
      L("рекламу кроссовок на 30 секунд", "a 30-second sneaker ad"),
      L("отчёт с конференции к утру", "a conference recap by the morning"),
    ];
    // подсказка печатается и стирается, как в чате с ИИ
    let ei = 0, ci = 0, del = false, typing = true;
    const type = () => {
      if (!typing || document.activeElement === input || input.value) { setTimeout(type, 600); return; }
      const t = EX[ei];
      ci += del ? -1 : 1;
      input.placeholder = t.slice(0, ci) + (ci < t.length || del ? "▍" : "");
      if (!del && ci >= t.length) { del = true; setTimeout(type, 1700); return; }
      if (del && ci <= 0) { del = false; ei = (ei + 1) % EX.length; }
      setTimeout(type, del ? 22 : 48);
    };
    if (reduce) input.placeholder = EX[0]; else type();

    const STY = [L("Естественно", "Natural"), L("Кино", "Cinematic"), L("Ярко и смело", "Bright & bold"), L("Документально", "Documentary")];
    const FRM = ["16:9", "9:16", L("Оба", "Both")];
    const EXT = [L("Субтитры", "Captions"), L("Дрон", "Drone"), L("Тизер на следующий день", "Next-day teaser"), L("Музыка с лицензией", "Licensed music")];
    const st = { f: window.FORMATS[1].id, s: 0, r: 2, x: [0] };
    const CH = [
      { id: "f", label: L("Формат", "Format"), opts: () => window.FORMATS.map((f) => [f.id, f.short]), val: () => window.FORMATS.find((f) => f.id === st.f).short },
      { id: "s", label: L("Стиль", "Style"), opts: () => STY.map((x, i) => [i, x]), val: () => STY[st.s] },
      { id: "r", label: L("Кадр", "Frame"), opts: () => FRM.map((x, i) => [i, x]), val: () => FRM[st.r] },
      { id: "x", label: L("Ещё", "Extras"), multi: true, opts: () => EXT.map((x, i) => [i, x]), val: () => (st.x.length ? st.x.map((i) => EXT[i]).join(", ") : "—") },
    ];
    const box = $("[data-c-chips]") || document.createElement("div");
    const paint = () => {
      box.innerHTML = CH.map((c) => `<div class="cchip" data-c="${c.id}"><button type="button" aria-haspopup="true"><span>${esc(c.label)}</span><b>${esc(c.val())}</b></button>
        <div class="cmenu" role="menu">${c.opts().map(([v, t]) => {
          const on = c.multi ? st.x.includes(v) : String(st[c.id]) === String(v);
          return `<button type="button" role="menuitemcheckbox" aria-checked="${on}" data-v="${v}">${esc(t)}</button>`;
        }).join("")}</div></div>`).join("");
    };
    paint();
    // формат угадывается по словам в строке
    const GUESS = [[/рилс|reel|shorts|тикток|tiktok|контент|רילס|טיקטוק|תוכן/i, "reels"], [/свадьб|wedding|венчан|חתונ/i, "wedding"], [/подкаст|podcast|פודקאסט/i, "podcast"],
      [/youtube|ютуб|интервью|interview|документ|doc|יוטיוב|ראיון|דוקו/i, "youtube"], [/реклам|промо|\bad\b|commercial|brand|פרסומ|מותג|תדמית/i, "ad"], [/конфер|фестив|концерт|репортаж|event|conference|festival|спорт|sport|כנס|פסטיבל|הופע|אירוע|ספורט/i, "event"]];
    input.addEventListener("input", () => {
      const hit = GUESS.find(([re]) => re.test(input.value));
      if (hit && hit[1] !== st.f) { st.f = hit[1]; paint(); }
    });
    let open = null;
    box.addEventListener("click", (e) => {
      const chip = e.target.closest(".cchip");
      if (!chip) return;
      const item = e.target.closest(".cmenu button");
      const c = CH.find((x) => x.id === chip.dataset.c);
      if (item) {
        const v = isNaN(+item.dataset.v) ? item.dataset.v : +item.dataset.v;
        if (c.multi) st.x = st.x.includes(v) ? st.x.filter((i) => i !== v) : [...st.x, v];
        else st[c.id] = v;
        open = c.multi ? c.id : null;
        paint();
        if (open) $(`[data-c="${open}"]`, box).classList.add("is-open");
        return;
      }
      const was = chip.classList.contains("is-open");
      $$(".cchip", box).forEach((x) => x.classList.remove("is-open"));
      if (!was) chip.classList.add("is-open");
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".cchip")) $$(".cchip", box).forEach((x) => x.classList.remove("is-open")); });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ask = (input.value || "").trim() || input.placeholder.replace("▍", "");
      const lines = [ask];
      if ($("[data-c-chips]")) {
        lines.push(`${L("Стиль", "Style")}: ${STY[st.s]}`, `${L("Кадр", "Frame")}: ${FRM[st.r]}`);
        if (st.x.length) lines.push(`${L("Ещё", "Extras")}: ${st.x.map((i) => EXT[i]).join(", ")}`);
      }
      BRIEF.open({ task: st.f, calc: lines.join("\n") });
    });
  })();

  /* ---------- 3D-стена работ: колонки плывут, мышь наклоняет плоскость ---------- */
  (() => {
    const wall = $("[data-wall]");
    const plane = $("[data-wall-plane]");
    if (!wall) return;
    const ids = window.WORKS.map((w) => w.id).filter(has);
    const cols = matchMedia("(max-width: 720px)").matches ? 3 : 5;
    let html = "";
    for (let c = 0; c < cols; c++) {
      // каждая колонка — своя перетасовка, дважды подряд, чтобы петля была бесшовной
      const list = ids.map((_, i) => ids[(i * (c + 2) + c * 3) % ids.length]).slice(0, 6);
      const cards = list.map((id) => `<div class="wcard" data-id="${id}" data-cursor="${esc(L("Смотреть", "Play"))}" style="--ar:${M[id].ar}"><img src="${pos(id)}" alt=""><span>${esc(work(id).title)}</span></div>`).join("");
      html += `<div class="wall__col" style="--t:${48 + c * 9}s">${cards}${cards}</div>`;
    }
    plane.innerHTML = html;
    let live = null;
    const play = (el) => {
      if (live === el) return;
      if (live) { const v = $("video", live); if (v) v.pause(); live.classList.remove("is-play"); }
      live = el;
      if (!el) return;
      let v = $("video", el);
      if (!v) {
        v = document.createElement("video");
        Object.assign(v, { muted: true, loop: true, playsInline: true, preload: "auto", src: vid(`${el.dataset.id}_prev`) });
        el.insertBefore(v, $("span", el));
        v.addEventListener("playing", () => el.classList.add("is-play"));
      }
      v.play().catch(() => {});
    };
    plane.addEventListener("mouseover", (e) => play(e.target.closest(".wcard")));
    plane.addEventListener("click", (e) => { const c = e.target.closest(".wcard"); if (c) LB.open(c.dataset.id); });
    if (!touch && !reduce) {
      wall.addEventListener("pointermove", (e) => {
        const r = wall.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        plane.style.setProperty("--ry", `${-10 + nx * 10}deg`);
        plane.style.setProperty("--rx", `${22 - ny * 8}deg`);
      });
      wall.addEventListener("pointerleave", () => { plane.style.removeProperty("--ry"); plane.style.removeProperty("--rx"); play(null); });
    }
    if (reduce) $$(".wall__col", plane).forEach((c) => (c.style.animation = "none"));
    // в фоне первого экрана: раз в пару секунд оживает случайная карточка в кадре
    setInterval(() => {
      if (document.hidden || scrollY > innerHeight) return;
      const vis = $$(".wcard", plane).filter((c) => { const r = c.getBoundingClientRect(); return r.top > 60 && r.bottom < innerHeight - 60 && r.left > 0 && r.right < innerWidth; });
      if (vis.length) play(vis[Math.floor(Math.random() * vis.length)]);
    }, 2600);
  })();

  /* ---------- первый экран: вордмарк, плитки, промпт и стена наклоняются за мышью ---------- */
  (() => {
    const hero = $(".hero");
    const mark = $("[data-mark]");
    const comp = $("[data-composer]");
    const plane = $("[data-wall-plane]");
    if (!hero || touch || reduce) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const step = () => {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      mark.style.setProperty("--px", `${x * 26}px`); mark.style.setProperty("--py", `${y * 20}px`);
      $$(".mark__w", mark).forEach((w) => { w.style.setProperty("--mry", `${x * 9}deg`); w.style.setProperty("--mrx", `${-y * 7}deg`); });
      if (comp) { comp.style.setProperty("--cry", `${-9 + x * 6}deg`); comp.style.setProperty("--crx", `${4 - y * 4}deg`); }
      if (plane) { plane.style.setProperty("--ry", `${-14 + x * 8}deg`); plane.style.setProperty("--rx", `${28 - y * 6}deg`); }
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(step) : 0;
    };
    hero.addEventListener("pointermove", (e) => {
      tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(step);
    });
  })();

  /* ---------- шапка: прозрачная над шоурилом, плотная дальше ---------- */
  (() => {
    const bar = $(".bar"), cine = $("[data-cine]");
    if (!bar) return;
    let raf = 0;
    const f = () => { raf = 0; bar.classList.toggle("is-solid", scrollY > (cine ? cine.offsetHeight - innerHeight * 0.6 : 40)); };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(f); }, { passive: true });
    f();
  })();

  /* ---------- кино-экран: шоурил 2.39 раскрывается на весь экран, титры по кадрам ---------- */
  (() => {
    const sec = $("[data-cine]");
    if (!sec) return;
    const frame = $("[data-cine-frame]");
    const v = $("[data-cine-v]");
    const cap = $(".cine__cap");
    const CUES = [{"t": 0.0, "work": "akmaral"}, {"t": 2.6, "work": "prosvet"}, {"t": 4.8, "work": "kick"}, {"t": 6.8, "work": "klej"}, {"t": 9.0, "work": "roman"}, {"t": 11.6, "work": "kiyana"}, {"t": 14.0, "work": "kick"}, {"t": 16.2, "work": "akmaral"}, {"t": 18.4, "work": "sport"}, {"t": 20.6, "work": "stayclean"}];
    let cur = -1;
    const show = (i) => {
      if (i === cur) return;
      cur = i;
      const w = work(CUES[i].work);
      cap.classList.add("is-swap");
      setTimeout(() => { $("[data-cine-title]").textContent = w.title; $("[data-cine-kind]").textContent = [w.kind, w.role, w.where, w.year].filter(Boolean).join(" · "); cap.classList.remove("is-swap"); }, 220);
    };
    const tick = () => {
      const t = v.currentTime;
      let i = 0;
      CUES.forEach((c, k) => { if (t >= c.t) i = k; });
      show(i);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    $("[data-cine-sound]").addEventListener("click", () => LB.open(CUES[Math.max(0, cur)].work));
    v.play().catch(() => {});
    new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0 }).observe(sec);
    const mob = () => matchMedia("(max-width: 720px)").matches;
    const set = (p) => {
      const k = Math.max(0, Math.min(1, p / 0.7));
      const e = k * k * (3 - 2 * k);
      const h0 = mob() ? innerHeight * 0.64 : innerWidth / 2.39;
      frame.style.setProperty("--fh", `${h0 + (innerHeight - h0) * e}px`);
      v.style.setProperty("--vs", (1.06 - 0.06 * e).toFixed(3));
      sec.style.setProperty("--bo", (1 - e).toFixed(3));
      const tt = Math.max(0, Math.min(1, (p - 0.55) / 0.4));
      frame.style.setProperty("--ty", `${-tt * 40}px`);
      frame.style.setProperty("--to", (1 - tt).toFixed(3));
    };
    if (window.ScrollTrigger && !reduce) {
      ScrollTrigger.create({ trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.3, onUpdate: (st) => set(st.progress) });
      addEventListener("resize", () => set(0));
      set(0);
    }
  })();

  /* ---------- главы по жанрам: видео на весь экран, следующая наезжает на предыдущую ---------- */
  (() => {
    const chaps = $$("[data-chap]");
    chaps.forEach((ch, i) => {
      const id = ch.dataset.chap, wid = ch.dataset.work;
      const v = $("video", ch);
      if (has(id)) { v.src = vid(id); v.poster = pos(id); }
      const txt = $(".chap__txt", ch);
      const go = document.createElement("div");
      go.className = "chap__go";
      go.innerHTML = `<button type="button" class="btn btn--blue">${esc(L("Смотреть фильм", "Watch the film"))}</button><button type="button" class="btn btn--line">${esc(L("Посчитать", "Get a price"))}</button>`;
      txt.appendChild(go);
      const [watch, price] = $$("button", go);
      watch.addEventListener("click", () => LB.open(wid));
      price.addEventListener("click", () => { CALC.select({ ad: "ad", wedding: "wedding", event: "event", film: "youtube" }[work(wid).cat]); goTo("#calc"); });
      // видео включается заранее, за полэкрана до появления, чтобы глава не открывалась стоп-кадром
      new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { rootMargin: "60% 0px" }).observe(ch);
      if (!window.ScrollTrigger || reduce) return;
      const inn = $(".chap__in", ch);
      const cl = (x) => Math.max(0, Math.min(1, x));
      const sm = (x) => x * x * (3 - 2 * x);
      // вход: глава поднимается кадром 2.39 со скруглёнными углами и раскрывается на весь экран,
      // как шоурил наверху; видео внутри отъезжает с 1.16 до 1, название проявляется последним
      const open = (k) => {
        const e = sm(cl(k));
        const band = Math.max(0, (1 - innerWidth / 2.39 / innerHeight) / 2) * 100;
        inn.style.setProperty("--ci", `${(band * (1 - e)).toFixed(2)}% ${(6 * (1 - e)).toFixed(2)}%`);
        inn.style.setProperty("--cr", `${(22 * (1 - e)).toFixed(1)}px`);
        inn.style.setProperty("--vz", (1.16 - 0.16 * e).toFixed(4));
        inn.style.setProperty("--ct", sm(cl((k - 0.6) / 0.4)).toFixed(3));
      };
      open(0);
      ScrollTrigger.create({ trigger: ch, start: "top bottom", end: "top top", scrub: true, onUpdate: (st) => open(st.progress), onRefresh: (st) => open(st.progress) });
      // уход: следующая глава накрывает, эта отступает вглубь и гаснет
      const nx = chaps[i + 1];
      if (nx) ScrollTrigger.create({ trigger: nx, start: "top bottom", end: "top top", scrub: true, onUpdate: (st) => {
        const e = sm(st.progress);
        inn.style.setProperty("--cs", (1 - e * 0.07).toFixed(4));
        inn.style.setProperty("--cb", (1 - e * 0.6).toFixed(3));
      } });
    });
  })();

  /* ---------- просмотр работы ---------- */
  const LB = (() => {
    const box = $("[data-lb]");
    const v = $("[data-lb-video]");
    let list = [], cur = null;
    const fill = (id) => {
      cur = id;
      const w = work(id);
      $("[data-lb-title]").textContent = w.title;
      const meta = [w.kind, w.role, w.where, w.year, M[id] ? (w.full ? `${mmss(M[id].dur)} ${L("из", "of")} ${w.full}` : mmss(M[id].dur)) : ""].filter(Boolean);
      $("[data-lb-kind]").textContent = meta.join(" · ");
      v.poster = pos(id);
      v.src = vid(id);
      v.play().catch(() => {});
    };
    const open = (id) => {
      if (!work(id) || !has(id)) return;
      list = $$(".tile:not(.is-out)").map((t) => t.dataset.id);
      if (!list.includes(id)) list = window.WORKS.map((w) => w.id).filter(has);
      fill(id);
      if (!box.open) { box.showModal(); SITE.lock(true); }
    };
    const step = (by) => {
      const k = list.indexOf(cur);
      fill(list[(k + by + list.length) % list.length]);
    };
    box.addEventListener("close", () => { v.pause(); v.removeAttribute("src"); v.load(); SITE.lock(false); });
    $("[data-lb-close]").addEventListener("click", () => box.close());
    $$("[data-lb-step]").forEach((b) => b.addEventListener("click", () => step(+b.dataset.lbStep)));
    $("[data-lb-want]").addEventListener("click", () => { const id = cur; box.close(); BRIEF.open({ ref: id, task: { ad: "ad", wedding: "wedding", event: "event", film: "youtube" }[work(id).cat] }); });
    box.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); });
    box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
    return { open };
  })();
  window.LB = LB;

  /* ---------- форматы ---------- */
  const priceOf = (f, v) => {
    const eps = v.eps || 1;
    let p = f.base;
    f.opts.forEach((o) => {
      let add = 0;
      if (o.range) add = o.price(v[o.id]);
      else if (o.pick) add = o.pick[v[o.id]][1];
      else if (o.flag) add = v[o.id] ? o.add : 0;
      p += o.perEp ? add * eps : add;
    });
    return Math.max(0, Math.round(p / 100) * 100);
  };
  const defaults = (f) => Object.fromEntries(f.opts.map((o) => [o.id, o.range ? o.range[3] : o.pick ? o.def : !!o.on]));
  const minimal = (f) => Object.fromEntries(f.opts.map((o) => {
    if (o.range) return [o.id, o.range[0]];
    if (o.pick) { let k = 0; o.pick.forEach((p, j) => { if (p[1] < o.pick[k][1]) k = j; }); return [o.id, k]; }
    return [o.id, false];
  }));
  const arLabel = (ar) => (ar > 2 ? "2.39:1" : ar > 1.5 ? "16:9" : ar < 0.7 ? "9:16" : `${ar}`);

  // строки форматов: название делает «второй взгляд» (гротеск → курсив), кадр всплывает у курсора
  if ($("[data-formats]")) {
  const fmts = $("[data-formats]");
  const peek = $("[data-peek]");
  const pv = $("video", peek);
  const pAr = $(".peek__ar", peek);
  let px = 0, py = 0, tx = 0, ty = 0, vx = 0, pOn = false, pRaf = 0;
  const peekLoop = () => {
    const nx = px + (tx - px) * 0.16, ny = py + (ty - py) * 0.16;
    vx = vx * 0.8 + (nx - px) * 0.2;
    px = nx; py = ny;
    peek.style.transform = `translate(${px + 28}px, ${py}px) translateY(-50%) rotate(${Math.max(-7, Math.min(7, vx * 0.35))}deg)`;
    pRaf = pOn || Math.abs(tx - px) > 0.5 ? requestAnimationFrame(peekLoop) : 0;
  };
  window.FORMATS.forEach((f) => {
    const li = document.createElement("li");
    // для рилс показываем сам формат 9:16, у остальных кадр в родных пропорциях работы
    const ar = f.ar < 1 ? f.ar : M[f.clip] ? M[f.clip].ar : f.ar;
    li.innerHTML = `<button type="button" class="fl__row" data-calc-go="${f.id}" aria-label="${esc(f.name)}: ${L("посчитать", "get a price")}">
        <span class="fl__ar mono">${arLabel(f.ar)}</span>
        <span class="fl__name"><span class="g">${esc(f.name)}</span><span class="s" aria-hidden="true">${esc(f.name)}</span></span>
        <span class="fl__desc">${f.lines.map(esc).join(". ")}.</span>
        <span class="fl__price"><b>${L("от", "from")} ${money(priceOf(f, minimal(f)))}</b><span class="mono">${esc(f.days)}</span></span>
        <span class="fl__go" aria-hidden="true">→</span>
        <span class="fl__thumb" style="--ar:${ar}" aria-hidden="true"><img src="${pos(f.clip)}" alt="" loading="lazy"></span>
      </button>`;
    fmts.appendChild(li);
    if (touch) return;
    const row = $(".fl__row", li);
    row.addEventListener("mouseenter", (e) => {
      if (!has(f.clip)) return;
      if (pv.dataset.id !== f.clip) { pv.dataset.id = f.clip; pv.poster = pos(f.clip); pv.src = vid(`${f.clip}_prev`); }
      pv.play().catch(() => {});
      peek.style.setProperty("--par", ar);
      peek.style.setProperty("--pw", ar < 1 ? "210px" : ar > 2 ? "430px" : "370px");
      pAr.textContent = arLabel(f.ar);
      if (!pOn) { px = tx = e.clientX; py = ty = e.clientY; }
      pOn = true;
      peek.classList.add("is-on");
      if (!pRaf) pRaf = requestAnimationFrame(peekLoop);
    });
    row.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
  });
  fmts.addEventListener("mouseleave", () => { pOn = false; peek.classList.remove("is-on"); pv.pause(); });
  addEventListener("scroll", () => { if (pOn) { pOn = false; peek.classList.remove("is-on"); pv.pause(); } }, { passive: true });
  }
  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-calc-go]");
    if (c) { CALC.select(c.dataset.calcGo); goTo("#calc"); return; }
    const w = e.target.closest("[data-works-go]");
    if (w) { WK.filter(w.dataset.worksGo); goTo("#works"); }
  });
  const hf = $("[data-hero-formats]");
  if (hf) hf.innerHTML = window.FORMATS.map((f) => `<button type="button" class="chip" data-calc-go="${f.id}">${esc(f.short)}</button>`).join("");

  /* ---------- работы: ряды одной высоты, без кропа ---------- */
  const WK = (() => {
    const box = $("[data-works]");
    const bar = $("[data-filter]");
    const items = window.WORKS.filter((w) => has(w.id));
    let cat = "all";
    const tiles = items.map((w) => {
      const t = document.createElement("figure");
      t.className = "tile";
      t.dataset.id = w.id;
      t.tabIndex = 0;
      t.setAttribute("role", "button");
      t.setAttribute("aria-label", `${L("Смотреть", "Watch")}: ${w.title}`);
      const dur = w.full ? `${mmss(M[w.id].dur)} ${L("из", "of")} ${w.full}` : mmss(M[w.id].dur);
      t.innerHTML = `<div class="tile__media"><img src="${pos(w.id)}" alt="" loading="lazy"><span class="tile__play mono">▶</span></div>
        <figcaption><b>${esc(w.title)}</b><span class="mono">${esc([w.role, dur].filter(Boolean).join(" · "))}</span></figcaption>`;
      t.addEventListener("click", () => LB.open(w.id));
      t.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); LB.open(w.id); } });
      let v = null;
      t.play = () => {
        if (!v) {
          v = document.createElement("video");
          Object.assign(v, { muted: true, loop: true, playsInline: true, preload: "auto", src: vid(`${w.id}_prev`) });
          v.setAttribute("aria-hidden", "true");
          $(".tile__media", t).insertBefore(v, $(".tile__play", t));
          v.addEventListener("playing", () => t.classList.add("is-play"));
        }
        v.play().catch(() => {});
      };
      t.stop = () => { if (v) { v.pause(); t.classList.remove("is-play"); } };
      if (!touch) { t.addEventListener("mouseenter", t.play); t.addEventListener("mouseleave", t.stop); }
      return t;
    });

    const layout = () => {
      const W = box.clientWidth;
      const gap = 14;
      const on = tiles.filter((t) => !t.classList.contains("is-out"));
      box.innerHTML = "";
      const emit = (row, h) => {
        const r = document.createElement("div");
        r.className = "works__row";
        row.forEach((t) => {
          const ar = M[t.dataset.id].ar;
          t.style.width = `${ar * h}px`;
          $(".tile__media", t).style.height = `${h}px`;
          r.appendChild(t);
        });
        box.appendChild(r);
      };
      if (W < 560) { on.forEach((t) => emit([t], W / M[t.dataset.id].ar)); return; }
      const target = W > 1200 ? 310 : W > 800 ? 250 : 200;
      let row = [], sum = 0;
      on.forEach((t) => {
        row.push(t); sum += M[t.dataset.id].ar;
        const need = sum * target + gap * (row.length - 1);
        if (need >= W) { emit(row, (W - gap * (row.length - 1)) / sum); row = []; sum = 0; }
      });
      if (row.length) emit(row, Math.min(target * 1.15, (W - gap * (row.length - 1)) / sum));
    };
    const filter = (c) => {
      cat = c;
      tiles.forEach((t) => t.classList.toggle("is-out", c !== "all" && work(t.dataset.id).cat !== c));
      $$(".chip", bar).forEach((b) => { const on = b.dataset.cat === c; b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on); });
      layout();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    };
    bar.innerHTML = window.CATS.map((c) => {
      const n = c.id === "all" ? items.length : items.filter((w) => w.cat === c.id).length;
      return n ? `<button type="button" class="chip" data-cat="${c.id}" aria-pressed="false">${esc(c.name)}<sup>${n}</sup></button>` : "";
    }).join("");
    bar.addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (b) filter(b.dataset.cat); });
    let rt = 0;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(layout, 120); });
    filter("all");

    // на телефоне играет одна плитка, самая видимая
    if (touch) {
      const seen = new Map();
      let now = null;
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => seen.set(e.target, e.intersectionRatio));
        let best = null, br = 0.6;
        seen.forEach((r, t) => { if (r > br && !t.classList.contains("is-out")) { best = t; br = r; } });
        if (best !== now) { if (now) now.stop(); now = best; if (now) now.play(); }
      }, { threshold: [0, 0.3, 0.6, 0.8, 1] });
      tiles.forEach((t) => io.observe(t));
    }
    return { filter };
  })();

  /* ---------- до/после цветокоррекции ---------- */
  (() => {
    const box = $("[data-cmp]");
    const before = $("[data-cmp-before]");
    const after = $("[data-cmp-after]");
    if (!box) return;
    if (!M.grade) { $("#grade").hidden = true; return; }
    after.src = "assets/poster/grade_cc.jpg";
    before.src = "assets/poster/grade_raw.jpg";
    after.addEventListener("load", () => box.style.setProperty("--car", `${after.naturalWidth} / ${after.naturalHeight}`));
    const set = (k) => {
      k = Math.max(0, Math.min(100, k));
      box.style.setProperty("--x", `${k}%`);
      box.setAttribute("aria-valuenow", Math.round(k));
    };
    let drag = false;
    const at = (e) => { const r = box.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100); };
    box.addEventListener("pointerdown", (e) => { drag = true; box.setPointerCapture(e.pointerId); at(e); hint && hint.kill(); });
    box.addEventListener("pointermove", (e) => { if (drag) at(e); });
    box.addEventListener("pointerup", () => (drag = false));
    box.addEventListener("keydown", (e) => {
      const k = parseFloat(box.getAttribute("aria-valuenow"));
      if (e.key === "ArrowLeft") set(k - 5);
      if (e.key === "ArrowRight") set(k + 5);
    });
    set(50);
    // шторка сама показывает, что её можно тянуть
    let hint = null;
    if (window.gsap && !reduce) {
      const o = { k: 50 };
      hint = gsap.timeline({ paused: true })
        .to(o, { k: 18, duration: 1.1, ease: "power2.inOut", onUpdate: () => set(o.k) })
        .to(o, { k: 78, duration: 1.4, ease: "power2.inOut", onUpdate: () => set(o.k) })
        .to(o, { k: 50, duration: 1, ease: "power2.inOut", onUpdate: () => set(o.k) });
      new IntersectionObserver(([e], io) => { if (e.isIntersecting) { hint.play(); io.disconnect(); } }, { threshold: 0.6 }).observe(box);
    }
  })();

  /* ---------- калькулятор ---------- */
  const CALC = (() => {
    const tabs = $("[data-calc-tabs]");
    const opts = $("[data-calc-opts]");
    const rows = $("[data-calc-rows]");
    const sumEl = $("[data-calc-sum]");
    const board = $("[data-receipt]");
    const no = $("[data-receipt-no]");
    const F = window.FORMATS;
    let f = F[1], v = defaults(f), take = 1, shown = 0;
    const store = {};

    tabs.innerHTML = F.map((x) => `<button type="button" class="calc__tab" role="tab" data-tab="${x.id}" aria-selected="false">${esc(x.short)}</button>`).join("");
    const unitOf = (o, val) => (o.unit ? ` ${o.unit(val)}` : "");
    const paintOpts = () => {
      opts.innerHTML = f.opts.map((o) => {
        if (o.range) {
          const [a, b, s] = o.range;
          const p = ((v[o.id] - a) / (b - a)) * 100;
          return `<div class="opt"><label class="opt__label" for="o-${f.id}-${o.id}">${esc(o.label)}</label><span class="opt__val" data-val="${o.id}">${v[o.id]}${esc(unitOf(o, v[o.id]))}</span>
            <input type="range" id="o-${f.id}-${o.id}" min="${a}" max="${b}" step="${s}" value="${v[o.id]}" data-opt="${o.id}" style="--p:${p}%"></div>`;
        }
        if (o.pick) return `<div class="opt"><span class="opt__label" id="l-${f.id}-${o.id}">${esc(o.label)}</span>
            <span class="seg" role="group" aria-labelledby="l-${f.id}-${o.id}">${o.pick.map((p, j) => `<button type="button" data-opt="${o.id}" data-j="${j}" aria-pressed="${v[o.id] === j}">${esc(p[0])}</button>`).join("")}</span></div>`;
        return `<div class="opt"><span class="opt__label" id="l-${f.id}-${o.id}">${esc(o.label)}</span>
            <button type="button" class="tog" role="switch" id="o-${f.id}-${o.id}" aria-labelledby="l-${f.id}-${o.id}" aria-checked="${!!v[o.id]}" data-opt="${o.id}"></button>
            <span class="opt__add mono">+ ${money(o.add)}${o.perEp ? L(" за выпуск", " per episode") : ""}</span></div>`;
      }).join("");
    };
    const params = () => f.opts.map((o) => {
      if (o.range) return `${o.label.toLowerCase()}: ${v[o.id]}${unitOf(o, v[o.id])}`;
      if (o.pick) return `${o.label.toLowerCase()}: ${o.pick[v[o.id]][0]}`;
      return v[o.id] ? o.label.toLowerCase() : "";
    }).filter(Boolean);
    const sum = () => priceOf(f, v);
    const lines = () => [
      [L("Формат", "Format"), f.name],
      [L("Параметры", "Settings"), params().join(", ")],
      [L("На выходе", "You get"), f.out(v).filter(Boolean).join(", ")],
      [L("Срок", "Turnaround"), v.rush && f.rushDays ? f.rushDays : f.days],
    ];
    const paintBoard = (clapIt) => {
      rows.innerHTML = lines().filter((_, i) => i !== 1).map(([k, x]) => `<div><dt>${esc(k)}</dt><dd>${esc(x)}</dd></div>`).join("");
      const to = sum();
      if (window.gsap && !reduce) {
        const o = { n: shown };
        gsap.to(o, { n: to, duration: 0.5, ease: "power2.out", onUpdate: () => (sumEl.textContent = money(Math.round(o.n / 100) * 100)) });
      } else sumEl.textContent = money(to);
      shown = to;
      no.textContent = `No ${String(1040 + take).padStart(5, "0")}`;
      if (clapIt) { board.classList.remove("is-print"); void board.offsetWidth; board.classList.add("is-print"); }
    };
    const select = (id) => {
      store[f.id] = v;
      f = F.find((x) => x.id === id) || F[0];
      v = store[f.id] || defaults(f);
      $$("[data-tab]", tabs).forEach((b) => b.setAttribute("aria-selected", b.dataset.tab === f.id));
      paintOpts();
      take += 1;
      paintBoard(true);
    };
    tabs.addEventListener("click", (e) => { const b = e.target.closest("[data-tab]"); if (b) select(b.dataset.tab); });
    opts.addEventListener("input", (e) => {
      const el = e.target.closest('input[type="range"]');
      if (!el) return;
      const o = f.opts.find((x) => x.id === el.dataset.opt);
      v[o.id] = +el.value;
      const [a, b] = o.range;
      el.style.setProperty("--p", `${((v[o.id] - a) / (b - a)) * 100}%`);
      $(`[data-val="${o.id}"]`, opts).textContent = `${v[o.id]}${unitOf(o, v[o.id])}`;
      paintBoard(false);
    });
    opts.addEventListener("change", (e) => { if (e.target.matches('input[type="range"]')) { take += 1; paintBoard(true); } });
    opts.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-opt]");
      if (!b) return;
      const o = f.opts.find((x) => x.id === b.dataset.opt);
      if (o.pick) {
        v[o.id] = +b.dataset.j;
        $$(`button[data-opt="${o.id}"]`, opts).forEach((x) => x.setAttribute("aria-pressed", x === b));
      } else {
        v[o.id] = !v[o.id];
        b.setAttribute("aria-checked", v[o.id]);
      }
      take += 1;
      paintBoard(true);
    });
    $("[data-calc-brief]").addEventListener("click", () => {
      const text = lines().map(([k, x]) => `${k}: ${x}`).concat(`${L("Ориентир", "Estimate")}: ≈ ${money(sum())}`).join("\n");
      BRIEF.open({ task: f.id, calc: text });
    });
    select(f.id);
    return { select };
  })();

  /* ---------- как работаем: карточки наслаиваются со смещением ---------- */
  $$(".step").forEach((el, i) => el.style.setProperty("--i", i));

  /* ---------- две ленты форматов, скорость от скролла ---------- */
  $$("[data-band]").forEach((run) => {
    const dir = +run.dataset.band || 1;
    const words = dir > 0 ? window.FORMATS.map((f) => f.short) : window.FORMATS.map((f) => f.short).reverse();
    const one = words.map((w, i) => `<span>${i % 2 ? `<em>${esc(w)}</em>` : esc(w)}<i>✺</i></span>`).join("");
    run.innerHTML = one + one + one;
    let x = dir > 0 ? 0 : -run.scrollWidth / 3, last = scrollY, boost = 0;
    const step = () => {
      const dy = scrollY - last; last = scrollY;
      boost = boost * 0.92 + Math.abs(dy) * 0.08;
      if (!reduce) x -= dir * (0.6 + boost * 0.5);
      const w = run.scrollWidth / 3;
      if (-x > w) x += w;
      if (x > 0) x -= w;
      run.style.transform = `translateX(${x}px)`;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  /* ---------- сцена: один кадр 16:9 разлетается в рилс, сторис и пост ---------- */
  (() => {
    const sec = $("[data-story]");
    if (!sec || !has("h_hearts")) return;
    const stage = $("[data-story-stage]");
    const raw = $("[data-raw]");
    const ph = $$("[data-ph]", sec);
    const paths = $$("[data-story-lines] path", sec);
    $$("[data-story-v]", sec).forEach((v) => { v.src = vid("h_hearts"); v.poster = pos("h_hearts"); });
    new IntersectionObserver(([e]) => $$("[data-story-v]", sec).forEach((v) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause())), { threshold: 0 }).observe(sec);
    const mob = () => matchMedia("(max-width: 720px)").matches;
    const T = () => (mob()
      ? [{ x: 18, y: 72, r: 0, ry: 0 }, { x: 50, y: 72, r: 0, ry: 0 }, { x: 82, y: 72, r: 0, ry: 0 }]
      : [{ x: 26, y: 70, r: 0, ry: 0 }, { x: 50, y: 70, r: 0, ry: 0 }, { x: 74, y: 70, r: 0, ry: 0 }]);
    const cl = (v) => Math.max(0, Math.min(1, v));
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const set = (p) => {
      const t1 = ease(cl((p - 0.06) / 0.26));
      const rawY = 50 - t1 * (mob() ? 26 : 30);
      raw.style.top = `${rawY}%`;
      raw.style.transform = `translate(-50%, -50%) scale(${1 - t1 * 0.5})`;
      const t2 = ease(cl((p - 0.34) / 0.36));
      const S = stage.getBoundingClientRect();
      const rr = raw.getBoundingClientRect();
      const x0 = rr.left + rr.width / 2 - S.left, y0 = rr.bottom - S.top;
      T().forEach((q, i) => {
        const el = ph[i];
        const x = 50 + (q.x - 50) * t2, y = rawY + (q.y - rawY) * t2;
        el.style.left = `${x}%`; el.style.top = `${y}%`;
        el.style.opacity = String(cl(t2 * 1.6));
        el.style.transform = `translate(-50%, -50%) scale(${0.4 + 0.6 * t2}) rotateY(${q.ry * t2}deg) rotate(${q.r * t2}deg)`;
        const er = el.getBoundingClientRect();
        const x1 = er.left + er.width / 2 - S.left, y1 = Math.max(er.top - S.top + 6, y0 + 24);
        const path = paths[i];
        path.setAttribute("d", `M${x0},${y0} C${x0},${(y0 + y1) / 2} ${x1},${(y0 + y1) / 2} ${x1},${y1}`);
        const len = path.getTotalLength() || 1;
        path.style.strokeDasharray = `${len}`;
        path.style.strokeDashoffset = `${len * (1 - cl((p - 0.4) / 0.35))}`;
      });
    };
    if (window.ScrollTrigger && !reduce) {
      ScrollTrigger.create({ trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.4, onUpdate: (st) => set(st.progress) });
      set(0);
      addEventListener("resize", () => set(0));
    } else set(1);
  })();

  /* ---------- заголовки появляются по словам ---------- */
  $$(".h2, .story__t").forEach((h) => {
    if (reduce) return;
    let d = 0;
    const wrap = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((t) => {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            const w = document.createElement("span");
            w.className = "w"; w.textContent = t; w.style.setProperty("--d", `${(d += 0.06).toFixed(2)}s`);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") {
          const w = document.createElement("span");
          w.className = "w"; w.style.setProperty("--d", `${(d += 0.06).toFixed(2)}s`);
          n.replaceWith(w); w.appendChild(n);
        }
      });
    };
    wrap(h);
    h.classList.add("kw");
    new IntersectionObserver(([e], io) => { if (e.isIntersecting) { h.classList.add("is-in"); io.disconnect(); } }, { threshold: 0.3 }).observe(h);
  });

  /* ---------- вопросы и контакты ---------- */
  // вопросы перепиской: время идёт как в настоящем чате
  (() => {
    let m = 14 * 60 + 2;
    const t = () => { const s = `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`; m += 1 + (m % 3); return s; };
    const fq = $("[data-faq]");
    if (fq) fq.innerHTML = `<div class="chat__top"><span class="chat__ava"><svg aria-hidden="true"><use href="#eye"/></svg></span><span class="chat__who"><b>DOUBLE TAKE</b><span>${L("в сети", "online")}</span></span></div>` +
      window.FAQ.map(([q, a]) => `<p class="msg msg--q">${esc(q)}<time>${t()} ✓✓</time></p><p class="msg msg--a">${esc(a)}<time>${t()}</time></p>`).join("") +
      `<p class="msg msg--a msg--typing" aria-label="${L("печатает", "typing")}"><i></i><i></i><i></i></p>`;
  })();
  $$("[data-tg]").forEach((a) => (a.href = `https://t.me/${S.tg}`));
  if (S.mail) $$("[data-mail]").forEach((a) => { a.href = `mailto:${S.mail}`; a.hidden = false; });
  document.addEventListener("click", (e) => { if (e.target.closest("[data-brief]")) BRIEF.open({}); });

  /* ---------- курсор с подписью ---------- */
  (() => {
    const cur = $("[data-cur]");
    if (!cur || touch) return;
    const lab = $("span", cur);
    let x = 0, y = 0, tx = 0, ty = 0, on = null;
    $$(".tile").forEach((t) => (t.dataset.cursor = L("Смотреть", "Play")));
    document.addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      const el = e.target.closest("[data-cursor]");
      if (el !== on) {
        on = el;
        if (on) { lab.textContent = on.dataset.cursor; cur.classList.add("is-on"); document.body.classList.add("has-cur"); }
        else { cur.classList.remove("is-on"); document.body.classList.remove("has-cur"); }
      }
    });
    const f = () => { x += (tx - x) * 0.22; y += (ty - y) * 0.22; cur.style.transform = `translate(${x}px, ${y}px)`; requestAnimationFrame(f); };
    requestAnimationFrame(f);
  })();

  /* ---------- DOUBLE TAKE огромными буквами, видео внутри, пролёт сквозь штрих T ---------- */
  (() => {
    const z = $("[data-zoom]");
    if (!z) return;
    const mask = $("[data-zoom-mask]");
    const t = $("[data-zoom-t]");
    const v = $(".zoom__v", z);
    const hint = $("[data-zoom-hint]");
    // точка входа: середина ножки буквы T, там толстый белый штрих, за ним видео
    const origin = () => {
      const m = mask.getBoundingClientRect(), r = t.getBoundingClientRect();
      mask.style.transformOrigin = `${r.left - m.left + r.width * 0.5}px ${r.top - m.top + r.height * 0.62}px`;
    };
    const set = (p) => {
      const k = Math.max(0, Math.min(1, (p - 0.14) / 0.7));
      const s = Math.pow(90, k * k * (3 - 2 * k));
      mask.style.transform = `scale(${s})`;
      mask.style.opacity = k > 0.97 ? String(1 - (k - 0.97) / 0.03) : "1";
      hint.style.opacity = p > 0.08 ? "0" : "1";
      z.classList.toggle("is-end", p > 0.86);
    };
    new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0 }).observe(z);
    origin();
    addEventListener("resize", origin);
    document.fonts && document.fonts.ready.then(origin);
    if (reduce || !window.ScrollTrigger) { set(0); return; }
    ScrollTrigger.create({ trigger: z, start: "top top", end: "bottom bottom", scrub: true, onUpdate: (st) => set(st.progress), onRefresh: origin });
    set(0);
  })();

  /* ---------- магнитная кнопка брифа ---------- */
  (() => {
    const m = $("[data-magnet]");
    if (!m || touch || reduce) return;
    const zone = $("#go");
    zone.addEventListener("pointermove", (e) => {
      const r = m.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy);
      const k = d < 260 ? 0.32 : 0;
      m.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
    });
    zone.addEventListener("pointerleave", () => (m.style.transform = ""));
  })();

  window.CALC = CALC;
  window.WK = WK;
})();
