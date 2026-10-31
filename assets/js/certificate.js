/* Factronics TTO Lab - result card and certificate renderer.
   Draws local PNG documents; no external libraries or network requests. */
(function () {
  "use strict";

  function loadImage(src) {
    return new Promise((resolve) => {
      if (!src) { resolve(null); return; }
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function rounded(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function setFont(ctx, size, weight) {
    ctx.font = `${weight || 700} ${size}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
  }

  function fitFont(ctx, text, maxWidth, start, min, weight) {
    let size = start;
    while (size > min) {
      setFont(ctx, size, weight);
      if (ctx.measureText(String(text || "")).width <= maxWidth) break;
      size -= 2;
    }
    return size;
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    let line = "";
    let lines = 0;
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, y);
        y += lineHeight;
        lines++;
        line = word;
        if (maxLines && lines >= maxLines) return y;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
    }
    return y;
  }

  function pill(ctx, x, y, text, bg, fg, size) {
    setFont(ctx, size, 800);
    const padX = size * 0.7;
    const w = ctx.measureText(text).width + padX * 2;
    const h = size * 1.9;
    ctx.fillStyle = bg;
    rounded(ctx, x, y, w, h, h / 2);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + padX, y + h / 2 + 1);
    ctx.textBaseline = "alphabetic";
    return w;
  }

  function circle(ctx, x, y, r, fill, stroke, width) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width || 2; ctx.stroke(); }
  }

  function drawSeal(ctx, x, y, r, label, sub) {
    circle(ctx, x, y, r, "rgba(11,122,88,.08)", "#0b7a58", 4);
    circle(ctx, x, y, r - 12, null, "#0b7a58", 1.5);
    ctx.strokeStyle = "#0b7a58";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - r * 0.34, y + r * 0.02);
    ctx.lineTo(x - r * 0.08, y + r * 0.28);
    ctx.lineTo(x + r * 0.4, y - r * 0.26);
    ctx.stroke();
    ctx.fillStyle = "#0b7a58";
    ctx.textAlign = "center";
    setFont(ctx, r * 0.19, 800);
    ctx.fillText(label, x, y + r * 0.62);
    if (sub) {
      ctx.fillStyle = "#3e6b5d";
      setFont(ctx, r * 0.11, 600);
      ctx.fillText(sub, x, y + r * 0.8);
    }
    ctx.textAlign = "left";
  }

  function shortUrl(url, max) {
    const value = String(url || "").replace(/^https?:\/\//, "");
    return value.length > max ? value.slice(0, max - 1) + "…" : value;
  }

  function label(ctx, text, x, y, size, color, weight) {
    setFont(ctx, size, weight || 700);
    ctx.fillStyle = color;
    ctx.fillText(String(text == null ? "" : text), x, y);
  }

  function drawCard(ctx, d, logo) {
    const W = 1080, H = 1350;
    const brand = "#0b5cab", ink = "#0a1b2c", muted = "#556b7e", ok = "#0b7a58";
    ctx.fillStyle = "#eef4fa";
    ctx.fillRect(0, 0, W, H);

    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, "#072a49");
    g.addColorStop(0.6, "#0b5cab");
    g.addColorStop(1, "#00a3e0");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, 300);

    circle(ctx, 1030, 20, 170, "rgba(255,255,255,.06)");
    circle(ctx, 940, 300, 120, "rgba(255,255,255,.05)");

    ctx.fillStyle = "#ffffff";
    rounded(ctx, 60, 52, 300, 76, 12);
    ctx.fill();
    if (logo) {
      const box = { x: 68, y: 58, w: 284, h: 64 };
      const ratio = Math.min(box.w / logo.width, box.h / logo.height);
      const dw = logo.width * ratio, dh = logo.height * ratio;
      ctx.drawImage(logo, box.x + (box.w - dw) / 2, box.y + (box.h - dh) / 2, dw, dh);
    } else {
      label(ctx, "FACTRONICS", 84, 100, 34, "#0b5cab", 900);
    }
    label(ctx, "FACTRONICS TTO LAB", 60, 178, 34, "#ffffff", 900);
    label(ctx, "D I S T R I B U I D O R   O F I C I A L   V I D E O J E T", 60, 210, 14, "#c8e8fa", 700);
    label(ctx, d.t("qr_title", "Tarjeta de resultado con QR"), 60, 262, 34, "#ffffff", 800);

    ctx.shadowColor = "rgba(6,40,70,.18)";
    ctx.shadowBlur = 34;
    ctx.shadowOffsetY = 18;
    ctx.fillStyle = "#ffffff";
    rounded(ctx, 40, 330, 1000, 970, 28);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    label(ctx, d.name || "—", 90, 430, fitFont(ctx, d.name || "—", 480, 54, 30, 800), ink, 800);
    label(ctx, d.email || "—", 90, 474, 24, muted, 400);

    const scoreColor = d.passed ? ok : "#b3261e";
    label(ctx, `${Math.round(d.score)}%`, 86, 630, 118, scoreColor, 900);
    label(ctx, d.passed ? d.t("res_pass", "Aprobado") : d.t("res_fail", "No aprobado"), 92, 688, 32, ink, 800);

    const rows = [
      [d.t("res_points", "Puntos"), `${d.points} / ${d.total}`],
      [d.t("report_date", "Fecha"), d.date],
      [d.t("report_models", "Equipos"), d.models],
      [d.t("report_mode", "Modalidad"), d.mode],
      [d.t("report_code", "Código"), d.code]
    ];
    let y = 748;
    rows.forEach(([k, v]) => {
      label(ctx, k.toUpperCase(), 92, y, 13, "#8aa0b3", 800);
      label(ctx, String(v || "—"), 92, y + 24, fitFont(ctx, v || "—", 470, 21, 14, 700), ink, 700);
      y += 58;
    });

    if (d.qrImage) {
      ctx.fillStyle = "#ffffff";
      rounded(ctx, 596, 410, 350, 350, 18);
      ctx.fill();
      ctx.strokeStyle = "#dce8f2";
      ctx.lineWidth = 2;
      rounded(ctx, 596, 410, 350, 350, 18);
      ctx.stroke();
      ctx.drawImage(d.qrImage, 611, 425, 320, 320);
    }
    label(ctx, d.t("qr_scan", "Escanea para verificar"), 596, 798, 21, ink, 800);
    ctx.fillStyle = "#eef5fb";
    rounded(ctx, 596, 814, 350, 54, 10);
    ctx.fill();
    label(ctx, shortUrl(d.verifyUrl, 44), 612, 848, 13, muted, 600);

    ctx.strokeStyle = "#dce8f2";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(90, 1090);
    ctx.lineTo(990, 1090);
    ctx.stroke();

    const badgeText = "✓ " + d.t("qr_integrity_ok", "Datos consistentes");
    pill(ctx, 90, 1120, badgeText, "#e3f6ee", ok, 17);
    if (d.checksum) label(ctx, `FNV-1a ${d.checksum}`, 420, 1147, 14, muted, 600);
    if (d.fingerprint) {
      label(ctx, d.t("verify_fingerprint", "Huella SHA-256"), 90, 1195, 12, "#8aa0b3", 800);
      label(ctx, d.fingerprint.slice(0, 32), 90, 1218, 13, muted, 600);
      label(ctx, d.fingerprint.slice(32), 90, 1240, 13, muted, 600);
    }

    label(ctx, d.t("report_footer", ""), 90, 1290, 13, "#7a90a3", 400);
  }

  function drawCertificate(ctx, d, logo) {
    const W = 1240, H = 1754;
    const brand = "#0b5cab", ink = "#0a1b2c", muted = "#556b7e", ok = "#0b7a58";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#0b5cab";
    ctx.lineWidth = 18;
    ctx.strokeRect(9, 9, W - 18, H - 18);
    ctx.strokeStyle = "#bfe0f4";
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, W - 72, H - 72);

    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, "#072a49");
    g.addColorStop(0.6, "#0b5cab");
    g.addColorStop(1, "#00a3e0");
    ctx.fillStyle = g;
    ctx.fillRect(36, 36, W - 72, 210);

    ctx.fillStyle = "#ffffff";
    rounded(ctx, 70, 70, 310, 82, 12);
    ctx.fill();
    if (logo) {
      const box = { x: 78, y: 77, w: 294, h: 68 };
      const ratio = Math.min(box.w / logo.width, box.h / logo.height);
      const dw = logo.width * ratio, dh = logo.height * ratio;
      ctx.drawImage(logo, box.x + (box.w - dw) / 2, box.y + (box.h - dh) / 2, dw, dh);
    } else {
      label(ctx, "FACTRONICS", 92, 122, 38, brand, 900);
    }
    label(ctx, "FACTRONICS TTO LAB", 420, 112, 30, "#ffffff", 900);
    label(ctx, "D I S T R I B U I D O R   O F I C I A L   V I D E O J E T", 420, 144, 13, "#c8e8fa", 700);
    label(ctx, d.t("cert_doc_title", "Certificado de evaluación").toUpperCase(), 420, 196, 22, "#ffffff", 800);

    label(ctx, d.t("cert_doc_kicker", "CERTIFICADO DE EVALUACIÓN TÉCNICA"), 90, 330, 16, brand, 800);
    label(ctx, d.t("cert_doc_lead", "Se certifica que"), 90, 392, 24, muted, 400);
    const nameSize = fitFont(ctx, d.name || "—", 1060, 66, 36, 900);
    label(ctx, d.name || "—", 90, 480, nameSize, ink, 900);
    label(ctx, d.email || "—", 90, 528, 25, muted, 400);

    setFont(ctx, 23, 400);
    ctx.fillStyle = "#2f465c";
    wrapText(ctx, d.t("cert_doc_body", "ha completado la evaluación técnica de Factronics TTO Lab con el resultado que se indica a continuación."), 90, 592, 1060, 34, 3);

    ctx.fillStyle = "#f3f8fd";
    rounded(ctx, 90, 690, 1060, 205, 18);
    ctx.fill();
    ctx.strokeStyle = "#d8e4ef";
    ctx.lineWidth = 2;
    rounded(ctx, 90, 690, 1060, 205, 18);
    ctx.stroke();
    const scoreColor = d.passed ? ok : "#b3261e";
    label(ctx, `${Math.round(d.score)}%`, 120, 840, 100, scoreColor, 900);
    label(ctx, d.t("cert_doc_score", "Resultado"), 430, 738, 13, "#8aa0b3", 800);
    label(ctx, d.passed ? d.t("res_pass", "Aprobado") : d.t("res_fail", "No aprobado"), 430, 786, 32, ink, 800);
    label(ctx, `${d.points} / ${d.total} ${d.t("res_points", "puntos")}`, 430, 826, 20, muted, 600);
    label(ctx, `${d.t("res_threshold", "Mínimo")} 70 %`, 430, 858, 16, muted, 600);

    const facts = [
      [d.t("cert_doc_date", "Fecha"), d.date],
      [d.t("cert_doc_code", "Código"), d.code],
      [d.t("cert_doc_models", "Equipos"), d.models],
      [d.t("cert_doc_mode", "Modalidad"), d.mode],
      [d.t("cert_doc_duration", "Duración"), d.duration],
      [d.t("cert_doc_total", "Preguntas"), String(d.total)]
    ];
    const fx = 90, fy = 950, fw = 330, fh = 86, gap = 15;
    facts.forEach(([k, v], i) => {
      const x = fx + (i % 3) * (fw + gap);
      const yy = fy + Math.floor(i / 3) * (fh + gap);
      ctx.fillStyle = "#fbfdff";
      rounded(ctx, x, yy, fw, fh, 12);
      ctx.fill();
      ctx.strokeStyle = "#e2edf6";
      ctx.lineWidth = 1.5;
      rounded(ctx, x, yy, fw, fh, 12);
      ctx.stroke();
      label(ctx, k.toUpperCase(), x + 14, yy + 24, 11, "#8aa0b3", 800);
      label(ctx, String(v || "—"), x + 14, yy + 55, fitFont(ctx, v || "—", fw - 28, 19, 12, 700), ink, 700);
    });

    if (d.qrImage) {
      ctx.fillStyle = "#ffffff";
      rounded(ctx, 90, 1190, 290, 290, 16);
      ctx.fill();
      ctx.strokeStyle = "#d8e4ef";
      ctx.lineWidth = 2;
      rounded(ctx, 90, 1190, 290, 290, 16);
      ctx.stroke();
      ctx.drawImage(d.qrImage, 105, 1205, 260, 260);
    }
    label(ctx, d.t("cert_doc_verify", "Verificar autenticidad"), 420, 1235, 30, ink, 800);
    const cleanUrl = String(d.verifyUrl || "").split("?")[0].replace(/^https?:\/\//, "");
    const slashAt = cleanUrl.indexOf("/");
    const urlHost = slashAt >= 0 ? cleanUrl.slice(0, slashAt) : cleanUrl;
    const urlPath = slashAt >= 0 ? cleanUrl.slice(slashAt) : "";
    label(ctx, urlHost, 420, 1268, 15, muted, 700);
    setFont(ctx, 14, 400);
    ctx.fillStyle = muted;
    wrapText(ctx, urlPath, 420, 1290, 450, 19, 2);
    label(ctx, d.code, 420, 1350, 22, brand, 800);
    if (d.checksum) label(ctx, `FNV-1a ${d.checksum}`, 420, 1380, 14, muted, 600);
    label(ctx, d.t("cert_doc_scan", "Escanea el QR para abrir la página de verificación."), 420, 1410, 14, muted, 400);

    drawSeal(ctx, 1005, 1325, 112, d.t("cert_doc_seal", "VERIFICADO"), "Factronics TTO Lab");

    if (d.fingerprint) {
      label(ctx, d.t("verify_fingerprint", "Huella SHA-256"), 90, 1530, 12, "#8aa0b3", 800);
      label(ctx, d.fingerprint.slice(0, 48), 90, 1552, 12, muted, 600);
      label(ctx, d.fingerprint.slice(48), 90, 1572, 12, muted, 600);
    }

    setFont(ctx, 13, 400);
    ctx.fillStyle = "#7a90a3";
    wrapText(ctx, d.t("cert_doc_disclaimer", ""), 90, 1610, 1060, 19, 4);

    label(ctx, "Khristyan Hidalgo", 720, 1688, 18, ink, 800);
    ctx.strokeStyle = "#8fa9c0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(720, 1702);
    ctx.lineTo(1110, 1702);
    ctx.stroke();
    label(ctx, d.t("cert_doc_signature", "Técnico de campo certificado"), 720, 1724, 12, muted, 400);
    label(ctx, "Factronics C.A. · Factronics TTO Lab", 90, 1704, 12, muted, 600);
    label(ctx, d.appVersion ? "v" + d.appVersion : "", 90, 1724, 11, "#9aafc0", 400);
  }

  async function render(kind, data) {
    const cert = kind === "cert";
    const canvas = document.createElement("canvas");
    canvas.width = cert ? 1240 : 1080;
    canvas.height = cert ? 1754 : 1350;
    const ctx = canvas.getContext("2d");
    const [logo, qr] = await Promise.all([
      loadImage(data.logoUrl),
      loadImage(data.qrSrc || (window.TTOResult && data.verifyUrl ? window.TTOResult.qrDataUrl(data.verifyUrl, 720) : ""))
    ]);
    const payload = Object.assign({}, data, { qrImage: qr });
    payload.t = (key, fallback) => {
      const value = window.ttoT ? window.ttoT(key, data.lang) : "";
      return value && value !== key ? value : fallback;
    };
    if (cert) drawCertificate(ctx, payload, logo);
    else drawCard(ctx, payload, logo);
    return canvas;
  }

  function filename(data, kind) {
    const safe = String(data.name || "resultado").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 42) || "resultado";
    return `Factronics-TTO-Lab-${kind === "cert" ? "Certificado" : "Tarjeta"}-${safe}.png`;
  }

  function download(canvas, name) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) { resolve(false); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2500);
        resolve(true);
      }, "image/png");
    });
  }

  window.TTOCert = { render, download, filename };
})();
