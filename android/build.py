#!/usr/bin/env python3
"""Build the native Factronics TTO Lab APK with the Android SDK command-line tools.

No Gradle required. Tested with build-tools 34.0.0, platform android-34 and JDK 17.
Run from the repository root:  python android/build.py
"""
from __future__ import annotations

import glob
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
BUILD = ROOT / "build"
MAIN = ROOT / "app" / "src" / "main"
MANIFEST = ROOT / "AndroidManifest.xml"
RES = MAIN / "res"
ASSETS = MAIN / "assets"
JAVA = MAIN / "java"


def fail(message: str) -> None:
    print("ERROR: " + message, file=sys.stderr)
    raise SystemExit(1)


def find_sdk() -> Path:
    for key in ("ANDROID_HOME", "ANDROID_SDK_ROOT"):
        value = os.environ.get(key)
        if value and Path(value).is_dir():
            return Path(value)
    default = Path.home() / "AppData" / "Local" / "Android" / "Sdk"
    if default.is_dir():
        return default
    fail("Android SDK not found. Define ANDROID_HOME.")


def find_jdk() -> Path:
    value = os.environ.get("JAVA_HOME")
    if value and (Path(value) / "bin" / "javac.exe").exists():
        return Path(value)
    fail("JAVA_HOME must point to a JDK (javac not found).")


def latest_build_tools(sdk: Path) -> Path:
    base = sdk / "build-tools"
    if not base.is_dir():
        fail("Android build-tools not installed.")
    candidates = [p for p in base.iterdir() if p.is_dir() and (p / "aapt2.exe").exists()]
    if not candidates:
        fail("aapt2.exe not found in build-tools.")
    def key(p: Path) -> tuple:
        out = []
        for part in p.name.replace("-", ".").split("."):
            digits = "".join(ch for ch in part if ch.isdigit())
            out.append(int(digits) if digits else 0)
        return tuple(out)

    return sorted(candidates, key=key)[-1]


def android_platform(sdk: Path) -> Path:
    base = sdk / "platforms"
    preferred = base / "android-34" / "android.jar"
    if preferred.exists():
        return preferred
    candidates = [p / "android.jar" for p in base.iterdir() if p.is_dir() and (p / "android.jar").exists()]
    if not candidates:
        fail("No Android platform installed (platforms/android-34/android.jar missing).")
    def api(p: Path) -> int:
        digits = "".join(ch for ch in p.parent.name if ch.isdigit())
        return int(digits) if digits else 0
    return sorted(candidates, key=api)[-1]


def tool(build_tools: Path, name: str) -> Path:
    candidates = [build_tools / name]
    if os.name == "nt":
        candidates.insert(0, build_tools / (name + ".bat"))
        candidates.insert(1, build_tools / (name + ".exe"))
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return candidates[0]


def validate_assets() -> None:
    for name in ("bank.json", "ui.json"):
        path = ASSETS / name
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            fail(f"{name} is not valid JSON: {exc}")
    version = (REPO / "VERSION").read_text(encoding="utf-8").strip()
    manifest = MANIFEST.read_text(encoding="utf-8")
    match = re.search(r'android:versionName="([^"]+)"', manifest)
    if not match or match.group(1) != version:
        fail(f"AndroidManifest versionName does not match VERSION ({version}).")


def run(args: list[str]) -> None:
    printable = " ".join(str(a) for a in args)
    print("> " + printable)
    if os.name == "nt" and str(args[0]).lower().endswith((".bat", ".cmd")):
        subprocess.run(subprocess.list2cmdline([str(a) for a in args]), shell=True, check=True)
    else:
        subprocess.run([str(a) for a in args], check=True)


def main() -> None:
    sdk = find_sdk()
    jdk = find_jdk()
    bt = latest_build_tools(sdk)
    platform = android_platform(sdk)
    if not platform.exists():
        fail("Android platform not installed.")
    android_jar = str(platform)
    javac = str(jdk / "bin" / "javac.exe")
    keytool = str(jdk / "bin" / "keytool.exe")
    jar = str(jdk / "bin" / "jar.exe")
    aapt2 = tool(bt, "aapt2")
    d8 = tool(bt, "d8")
    zipalign = tool(bt, "zipalign")
    apksigner = tool(bt, "apksigner")

    validate_assets()

    # Best-effort cleanup. Windows search/antivirus can briefly lock generated
    # folders; rebuilding into them is still safe because every tool overwrites.
    if BUILD.exists():
        for name in ("gen", "classes", "dex"):
            shutil.rmtree(BUILD / name, ignore_errors=True)
        for name in ("res.zip", "base.apk", "classes.jar", "aligned.apk", "Factronics-TTO-Lab.apk"):
            try:
                (BUILD / name).unlink()
            except FileNotFoundError:
                pass
            except PermissionError:
                pass
    for d in ("gen", "classes", "dex"):
        (BUILD / d).mkdir(parents=True, exist_ok=True)
    download = REPO / "download"
    download.mkdir(exist_ok=True)

    print("SDK:", sdk)
    print("Build tools:", bt)
    print("JDK:", jdk)
    print("Platform:", platform.parent.name)

    res_zip = BUILD / "res.zip"
    base_apk = BUILD / "base.apk"
    run([aapt2, "compile", "--dir", RES, "-o", res_zip])
    run([
        aapt2, "link", "-o", base_apk,
        "-I", android_jar,
        "--manifest", MANIFEST,
        "-R", res_zip,
        "--java", BUILD / "gen",
        "-A", ASSETS,
        "--auto-add-overlay",
    ])

    sources = sorted(glob.glob(str(JAVA / "**" / "*.java"), recursive=True))
    sources += sorted(glob.glob(str(BUILD / "gen" / "**" / "*.java"), recursive=True))
    if not sources:
        fail("No Java sources found.")
    run([
        javac, "-source", "8", "-target", "8", "-Xlint:-options", "-encoding", "UTF-8",
        "-classpath", android_jar, "-d", BUILD / "classes",
    ] + sources)

    classes_jar = BUILD / "classes.jar"
    run([jar, "cf", classes_jar, "-C", BUILD / "classes", "."])
    run([
        d8, "--lib", android_jar, "--min-api", "24",
        "--output", BUILD / "dex", classes_jar,
    ])

    # Add the DEX file to the resource APK. APKs are ZIP files.
    with zipfile.ZipFile(base_apk, "a", zipfile.ZIP_DEFLATED) as zf:
        zf.write(BUILD / "dex" / "classes.dex", "classes.dex")

    aligned = BUILD / "aligned.apk"
    run([zipalign, "-f", "-p", "4", base_apk, aligned])

    env_keystore = os.environ.get("TTO_KEYSTORE", "").strip()
    keystore = Path(env_keystore) if env_keystore else BUILD / "debug.keystore"
    if env_keystore and not keystore.exists():
        fail("TTO_KEYSTORE was set but the file does not exist.")
    storepass = os.environ.get("TTO_KEYSTORE_PASS", "android")
    keyalias = os.environ.get("TTO_KEY_ALIAS", "androiddebugkey")
    keypass = os.environ.get("TTO_KEY_PASS", storepass)
    if not keystore.exists():
        run([
            keytool, "-genkeypair", "-v", "-keystore", keystore,
            "-storepass", storepass, "-keypass", keypass,
            "-alias", keyalias,
            "-dname", "CN=Factronics TTO Lab, OU=Training, O=Factronics, L=Caracas, ST=Distrito Capital, C=VE",
            "-keyalg", "RSA", "-keysize", "2048", "-validity", "10000",
        ])

    signed = BUILD / "Factronics-TTO-Lab.apk"
    run([
        apksigner, "sign",
        "--ks", keystore, "--ks-pass", "pass:" + storepass, "--key-pass", "pass:" + keypass,
        "--out", signed, aligned,
    ])
    run([apksigner, "verify", "--verbose", signed])

    target = download / "Factronics-TTO-Lab.apk"
    shutil.copy2(signed, target)
    digest = hashlib.sha256(target.read_bytes()).hexdigest()
    (download / "Factronics-TTO-Lab.apk.sha256").write_text(digest + "\n", encoding="utf-8")
    size = target.stat().st_size / 1024
    print()
    print("APK:", target)
    print("Size: %.1f KB" % size)
    print("SHA-256:", digest)
    print("Package: com.factronics.tto.lab · minSdk 24 · targetSdk 34")


if __name__ == "__main__":
    main()
