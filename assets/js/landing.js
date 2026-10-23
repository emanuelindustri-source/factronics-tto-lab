/* Landing page: language, theme, model cards and hero preview. */
(function () {
  "use strict";
  const bank = window.TTO_BANK || { models: {}, questions: [] };
  const i18n = window.TTO_I18N || {};
  const T = (key, lang) => window.ttoT(key, lang);
  const state = {
    lang: localStorage.getItem("tto.lang") || "es",
    theme: localStorage.getItem("tto.theme") || "light",
    demo: { rounds: [], answers: [], index: 0 }
  };
  if (!i18n[state.lang]) state.lang = "es";

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function applyText() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = T(key, state.lang);
      if (val !== undefined) el.textContent = val;
    });
    document.querySelectorAll("[data-lang]").forEach((b) => {
      b.classList.toggle("on", b.getAttribute("data-lang") === state.lang);
    });
    const pool = document.getElementById("poolStat");
    if (pool) pool.textContent = bank.questions.length || "328";
    document.title = state.lang === "en"
      ? "Factronics TTO Lab · Technical assessment generator"
      : state.lang === "pt"
        ? "Factronics TTO Lab · Gerador de avaliações técnicas"
        : "Factronics TTO Lab · Generador de evaluaciones técnicas";
  }

  function modelCard(id, m) {
    const tier = T("tier_" + (m.tier || "legacy"), state.lang);
    const widths = m.widths && m.widths.length > 1 ? m.widths.join(" / ") : String(m.widths ? m.widths[0] : m.maxWidth);
    const ppm = m.ppm107 ? `${m.ppm} / ${m.ppm107}` : String(m.ppm);
    const air = m.air === "airless" ? T("airless", state.lang) : T("pneumatic", state.lang);
    const featured = id === "6530" ? " featured" : "";
    return `
      <article class="model-card${featured}">
        <div class="model-top">
          <h3>${m.name}</h3>
          <span class="model-tier ${m.tier === "legacy" ? "legacy" : ""}">${tier}</span>
        </div>
        <div class="spec-list">
          <div class="spec-row"><span>${T("model_width", state.lang)}</span><b>${widths} mm</b></div>
          <div class="spec-row"><span>${T("model_ribbon", state.lang)}</span><b>${m.ribbon} m</b></div>
          <div class="spec-row"><span>${T("model_ppm", state.lang)}</span><b>${ppm} ppm</b></div>
          <div class="spec-row"><span>${T("model_speed", state.lang)}</span><b>${m.speedCont} mm/s</b></div>
          <div class="spec-row"><span>${T("model_air", state.lang)}</span><b>${air}</b></div>
          <div class="spec-row"><span>${T("model_screen", state.lang)}</span><b>${m.screen}" · ${m.ethernet ? "Ethernet" : "RS232"}</b></div>
        </div>
      </article>`;
  }

  function renderModels() {
    const el = document.getElementById("modelGrid");
    if (!el) return;
    const order = ["6210", "6230", "6320", "6330", "6420", "6530"];
    el.innerHTML = order.map((id) => modelCard(id, bank.models[id])).filter(Boolean).join("");
  }

  function renderHero() {
    if (!bank.questions || !bank.questions.length) return;
    const q = bank.questions.find((x) => x.id === "G-S-6530-width-1") ||
      bank.questions.find((x) => x.type === "single" && x.models && x.models.includes("6530"));
    if (!q || !q.i18n || !q.i18n[state.lang]) return;
    const d = q.i18n[state.lang];
    const qEl = document.getElementById("mockQuestion");
    const oEl = document.getElementById("mockOptions");
    if (qEl) qEl.textContent = d.q;
    if (oEl) {
      const answer = (d.answer || [])[0];
      oEl.innerHTML = (d.options || []).map((o) => {
        const good = o.id === answer ? " good" : "";
        return `<div class="mock-opt${good}"><b>${o.id.toUpperCase()}</b><span>${o.text}</span></div>`;
      }).join("");
    }
  }

  function pickDemoRounds() {
    const candidates = (bank.questions || []).filter((q) => {
      const d = q.i18n && q.i18n.es;
      return q.type === "single" && d && d.q && Array.isArray(d.options) && d.options.length >= 3 && Array.isArray(d.answer) && d.answer.length;
    });
    const chosen = [];
    const seen = new Set();
    const models = shuffle(["6530", "6230", "6210", "6330", "6420", "6320"]);
    models.forEach((m) => {
      const q = shuffle(candidates).find((x) => x.models && x.models.includes(m) && !seen.has(x.id));
      if (q && chosen.length < 3) { chosen.push(q); seen.add(q.id); }
    });
    shuffle(candidates).forEach((q) => {
      if (chosen.length < 3 && !seen.has(q.id)) { chosen.push(q); seen.add(q.id); }
    });
    return chosen;
  }
  function demoAnswered(item) {
    return state.demo.answers[state.demo.index] !== undefined;
  }
  function demoCorrect(item) {
    const selected = state.demo.answers[state.demo.index];
    const d = item.i18n[state.lang] || item.i18n.es;
    return !!selected && (d.answer || []).includes(selected);
  }
  function demoScore() {
    let n = 0;
    state.demo.rounds.forEach((q, i) => {
      const selected = state.demo.answers[i];
      if (!selected) return;
      const d = q.i18n[state.lang] || q.i18n.es;
      if ((d.answer || []).includes(selected)) n++;
    });
    return n;
  }
  function renderDemo() {
    const body = document.getElementById("demoBody");
    const progress = document.getElementById("demoProgress");
    if (!body) return;
    if (!state.demo.rounds.length) state.demo.rounds = pickDemoRounds();
    if (!state.demo.rounds.length) {
      body.innerHTML = `<p class="muted">${esc(T("loading", state.lang))}</p>`;
      return;
    }
    const total = state.demo.rounds.length;
    if (state.demo.index >= total) {
      if (progress) progress.textContent = `${total} / ${total}`;
      body.innerHTML = `<div class="demo-feedback ok"><b>${esc(T("demo_done", state.lang))}</b>${esc(T("demo_done_lead", state.lang).replace("{score}", String(demoScore())).replace("{total}", String(total)))}</div>
        <div class="demo-actions"><a class="btn primary sm" href="generator/">${esc(T("demo_full", state.lang))}</a><button class="btn sm" type="button" data-demo-action="restart">${esc(T("demo_restart", state.lang))}</button></div>`;
      return;
    }
    const q = state.demo.rounds[state.demo.index];
    const d = q.i18n[state.lang] || q.i18n.es;
    if (progress) progress.textContent = T("demo_progress", state.lang).replace("{n}", String(state.demo.index + 1)).replace("{total}", String(total));
    const selected = state.demo.answers[state.demo.index];
    const answered = selected !== undefined;
    const correct = answered && (d.answer || []).includes(selected);
    const opts = (d.options || []).map((o, i) => {
      let cls = "";
      if (answered && (d.answer || []).includes(o.id)) cls = " correct";
      else if (answered && selected === o.id) cls = " wrong";
      return `<button class="demo-opt${cls}" type="button" data-demo-opt="${esc(o.id)}" ${answered ? "disabled" : ""}>
        <b>${String.fromCharCode(65 + i)}</b><span>${esc(o.text)}</span>
      </button>`;
    }).join("");
    body.innerHTML = `
      <p class="demo-question">${esc(d.q)}</p>
      <div class="demo-options">${opts}</div>
      ${answered ? `<div class="demo-feedback ${correct ? "ok" : "bad"}"><b>${esc(correct ? T("demo_correct", state.lang) : T("demo_incorrect", state.lang))}</b>${d.explanation ? `<span>${esc(T("demo_explanation", state.lang))}: ${esc(d.explanation)}</span>` : ""}</div>` : ""}
      ${answered ? `<div class="demo-actions"><button class="btn primary sm" type="button" data-demo-action="next">${esc(state.demo.index >= total - 1 ? T("demo_done", state.lang) : T("demo_next", state.lang))}</button><span class="demo-score">${esc(T("demo_score", state.lang))}: ${demoScore()} / ${state.demo.index + 1}</span></div>` : `<p class="tiny muted" style="margin:12px 0 0">${esc(T("hero_note", state.lang))}</p>`}
    `;
  }
  function resetDemo() {
    state.demo = { rounds: pickDemoRounds(), answers: [], index: 0 };
    renderDemo();
  }

  function render() {
    applyText();
    renderModels();
    renderHero();
    renderDemo();
  }

  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("tto.theme", theme);
    const btn = document.getElementById("themeBtn");
    if (btn) btn.textContent = theme === "dark" ? "☀" : "◐";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#06111d" : "#0b5cab");
  }

  document.addEventListener("click", (e) => {
    const langBtn = e.target.closest("[data-lang]");
    if (langBtn) {
      state.lang = langBtn.getAttribute("data-lang");
      localStorage.setItem("tto.lang", state.lang);
      render();
      return;
    }
    if (e.target.closest("#themeBtn")) {
      setTheme(state.theme === "dark" ? "light" : "dark");
      return;
    }
    const opt = e.target.closest("[data-demo-opt]");
    if (opt) {
      if (state.demo.answers[state.demo.index] !== undefined) return;
      state.demo.answers[state.demo.index] = opt.getAttribute("data-demo-opt");
      renderDemo();
      return;
    }
    const act = e.target.closest("[data-demo-action]");
    if (act) {
      const action = act.getAttribute("data-demo-action");
      if (action === "restart") resetDemo();
      else if (action === "next") {
        state.demo.index = Math.min(state.demo.index + 1, state.demo.rounds.length);
        renderDemo();
      }
      return;
    }
  });

  document.getElementById("year").textContent = String(new Date().getFullYear());
  setTheme(state.theme);
  render();
})();
