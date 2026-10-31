/* Factronics TTO Lab - update notice.
   Checks version.json and offers a reload when a newer web version exists.
   Silent when offline, respects a per-version dismissal and never sends data. */
(function () {
  "use strict";

  const versionMeta = document.querySelector('meta[name="app-version"]');
  const urlMeta = document.querySelector('meta[name="app-version-url"]');
  if (!versionMeta || !urlMeta) return;
  const current = versionMeta.getAttribute("content") || "0.0.0";
  const endpoint = new URL(urlMeta.getAttribute("content") || "version.json", location.href).href;
  const DISMISS_KEY = "tto.update.dismissed";

  function parse(v) {
    return String(v || "").replace(/^v/i, "").split(/[.+-]/).slice(0, 3).map((x) => parseInt(x, 10) || 0);
  }
  function newer(remote, local) {
    const a = parse(remote), b = parse(local);
    for (let i = 0; i < 3; i++) {
      if (a[i] !== b[i]) return a[i] > b[i];
    }
    return false;
  }

  function removeBanner() {
    const old = document.getElementById("updateBanner");
    if (old) old.remove();
  }

  function show(data) {
    if (!data || !newer(data.version, current)) return;
    if (sessionStorage.getItem(DISMISS_KEY) === data.version) return;
    if (document.getElementById("updateBanner")) return;
    const banner = document.createElement("div");
    banner.id = "updateBanner";
    banner.className = "update-banner";
    banner.setAttribute("role", "status");
    banner.innerHTML = `
      <div class="update-copy">
        <b>${esc(data.title || "Factronics TTO Lab " + data.version)}</b>
        <span>${esc(data.notes || "")}</span>
      </div>
      <div class="update-actions">
        <a class="btn sm light" href="${esc(data.release || data.web || "#")}" target="_blank" rel="noopener">Ver novedades</a>
        <button class="btn sm primary" type="button" id="updateNow">Actualizar</button>
        <button class="icon-btn" type="button" id="updateClose" aria-label="Cerrar">×</button>
      </div>`;
    document.body.appendChild(banner);
    const close = document.getElementById("updateClose");
    if (close) close.addEventListener("click", () => {
      sessionStorage.setItem(DISMISS_KEY, data.version);
      removeBanner();
    });
    const now = document.getElementById("updateNow");
    if (now) now.addEventListener("click", () => {
      now.disabled = true;
      now.textContent = "Actualizando…";
      const done = () => setTimeout(() => location.reload(), 250);
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistration().then((reg) => reg && reg.update()).catch(() => {}).then(done);
      } else {
        done();
      }
    });
  }

  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  let checking = false;
  async function check() {
    if (checking || !navigator.onLine) return;
    checking = true;
    try {
      const response = await fetch(endpoint + (endpoint.includes("?") ? "&" : "?") + "t=" + Date.now(), { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      show(data);
    } catch (e) {
      /* offline or blocked: keep the app usable */
    } finally {
      checking = false;
    }
  }

  window.addEventListener("load", () => setTimeout(check, 2500));
  window.addEventListener("online", check);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) check();
  });
  setInterval(check, 15 * 60 * 1000);
})();
