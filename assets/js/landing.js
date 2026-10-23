/* Landing page: language, theme, model cards and hero preview. */
(function () {
  "use strict";
  const bank = window.TTO_BANK || { models: {}, questions: [] };
  const i18n = window.TTO_I18N || {};
  const T = (key, lang) => window.ttoT(key, lang);
  const state = {
    lang: localStorage.getItem("tto.lang") || "es",
    theme: localStorage.getItem("tto.theme") || "light"
  };
  if (!i18n[state.lang]) state.lang = "es";

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

  function render() {
    applyText();
    renderModels();
    renderHero();
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
    }
  });

  document.getElementById("year").textContent = String(new Date().getFullYear());
  setTheme(state.theme);
  render();
})();
