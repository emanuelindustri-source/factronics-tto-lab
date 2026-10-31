/* Factronics TTO Lab - compact result payload, checksum, QR and result URL.
   The QR contains a URL with the result summary; no server or account needed. */
(function () {
  "use strict";

  const VERSION = 1;
  const RESULT_BASE = (document.querySelector('meta[name="result-base"]') || {}).content || "resultado/";
  const VERIFY_BASE = (document.querySelector('meta[name="verify-base"]') || {}).content || "verificar/";

  function utf8Bytes(text) {
    return new TextEncoder().encode(String(text || ""));
  }
  function bytesUtf8(bytes) {
    return new TextDecoder().decode(bytes);
  }
  function toBase64Url(bytes) {
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function fromBase64Url(text) {
    let value = String(text || "").replace(/-/g, "+").replace(/_/g, "/");
    while (value.length % 4) value += "=";
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  /* FNV-1a 32-bit. It detects accidental corruption and typos; it is not a
     cryptographic signature. */
  function checksum(text) {
    let h = 0x811c9dc5;
    const bytes = utf8Bytes(text);
    for (let i = 0; i < bytes.length; i++) {
      h ^= bytes[i];
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return ("00000000" + h.toString(16)).slice(-8);
  }
  function canonical(data) {
    return JSON.stringify({
      v: VERSION,
      n: String(data.n || ""),
      e: String(data.e || ""),
      s: Number(data.s || 0),
      p: Number(data.p || 0),
      t: Number(data.t || 0),
      d: String(data.d || ""),
      m: Array.isArray(data.m) ? data.m.map(String) : [],
      y: Array.isArray(data.y) ? data.y.map(String) : [],
      c: String(data.c || ""),
      b: data.b && typeof data.b === "object" ? data.b : {},
      l: String(data.l || "es")
    });
  }
  function sign(data) {
    const base = {
      v: VERSION,
      n: String(data.n || ""),
      e: String(data.e || ""),
      s: Number(data.s || 0),
      p: Number(data.p || 0),
      t: Number(data.t || 0),
      d: String(data.d || ""),
      m: Array.isArray(data.m) ? data.m.map(String) : [],
      y: Array.isArray(data.y) ? data.y.map(String) : [],
      c: String(data.c || ""),
      b: data.b && typeof data.b === "object" ? data.b : {},
      l: String(data.l || "es")
    };
    base.h = checksum(canonical(base));
    return base;
  }
  function encode(payload) {
    return toBase64Url(utf8Bytes(JSON.stringify(payload)));
  }
  function decode(text) {
    const bytes = fromBase64Url(text);
    return JSON.parse(bytesUtf8(bytes));
  }
  function verify(payload) {
    if (!payload || typeof payload !== "object") return false;
    const expected = checksum(canonical(payload));
    return String(payload.h || "").toLowerCase() === expected;
  }
  function resultUrl(payload) {
    return urlFor(RESULT_BASE, payload);
  }
  function verifyUrl(payload) {
    return urlFor(VERIFY_BASE, payload);
  }
  function urlFor(base, payload) {
    const url = new URL(base, location.href);
    url.searchParams.set("d", encode(payload));
    return url.href;
  }
  async function fingerprint(payload) {
    try {
      if (!window.crypto || !window.crypto.subtle) return "";
      const data = utf8Bytes(canonical(payload));
      const digest = await window.crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      return "";
    }
  }
  function qrDataUrl(text, size) {
    if (typeof qrcode !== "function") return "";
    const qr = qrcode(0, "M");
    qr.addData(String(text));
    qr.make();
    const modules = qr.getModuleCount();
    const cell = Math.max(2, Math.floor((size || 320) / (modules + 8)));
    const quiet = 4;
    const side = (modules + quiet * 2) * cell;
    const canvas = document.createElement("canvas");
    canvas.width = side;
    canvas.height = side;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, side, side);
    ctx.fillStyle = "#0a1b2c";
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        if (qr.isDark(y, x)) ctx.fillRect((x + quiet) * cell, (y + quiet) * cell, cell, cell);
      }
    }
    return canvas.toDataURL("image/png");
  }
  function qrImage(text, size, alt) {
    const src = qrDataUrl(text, size);
    return src ? `<img src="${src}" width="${size || 240}" height="${size || 240}" alt="${String(alt || "QR")}" style="display:block;max-width:100%;height:auto">` : "";
  }

  window.TTOResult = {
    version: VERSION,
    encode: encode,
    decode: decode,
    verify: verify,
    sign: sign,
    canonical: canonical,
    resultUrl: resultUrl,
    verifyUrl: verifyUrl,
    fingerprint: fingerprint,
    qrDataUrl: qrDataUrl,
    qrImage: qrImage,
    checksum: checksum
  };
})();
