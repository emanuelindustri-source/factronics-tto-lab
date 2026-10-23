#!/usr/bin/env python3
"""Publish the static site, Android sources and APK to GitHub via REST.

The token is read only from the GITHUB_TOKEN environment variable. It is never
written to a file or printed.

Example:
    $env:GITHUB_TOKEN = "github_pat_..."
    python tools/publish_github.py --owner emanuelindustri-source --repo factronics-tto-lab
"""
from __future__ import annotations

import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
API = "https://api.github.com"
UPLOADS = "https://uploads.github.com"
RELEASE_TAG = "v1.2.0"
APK = ROOT / "download" / "Factronics-TTO-Lab.apk"
EXCLUDED = {
    ".git", ".idea", ".vscode", "__pycache__", ".venv", "node_modules",
    "android/build", "android/.gradle", ".pytest_cache",
}
EXCLUDED_SUFFIXES = {".pyc", ".pyo", ".log", ".idsig", ".class"}


def token() -> str:
    value = os.environ.get("GITHUB_TOKEN", "").strip()
    if not value:
        sys.exit("Define GITHUB_TOKEN (fine-grained PAT with repo contents/pages/releases permissions).")
    return value


def request(method: str, url: str, data=None, content_type="application/json", binary=False, token_value=None):
    headers = {
        "Authorization": "Bearer " + (token_value or token()),
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "factronics-tto-lab-publisher",
    }
    if data is not None:
        if binary:
            body = data
        elif isinstance(data, (dict, list)):
            body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        else:
            body = str(data).encode("utf-8")
        headers["Content-Type"] = content_type
    else:
        body = None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            payload = response.read()
            if not payload:
                return response.status, None
            try:
                return response.status, json.loads(payload.decode("utf-8"))
            except json.JSONDecodeError:
                return response.status, payload
    except urllib.error.HTTPError as exc:
        payload = exc.read().decode("utf-8", "replace")
        try:
            parsed = json.loads(payload)
        except json.JSONDecodeError:
            parsed = payload
        return exc.code, parsed
    except urllib.error.URLError as exc:
        sys.exit("Network error: " + str(exc.reason))


def files_to_publish() -> list[Path]:
    out: list[Path] = []
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(ROOT).as_posix()
        parts = rel.split("/")
        if any(part in EXCLUDED for part in parts):
            continue
        if any(rel == ex or rel.startswith(ex + "/") for ex in EXCLUDED):
            continue
        if path.suffix.lower() in EXCLUDED_SUFFIXES:
            continue
        if rel.endswith(".apk") and rel != "download/Factronics-TTO-Lab.apk":
            continue
        out.append(path)
    return out


def ensure_repo(owner: str, repo: str, branch: str) -> dict:
    status, data = request("GET", f"{API}/repos/{owner}/{repo}")
    if status == 200:
        print(f"Repositorio existente: https://github.com/{owner}/{repo}")
        return data
    if status != 404:
        sys.exit(f"No se pudo consultar el repositorio ({status}): {data}")

    print("Creando repositorio...")
    status, data = request("POST", f"{API}/user/repos", {
        "name": repo,
        "description": "Factronics TTO Lab: entrenamiento técnico Videojet 6210/6230 y DataFlex 6320/6330/6420/6530. Proyecto de Factronics Venezuela; Videojet no lo solicitó ni autorizó.",
        "homepage": f"https://{owner}.github.io/{repo}/",
        "private": False,
        "has_issues": True,
        "has_projects": False,
        "has_wiki": False,
        "auto_init": False,
    })
    if status not in (200, 201):
        sys.exit(f"No se pudo crear el repositorio ({status}): {data}")
    print(f"Creado: {data.get('html_url')}")
    # Give GitHub a moment to initialize the empty repository.
    time.sleep(1.5)
    return data


def upload_file(owner: str, repo: str, branch: str, path: Path, rel: str) -> None:
    raw = path.read_bytes()
    encoded = base64.b64encode(raw).decode("ascii")
    url = f"{API}/repos/{owner}/{repo}/contents/{urllib.parse.quote(rel, safe='/')}"

    status, current = request("GET", url + "?ref=" + urllib.parse.quote(branch))
    sha = current.get("sha") if status == 200 and isinstance(current, dict) else None
    if status not in (200, 404):
        print(f"  ! {rel}: GET {status}")
        return

    # GitHub does not allow a branch name in the first commit of a completely
    # empty repository. Omit it only in that specific case.
    branch_status, _ = request("GET", f"{API}/repos/{owner}/{repo}/branches/{urllib.parse.quote(branch)}")
    body = {
        "message": f"chore: publish {rel}",
        "content": encoded,
    }
    if sha or branch_status == 200:
        body["branch"] = branch
    if sha:
        body["sha"] = sha
    status, data = request("PUT", url, body)
    if status in (200, 201):
        action = "actualizado" if sha else "subido"
        print(f"  ✓ {rel} ({action}, {len(raw)} B)")
    else:
        print(f"  ✗ {rel}: {status} {data}")


def delete_file(owner: str, repo: str, branch: str, rel: str) -> None:
    url = f"{API}/repos/{owner}/{repo}/contents/{urllib.parse.quote(rel, safe='/')}"
    status, current = request("GET", url + "?ref=" + urllib.parse.quote(branch))
    if status == 404:
        print(f"  · {rel}: ya no existe")
        return
    if status != 200 or not isinstance(current, dict):
        print(f"  ✗ {rel}: GET {status}")
        return
    status, data = request("DELETE", url, {
        "message": f"chore: remove legacy {rel}",
        "sha": current["sha"],
        "branch": branch,
    })
    if status in (200, 204):
        print(f"  ✓ {rel}: eliminado")
    else:
        print(f"  ✗ {rel}: DELETE {status} {data}")


def ensure_release(owner: str, repo: str, branch: str) -> dict:
    status, data = request("GET", f"{API}/repos/{owner}/{repo}/releases/tags/{RELEASE_TAG}")
    if status == 200 and isinstance(data, dict):
        print(f"Release existente: {RELEASE_TAG}")
        return data
    if status != 404:
        sys.exit(f"No se pudo consultar el release ({status}): {data}")

    print("Creando release...")
    status, data = request("POST", f"{API}/repos/{owner}/{repo}/releases", {
        "tag_name": RELEASE_TAG,
        "target_commitish": branch,
        "name": "Factronics TTO Lab 1.2.0",
        "body": (
            "Aplicación Android nativa y generador web de evaluaciones TTO de Factronics Venezuela.\n\n"
            "- 6 modelos: Videojet 6210, 6230 y DataFlex 6320, 6330, 6420, 6530\n"
            "- 7 tipos de pregunta\n"
            "- Modos examen, estudio y repaso\n"
            "- Progreso, historial, cuaderno de errores y repetición espaciada\n"
            "- Biblioteca de preguntas con búsqueda y filtros\n"
            "- PWA instalable y APK con tema claro/oscuro y reanudar sesión\n"
            "- Español, English, Português\n"
            "- Offline, sin WebView, sin permisos de red\n\n"
            "Proyecto de Factronics Venezuela, distribuidor oficial de Videojet. "
            "Desarrollado por Khristyan Hidalgo, técnico de campo certificado. "
            "Videojet Technologies no solicitó, patrocinó ni autorizó este proyecto.\n\n"
            "APK firmado con clave de entrenamiento autofirmada."
        ),
        "draft": False,
        "prerelease": False,
    })
    if status not in (200, 201):
        sys.exit(f"No se pudo crear el release ({status}): {data}")
    print(f"Release: {data.get('html_url')}")
    return data


def upload_asset(owner: str, repo: str, release: dict) -> None:
    if not APK.exists():
        print("! No existe download/Factronics-TTO-Lab.apk; se omite el asset.")
        return
    sha = APK.with_name(APK.name + ".sha256")
    targets = [(APK, "application/vnd.android.package-archive")]
    if sha.exists() and sha.read_text(encoding="utf-8").strip():
        targets.append((sha, "text/plain"))

    assets_url = release.get("assets_url") or f"{API}/repos/{owner}/{repo}/releases/{release['id']}/assets"
    status, assets = request("GET", assets_url)
    if status == 200 and isinstance(assets, list):
        names = {target.name for target, _ in targets}
        for asset in assets:
            if asset.get("name") in names:
                request("DELETE", asset["url"])
                print(f"  · asset anterior eliminado: {asset.get('name')}")

    for target, content_type in targets:
        upload_url = (
            f"{UPLOADS}/repos/{owner}/{repo}/releases/{release['id']}/assets"
            f"?name={urllib.parse.quote(target.name)}"
        )
        status, data = request(
            "POST", upload_url, target.read_bytes(),
            content_type=content_type, binary=True,
        )
        if status in (200, 201):
            print(f"  ✓ {target.name} ({target.stat().st_size} B)")
            print(f"    {data.get('browser_download_url')}")
        else:
            print(f"  ✗ asset {target.name}: {status} {data}")


def ensure_pages(owner: str, repo: str, branch: str) -> None:
    body = {"source": {"branch": branch, "path": "/"}}
    status, data = request("POST", f"{API}/repos/{owner}/{repo}/pages", body)
    if status in (201, 204):
        print(f"Pages activado: https://{owner}.github.io/{repo}/")
        return
    if status in (409, 422):
        status, data = request("PUT", f"{API}/repos/{owner}/{repo}/pages", body)
        if status in (200, 204):
            print(f"Pages actualizado: https://{owner}.github.io/{repo}/")
            return
    print(f"! Pages no se pudo activar automáticamente ({status}): {data}")
    print("  Actívalo en Settings → Pages → Deploy from a branch → main / (root).")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--owner", default="emanuelindustri-source")
    parser.add_argument("--repo", default="factronics-tto-lab")
    parser.add_argument("--branch", default="main")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--only", action="append", default=[], metavar="PATH", help="Subir solo este archivo (repetible).")
    parser.add_argument("--delete", action="append", default=[], metavar="PATH", help="Eliminar una ruta del repositorio (repetible).")
    parser.add_argument("--skip-pages", action="store_true")
    parser.add_argument("--skip-release", action="store_true")
    args = parser.parse_args()

    files = files_to_publish()
    if args.only:
        wanted = set(args.only)
        files = [p for p in files if p.relative_to(ROOT).as_posix() in wanted]
        if not files:
            sys.exit("--only no coincide con ningún archivo publicable.")
    total = sum(p.stat().st_size for p in files)
    print(f"Archivos: {len(files)} · {total / 1024:.1f} KB")
    if args.dry_run:
        for p in files:
            print("  " + p.relative_to(ROOT).as_posix())
        return

    repo_data = ensure_repo(args.owner, args.repo, args.branch)
    branch = repo_data.get("default_branch") or args.branch
    print(f"Rama de publicación: {branch}")
    print("Subiendo contenido...")
    for index, path in enumerate(files, 1):
        rel = path.relative_to(ROOT).as_posix()
        print(f"[{index}/{len(files)}] {rel}")
        upload_file(args.owner, args.repo, branch, path, rel)

    if args.delete:
        print("Eliminando rutas obsoletas...")
        for rel in args.delete:
            delete_file(args.owner, args.repo, branch, rel)

    if not args.skip_release:
        release = ensure_release(args.owner, args.repo, branch)
        upload_asset(args.owner, args.repo, release)

    if not args.skip_pages:
        ensure_pages(args.owner, args.repo, branch)

    print()
    print("Listo:")
    print(f"  Repo:   https://github.com/{args.owner}/{args.repo}")
    print(f"  Pages:  https://{args.owner}.github.io/{args.repo}/")
    print(f"  APK:    https://github.com/{args.owner}/{args.repo}/releases/latest/download/Factronics-TTO-Lab.apk")
    print("  Revoca o rota el token utilizado.")


if __name__ == "__main__":
    main()
