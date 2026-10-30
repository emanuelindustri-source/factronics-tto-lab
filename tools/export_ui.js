#!/usr/bin/env node
/* Export the shared web dictionary (assets/js/i18n.js) to the Android asset.
   Run: node tools/export_ui.js */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "assets", "js", "i18n.js");
const target = path.join(root, "android", "app", "src", "main", "assets", "ui.json");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(source, "utf8"), sandbox, { filename: source });

const dict = sandbox.window.TTO_I18N;
if (!dict || !dict.es || !dict.en || !dict.pt) {
  console.error("ERROR: i18n.js did not expose TTO_I18N with es/en/pt.");
  process.exit(1);
}

const base = Object.keys(dict.es);
for (const lang of ["en", "pt"]) {
  const missing = base.filter((key) => !(key in dict[lang]));
  const extra = Object.keys(dict[lang]).filter((key) => !(key in dict.es));
  if (missing.length || extra.length) {
    console.error(`ERROR: ${lang} is out of sync (missing ${missing.length}, extra ${extra.length}).`);
    process.exit(1);
  }
}

const serialized = JSON.stringify(dict, null, 2) + "\n";
const checkOnly = process.argv.includes("--check");
if (checkOnly) {
  const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
  if (current !== serialized) {
    console.error("ERROR: android/ui.json is stale. Run: node tools/export_ui.js");
    process.exit(1);
  }
  console.log(`ui.json OK: ${Object.keys(dict).length} languages · ${base.length} keys`);
} else {
  fs.writeFileSync(target, serialized, "utf8");
  console.log(`ui.json: ${Object.keys(dict).length} languages · ${base.length} keys`);
}
