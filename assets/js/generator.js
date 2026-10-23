/* Factronics TTO Lab - exam generator and runner (vanilla JS, offline). */
(function () {
  "use strict";

  const BANK = window.TTO_BANK || { models: {}, questions: [] };
  const MODELS = BANK.models || {};
  const ALL_QUESTIONS = BANK.questions || [];
  const T = (key, lang) => window.ttoT(key, lang || state.lang);
  const MODEL_ORDER = ["6210", "6230", "6320", "6330", "6420", "6530"];
  const TYPE_ORDER = ["single", "multi", "fill", "describe", "calc", "errmap", "errorfix"];
  const TYPE_LABEL = {
    single: "type_single", multi: "type_multi", fill: "type_fill",
    describe: "type_describe", calc: "type_calc", errmap: "type_errmap", errorfix: "type_errorfix"
  };
  const COUNTS = [10, 15, 20, 25, 30, 40, 50];
  const DURATIONS = [10, 20, 30, 45, 60, 90, 0];
  const PASS = 70;

  const byId = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));

  const state = {
    lang: localStorage.getItem("tto.lang") || "es",
    theme: localStorage.getItem("tto.theme") || "light",
    screen: "setup",
    config: loadConfig(),
    exam: null,
    result: null,
    reviewFilter: "all",
    autoSubmitted: false
  };
  if (!window.TTO_I18N || !window.TTO_I18N[state.lang]) state.lang = "es";

  let timerHandle = null;
  let saveTimer = null;

  /* ------------------------------------------------------------------ utils */
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function num(v) { return Number(String(v == null ? "" : v).replace(",", ".")); }
  function fmtNum(v) {
    if (typeof v !== "number") return String(v == null ? "" : v);
    const s = Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
    return state.lang === "en" ? s : s.replace(".", ",");
  }
  function norm(s) {
    return String(s == null ? "" : s).toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ").trim();
  }
  function formatClock(sec) {
    sec = Math.max(0, Math.ceil(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const pad = (x) => String(x).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }
  function formatDate(d) {
    const locale = state.lang === "en" ? "en-GB" : state.lang === "pt" ? "pt-PT" : "es-ES";
    return new Date(d).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
  }

  /* --------------------------------------------------------------- storage */
  function loadConfig() {
    const base = {
      models: ["6210", "6230", "6320", "6330", "6420", "6530"],
      count: 20, minutes: 30, types: TYPE_ORDER.slice(),
      shuffle: true, partial: true, instant: false, excludeSeen: true
    };
    try {
      const raw = JSON.parse(localStorage.getItem("tto.config.v1") || "null");
      if (raw && typeof raw === "object") {
        base.models = Array.isArray(raw.models) ? raw.models.filter((m) => MODELS[m]) : base.models;
        base.types = Array.isArray(raw.types) ? raw.types.filter((t) => TYPE_ORDER.includes(t)) : base.types;
        base.count = clamp(parseInt(raw.count, 10) || base.count, 5, 100);
        base.minutes = [0, 10, 20, 30, 45, 60, 90].includes(Number(raw.minutes)) ? Number(raw.minutes) : base.minutes;
        ["shuffle", "partial", "instant", "excludeSeen"].forEach((k) => {
          if (typeof raw[k] === "boolean") base[k] = raw[k];
        });
      }
    } catch (e) { /* ignore */ }
    return base;
  }
  function saveConfig() { localStorage.setItem("tto.config.v1", JSON.stringify(state.config)); }
  function saveExam() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (state.exam && !state.exam.submitted) {
        localStorage.setItem("tto.exam.v1", JSON.stringify(state.exam));
      }
    }, 80);
  }
  function loadSavedExam() {
    try {
      const e = JSON.parse(localStorage.getItem("tto.exam.v1") || "null");
      if (!e || !Array.isArray(e.questions) || !e.questions.length) return null;
      if (!e.questions.every((x) => byId.has(x.qid))) return null;
      return e;
    } catch (x) { return null; }
  }
  function saveSeen() {
    try { localStorage.setItem("tto.seen.v1", JSON.stringify(seen)); } catch (e) { /* ignore */ }
  }
  let seen = {};
  try { seen = JSON.parse(localStorage.getItem("tto.seen.v1") || "{}") || {}; } catch (e) { seen = {}; }

  /* ---------------------------------------------------------------- i18n */
  function applyStatic() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const k = el.getAttribute("data-i18n");
      const v = T(k);
      if (v !== undefined) el.textContent = v;
    });
    document.querySelectorAll("[data-lang]").forEach((b) => {
      b.classList.toggle("on", b.getAttribute("data-lang") === state.lang);
    });
    document.title = T("gen_title") + " · Factronics TTO Lab";
  }
  function typeLabel(t) { return T(TYPE_LABEL[t] || t); }
  function modelName(id) { return (MODELS[id] && MODELS[id].name) || id; }

  /* --------------------------------------------------------------- pool */
  function buildPool(typeFilter) {
    const types = typeFilter || state.config.types;
    const models = state.config.models;
    const out = [];
    const used = new Set();
    for (const q of ALL_QUESTIONS) {
      if (!types.includes(q.type)) continue;
      if (!q.models || !q.models.some((m) => models.includes(m))) continue;
      const d = q.i18n && (q.i18n[state.lang] || q.i18n.es);
      if (!d || !d.q) continue;
      const key = norm(d.q);
      if (used.has(key)) continue;
      used.add(key);
      out.push(q);
    }
    return out;
  }
  function unseenCount(pool) { return pool.filter((q) => !seen[q.id]).length; }
  function pickQuestions(pool, count) {
    const buckets = state.config.types.map((t) => {
      const arr = pool.filter((q) => q.type === t);
      if (state.config.shuffle) {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }
      if (state.config.excludeSeen) arr.sort((a, b) => (seen[a.id] || 0) - (seen[b.id] || 0));
      return arr;
    }).filter((b) => b.length);
    const out = [];
    while (out.length < count) {
      let added = false;
      for (const b of buckets) {
        if (!b.length) continue;
        out.push(b.shift());
        added = true;
        if (out.length >= count) break;
      }
      if (!added) break;
    }
    return out;
  }
  function optionOrder(q) {
    const ids = ((q.i18n[state.lang] || q.i18n.es).options || []).map((o) => o.id);
    return state.config.shuffle ? shuffle(ids) : ids;
  }
  function orderedOptions(item, q) {
    const d = q.i18n[state.lang] || q.i18n.es;
    const opts = d.options || [];
    const order = item.optOrder || opts.map((o) => o.id);
    const map = new Map(opts.map((o) => [o.id, o]));
    return order.map((id) => map.get(id)).filter(Boolean);
  }

  /* --------------------------------------------------------------- setup */
  function renderModelPicks() {
    const el = document.getElementById("modelPicks");
    if (!el) return;
    el.innerHTML = MODEL_ORDER.map((id) => {
      const m = MODELS[id] || { name: id };
      const on = state.config.models.includes(id);
      const spec = `${m.widths && m.widths.length > 1 ? m.widths.join("/") : m.maxWidth} mm · ${m.ppm} ppm · ${m.ribbon} m`;
      return `<label class="pick${on ? " on" : ""}">
        <input type="checkbox" data-model="${id}" ${on ? "checked" : ""}>
        <span class="box"></span>
        <span><b>${esc(m.name || id)}</b><small>${esc(spec)}</small></span>
      </label>`;
    }).join("");
  }
  function renderTypePicks() {
    const el = document.getElementById("typePicks");
    if (!el) return;
    el.innerHTML = TYPE_ORDER.map((t) => {
      const on = state.config.types.includes(t);
      const count = buildPool([t]).length;
      return `<label class="type-pick${on ? " on" : ""}">
        <input type="checkbox" data-type="${t}" ${on ? "checked" : ""}>
        <span>${esc(typeLabel(t))} <small class="muted" data-type-count="${t}">(${count})</small></span>
      </label>`;
    }).join("");
  }
  function updateTypeCounts() {
    document.querySelectorAll("[data-type-count]").forEach((el) => {
      const t = el.getAttribute("data-type-count");
      el.textContent = `(${buildPool([t]).length})`;
    });
  }
  function populateSelects() {
    const cs = document.getElementById("countSel");
    const ds = document.getElementById("durationSel");
    if (cs) {
      const vals = COUNTS.slice();
      if (!vals.includes(state.config.count)) vals.push(state.config.count);
      vals.sort((a, b) => a - b);
      cs.innerHTML = vals.map((n) => `<option value="${n}" ${n === state.config.count ? "selected" : ""}>${n}</option>`).join("");
    }
    if (ds) {
      const vals = DURATIONS.slice();
      if (!vals.includes(state.config.minutes)) vals.push(state.config.minutes);
      ds.innerHTML = vals.map((n) => `<option value="${n}" ${n === state.config.minutes ? "selected" : ""}>${n === 0 ? esc(T("no_limit")) : n + " " + esc(T("minutes"))}</option>`).join("");
    }
  }
  function renderSetup() {
    state.screen = "setup";
    applyStatic();
    renderModelPicks();
    renderTypePicks();
    populateSelects();
    document.getElementById("optShuffle").checked = state.config.shuffle;
    document.getElementById("optPartial").checked = state.config.partial;
    document.getElementById("optInstant").checked = state.config.instant;
    document.getElementById("optExclude").checked = state.config.excludeSeen;
    const saved = loadSavedExam();
    const banner = document.getElementById("resumeBanner");
    const rt = document.getElementById("resumeTitle");
    if (saved) {
      banner.style.display = "block";
      rt.textContent = T("resume_title");
      banner.querySelectorAll("[data-action]")[0].textContent = T("resume_btn");
      banner.querySelectorAll("[data-action]")[1].textContent = T("discard_btn");
    } else {
      banner.style.display = "none";
    }
    updateSummary();
  }
  function updateSummary() {
    const pool = buildPool();
    const n = unseenCount(pool);
    const modelsEl = document.getElementById("sumModels");
    const countEl = document.getElementById("sumCount");
    const timeEl = document.getElementById("sumTime");
    const typesEl = document.getElementById("sumTypes");
    const poolEl = document.getElementById("poolCount");
    const newEl = document.getElementById("poolNew");
    if (modelsEl) {
      modelsEl.textContent = state.config.models.length === 6 ? T("select_all") :
        state.config.models.map((m) => m).join(" · ");
    }
    if (countEl) countEl.textContent = String(state.config.count);
    if (timeEl) timeEl.textContent = state.config.minutes ? `${state.config.minutes} ${T("minutes")}` : T("no_limit");
    if (typesEl) {
      const labels = state.config.types.map(typeLabel);
      typesEl.textContent = labels.length > 3 ? `${labels.length} · ${labels.slice(0, 2).join(", ")}…` : labels.join(", ");
    }
    if (poolEl) poolEl.textContent = String(pool.length);
    if (newEl) newEl.textContent = String(n);
    const btn = document.getElementById("startBtn");
    if (btn) {
      btn.disabled = !state.config.models.length || !state.config.types.length || pool.length < 2;
    }
    const alert = document.getElementById("setupAlert");
    if (alert) {
      if (!state.config.models.length) alert.innerHTML = `<div class="alert">${esc(T("choose_model"))}</div>`;
      else if (!state.config.types.length) alert.innerHTML = `<div class="alert">${esc(T("choose_type"))}</div>`;
      else if (pool.length < state.config.count) alert.innerHTML = `<div class="alert warn">${esc(T("not_enough"))} (${pool.length}/${state.config.count})</div>`;
      else alert.innerHTML = "";
    }
  }
  function setAlert(msg, cls) {
    const el = document.getElementById("setupAlert");
    if (el) el.innerHTML = msg ? `<div class="alert ${cls || ""}">${esc(msg)}</div>` : "";
  }

  /* --------------------------------------------------------------- exam */
  function newExam() {
    const pool = buildPool();
    if (!state.config.models.length) { setAlert(T("choose_model")); return; }
    if (!state.config.types.length) { setAlert(T("choose_type")); return; }
    if (pool.length < state.config.count) { setAlert(`${T("not_enough")} (${pool.length}/${state.config.count})`, "warn"); return; }
    const picked = pickQuestions(pool, state.config.count);
    if (picked.length < state.config.count) { setAlert(T("not_enough"), "warn"); return; }
    const now = Date.now();
    state.exam = {
      id: "exam-" + now,
      startedAt: now,
      endsAt: state.config.minutes ? now + state.config.minutes * 60000 : null,
      minutes: state.config.minutes,
      questions: picked.map((q) => ({ qid: q.id, optOrder: optionOrder(q) })),
      answers: {},
      flags: {},
      self: {},
      checked: {},
      index: 0,
      submitted: false,
      models: state.config.models.slice(),
      types: state.config.types.slice()
    };
    state.result = null;
    state.autoSubmitted = false;
    state.reviewFilter = "all";
    saveExam();
    showScreen("exam");
    startTimer();
  }
  function showScreen(name) {
    state.screen = name;
    document.getElementById("setupView").style.display = name === "setup" ? "" : "none";
    document.getElementById("examView").style.display = name === "exam" ? "" : "none";
    document.getElementById("resultsView").style.display = name === "results" ? "" : "none";
    applyStatic();
    if (name === "setup") renderSetup();
    if (name === "exam") renderExam();
    if (name === "results") renderResults();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function startTimer() {
    stopTimer();
    tick();
    if (state.exam && state.exam.endsAt) timerHandle = setInterval(tick, 500);
  }
  function stopTimer() {
    if (timerHandle) clearInterval(timerHandle);
    timerHandle = null;
  }
  function tick() {
    const el = document.getElementById("timer");
    if (!el || !state.exam || state.exam.submitted) return;
    if (!state.exam.endsAt) {
      el.textContent = "∞";
      el.className = "timer";
      return;
    }
    const left = Math.max(0, Math.ceil((state.exam.endsAt - Date.now()) / 1000));
    el.textContent = formatClock(left);
    el.className = "timer" + (left <= 60 ? " bad" : left <= 300 ? " warn" : "");
    if (left <= 0) {
      stopTimer();
      finishExam(true);
    }
  }
  function currentItem() { return state.exam && state.exam.questions[state.exam.index]; }
  function currentQ() { const it = currentItem(); return it ? byId.get(it.qid) : null; }

  function renderExam() {
    if (!state.exam) return;
    const total = state.exam.questions.length;
    document.getElementById("examTitle").textContent = T("gen_title");
    document.getElementById("examSub").textContent =
      `${state.exam.models.join(" + ")} · ${total} ${T("bp_count").toLowerCase()} · ${state.exam.minutes ? state.exam.minutes + " " + T("minutes") : T("no_limit")}`;
    document.getElementById("answeredMeta").textContent = `${answeredCount()}/${total}`;
    document.getElementById("typeMeta").textContent = `${state.exam.types.length} ${T("bp_types").toLowerCase()}`;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const k = el.getAttribute("data-i18n");
      const v = T(k);
      if (v !== undefined) el.textContent = v;
    });
    renderPalette();
    renderQuestion();
    updateChrome();
    tick();
  }
  function answeredCount() {
    if (!state.exam) return 0;
    return state.exam.questions.filter((it) => isAnswered(byId.get(it.qid), state.exam.answers[it.qid])).length;
  }
  function updateChrome() {
    if (!state.exam) return;
    const total = state.exam.questions.length;
    const done = answeredCount();
    const bar = document.getElementById("progressBar");
    if (bar) bar.style.width = `${total ? (done / total) * 100 : 0}%`;
    const am = document.getElementById("answeredMeta");
    if (am) am.textContent = `${done}/${total}`;
    const prev = document.getElementById("prevBtn");
    if (prev) prev.disabled = state.exam.index <= 0;
    const next = document.getElementById("nextBtn");
    if (next) next.textContent = state.exam.index >= total - 1 ? T("exam_finish") : T("exam_next");
    const flag = document.getElementById("flagBtn");
    if (flag) {
      const isFlag = !!state.exam.flags[currentItem().qid];
      flag.textContent = isFlag ? T("exam_unflag") : T("exam_flag");
      flag.classList.toggle("ok", isFlag);
    }
    const pal = document.getElementById("palette");
    if (pal) {
      pal.querySelectorAll("button[data-jump]").forEach((b) => {
        const i = Number(b.getAttribute("data-jump"));
        const it = state.exam.questions[i];
        b.classList.toggle("cur", i === state.exam.index);
        b.classList.toggle("ans", isAnswered(byId.get(it.qid), state.exam.answers[it.qid]));
        b.classList.toggle("flag", !!state.exam.flags[it.qid]);
      });
    }
  }
  function renderPalette() {
    const pal = document.getElementById("palette");
    if (!pal) return;
    pal.innerHTML = state.exam.questions.map((it, i) =>
      `<button type="button" data-jump="${i}" title="${i + 1}">${i + 1}</button>`
    ).join("");
  }

  function instructions(q) {
    if (q.type === "single" || q.type === "errmap") return T("exam_instructions_single");
    if (q.type === "multi") return T("exam_instructions_multi");
    if (q.type === "fill") return T("exam_instructions_fill");
    if (q.type === "calc") return T("exam_instructions_calc");
    return T("exam_instructions_open");
  }
  function renderQuestion() {
    const card = document.getElementById("qCard");
    if (!card) return;
    const item = currentItem();
    const q = currentQ();
    if (!item || !q) { card.innerHTML = ""; return; }
    const d = q.i18n[state.lang] || q.i18n.es;
    const ans = state.exam.answers[q.id];
    const isMulti = q.type === "multi";
    let body = "";
    if (q.type === "single" || q.type === "errmap" || isMulti) {
      const opts = orderedOptions(item, q);
      body = `<div class="options">${opts.map((o, i) => {
        const checked = isMulti ? Array.isArray(ans) && ans.includes(o.id) : ans === o.id;
        return `<label class="option${isMulti ? " multi" : ""}${checked ? " on" : ""}">
          <input type="${isMulti ? "checkbox" : "radio"}" name="opt-${esc(q.id)}" value="${esc(o.id)}" data-opt="${isMulti ? "multi" : "single"}" data-qid="${esc(q.id)}" ${checked ? "checked" : ""}>
          <span class="mark">${String.fromCharCode(65 + i)}</span>
          <span>${esc(o.text)}</span>
        </label>`;
      }).join("")}</div>`;
    } else if (q.type === "fill" || q.type === "calc") {
      const vals = Array.isArray(ans) ? ans : [];
      body = `<div class="fields">${(d.fields || []).map((f, i) => `
        <div class="frow">
          <div><label>${esc(f.label)}</label><input class="inp" type="text" inputmode="${q.type === "calc" ? "decimal" : "text"}" data-field="${i}" data-qid="${esc(q.id)}" value="${esc(vals[i] || "")}" autocomplete="off"></div>
          <div class="unit">${esc(f.unit || "")}</div>
        </div>`).join("")}</div>`;
    } else {
      body = `<textarea class="inp" data-open="${esc(q.id)}" placeholder="${esc(T("exam_instructions_open"))}">${esc(ans || "")}</textarea>`;
    }
    let feedback = "";
    if (state.config.instant && state.exam.checked[q.id] && q.type !== "describe" && q.type !== "errorfix") {
      const g = gradeQuestion(q, ans, null);
      const st = g >= 0.999 ? "ok" : g > 0 ? "warn" : "bad";
      feedback = `<div class="q-feedback ${st}"><b>${g >= 0.999 ? T("exam_correct") : T("exam_incorrect")}</b>${correctText(q)}<div class="rev-exp">${esc((d.explanation || ""))}</div></div>`;
    }
    card.innerHTML = `
      <div class="q-head">
        <span class="q-id">${String(state.exam.index + 1).padStart(2, "0")}</span>
        <span class="q-type">${esc(typeLabel(q.type))}</span>
        <span class="q-flag">${q.models.map((m) => `<span class="q-type">${esc(m)}</span>`).join(" ")}</span>
      </div>
      <div class="q-body">
        <p class="q-text">${esc(d.q)}</p>
        <p class="q-instr">${esc(instructions(q))}</p>
        ${body}
        ${state.config.instant && q.type !== "describe" && q.type !== "errorfix" ? `<div class="q-actions"><button class="btn sm" type="button" data-action="check">${esc(T("exam_check"))}</button></div>` : ""}
        ${feedback}
      </div>`;
  }

  /* ------------------------------------------------------------- grading */
  function isAnswered(q, ans) {
    if (!q) return false;
    if (q.type === "single" || q.type === "errmap") return typeof ans === "string" && ans.length > 0;
    if (q.type === "multi") return Array.isArray(ans) && ans.length > 0;
    if (q.type === "fill" || q.type === "calc") return Array.isArray(ans) && ans.some((x) => String(x || "").trim() !== "");
    return typeof ans === "string" && ans.trim().length > 0;
  }
  function matchField(field, value) {
    const raw = String(value == null ? "" : value).trim();
    if (!raw) return false;
    const answers = field.answers || [];
    const numeric = answers.length > 0 && answers.every((a) => typeof a === "number" || (String(a).trim() !== "" && !isNaN(num(a))));
    if (numeric) {
      const v = num(raw);
      if (isNaN(v)) return false;
      const tol = Number(field.tolerance) || 0.001;
      return answers.some((a) => Math.abs(v - Number(a)) <= tol + 1e-9);
    }
    return answers.some((a) => norm(a) === norm(raw));
  }
  function gradeQuestion(q, ans, selfScore) {
    const d = q.i18n[state.lang] || q.i18n.es;
    if (q.type === "describe" || q.type === "errorfix") {
      return typeof selfScore === "number" ? selfScore : null;
    }
    if (!isAnswered(q, ans)) return 0;
    if (q.type === "single" || q.type === "errmap") {
      return (d.answer || []).includes(ans) ? 1 : 0;
    }
    if (q.type === "multi") {
      const correct = d.answer || [];
      const selected = Array.isArray(ans) ? ans : [];
      const hits = selected.filter((x) => correct.includes(x)).length;
      const wrong = selected.filter((x) => !correct.includes(x)).length;
      if (!hits) return 0;
      if (hits === correct.length && wrong === 0) return 1;
      if (!state.config.partial) return 0;
      return Math.max(0, (hits - wrong) / correct.length);
    }
    if (q.type === "fill" || q.type === "calc") {
      const fields = d.fields || [];
      if (!fields.length) return 0;
      const vals = Array.isArray(ans) ? ans : [];
      const ok = fields.filter((f, i) => matchField(f, vals[i])).length;
      return ok / fields.length;
    }
    return 0;
  }
  function statusOf(score, blank) {
    if (blank) return "blank";
    if (score === null || score === undefined) return "pending";
    if (score >= 0.999) return "ok";
    if (score > 0) return "half";
    return "bad";
  }
  function scoreExam() {
    const rows = [];
    let points = 0, pending = 0;
    const byType = {};
    state.exam.questions.forEach((it, idx) => {
      const q = byId.get(it.qid);
      const d = q.i18n[state.lang] || q.i18n.es;
      const ans = state.exam.answers[q.id];
      const blank = !isAnswered(q, ans);
      const self = state.exam.self[q.id];
      const isOpen = q.type === "describe" || q.type === "errorfix";
      const g = gradeQuestion(q, ans, self);
      const status = (isOpen && self === undefined) ? "pending" : statusOf(g, blank);
      if (status === "pending") pending++;
      points += (typeof g === "number" ? g : 0);
      if (!byType[q.type]) byType[q.type] = { total: 0, points: 0, count: 0 };
      byType[q.type].total++;
      byType[q.type].points += (typeof g === "number" ? g : 0);
      byType[q.type].count += (typeof g === "number" ? 1 : 0);
      rows.push({ idx, item: it, q, d, ans, blank, grade: g, status });
    });
    const total = state.exam.questions.length;
    const percent = total ? (points / total) * 100 : 0;
    return { rows, points, total, percent, pending, byType };
  }

  /* -------------------------------------------------------------- finish */
  function requestFinish() {
    if (!state.exam || state.exam.submitted) return;
    const blank = state.exam.questions.filter((it) => !isAnswered(byId.get(it.qid), state.exam.answers[it.qid])).length;
    if (blank > 0) {
      showModal(T("exam_confirm_title"), T("exam_confirm_text"), T("exam_confirm_ok"), T("exam_confirm_cancel"), () => {
        closeModal();
        finishExam(false);
      });
    } else {
      finishExam(false);
    }
  }
  function finishExam(auto) {
    if (!state.exam || state.exam.submitted) return;
    stopTimer();
    state.exam.submitted = true;
    state.exam.finishedAt = Date.now();
    state.autoSubmitted = !!auto;
    state.exam.questions.forEach((it) => {
      seen[it.qid] = (seen[it.qid] || 0) + 1;
    });
    saveSeen();
    localStorage.removeItem("tto.exam.v1");
    try { localStorage.setItem("tto.last.v1", JSON.stringify(state.exam)); } catch (e) { /* ignore */ }
    state.result = scoreExam();
    showScreen("results");
  }

  /* -------------------------------------------------------------- results */
  function openQuestions() {
    return state.exam ? state.exam.questions.map((it) => byId.get(it.qid)).filter((q) => q && (q.type === "describe" || q.type === "errorfix")) : [];
  }
  function renderResults() {
    if (!state.exam) return;
    state.result = scoreExam();
    const r = state.result;
    const percent = Math.round(r.percent * 10) / 10;
    const passed = percent >= PASS;
    document.getElementById("scoreNum").innerHTML = `${Math.round(percent)}<small>%</small>`;
    document.getElementById("scorePoints").textContent = `${fmtNum(Math.round(r.points * 100) / 100)} / ${r.total} ${T("res_points")}`;
    document.getElementById("scoreDate").textContent = formatDate(state.exam.finishedAt || Date.now());
    const pill = document.getElementById("scorePill");
    pill.className = "pill " + (passed ? "ok" : "bad");
    pill.textContent = r.pending > 0 ? T("res_pending") : (passed ? T("res_pass") : T("res_fail"));
    if (r.pending > 0) {
      pill.style.background = "rgba(255,196,107,.16)";
      pill.style.color = "#ffd18a";
      pill.style.borderColor = "rgba(255,196,107,.28)";
    } else {
      pill.style.background = "";
      pill.style.color = "";
      pill.style.borderColor = "";
    }
    document.getElementById("resHeadline").textContent =
      (passed ? T("res_pass") : T("res_fail")) + " · " + Math.round(percent) + " %";
    let sub = `${state.exam.models.join(" + ")} · ${r.total} ${T("bp_count").toLowerCase()}`;
    sub += " · " + T("res_threshold") + " " + PASS + " %";
    if (state.autoSubmitted) sub += " · " + T("exam_time_up");
    if (r.pending > 0) sub += " · " + T("res_provisional");
    document.getElementById("resSubline").textContent = sub;
    const counts = r.rows.reduce((a, row) => {
      if (row.status === "ok") a.ok++;
      else if (row.status === "blank") a.blank++;
      else if (row.status === "pending") a.pending++;
      else a.bad++;
      return a;
    }, { ok: 0, bad: 0, blank: 0, pending: 0 });
    document.getElementById("statCorrect").textContent = counts.ok;
    document.getElementById("statWrong").textContent = counts.bad;
    document.getElementById("statBlank").textContent = counts.blank;
    document.getElementById("statPending").textContent = counts.pending;
    renderBreakdown(r);
    renderSelf();
    renderReview();
  }
  function renderBreakdown(r) {
    const el = document.getElementById("breakdown");
    if (!el) return;
    el.innerHTML = Object.keys(r.byType).map((t) => {
      const x = r.byType[t];
      const pct = x.total ? (x.points / x.total) * 100 : 0;
      return `<div class="bd-row"><span>${esc(typeLabel(t))}</span><div class="bd-bar"><i style="width:${clamp(pct, 0, 100)}%"></i></div><b>${Math.round(pct)}%</b></div>`;
    }).join("");
  }
  function renderSelf() {
    const el = document.getElementById("selfList");
    if (!el) return;
    const open = openQuestions();
    if (!open.length) {
      el.innerHTML = `<p class="muted">${esc(T("res_self_done"))}</p>`;
      return;
    }
    el.innerHTML = open.map((q) => {
      const d = q.i18n[state.lang] || q.i18n.es;
      const score = state.exam.self[q.id];
      const ans = state.exam.answers[q.id];
      return `<div class="self-item">
        <h4>${esc(d.q).slice(0, 140)}${d.q.length > 140 ? "…" : ""}</h4>
        <div class="rev-ans" style="margin-bottom:7px"><b>${esc(T("res_your_answer"))}:</b> ${esc(ans || T("res_no_answer"))}</div>
        <ul class="rubric">${(d.rubric || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        <div class="self-btns">
          <button type="button" data-self="${esc(q.id)}" data-score="1" class="${score === 1 ? "on" : ""}">${esc(T("res_self_1"))}</button>
          <button type="button" data-self="${esc(q.id)}" data-score="0.5" class="${score === 0.5 ? "on" : ""}">${esc(T("res_self_half"))}</button>
          <button type="button" data-self="${esc(q.id)}" data-score="0" class="${score === 0 ? "on" : ""}">${esc(T("res_self_0"))}</button>
        </div>
      </div>`;
    }).join("");
  }
  function answerText(q, ans) {
    const d = q.i18n[state.lang] || q.i18n.es;
    if (q.type === "single" || q.type === "errmap") {
      const o = (d.options || []).find((x) => x.id === ans);
      return o ? o.text : (ans || T("res_no_answer"));
    }
    if (q.type === "multi") {
      const arr = Array.isArray(ans) ? ans : [];
      if (!arr.length) return T("res_no_answer");
      return arr.map((id) => {
        const o = (d.options || []).find((x) => x.id === id);
        return o ? o.text : id;
      }).join(" · ");
    }
    if (q.type === "fill" || q.type === "calc") {
      const vals = Array.isArray(ans) ? ans : [];
      return (d.fields || []).map((f, i) => `${f.label}: ${vals[i] || T("res_no_answer")}${f.unit ? " " + f.unit : ""}`).join(" · ");
    }
    return ans || T("res_no_answer");
  }
  function correctText(q) {
    const d = q.i18n[state.lang] || q.i18n.es;
    if (q.type === "single" || q.type === "errmap" || q.type === "multi") {
      return (d.answer || []).map((id) => {
        const o = (d.options || []).find((x) => x.id === id);
        return o ? o.text : id;
      }).join(" · ");
    }
    if (q.type === "fill" || q.type === "calc") {
      return (d.fields || []).map((f) => `${f.label}: ${(f.answers || []).map((a) => fmtNum(a)).join(" / ")}${f.unit ? " " + f.unit : ""}`).join(" · ");
    }
    return "";
  }
  function renderReview() {
    const el = document.getElementById("reviewList");
    if (!el || !state.exam) return;
    const r = state.result || scoreExam();
    const filtered = r.rows.filter((row) => {
      if (state.reviewFilter === "ok") return row.status === "ok";
      if (state.reviewFilter === "bad") return row.status === "bad" || row.status === "half";
      if (state.reviewFilter === "blank") return row.status === "blank";
      return true;
    });
    document.querySelectorAll("#reviewFilters [data-filter]").forEach((b) => {
      b.classList.toggle("on", b.getAttribute("data-filter") === state.reviewFilter);
    });
    el.innerHTML = filtered.map((row) => {
      const q = row.q, d = row.d;
      const badge = row.status === "ok" ? "ok" : row.status === "blank" ? "blank" : row.status === "pending" ? "half" : row.status === "half" ? "half" : "bad";
      const label = row.status === "ok" ? T("res_correct_answer") : row.status === "blank" ? T("res_no_answer") : row.status === "pending" ? T("res_pending") : row.status === "half" ? T("res_partial") : T("res_wrong");
      let extra = "";
      if (q.type === "describe" || q.type === "errorfix") {
        extra = `<div class="rev-model"><b>${esc(T("res_model_answer"))}:</b><br>${esc(d.model || "")}</div>`;
        if (d.rubric && d.rubric.length) {
          extra += `<div class="rev-model"><b>${esc(T("res_rubric"))}:</b><ul class="rubric">${d.rubric.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
        }
      }
      return `<article class="rev-item">
        <div class="rev-top">
          <span class="rev-n">#${String(row.idx + 1).padStart(2, "0")}</span>
          <span class="rev-badge ${badge}">${esc(label)}</span>
          <span class="rev-n">${esc(typeLabel(q.type))}</span>
          <span class="rev-n">${q.models.map((m) => esc(m)).join(" · ")}</span>
          <span class="rev-n" style="margin-left:auto">${row.grade === null ? "—" : fmtNum(Math.round((row.grade || 0) * 100) / 100)} / 1</span>
        </div>
        <p class="rev-q">${esc(d.q)}</p>
        <div class="rev-ans"><div><b>${esc(T("res_your_answer"))}:</b> ${esc(answerText(q, row.ans))}</div>
        ${q.type === "describe" || q.type === "errorfix" ? "" : `<div><b>${esc(T("res_correct_answer"))}:</b> ${esc(correctText(q))}</div>`}</div>
        ${extra}
        ${d.explanation ? `<div class="rev-exp">${esc(d.explanation)}</div>` : ""}
      </article>`;
    }).join("") || `<p class="muted">—</p>`;
  }

  /* ---------------------------------------------------------------- modal */
  function showModal(title, text, ok, cancel, onOk) {
    const root = document.getElementById("modalRoot");
    root.innerHTML = `<div class="modal-backdrop" data-modal="backdrop"><div class="modal" role="dialog" aria-modal="true">
      <h2>${esc(title)}</h2><p>${esc(text)}</p>
      <div class="modal-actions"><button class="btn" type="button" data-modal="cancel">${esc(cancel)}</button><button class="btn primary" type="button" data-modal="ok">${esc(ok)}</button></div>
    </div></div>`;
    root.querySelector('[data-modal="ok"]').onclick = () => { closeModal(); onOk && onOk(); };
    root.querySelector('[data-modal="cancel"]').onclick = closeModal;
    root.querySelector('[data-modal="backdrop"]').addEventListener("click", (e) => { if (e.target === e.currentTarget) closeModal(); });
    root.querySelector('[data-modal="ok"]').focus();
  }
  function closeModal() { document.getElementById("modalRoot").innerHTML = ""; }
  function showPaletteModal() {
    if (!state.exam) return;
    const root = document.getElementById("modalRoot");
    root.innerHTML = `<div class="modal-backdrop" data-modal="backdrop"><div class="modal">
      <h2>${esc(T("exam_palette"))}</h2>
      <div class="palette" id="modalPalette"></div>
      <div class="modal-actions"><button class="btn" type="button" data-modal="close">OK</button></div>
    </div></div>`;
    const pal = document.getElementById("modalPalette");
    pal.innerHTML = state.exam.questions.map((it, i) => {
      const q = byId.get(it.qid);
      const cls = i === state.exam.index ? "cur" : isAnswered(q, state.exam.answers[it.qid]) ? "ans" : "";
      return `<button type="button" class="${cls}" data-jump="${i}">${i + 1}</button>`;
    }).join("");
    pal.querySelectorAll("[data-jump]").forEach((b) => b.onclick = () => {
      state.exam.index = Number(b.getAttribute("data-jump"));
      closeModal(); renderExam();
    });
    root.querySelector('[data-modal="close"]').onclick = closeModal;
    root.querySelector('[data-modal="backdrop"]').addEventListener("click", (e) => { if (e.target === e.currentTarget) closeModal(); });
  }

  /* -------------------------------------------------------------- exports */
  function downloadCSV() {
    if (!state.exam) return;
    const r = state.result || scoreExam();
    const head = ["#", "type", "models", "question", "your_answer", "correct_answer", "score", "status"];
    const lines = [head];
    r.rows.forEach((row) => {
      const q = row.q, d = row.d;
      lines.push([
        row.idx + 1, q.type, q.models.join("|"), d.q,
        answerText(q, row.ans), correctText(q),
        row.grade === null ? "" : Math.round(row.grade * 100) / 100, row.status
      ]);
    });
    const csv = "\uFEFF" + lines.map((line) => line.map((x) => `"${String(x == null ? "" : x).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "TTO-Lab-resultados.csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function copySummary() {
    if (!state.exam) return;
    const r = state.result || scoreExam();
    const text = [
      "Factronics TTO Lab", T("res_title") + ": " + Math.round(r.percent) + "%",
      `${fmtNum(Math.round(r.points * 100) / 100)} / ${r.total} ${T("res_points")}`,
      `${T("bp_models")}: ${state.exam.models.join(" + ")}`,
      `${T("res_date")}: ${formatDate(state.exam.finishedAt || Date.now())}`
    ].join("\n");
    const done = () => setAlert(T("res_copied"), "ok");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(done);
    } else {
      const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta);
      ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove(); done();
    }
  }
  function shareBlueprint() {
    const u = new URL(location.href);
    u.search = "";
    u.searchParams.set("models", state.config.models.join(","));
    u.searchParams.set("count", state.config.count);
    u.searchParams.set("minutes", state.config.minutes);
    u.searchParams.set("types", state.config.types.join(","));
    history.replaceState(null, "", u.toString());
    const done = () => setAlert(T("share_done"), "ok");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u.toString()).then(done).catch(done);
    else done();
  }

  /* --------------------------------------------------------------- events */
  function setLang(lang) {
    if (!window.TTO_I18N[lang]) return;
    state.lang = lang;
    localStorage.setItem("tto.lang", lang);
    if (state.screen === "setup") renderSetup();
    else if (state.screen === "exam") { applyStatic(); renderExam(); }
    else if (state.screen === "results") { applyStatic(); renderResults(); }
    else applyStatic();
  }
  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("tto.theme", theme);
    document.getElementById("themeBtn").textContent = theme === "dark" ? "☀" : "◐";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#06111d" : "#0b5cab");
  }
  function applyPreset(p) {
    if (p === "all") state.config.models = MODEL_ORDER.slice();
    else if (p === "none") state.config.models = [];
    else if (p === "6000") state.config.models = ["6230", "6330", "6530"];
    else if (p === "legacy") state.config.models = ["6210", "6320", "6420"];
    else if (p === "6530") state.config.models = ["6530"];
    else if (p === "6230") state.config.models = ["6230"];
    saveConfig();
    renderModelPicks(); updateTypeCounts(); updateSummary();
  }

  document.addEventListener("click", (e) => {
    const lang = e.target.closest("[data-lang]");
    if (lang) { setLang(lang.getAttribute("data-lang")); return; }
    if (e.target.closest("#themeBtn")) { setTheme(state.theme === "dark" ? "light" : "dark"); return; }
    const preset = e.target.closest("[data-preset]");
    if (preset) { applyPreset(preset.getAttribute("data-preset")); return; }
    if (e.target.closest("#startBtn")) { newExam(); return; }
    if (e.target.closest("#shareBtn")) { shareBlueprint(); return; }
    const selfBtn = e.target.closest("[data-self]");
    if (selfBtn) {
      const id = selfBtn.getAttribute("data-self");
      const value = Number(selfBtn.getAttribute("data-score"));
      state.exam.self[id] = value;
      state.result = scoreExam();
      renderResults();
      return;
    }
    const filter = e.target.closest("[data-filter]");
    if (filter) { state.reviewFilter = filter.getAttribute("data-filter"); renderReview(); return; }
    const jump = e.target.closest("[data-jump]");
    if (jump) {
      state.exam.index = Number(jump.getAttribute("data-jump"));
      closeModal(); renderExam(); return;
    }
    const act = e.target.closest("[data-action]");
    if (!act) return;
    const a = act.getAttribute("data-action");
    if (a === "resume") {
      const saved = loadSavedExam();
      if (saved) { state.exam = saved; showScreen("exam"); startTimer(); }
    } else if (a === "discard-saved") {
      localStorage.removeItem("tto.exam.v1");
      renderSetup();
    } else if (a === "palette") {
      showPaletteModal();
    } else if (a === "finish") {
      requestFinish();
    } else if (a === "prev") {
      if (state.exam.index > 0) { state.exam.index--; saveExam(); renderExam(); }
    } else if (a === "next") {
      if (state.exam.index >= state.exam.questions.length - 1) requestFinish();
      else { state.exam.index++; saveExam(); renderExam(); }
    } else if (a === "flag") {
      const id = currentItem().qid;
      if (state.exam.flags[id]) delete state.exam.flags[id]; else state.exam.flags[id] = true;
      saveExam(); renderExam();
    } else if (a === "check") {
      state.exam.checked[currentItem().qid] = true;
      renderQuestion();
    } else if (a === "retry") {
      newExam();
    } else if (a === "new") {
      state.exam = null; state.result = null; localStorage.removeItem("tto.exam.v1"); showScreen("setup");
    } else if (a === "print") {
      window.print();
    } else if (a === "csv") {
      downloadCSV();
    } else if (a === "copy") {
      copySummary();
    }
  });

  document.addEventListener("change", (e) => {
    const model = e.target.closest("[data-model]");
    if (model) {
      const id = model.getAttribute("data-model");
      if (model.checked) { if (!state.config.models.includes(id)) state.config.models.push(id); }
      else state.config.models = state.config.models.filter((m) => m !== id);
      model.closest(".pick").classList.toggle("on", model.checked);
      saveConfig(); updateTypeCounts(); updateSummary(); return;
    }
    const type = e.target.closest("[data-type]");
    if (type) {
      const id = type.getAttribute("data-type");
      if (type.checked) { if (!state.config.types.includes(id)) state.config.types.push(id); }
      else state.config.types = state.config.types.filter((t) => t !== id);
      type.closest(".type-pick").classList.toggle("on", type.checked);
      saveConfig(); updateSummary(); return;
    }
    if (e.target.id === "countSel") {
      state.config.count = clamp(parseInt(e.target.value, 10) || 20, 5, 100);
      saveConfig(); updateSummary(); return;
    }
    if (e.target.id === "durationSel") {
      state.config.minutes = Number(e.target.value) || 0;
      saveConfig(); updateSummary(); return;
    }
    if (["optShuffle", "optPartial", "optInstant", "optExclude"].includes(e.target.id)) {
      state.config.shuffle = document.getElementById("optShuffle").checked;
      state.config.partial = document.getElementById("optPartial").checked;
      state.config.instant = document.getElementById("optInstant").checked;
      state.config.excludeSeen = document.getElementById("optExclude").checked;
      saveConfig(); return;
    }
    const opt = e.target.closest("[data-opt]");
    if (opt && state.exam) {
      const qid = opt.getAttribute("data-qid");
      if (opt.getAttribute("data-opt") === "multi") {
        const arr = Array.isArray(state.exam.answers[qid]) ? state.exam.answers[qid].slice() : [];
        const v = opt.value;
        const i = arr.indexOf(v);
        if (i >= 0) arr.splice(i, 1); else arr.push(v);
        state.exam.answers[qid] = arr;
      } else {
        state.exam.answers[qid] = opt.value;
      }
      state.exam.checked[qid] = false;
      saveExam();
      renderQuestion();
      updateChrome();
    }
  });

  document.addEventListener("input", (e) => {
    if (!state.exam) return;
    const field = e.target.closest("[data-field]");
    if (field) {
      const qid = field.getAttribute("data-qid");
      const i = Number(field.getAttribute("data-field"));
      const arr = Array.isArray(state.exam.answers[qid]) ? state.exam.answers[qid].slice() : [];
      arr[i] = field.value;
      state.exam.answers[qid] = arr;
      state.exam.checked[qid] = false;
      saveExam();
      updateChrome();
      return;
    }
    const open = e.target.closest("[data-open]");
    if (open) {
      state.exam.answers[open.getAttribute("data-open")] = open.value;
      saveExam();
      updateChrome();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!state.exam || state.screen !== "exam") return;
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    if (e.key === "ArrowLeft") { if (state.exam.index > 0) { state.exam.index--; renderExam(); } }
    if (e.key === "ArrowRight") {
      if (state.exam.index < state.exam.questions.length - 1) state.exam.index++;
      renderExam();
    }
  });

  window.addEventListener("beforeunload", () => { if (state.exam && !state.exam.submitted) saveExam(); });

  /* ----------------------------------------------------------------- init */
  function parseParams() {
    const p = new URLSearchParams(location.search);
    let changed = false;
    if (p.get("models")) {
      const ms = p.get("models").split(",").map((x) => x.trim()).filter((m) => MODELS[m]);
      if (ms.length) { state.config.models = ms; changed = true; }
    }
    if (p.get("types")) {
      const ts = p.get("types").split(",").map((x) => x.trim()).filter((t) => TYPE_ORDER.includes(t));
      if (ts.length) { state.config.types = ts; changed = true; }
    }
    if (p.get("count")) {
      const n = parseInt(p.get("count"), 10);
      if (n >= 5 && n <= 100) { state.config.count = n; changed = true; }
    }
    if (p.get("minutes")) {
      const n = Number(p.get("minutes"));
      if ([0, 10, 20, 30, 45, 60, 90].includes(n)) { state.config.minutes = n; changed = true; }
    }
    if (p.get("lang") && window.TTO_I18N[p.get("lang")]) { state.lang = p.get("lang"); changed = true; }
    if (changed) saveConfig();
  }

  parseParams();
  setTheme(state.theme);
  applyStatic();
  renderSetup();
  if (state.exam === null) {
    const saved = loadSavedExam();
    if (saved) state.exam = null; // wait for explicit resume
  }
})();
