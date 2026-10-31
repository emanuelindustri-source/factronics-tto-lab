/* Factronics TTO Lab - lightweight particles, reveal-on-scroll and counters.
   No dependencies. Respects prefers-reduced-motion and pauses when hidden. */
(function () {
  "use strict";

  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("motion-ready");

  /* ------------------------------------------------------------- particles */
  const canvas = document.getElementById("particleCanvas");
  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d");
    let width = 0, height = 0, dpr = 1;
    let particles = [];
    let frame = 0;
    let running = true;

    const palette = ["0, 163, 224", "11, 92, 171", "85, 200, 243"];

    function makeParticles() {
      const count = Math.max(18, Math.min(54, Math.round((width * height) / 26000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 0.8 + Math.random() * 1.8,
        c: palette[Math.floor(Math.random() * palette.length)],
        a: 0.18 + Math.random() * 0.32
      }));
    }

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeParticles();
    }

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + p.c + "," + p.a + ")";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 15000) {
            const alpha = (1 - d2 / 15000) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = "rgba(0, 163, 224," + alpha.toFixed(3) + ")";
            ctx.lineWidth = 0.7;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      frame = requestAnimationFrame(draw);
    }

    function start() {
      if (!running) { running = true; draw(); }
    }
    function stop() {
      running = false;
      cancelAnimationFrame(frame);
    }

    resize();
    draw();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop(); else start();
    });
  }

  /* --------------------------------------------------------------- reveals */
  const revealTargets = document.querySelectorAll(
    ".hero-copy, .section-head, .model-card, .feature, .step, .type-card, .new-card, .android-band, .panel, .res-head, .res-body"
  );
  revealTargets.forEach((el, index) => {
    el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", Math.min(220, (index % 6) * 45) + "ms");
  });

  if (!reduced && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("in"));
  }

  /* --------------------------------------------------------------- counters */
  function animateNumber(el) {
    if (reduced) return;
    const raw = el.textContent.trim();
    const target = Number(raw.replace(/[^\d]/g, ""));
    if (!Number.isFinite(target) || target <= 0 || target > 9999) return;
    const start = performance.now();
    const duration = 900;
    function step(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = raw;
    }
    el.textContent = "0";
    requestAnimationFrame(step);
  }
  const statObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateNumber(entry.target);
        statObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 })
    : null;
  if (statObserver) document.querySelectorAll(".stat b, .pstat b, .res-stat b").forEach((el) => statObserver.observe(el));
})();
