/* Factronics TTO Lab - public certificate / result verification page. */
(function () {
  "use strict";

  const root = document.getElementById("verifyRoot");
  const params = new URLSearchParams(location.search);
  const raw = params.get("d");
  const state = {
    lang: localStorage.getItem("tto.lang") || "es",
    theme: localStorage.getItem("tto.theme") || "light",
    data: null,
    valid: false,
    fingerprint: "",
    loading: true
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
  function locale() {
    return state.lang === "en" ? "en-GB" : state.lang === "pt" ? "pt-PT" : "es-ES";
  }
  function dateText(value) {
    const d = new Date(value || Date.now());
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(locale(), { day: "2-digit", month: "short", year: "numeric" });
  }
  function pointsText(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "0";
    const s = Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
    return state.lang === "en" ? s : s.replace(".", ",");
  }
  function applyText() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = T(el.getAttribute("data-i18n"));
      if (value !== undefined && value !== el.getAttribute("data-i18n")) el.textContent = value;
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
    document.title = T("verify_page_title") + " · Factronics TTO Lab";
  }
  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("tto.theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#06111d" : "#0b5cab");
  }
  function verifyUrl() {
    return location.href.split("#")[0];
  }
  function errorBox(message) {
    root.innerHTML = `<div class="panel verify-error">
      <h1>${esc(T("verify_invalid"))}</h1>
      <p>${esc(message)}</p>
      <p><a class="btn" href="../generator/">${esc(T("verify_home"))}</a></p>
    </div>`;
  }
  function facts(data) {
    const types = (data.y || []).map(typeLabel).join(" · ") || "—";
    const items = [
      [T("verify_date"), dateText(data.d)],
      [T("verify_code"), data.c || "—"],
      [T("verify_models"), (data.m || []).join(" + ") || "—"],
      [T("verify_score"), `${pointsText(data.p)} / ${data.t || 0} ${T("res_points")}`],
      [T("verify_holder"), data.n || "—"],
      [T("verify_issuer"), "Factronics TTO Lab"]
    ];
    return items.map(([k, v]) => `<div class="verify-fact"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("");
  }
  function breakdown(data) {
    const b = data.b && typeof data.b === "object" ? data.b : {};
    const keys = Object.keys(b);
    if (!keys.length) return "";
    const rows = keys.map((type) => {
      const pct = Math.max(0, Math.min(100, Math.round(Number(b[type]) || 0)));
      return `<div class="bd-row"><span>${esc(typeLabel(type))}</span><div class="bd-bar"><i style="width:${pct}%"></i></div><b>${pct}%</b></div>`;
    }).join("");
    return `<h2>${esc(T("report_breakdown"))}</h2><div class="breakdown">${rows}</div>`;
  }
  function render() {
    applyText();
    if (state.loading) return;
    if (!state.data) {
      errorBox(T(raw ? "verify_invalid" : "verify_missing"));
      return;
    }
    const d = state.data;
    const passed = Number(d.s) >= 70;
    const qrSrc = window.TTOResult ? window.TTOResult.qrDataUrl(verifyUrl(), 360) : "";
    const banner = state.valid
      ? `<div class="verify-banner ok"><span class="verify-badge">✓</span><div><b>${esc(T("verify_ok"))}</b><span>${esc(T("verify_ok_help"))}</span></div></div>`
      : `<div class="verify-banner bad"><span class="verify-badge">!</span><div><b>${esc(T("verify_bad"))}</b><span>${esc(T("verify_bad_help"))}</span></div></div>`;
    const hash = state.fingerprint
      ? `<div class="verify-hash"><span>${esc(T("verify_fingerprint"))}</span><b>${esc(state.fingerprint)}</b></div>`
      : "";
    const checksum = d.h
      ? `<div class="verify-hash"><span>${esc(T("verify_checksum"))}</span><b>${esc(d.h)}</b></div>`
      : "";
    const qr = qrSrc
      ? `<div class="verify-qr"><img src="${qrSrc}" width="240" height="240" alt="QR de verificación"><div><b>${esc(T("cert_doc_verify"))}</b><span>${esc(location.origin + location.pathname)}</span><code>${esc(d.c || "")}</code></div></div>`
      : "";
    const scoreLabel = passed ? T("res_pass") : T("res_fail");
    root.innerHTML = `
      ${banner}
      <article class="verify-sheet ${state.valid ? "" : "bad"}">
        <header class="verify-top">
          <div class="brand"><img src="../assets/img/factronics-transparent.png" alt="Factronics"><div><b>Factronics TTO Lab</b><span>${esc(T("report_subtitle"))}</span></div></div>
          <div class="verify-top-code"><b>${esc(T("verify_heading"))}</b>${esc(d.c || "—")}<br>${esc(dateText(d.d))}</div>
        </header>
        <div class="verify-body">
          <p class="kicker">${esc(T("cert_doc_kicker"))}</p>
          <h1>${esc(d.n || "—")}</h1>
          <p class="muted">${esc(d.e || "—")}</p>
          <p class="verify-lead">${esc(T("cert_doc_body"))}</p>
          <div class="verify-score ${passed ? "ok" : "bad"}">
            <b>${Math.round(Number(d.s) || 0)}%</b>
            <span>${esc(scoreLabel)}</span>
            <small>${esc(pointsText(d.p))} / ${esc(String(d.t || 0))} ${esc(T("res_points"))} · ${esc(T("res_threshold"))} 70 %</small>
          </div>
          <div class="verify-facts">${facts(d)}</div>
          ${breakdown(d)}
          ${qr}
          <div class="verify-hashes">${checksum}${hash}</div>
          <div class="verify-legal">
            <p>${esc(T("verify_legal"))}</p>
            <p>${esc(T("cert_doc_disclaimer"))}</p>
          </div>
          <div class="verify-sign">
            <div><i></i><b>Khristyan Hidalgo</b><span>${esc(T("cert_doc_signature"))}</span></div>
            <div class="verify-seal">${esc(T("cert_doc_seal"))}<small>Factronics TTO Lab</small></div>
          </div>
        </div>
        <footer class="verify-foot">${esc(T("report_footer"))} · v1.7.0</footer>
      </article>
      <div class="verify-actions no-print">
        <button class="btn primary" type="button" id="downloadCert" ${state.valid ? "" : "disabled"}>${esc(T("verify_download"))}</button>
        <button class="btn" type="button" id="printCert" ${state.valid ? "" : "disabled"}>${esc(T("verify_print"))}</button>
        <a class="btn" href="../generator/">${esc(T("verify_home"))}</a>
      </div>
      <section class="verify-about panel">
        <h2>${esc(T("verify_what_title"))}</h2>
        <ul>
          <li>${esc(T("verify_what_1"))}</li>
          <li>${esc(T("verify_what_2"))}</li>
          <li>${esc(T("verify_what_3"))}</li>
        </ul>
      </section>`;
    const download = document.getElementById("downloadCert");
    if (download) download.addEventListener("click", downloadCertificate);
    const print = document.getElementById("printCert");
    if (print) print.addEventListener("click", () => window.print());
  }
  async function downloadCertificate() {
    if (!state.valid || !state.data || !window.TTOCert) return;
    const button = document.getElementById("downloadCert");
    if (button) { button.disabled = true; button.textContent = T("loading"); }
    try {
      const d = state.data;
      const data = {
        name: d.n || "",
        email: d.e || "",
        score: Number(d.s) || 0,
        points: pointsText(d.p),
        total: Number(d.t) || 0,
        passed: Number(d.s) >= 70,
        date: dateText(d.d),
        code: d.c || "",
        models: (d.m || []).join(" + "),
        mode: (d.y || []).map(typeLabel).join(" · "),
        duration: "—",
        verifyUrl: verifyUrl(),
        checksum: d.h || "",
        fingerprint: state.fingerprint,
        lang: state.lang,
        logoUrl: new URL("../assets/img/factronics-transparent.png", location.href).href,
        appVersion: "1.7.0"
      };
      const canvas = await window.TTOCert.render("cert", data);
      await window.TTOCert.download(canvas, window.TTOCert.filename(data, "cert"));
      if (button) { button.textContent = T("verify_download"); }
    } catch (e) {
      if (window.console && console.error) console.error(e);
      if (button) { button.textContent = T("verify_download"); }
    } finally {
      if (button) { button.disabled = false; }
    }
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
  }
  state.loading = false;
  render();
  if (state.data && window.TTOResult.fingerprint) {
    window.TTOResult.fingerprint(state.data).then((value) => {
      state.fingerprint = value || "";
      render();
    }).catch(() => { /* the checksum is still shown */ });
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
})();
