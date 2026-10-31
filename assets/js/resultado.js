/* Factronics TTO Lab - result viewer decoded from a QR URL. */
(function () {
  "use strict";

  const root = document.getElementById("resultCard");
  const params = new URLSearchParams(location.search);
  const raw = params.get("d");
  const state = {
    lang: localStorage.getItem("tto.lang") || "es",
    theme: localStorage.getItem("tto.theme") || "light",
    data: null,
    valid: false
  };
  if (!window.TTO_I18N || !window.TTO_I18N[state.lang]) state.lang = "es";
  if (state.theme !== "dark" && state.theme !== "light") state.theme = "light";

  const T = (key) => window.ttoT(key, state.lang);
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function typeLabel(type) {
    const map = {
      single: "type_single", multi: "type_multi", fill: "type_fill", describe: "type_describe",
      calc: "type_calc", errmap: "type_errmap", errorfix: "type_errorfix"
    };
    return T(map[type] || type);
  }
  function dateText(value) {
    const d = new Date(value || Date.now());
    if (isNaN(d.getTime())) return "—";
    const locale = state.lang === "en" ? "en-GB" : state.lang === "pt" ? "pt-PT" : "es-ES";
    return d.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
  }
  function applyText() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = T(el.getAttribute("data-i18n"));
      if (value !== undefined) el.textContent = value;
    });
    document.querySelectorAll("[data-lang]").forEach((b) => {
      const on = b.getAttribute("data-lang") === state.lang;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    const themeBtn = document.getElementById("themeBtn");
    if (themeBtn) {
      themeBtn.textContent = state.theme === "dark" ? "☀" : "◐";
      themeBtn.setAttribute("aria-label", T(state.theme === "dark" ? "theme_light" : "theme_dark"));
    }
    document.title = T("result_viewer") + " · Factronics TTO Lab";
  }
  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("tto.theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#06111d" : "#0b5cab");
  }
  function errorBox(message, key) {
    root.innerHTML = `<div class="panel result-error"><h1>${esc(T("result_invalid"))}</h1><p>${esc(message || T(key || "result_invalid"))}</p><p><a class="btn" href="../generator/">${esc(T("result_open_generator"))}</a></p></div>`;
  }
  function render() {
    applyText();
    if (!state.data) { errorBox(T("result_missing")); return; }
    const d = state.data;
    const passed = Number(d.s) >= 70;
    const breakdown = Object.keys(d.b || {}).map((type) => {
      const pct = Math.max(0, Math.min(100, Math.round(Number(d.b[type]) || 0)));
      return `<div class="bd-row"><span>${esc(typeLabel(type))}</span><div class="bd-bar"><i style="width:${pct}%"></i></div><b>${pct}%</b></div>`;
    }).join("");
    const models = (d.m || []).map((m) => `<span class="chip">${esc(m)}</span>`).join("");
    const verify = state.valid && window.TTOResult && window.TTOResult.verifyUrl ? window.TTOResult.verifyUrl(d) : "";
    const verifyQr = verify && window.TTOResult.qrDataUrl ? window.TTOResult.qrDataUrl(verify, 220) : "";
    const integrity = state.valid
      ? `<span class="pill ok">✓ ${esc(T("qr_integrity_ok"))}</span>`
      : `<span class="pill bad">! ${esc(T("qr_integrity_bad"))}</span>`;
    root.innerHTML = `
      <article class="result-sheet">
        <header class="result-top">
          <div class="brand"><img src="../assets/img/factronics-transparent.png" alt="Factronics"><div><b>Factronics TTO Lab</b><span>${esc(T("report_subtitle"))}</span></div></div>
          <div class="result-code"><b>${esc(T("result_viewer"))}</b>${esc(d.c || "—")}<br>${esc(dateText(d.d))}</div>
        </header>
        <div class="result-body">
          <p class="kicker">${esc(T("result_viewer_lead"))}</p>
          <h1>${esc(d.n || "—")}</h1>
          <p class="muted">${esc(d.e || "—")}</p>
          <div class="result-score ${passed ? "ok" : "bad"}">
            <b>${Math.round(Number(d.s) || 0)}%</b>
            <span>${esc(passed ? T("res_pass") : T("res_fail"))}</span>
            <small>${esc(fmtPoints(d.p))} / ${esc(String(d.t || 0))} ${esc(T("res_points"))} · ${esc(T("res_threshold"))} 70 %</small>
          </div>
          <div class="result-integrity">${integrity}</div>
          <h2>${esc(T("report_breakdown"))}</h2>
          <div class="breakdown">${breakdown || `<p class="muted">—</p>`}</div>
          <h2>${esc(T("report_models"))}</h2>
          <div class="chips">${models || `<span class="muted">—</span>`}</div>
          ${verify ? `<div class="result-verify"><img src="${verifyQr}" width="124" height="124" alt="QR"><div><b>${esc(T("cert_doc_verify"))}</b><span>${esc(verify)}</span><code>${esc(d.c || "")}</code></div></div>` : ""}
          <div class="result-actions no-print">
            ${verify ? `<a class="btn primary" href="${esc(verify)}">${esc(T("verify_open"))}</a>` : ""}
            <button class="btn" type="button" id="printResult">${esc(T("result_print"))}</button>
            <a class="btn" href="../generator/">${esc(T("result_open_generator"))}</a>
          </div>
        </div>
        <footer class="result-foot">${esc(T("report_footer"))}</footer>
      </article>`;
    const print = document.getElementById("printResult");
    if (print) print.addEventListener("click", () => window.print());
  }
  function fmtPoints(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "0";
    const s = Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
    return state.lang === "en" ? s : s.replace(".", ",");
  }

  try {
    if (raw) {
      state.data = window.TTOResult.decode(raw);
      state.valid = window.TTOResult.verify(state.data);
      if (state.data.l && window.TTO_I18N[state.data.l]) state.lang = state.data.l;
    }
  } catch (e) {
    state.data = null;
    state.valid = false;
    errorBox(T("result_invalid"));
  }

  document.addEventListener("click", (e) => {
    const lang = e.target.closest("[data-lang]");
    if (lang) {
      state.lang = lang.getAttribute("data-lang");
      localStorage.setItem("tto.lang", state.lang);
      render();
      return;
    }
    if (e.target.closest("#themeBtn")) {
      setTheme(state.theme === "dark" ? "light" : "dark");
      applyText();
      render();
    }
  });

  setTheme(state.theme);
  if (raw && state.data) render();
  else if (!raw) errorBox(T("result_missing"));
})();
