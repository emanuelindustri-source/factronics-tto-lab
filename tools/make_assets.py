#!/usr/bin/env python3
"""Generate the social card, favicon and Android launcher icons.

Requires Pillow. Run from the repository root:
    python tools/make_assets.py

Source mark: assets/img/factronics.png (transparent PNG).
The white variant preserves the source alpha channel, so thin lettering and
anti-aliased edges stay crisp on dark backgrounds.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
FONTS = Path("C:/Windows/Fonts")
W, H = 1200, 630


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    path = FONTS / name
    if path.exists():
        return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def build_brand_variants() -> None:
    src = Image.open(IMG / "factronics.png").convert("RGBA")
    # The source already has a transparent background and anti-aliased alpha.
    src.save(IMG / "factronics-transparent.png", optimize=True)
    white = Image.new("RGBA", src.size, (255, 255, 255, 0))
    white.putalpha(src.getchannel("A"))
    white.save(IMG / "factronics-white.png", optimize=True)


def build_og() -> None:
    og = Image.new("RGB", (W, H), "#041220")
    px = og.load()
    for y in range(H):
        t = y / (H - 1)
        for x in range(W):
            u = min(1.0, max(0.0, (x / W) * 0.65 + (1 - t) * 0.25))
            px[x, y] = (int(4 + 6 * u), int(18 + 48 * u), int(32 + 92 * u))

    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((760, -220, 1420, 420), fill=(0, 163, 224, 42))
    glow = glow.filter(ImageFilter.GaussianBlur(70))
    og = Image.alpha_composite(og.convert("RGBA"), glow)
    d = ImageDraw.Draw(og)

    fact = Image.open(IMG / "factronics-white.png").convert("RGBA")
    fw = 330
    fh = round(fact.height * fw / fact.width)
    fact = fact.resize((fw, fh), Image.LANCZOS)
    og.alpha_composite(fact, (82, 62))

    vj = Image.open(IMG / "logo.png").convert("RGBA")
    vw = 210
    vh = round(vj.height * vw / vj.width)
    vj = vj.resize((vw, vh), Image.LANCZOS)
    chip_w, chip_h = 250, 76
    chip = Image.new("RGBA", (chip_w, chip_h), (0, 0, 0, 0))
    cd = ImageDraw.Draw(chip)
    cd.rounded_rectangle((0, 0, chip_w - 1, chip_h - 1), radius=14, fill=(255, 255, 255, 255))
    chip.alpha_composite(vj, ((chip_w - vw) // 2, (chip_h - vh) // 2))
    og.alpha_composite(chip, (W - chip_w - 78, 60))
    d.text(
        (W - chip_w - 78, 146),
        "DISTRIBUIDOR OFICIAL EN VENEZUELA",
        font=font("segoeuib.ttf", 16),
        fill=(127, 214, 245),
    )

    d.text((82, 206), "FACTRONICS", font=font("segoeuib.ttf", 84), fill=(255, 255, 255))
    d.text((82, 294), "TTO LAB", font=font("segoeuib.ttf", 84), fill=(125, 220, 255))
    d.text(
        (84, 402),
        "Entrenamiento técnico · Factronics Venezuela",
        font=font("segoeuisl.ttf", 28),
        fill=(210, 233, 247),
    )
    d.text(
        (84, 444),
        "Generador de evaluaciones + app Android nativa",
        font=font("segoeui.ttf", 22),
        fill=(169, 207, 232),
    )

    labels = ["6 modelos", "7 tipos de pregunta", "3 idiomas", "100 % offline"]
    x = 84
    for label in labels:
        tw = d.textlength(label, font=font("segoeuib.ttf", 16))
        box = (x, 506, x + tw + 28, 544)
        d.rounded_rectangle(box, radius=10, fill=(13, 62, 94), outline=(40, 128, 177), width=1)
        d.text((x + 14, 512), label, font=font("segoeuib.ttf", 16), fill=(90, 226, 197))
        x = box[2] + 10

    d.text(
        (84, 575),
        "Desarrollado por Khristyan Hidalgo · Técnico de campo certificado",
        font=font("segoeui.ttf", 18),
        fill=(208, 229, 243),
    )
    credit = "Factronics C.A."
    d.text(
        (W - 78 - d.textlength(credit, font=font("segoeui.ttf", 18)), 575),
        credit,
        font=font("segoeui.ttf", 18),
        fill=(127, 214, 245),
    )

    og.convert("RGB").save(IMG / "og.png", optimize=True)


def make_icon(size: int, path: Path) -> None:
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    pad = max(1, size // 32)
    radius = max(8, size // 5)
    dr.rounded_rectangle((pad, pad, size - pad - 1, size - pad - 1), radius=radius, fill=(11, 92, 171, 255))
    band_h = max(6, size // 9)
    dr.rounded_rectangle(
        (pad, size - pad - band_h, size - pad - 1, size - pad - 1),
        radius=max(3, size // 18),
        fill=(0, 163, 224, 255),
    )
    f = font("segoeuib.ttf", int(size * 0.58))
    bb = dr.textbbox((0, 0), "F", font=f)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    dr.text(
        ((size - tw) / 2 - bb[0], (size - th) / 2 - bb[1] - size * 0.06),
        "F",
        font=f,
        fill=(255, 255, 255, 255),
    )
    tf = font("segoeuib.ttf", max(8, int(size * 0.13)))
    tb = dr.textbbox((0, 0), "TTO", font=tf)
    tw2, th2 = tb[2] - tb[0], tb[3] - tb[1]
    dr.text(
        ((size - tw2) / 2 - tb[0], size - pad - th2 - max(8, size * 0.10)),
        "TTO",
        font=tf,
        fill=(235, 249, 255, 235),
    )
    im.save(path, optimize=True)


def main() -> None:
    build_brand_variants()
    build_og()
    make_icon(128, IMG / "favicon.png")
    sizes = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
    for name, size in sizes.items():
        make_icon(size, ROOT / "android" / "app" / "src" / "main" / "res" / f"mipmap-{name}" / "ic_launcher.png")
    (ROOT / "android" / "app" / "src" / "main" / "assets" / "logo.png").write_bytes(
        (IMG / "factronics-transparent.png").read_bytes()
    )
    print("OK: og.png, favicon.png, launcher icons, Android logo")


if __name__ == "__main__":
    main()
