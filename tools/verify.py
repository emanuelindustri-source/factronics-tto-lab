#!/usr/bin/env python3
"""Verify the static site, shared bank, translations and Android artifact.

Run from the repository root:

    python tools/verify.py

No third-party packages are required. If Node.js is available, the script also
checks that android/app/src/main/assets/ui.json is exactly the export of
assets/js/i18n.js.
"""
from __future__ import annotations

import hashlib
import json
import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent.parent
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
BANK_JS = ROOT / "assets" / "js" / "bank.js"
ANDROID_BANK = ROOT / "android" / "app" / "src" / "main" / "assets" / "bank.json"
UI_JSON = ROOT / "android" / "app" / "src" / "main" / "assets" / "ui.json"
APK = ROOT / "download" / "Factronics-TTO-Lab.apk"
APK_SHA = ROOT / "download" / "Factronics-TTO-Lab.apk.sha256"
MANIFEST = ROOT / "android" / "AndroidManifest.xml"
VERSION_FILE = ROOT / "VERSION"

LANGS = ("es", "en", "pt")
MODEL_IDS = {"6210", "6230", "6320", "6330", "6420", "6530"}
TYPES = {"single", "multi", "fill", "describe", "calc", "errmap", "errorfix"}

errors: list[str] = []
warnings: list[str] = []
checks = 0


def check(condition: bool, message: str) -> bool:
    global checks
    checks += 1
    if not condition:
        errors.append(message)
    return condition


def warn(message: str) -> None:
    warnings.append(message)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFD", str(text or "").lower())
    return re.sub(r"\s+", " ", "".join(ch for ch in text if not unicodedata.combining(ch))).strip()


def load_bank() -> dict:
    raw = read(BANK_JS)
    match = re.search(r"window\.TTO_BANK\s*=\s*(\{.*\})\s*;?\s*$", raw, re.S)
    if not match:
        raise SystemExit("ERROR: no se pudo extraer window.TTO_BANK de bank.js")
    return json.loads(match.group(1))


def load_ui() -> dict:
    if not UI_JSON.exists():
        raise SystemExit("ERROR: falta android/app/src/main/assets/ui.json")
    return json.loads(read(UI_JSON))


def verify_version() -> str:
    check(VERSION_FILE.exists(), "Falta VERSION")
    version = read(VERSION_FILE).strip() if VERSION_FILE.exists() else ""
    check(bool(re.fullmatch(r"\d+\.\d+\.\d+", version)), f"VERSION no es semver: {version!r}")

    sw = read(ROOT / "sw.js")
    m = re.search(r'const VERSION = "([^"]+)"', sw)
    check(bool(m and m.group(1) == version), "sw.js VERSION no coincide con VERSION")

    manifest = read(MANIFEST)
    m = re.search(r'android:versionName="([^"]+)"', manifest)
    check(bool(m and m.group(1) == version), "AndroidManifest versionName no coincide con VERSION")
    code_match = re.search(r'android:versionCode="(\d+)"', manifest)
    manifest_code = int(code_match.group(1)) if code_match else 0

    version_json = json.loads(read(ROOT / "version.json"))
    check(version_json.get("version") == version, "version.json version no coincide con VERSION")
    check(int(version_json.get("versionCode") or 0) == manifest_code, "version.json versionCode no coincide con AndroidManifest")
    for name in ("index.html", "generator/index.html", "resultado/index.html", "verificar/index.html"):
        html = read(ROOT / name)
        meta = re.search(r'<meta name="app-version" content="([^"]+)"', html)
        check(bool(meta and meta.group(1) == version), f"{name}: meta app-version no coincide con VERSION")

    publisher = read(ROOT / "tools" / "publish_github.py")
    m = re.search(r'RELEASE_TAG = "v([^"]+)"', publisher)
    check(bool(m and m.group(1) == version), "publish_github.py RELEASE_TAG no coincide con VERSION")

    for name in ("index.html", "generator/index.html", "resultado/index.html", "verificar/index.html"):
        check(f"v{version}" in read(ROOT / name), f"{name} no muestra v{version}")

    check(f"versión `{version}`" in read(ROOT / "README.md"), "README no documenta la versión actual")
    check(f"`{version}`" in read(ROOT / "download" / "README.md"), "download/README no documenta la versión actual")
    return version


def verify_bank(bank: dict) -> dict[str, int]:
    questions = bank.get("questions") or []
    models = bank.get("models") or {}
    check(len(questions) == 356, f"Se esperaban 356 preguntas, hay {len(questions)}")
    check(set(models) == MODEL_IDS, f"Modelos inesperados: {sorted(set(models) ^ MODEL_IDS)}")

    ids = [q.get("id") for q in questions]
    check(len(ids) == len(set(ids)), "Hay IDs de pregunta duplicados")
    statements: set[str] = set()
    by_type: dict[str, int] = {}
    by_model: dict[str, int] = {m: 0 for m in MODEL_IDS}

    for q in questions:
        qid = q.get("id", "?")
        qtype = q.get("type")
        check(qtype in TYPES, f"{qid}: tipo inválido {qtype!r}")
        by_type[qtype] = by_type.get(qtype, 0) + 1
        qmodels = q.get("models") or []
        check(bool(qmodels), f"{qid}: sin modelos")
        for model in qmodels:
            check(model in MODEL_IDS, f"{qid}: modelo inválido {model!r}")
            if model in by_model:
                by_model[model] += 1
        for lang in LANGS:
            d = (q.get("i18n") or {}).get(lang) or {}
            check(bool(str(d.get("q", "")).strip()), f"{qid}/{lang}: pregunta vacía")
            if lang == "es" and d.get("q"):
                statements.add(normalize(d["q"]))
            if qtype in ("single", "errmap", "multi"):
                options = d.get("options") or []
                opt_ids = [o.get("id") for o in options]
                answers = d.get("answer") or []
                check(len(opt_ids) == len(set(opt_ids)), f"{qid}/{lang}: IDs de opción duplicados")
                check(bool(options), f"{qid}/{lang}: sin opciones")
                check(bool(answers), f"{qid}/{lang}: sin respuesta")
                for answer in answers:
                    check(answer in opt_ids, f"{qid}/{lang}: respuesta {answer!r} fuera de opciones")
                if qtype in ("single", "errmap"):
                    check(len(answers) == 1, f"{qid}/{lang}: {qtype} debería tener una respuesta")
                if qtype != "multi":
                    continue
            if qtype in ("fill", "calc"):
                fields = d.get("fields") or []
                check(bool(fields), f"{qid}/{lang}: sin campos")
                for field in fields:
                    check(bool(field.get("answers")), f"{qid}/{lang}: campo sin respuesta")
                    check(bool(str(field.get("label", "")).strip()), f"{qid}/{lang}: campo sin etiqueta")
            if qtype in ("describe", "errorfix"):
                check(bool(str(d.get("model", "")).strip()), f"{qid}/{lang}: abierta sin modelo")
                check(bool(d.get("rubric")), f"{qid}/{lang}: abierta sin rúbrica")

    check(len(statements) == 332, f"Se esperaban 332 enunciados únicos, hay {len(statements)}")
    check(sum(by_type.values()) == len(questions), "El recuento por tipo no cuadra")
    check(all(by_model[m] > 0 for m in MODEL_IDS), "Algún modelo no tiene preguntas")

    android = json.loads(read(ANDROID_BANK))
    check(android == bank, "android/.../bank.json no coincide con assets/js/bank.js")
    return {"questions": len(questions), "unique": len(statements), "by_type": by_type, "by_model": by_model}


def verify_i18n(ui: dict) -> int:
    for lang in LANGS:
        check(isinstance(ui.get(lang), dict), f"ui.json: falta el idioma {lang}")
    base = set((ui.get("es") or {}).keys())
    check(len(base) >= 350, f"ui.json tiene muy pocas claves: {len(base)}")
    for lang in ("en", "pt"):
        current = set((ui.get(lang) or {}).keys())
        check(current == base, f"ui.json/{lang}: claves faltantes {sorted(base - current)[:5]} o extra {sorted(current - base)[:5]}")

    html_keys: set[str] = set()
    for name in ("index.html", "generator/index.html", "resultado/index.html", "verificar/index.html"):
        html = read(ROOT / name)
        for attr in ("data-i18n", "data-i18n-aria", "data-i18n-title", "data-i18n-placeholder"):
            html_keys.update(re.findall(rf'{attr}="([^"]+)"', html))
    missing = sorted(html_keys - base)
    check(not missing, f"HTML usa claves i18n inexistentes: {missing}")

    node = shutil.which("node")
    if node:
        result = subprocess.run(
            [node, str(ROOT / "tools" / "export_ui.js"), "--check"],
            cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace",
        )
        check(result.returncode == 0, "ui.json no coincide con i18n.js; ejecuta node tools/export_ui.js\n" + result.stderr.strip())
    else:
        warn("Node.js no disponible: no se pudo comparar ui.json con i18n.js")
    return len(base)


def verify_html() -> None:
    for name in ("index.html", "generator/index.html", "resultado/index.html", "verificar/index.html"):
        html = read(ROOT / name)
        check("<!DOCTYPE html>" in html, f"{name}: falta DOCTYPE")
        check(re.search(r'<html[^>]+lang="', html) is not None, f"{name}: falta lang en html")
        check("<title>" in html, f"{name}: falta title")
        check('name="description"' in html, f"{name}: falta meta description")
        check('name="viewport"' in html, f"{name}: falta viewport")
        ids = re.findall(r'\bid="([^"]+)"', html)
        duplicates = sorted({x for x in ids if ids.count(x) > 1})
        check(not duplicates, f"{name}: IDs duplicados {duplicates}")


def verify_links() -> None:
    for name in ("index.html", "generator/index.html", "resultado/index.html", "verificar/index.html"):
        source = ROOT / name
        html = read(source)
        for attr in ("href", "src"):
            for url in re.findall(rf'{attr}="([^"]+)"', html):
                if url.startswith(("#", "http://", "https://", "mailto:", "data:", "javascript:")):
                    continue
                target = unquote(url.split("#", 1)[0].split("?", 1)[0])
                if not target:
                    continue
                path = (source.parent / target).resolve()
                if path.is_dir():
                    path = path / "index.html"
                check(path.exists(), f"{name}: enlace roto {url}")

    manifest = json.loads(read(ROOT / "manifest.webmanifest"))
    for icon in manifest.get("icons", []):
        check((ROOT / icon["src"]).exists(), f"manifest: icono inexistente {icon['src']}")

    sw = read(ROOT / "sw.js")
    core_match = re.search(r"const CORE = \[(.*?)\];", sw, re.S)
    check(core_match is not None, "sw.js: no se encontró CORE")
    if core_match:
        for item in re.findall(r'"([^"]+)"', core_match.group(1)):
            path = ROOT / item.lstrip("./")
            if path.is_dir():
                path = path / "index.html"
            check(path.exists(), f"sw.js: recurso de caché inexistente {item}")


def verify_result_flow() -> None:
    for rel in (
        "assets/js/result.js",
        "assets/js/certificate.js",
        "assets/js/verificar.js",
        "assets/js/resultado.js",
        "verificar/index.html",
        "resultado/index.html",
        "assets/js/vendor/qrcode.js",
    ):
        check((ROOT / rel).exists(), f"Falta {rel}")

    verificar = read(ROOT / "verificar" / "index.html")
    check('name="verify-base"' in verificar, "verificar/index.html: falta meta verify-base")
    check("assets/js/certificate.js" in verificar, "verificar/index.html: no carga certificate.js")
    check("assets/js/verificar.js" in verificar, "verificar/index.html: no carga verificar.js")
    check('name="robots" content="noindex' in verificar, "verificar/index.html: deber��a ser noindex")

    generator = read(ROOT / "generator" / "index.html")
    for token in ("cert-png", "verify-open", "verify-copy", "resQr", "resCode", "certificate.js"):
        check(token in generator, f"generator/index.html: falta {token}")
    check('name="verify-base"' in generator, "generator/index.html: falta meta verify-base")

    js = read(ROOT / "assets" / "js" / "generator.js")
    for token in ("downloadCertificate", "verifyUrl", "renderResultVerify", "copyVerifyLink"):
        check(token in js, f"generator.js: falta {token}")
    check("mailto:" not in js, "generator.js: todav��a contiene mailto")

    android = read(ROOT / "android" / "app" / "src" / "main" / "java" / "com" / "factronics" / "tto" / "lab" / "MainActivity.java")
    check("verificar/?d=" in android, "Android: el QR no apunta a verificar/")
    check("shareCsv" in android, "Android: falta compartir CSV")
    check("EXTRA_EMAIL" not in android, "Android: todav��a contiene EXTRA_EMAIL")

    result_js = read(ROOT / "assets" / "js" / "result.js")
    for token in ("verifyUrl", "fingerprint", "VERIFY_BASE"):
        check(token in result_js, f"result.js: falta {token}")

    sw = read(ROOT / "sw.js")
    for token in ("verificar/", "verificar/index.html", "certificate.js", "verificar.js"):
        check(token in sw, f"sw.js: falta {token}")

    i18n = read(ROOT / "assets" / "js" / "i18n.js")
    for token in ("verify_ok", "verify_bad", "cert_doc_title", "android_csv", "doc_cert_hint"):
        check(token in i18n, f"i18n.js: falta {token}")


def verify_apk(version: str) -> tuple[int, str]:
    check(APK.exists(), "Falta download/Factronics-TTO-Lab.apk")
    check(APK_SHA.exists(), "Falta download/Factronics-TTO-Lab.apk.sha256")
    if not APK.exists() or not APK_SHA.exists():
        return 0, ""
    digest = hashlib.sha256(APK.read_bytes()).hexdigest()
    expected = read(APK_SHA).strip().split()[0].lower()
    check(digest == expected, "El SHA-256 del APK no coincide con .sha256")
    check(digest in read(ROOT / "download" / "README.md"), "download/README no publica el hash actual")
    manifest = read(MANIFEST)
    m = re.search(r'android:versionName="([^"]+)"', manifest)
    check(bool(m and m.group(1) == version), "La versión del APK no coincide con VERSION")
    return APK.stat().st_size, digest


def verify_secrets() -> None:
    patterns = {
        "token clásico de GitHub": re.compile(r"ghp_[A-Za-z0-9]{20,}"),
        "token fine-grained de GitHub": re.compile(r"github_pat_[A-Za-z0-9_]{20,}"),
        "clave AWS": re.compile(r"AKIA[0-9A-Z]{16}"),
        "clave privada": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    }
    skip_dirs = {".git", "node_modules", "android/build", "__pycache__", ".venv"}
    skip_suffixes = {".apk", ".png", ".jpg", ".jpeg", ".webp", ".ico", ".woff", ".woff2", ".ttf", ".pdf", ".keystore"}
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() in skip_suffixes:
            continue
        rel = path.relative_to(ROOT).as_posix()
        if any(rel == d or rel.startswith(d + "/") for d in skip_dirs):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for label, pattern in patterns.items():
            if pattern.search(text):
                errors.append(f"Posible {label} en {rel}")


def main() -> int:
    version = verify_version()
    bank = load_bank()
    stats = verify_bank(bank)
    ui = load_ui()
    key_count = verify_i18n(ui)
    verify_html()
    verify_links()
    verify_result_flow()
    apk_size, digest = verify_apk(version)
    verify_secrets()

    print("Factronics TTO Lab · verificación")
    print(f"Versión: {version}")
    print(f"Banco: {stats['questions']} preguntas · {stats['unique']} enunciados únicos")
    print("Tipos: " + " · ".join(f"{k}: {v}" for k, v in sorted(stats["by_type"].items())))
    print("Modelos: " + " · ".join(f"{k}: {v}" for k, v in stats["by_model"].items()))
    print(f"i18n: {key_count} claves × {len(LANGS)} idiomas")
    print(f"APK: {apk_size / 1024:.1f} KB · {digest}")
    print(f"Comprobaciones: {checks}")

    if warnings:
        print("\nAvisos:")
        for item in warnings:
            print("  ! " + item)
    if errors:
        print("\nErrores:")
        for item in errors:
            print("  ✗ " + item)
        print(f"\nRESULTADO: {len(errors)} error(es)")
        return 1
    print("\nRESULTADO: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
