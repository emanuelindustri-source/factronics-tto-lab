/* Factronics TTO Lab - PWA registration and browser install prompt.
   The service worker is optional: file:// and unsupported browsers keep working. */
(function () {
  "use strict";

  const standalone = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
  let deferredPrompt = null;

  function installButtons() {
    return Array.from(document.querySelectorAll("#installBtn, [data-install]"));
  }
  function showInstall(show) {
    installButtons().forEach((btn) => { btn.hidden = !show; });
  }
  function setInstallLabel(key) {
    if (!window.ttoT) return;
    const lang = localStorage.getItem("tto.lang") || "es";
    installButtons().forEach((btn) => {
      const value = window.ttoT(key, lang);
      if (value) btn.textContent = value;
    });
  }

  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    const manifest = document.querySelector('link[rel="manifest"]');
    let swUrl = null;
    try {
      swUrl = manifest ? new URL("sw.js", manifest.href) : new URL("sw.js", location.href);
    } catch (e) { swUrl = null; }
    if (swUrl) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register(swUrl.href, { scope: swUrl.href.replace(/sw\.js(?:\?.*)?$/, "") })
          .then((reg) => {
            document.documentElement.setAttribute("data-offline-ready", "true");
            if (reg && reg.update) reg.update().catch(() => {});
          })
          .catch(() => { /* keep the app usable without a service worker */ });
      });
    }
  }

  if (standalone) showInstall(false);

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (!standalone) showInstall(true);
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    setInstallLabel("install_done");
    setTimeout(() => showInstall(false), 2500);
  });

  document.addEventListener("click", (event) => {
    const btn = event.target.closest("#installBtn, [data-install]");
    if (!btn) return;
    event.preventDefault();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = deferredPrompt.userChoice;
    if (choice && choice.then) {
      choice.then(() => {
        deferredPrompt = null;
        showInstall(false);
      }).catch(() => {});
    } else {
      deferredPrompt = null;
      showInstall(false);
    }
  });
})();
