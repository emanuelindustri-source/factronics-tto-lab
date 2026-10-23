/* Factronics TTO Lab - local progress, history, error notebook and spaced review.
   Everything stays in localStorage; there is no account and no network call. */
(function () {
  "use strict";

  const KEY = "tto.progress.v2";
  const DAY = 86400000;
  const INTERVALS = [1, 3, 7, 21, 45];
  const MAX_ATTEMPTS = 60;
  const DEFAULT_PROFILE = "Técnico";

  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  function freshProfile(name) {
    return { name: name, createdAt: Date.now(), attempts: [], errors: {} };
  }

  function freshData() {
    return { version: 2, active: DEFAULT_PROFILE, profiles: { [DEFAULT_PROFILE]: freshProfile(DEFAULT_PROFILE) } };
  }

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!raw || typeof raw !== "object" || !raw.profiles || typeof raw.profiles !== "object") return freshData();
      const data = { version: 2, active: raw.active, profiles: {} };
      Object.keys(raw.profiles).forEach((name) => {
        const p = raw.profiles[name] || {};
        data.profiles[name] = {
          name: name,
          createdAt: Number(p.createdAt) || Date.now(),
          attempts: Array.isArray(p.attempts) ? p.attempts.filter((a) => a && a.id) : [],
          errors: p.errors && typeof p.errors === "object" ? p.errors : {}
        };
      });
      if (!Object.keys(data.profiles).length) data.profiles[DEFAULT_PROFILE] = freshProfile(DEFAULT_PROFILE);
      if (!data.profiles[data.active]) data.active = Object.keys(data.profiles)[0];
      return data;
    } catch (e) { return freshData(); }
  }

  let data = load();

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage can be full or disabled */ }
  }
  function profileName(name) {
    if (name && data.profiles[name]) return name;
    return data.active && data.profiles[data.active] ? data.active : Object.keys(data.profiles)[0];
  }
  function profile(name) { return data.profiles[profileName(name)]; }
  function cleanName(name) {
    return String(name == null ? "" : name).replace(/\s+/g, " ").trim().slice(0, 40) || DEFAULT_PROFILE;
  }
  function activeName() { return profileName(data.active); }
  function profiles() {
    return Object.keys(data.profiles).sort((a, b) => {
      if (a === data.active) return -1;
      if (b === data.active) return 1;
      return a.localeCompare(b);
    });
  }
  function setActive(name) {
    if (!data.profiles[name]) return false;
    data.active = name;
    persist();
    return true;
  }
  function createProfile(name) {
    const clean = cleanName(name);
    if (data.profiles[clean]) return { ok: false, name: clean, exists: true };
    data.profiles[clean] = freshProfile(clean);
    data.active = clean;
    persist();
    return { ok: true, name: clean };
  }
  function renameProfile(oldName, newName) {
    if (!data.profiles[oldName]) return { ok: false, exists: false };
    const clean = cleanName(newName);
    if (clean !== oldName && data.profiles[clean]) return { ok: false, exists: true };
    const p = data.profiles[oldName];
    delete data.profiles[oldName];
    p.name = clean;
    data.profiles[clean] = p;
    if (data.active === oldName) data.active = clean;
    persist();
    return { ok: true, name: clean };
  }
  function deleteProfile(name) {
    if (Object.keys(data.profiles).length <= 1) return false;
    if (!data.profiles[name]) return false;
    delete data.profiles[name];
    if (data.active === name) data.active = Object.keys(data.profiles)[0];
    persist();
    return true;
  }

  function applyError(p, id, status, at) {
    if (status === "ok") {
      const e = p.errors[id];
      if (!e) return;
      e.streak = (Number(e.streak) || 0) + 1;
      e.last = at;
      if (e.streak >= 2) delete p.errors[id];
      else e.due = at + 7 * DAY;
      return;
    }
    if (status !== "bad" && status !== "half" && status !== "blank") return;
    const e = p.errors[id] || { count: 0, streak: 0 };
    e.count = (Number(e.count) || 0) + 1;
    e.streak = 0;
    e.last = at;
    e.due = at + INTERVALS[Math.min(e.count - 1, INTERVALS.length - 1)] * DAY;
    p.errors[id] = e;
  }

  function syncErrors(exam, result) {
    if (!exam || !result || !Array.isArray(result.rows)) return;
    const p = profile();
    const at = Number(exam.finishedAt) || Date.now();
    const snapshot = exam.errorSnapshot && typeof exam.errorSnapshot === "object" ? exam.errorSnapshot : {};
    result.rows.forEach((row) => {
      const id = row && row.q && row.q.id;
      if (!id) return;
      if (snapshot[id] === row.status) return;
      applyError(p, id, row.status, at);
      snapshot[id] = row.status;
    });
    exam.errorSnapshot = snapshot;
    if (exam.attemptId) {
      const attempt = p.attempts.find((a) => a.id === exam.attemptId);
      if (attempt) {
        const count = (s) => result.rows.filter((row) => row.status === s).length;
        attempt.ok = count("ok");
        attempt.bad = count("bad") + count("half");
        attempt.blank = count("blank");
        attempt.pending = count("pending");
        attempt.percent = Math.round(Number(result.percent || 0) * 10) / 10;
        attempt.points = Math.round(Number(result.points || 0) * 100) / 100;
        attempt.wrongIds = result.rows
          .filter((row) => row.status === "bad" || row.status === "half" || row.status === "blank")
          .map((row) => row.q.id)
          .filter((id, i, all) => all.indexOf(id) === i);
      }
    }
    persist();
  }

  function recordExam(exam, result) {
    if (!exam || !result || !Array.isArray(result.rows)) return null;
    const p = profile();
    syncErrors(exam, result);
    if (exam.progressRecorded) return p.attempts[0] || null;
    const ended = Number(exam.finishedAt) || Date.now();
    const rows = result.rows;
    const wrong = [];
    rows.forEach((row) => {
      if (row.status === "bad" || row.status === "half" || row.status === "blank") {
        if (!wrong.includes(row.q.id)) wrong.push(row.q.id);
      }
    });
    const count = (s) => rows.filter((row) => row.status === s).length;
    const attempt = {
      id: "att-" + ended + "-" + Math.random().toString(36).slice(2, 7),
      at: ended,
      duration: Math.max(0, Math.round((ended - (Number(exam.startedAt) || ended)) / 1000)),
      percent: Math.round(Number(result.percent || 0) * 10) / 10,
      points: Math.round(Number(result.points || 0) * 100) / 100,
      total: Number(result.total) || rows.length,
      models: Array.isArray(exam.models) ? exam.models.slice() : [],
      types: Array.isArray(exam.types) ? exam.types.slice() : [],
      mode: exam.mode || "exam",
      ok: count("ok"),
      bad: count("bad") + count("half"),
      blank: count("blank"),
      pending: count("pending"),
      wrongIds: wrong
    };
    p.attempts.unshift(attempt);
    p.attempts = p.attempts.slice(0, MAX_ATTEMPTS);
    exam.attemptId = attempt.id;
    exam.progressRecorded = true;
    persist();
    return attempt;
  }

  function errorIds(name) {
    const p = profile(name);
    return Object.keys(p.errors)
      .filter((id) => p.errors[id] && Number(p.errors[id].count) > 0)
      .sort((a, b) => {
        const ea = p.errors[a], eb = p.errors[b];
        return (Number(eb.count) || 0) - (Number(ea.count) || 0) || (Number(ea.due) || 0) - (Number(eb.due) || 0);
      });
  }
  function dueIds(name) {
    const p = profile(name);
    const now = Date.now();
    return Object.keys(p.errors)
      .filter((id) => p.errors[id] && Number(p.errors[id].count) > 0 && Number(p.errors[id].due || 0) <= now)
      .sort((a, b) => (Number(p.errors[a].due) || 0) - (Number(p.errors[b].due) || 0));
  }
  function attempts(name) { return profile(name).attempts.slice(); }
  function attempt(id, name) { return profile(name).attempts.find((a) => a.id === id) || null; }

  function stats(name) {
    const p = profile(name);
    const list = p.attempts;
    const avg = list.length ? list.reduce((n, a) => n + Number(a.percent || 0), 0) / list.length : 0;
    const best = list.length ? Math.max.apply(null, list.map((a) => Number(a.percent) || 0)) : 0;
    const days = new Set();
    list.forEach((a) => {
      const d = new Date(Number(a.at) || 0);
      if (!isNaN(d.getTime())) days.add(d.toDateString());
    });
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (days.has(cursor.toDateString())) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return {
      attempts: list.length,
      average: Math.round(avg * 10) / 10,
      best: Math.round(best * 10) / 10,
      streak: streak,
      errors: errorIds(name).length,
      due: dueIds(name).length
    };
  }

  function exportJSON() {
    return JSON.stringify({ app: "Factronics TTO Lab", version: 2, exportedAt: new Date().toISOString(), data: clone(data) }, null, 2);
  }

  function mergeAttempts(a, b) {
    const map = new Map();
    (a || []).concat(b || []).forEach((x) => { if (x && x.id) map.set(x.id, x); });
    return Array.from(map.values()).sort((x, y) => (Number(y.at) || 0) - (Number(x.at) || 0)).slice(0, MAX_ATTEMPTS);
  }
  function mergeErrors(a, b) {
    const out = Object.assign({}, a || {});
    Object.keys(b || {}).forEach((id) => {
      const x = b[id], y = out[id];
      if (!y) { out[id] = x; return; }
      out[id] = {
        count: Math.max(Number(x.count) || 0, Number(y.count) || 0),
        streak: Math.max(Number(x.streak) || 0, Number(y.streak) || 0),
        last: Math.max(Number(x.last) || 0, Number(y.last) || 0),
        due: Math.min(Number(x.due) || 0, Number(y.due) || 0)
      };
    });
    return out;
  }
  function importJSON(text, replace) {
    let obj;
    try { obj = JSON.parse(text); } catch (e) { return { ok: false, error: "json" }; }
    const incoming = obj && obj.data && obj.data.profiles ? obj.data : (obj && obj.profiles ? obj : null);
    if (!incoming || !incoming.profiles || typeof incoming.profiles !== "object") return { ok: false, error: "format" };
    if (replace) {
      const next = { version: 2, active: incoming.active || Object.keys(incoming.profiles)[0], profiles: {} };
      Object.keys(incoming.profiles).forEach((name) => {
        const p = incoming.profiles[name] || {};
        next.profiles[name] = {
          name: name,
          createdAt: Number(p.createdAt) || Date.now(),
          attempts: Array.isArray(p.attempts) ? p.attempts : [],
          errors: p.errors && typeof p.errors === "object" ? p.errors : {}
        };
      });
      if (!Object.keys(next.profiles).length) return { ok: false, error: "empty" };
      data = next;
    } else {
      Object.keys(incoming.profiles).forEach((name) => {
        const raw = incoming.profiles[name] || {};
        const current = data.profiles[name];
        if (!current) {
          data.profiles[name] = {
            name: name,
            createdAt: Number(raw.createdAt) || Date.now(),
            attempts: Array.isArray(raw.attempts) ? raw.attempts : [],
            errors: raw.errors && typeof raw.errors === "object" ? raw.errors : {}
          };
        } else {
          current.attempts = mergeAttempts(current.attempts, raw.attempts);
          current.errors = mergeErrors(current.errors, raw.errors);
        }
      });
      if (incoming.active && data.profiles[incoming.active]) data.active = incoming.active;
    }
    if (!data.profiles[data.active]) data.active = Object.keys(data.profiles)[0];
    persist();
    return { ok: true, active: data.active };
  }

  window.TTOProgress = {
    storageKey: KEY,
    DEFAULT_PROFILE: DEFAULT_PROFILE,
    activeName: activeName,
    profiles: profiles,
    profile: profile,
    setActive: setActive,
    createProfile: createProfile,
    renameProfile: renameProfile,
    deleteProfile: deleteProfile,
    recordExam: recordExam,
    syncErrors: syncErrors,
    errorIds: errorIds,
    dueIds: dueIds,
    attempts: attempts,
    attempt: attempt,
    stats: stats,
    exportJSON: exportJSON,
    importJSON: importJSON
  };
})();
