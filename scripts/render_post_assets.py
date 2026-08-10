#!/usr/bin/env python3
"""Render the PATTERN high-resolution launch-post image set.

The four informational cards are fully deterministic. Post 01 is a documented
campaign-art derivative: the AI source is upscaled, gently sharpened, and its
obsolete pre-launch ticker label is replaced with the approved `$P4663` label.
"""

from __future__ import annotations

import argparse
import math
from pathlib import Path
from typing import Callable, Iterable, Sequence

from PIL import Image, ImageCms, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "brand" / "posts"
DEFAULT_SOURCE = OUT / "sources" / "pattern_post_01_genesis_imagegen_1254_v01.png"
SRGB_PROFILE = OUT / "sources" / "srgb.icc"

SIZE = 2160
VOID = "#07090C"
SURFACE = "#0D1219"
BONE = "#F2EFE7"
CYAN = "#39D9FF"
GRID = "#28313B"
MUTED = "#88939F"

if not SRGB_PROFILE.exists():
    raise FileNotFoundError(f"Packaged sRGB profile missing: {SRGB_PROFILE}")
SRGB_ICC = SRGB_PROFILE.read_bytes()
# Validate the packaged profile early instead of producing superficially tagged files.
ImageCms.ImageCmsProfile(str(SRGB_PROFILE))


def _font_file(kind: str) -> Path:
    pattern = "geist-98bbbccb.woff2" if kind == "sans" else "geist-mono-013b2f2f.woff2"
    candidates = list((ROOT / "dist").glob(f"**/{pattern}"))
    if candidates:
        return candidates[0]
    fallback = Path(r"C:\Windows\Fonts\bahnschrift.ttf" if kind == "sans" else r"C:\Windows\Fonts\consola.ttf")
    if fallback.exists():
        return fallback
    raise FileNotFoundError(f"No usable {kind} font found")


def font(size: int, kind: str = "sans") -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(_font_file(kind)), size=size)


def rgba(hex_color: str, alpha: int) -> tuple[int, int, int, int]:
    value = hex_color.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def canvas() -> Image.Image:
    image = Image.new("RGB", (SIZE, SIZE), VOID)
    draw = ImageDraw.Draw(image)
    # Quiet modular field: hierarchy before decoration.
    for x in range(110, SIZE, 100):
        for y in range(110, SIZE, 100):
            draw.ellipse((x - 2, y - 2, x + 2, y + 2), fill=GRID)
    return image


def text_tracking(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    value: str,
    face: ImageFont.FreeTypeFont,
    fill: str,
    tracking: int = 0,
) -> int:
    x, y = xy
    for char in value:
        draw.text((x, y), char, font=face, fill=fill)
        x += int(draw.textlength(char, font=face)) + tracking
    return x


def label(draw: ImageDraw.ImageDraw, text: str, y: int = 104) -> None:
    text_tracking(draw, (120, y), text, font(31, "mono"), MUTED, tracking=5)
    draw.line((120, y + 62, 212, y + 62), fill=CYAN, width=5)


def footer(draw: ImageDraw.ImageDraw, field: str) -> None:
    y = 2040
    text_tracking(draw, (120, y), "PATTERN", font(27, "mono"), BONE, tracking=5)
    text_tracking(draw, (380, y), f"/ {field}", font(27, "mono"), MUTED, tracking=4)
    ticker = "$P4663 / PRE-LAUNCH"
    w = draw.textlength(ticker, font=font(27, "mono")) + 4 * (len(ticker) - 1)
    text_tracking(draw, (int(SIZE - 120 - w), y), ticker, font(27, "mono"), MUTED, tracking=4)


ACTIVE = {
    (1, 1), (2, 1), (3, 1), (4, 1),
    (1, 2), (5, 2),
    (1, 3), (5, 3),
    (1, 4), (2, 4), (3, 4), (4, 4), (5, 4),
    (1, 5), (1, 6), (1, 7),
}


def mark(draw: ImageDraw.ImageDraw, origin: tuple[int, int], cell: int = 34) -> None:
    """Draw the canonical 7x9 dotted P with one displaced cyan anomaly."""
    ox, oy = origin
    passive_r = max(2, round(cell * 0.075))
    active_r = round(cell * 0.145)
    for gy in range(1, 10):
        for gx in range(1, 8):
            x = ox + (gx - 1) * cell
            y = oy + (gy - 1) * cell
            draw.ellipse((x - passive_r, y - passive_r, x + passive_r, y + passive_r), fill=GRID)
    for gx, gy in sorted(ACTIVE):
        if (gx, gy) == (5, 4):
            x = ox + ((5 - 1) + 0.35) * cell
            fill = CYAN
        else:
            x = ox + (gx - 1) * cell
            fill = BONE
        y = oy + (gy - 1) * cell
        draw.ellipse((x - active_r, y - active_r, x + active_r, y + active_r), fill=fill)


def save(image: Image.Image, name: str) -> Path:
    OUT.mkdir(parents=True, exist_ok=True)
    target = OUT / name
    image.convert("RGB").save(target, format="PNG", optimize=True, icc_profile=SRGB_ICC)
    return target


def render_genesis(source_path: Path) -> Path:
    if not source_path.exists():
        raise FileNotFoundError(f"Campaign-art source missing: {source_path}")
    source = Image.open(source_path).convert("RGB")
    if source.size != (1254, 1254):
        raise ValueError(f"Campaign-art source is {source.size}; expected the preserved 1254x1254 render")
    image = source.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    image = image.filter(ImageFilter.UnsharpMask(radius=1.3, percent=92, threshold=3))

    # Replace only the obsolete ticker line. A soft-edged Void patch behaves
    # like an intentional quiet label zone and avoids claiming a fresh AI edit.
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    patch = Image.new("L", image.size, 0)
    pd = ImageDraw.Draw(patch)
    pd.rounded_rectangle((172, 1790, 825, 1940), radius=26, fill=244)
    patch = patch.filter(ImageFilter.GaussianBlur(18))
    field = Image.new("RGBA", image.size, rgba(VOID, 255))
    overlay = Image.composite(field, overlay, patch)
    image = Image.alpha_composite(image.convert("RGBA"), overlay).convert("RGB")

    draw = ImageDraw.Draw(image)
    text_tracking(draw, (214, 1846), "$P4663 / PRE-LAUNCH", font(33, "mono"), BONE, tracking=5)
    return save(image, "pattern_post_01_genesis_2160_v02.png")


def render_golden_angle() -> Path:
    image = canvas()
    draw = ImageDraw.Draw(image)
    label(draw, "FIELD 01 / PHYLLOTAXIS")
    mark(draw, (1790, 108), 30)

    draw.text((120, 240), "ORDER WITHOUT", font=font(116), fill=BONE)
    draw.text((120, 365), "A GRID", font=font(116), fill=BONE)
    draw.text((126, 525), "137.507764°", font=font(62, "mono"), fill=CYAN)
    draw.text((128, 605), "THE GOLDEN ANGLE", font=font(28, "mono"), fill=MUTED)

    cx, cy = 1245, 1265
    golden_angle = math.radians(137.507764)
    for n in range(610):
        radius = 27.0 * math.sqrt(n)
        theta = n * golden_angle
        x = cx + radius * math.cos(theta)
        y = cy + radius * math.sin(theta)
        if n == 377:
            r, fill = 10, CYAN
        else:
            r = 3 + int(3 * n / 609)
            fill = BONE if n % 13 else MUTED
        draw.ellipse((x - r, y - r, x + r, y + r), fill=fill)

    draw.line((120, 1865, 2040, 1865), fill=GRID, width=2)
    draw.text((120, 1900), "r(n) = c * sqrt(n), theta(n) = n * 137.507764 deg", font=font(35, "mono"), fill=MUTED)
    footer(draw, "FIELD 01")
    return save(image, "pattern_post_05_golden-angle_2160_v01.png")


def _dashed(
    draw: ImageDraw.ImageDraw,
    points: Sequence[tuple[float, float]],
    fill: str,
    width: int,
    dash: int,
    gap: int,
) -> None:
    phase = 0.0
    drawing = True
    remain = float(dash)
    for a, b in zip(points, points[1:]):
        x1, y1 = a
        x2, y2 = b
        length = math.hypot(x2 - x1, y2 - y1)
        if length == 0:
            continue
        consumed = 0.0
        while consumed < length:
            take = min(remain, length - consumed)
            t0, t1 = consumed / length, (consumed + take) / length
            if drawing:
                draw.line(
                    (x1 + (x2 - x1) * t0, y1 + (y2 - y1) * t0,
                     x1 + (x2 - x1) * t1, y1 + (y2 - y1) * t1),
                    fill=fill,
                    width=width,
                )
            consumed += take
            remain -= take
            if remain <= 1e-6:
                drawing = not drawing
                remain = float(dash if drawing else gap)


def render_taylor() -> Path:
    image = canvas()
    draw = ImageDraw.Draw(image)
    label(draw, "FIELD 02 / TAYLOR SERIES")
    mark(draw, (1790, 108), 30)

    draw.text((120, 240), "A CURVE, REBUILT", font=font(100), fill=BONE)
    draw.text((120, 355), "FROM LOCAL RULES", font=font(100), fill=BONE)
    draw.text((124, 505), "sin(x) ~= x - x^3/3! + x^5/5!", font=font(47, "mono"), fill=CYAN)

    left, top, right, bottom = 150, 755, 2010, 1745
    draw.rounded_rectangle((left, top, right, bottom), radius=24, fill=SURFACE, outline=GRID, width=2)
    for i in range(1, 8):
        x = left + (right - left) * i / 8
        draw.line((x, top, x, bottom), fill=GRID, width=1)
    for i in range(1, 6):
        y = top + (bottom - top) * i / 6
        draw.line((left, y, right, y), fill=GRID, width=1)

    xmin, xmax, ymin, ymax = -3.2, 3.2, -2.0, 2.0

    def point(x: float, y: float) -> tuple[float, float]:
        px = left + (x - xmin) / (xmax - xmin) * (right - left)
        py = bottom - (y - ymin) / (ymax - ymin) * (bottom - top)
        return px, max(top + 4, min(bottom - 4, py))

    draw.line((*point(0, ymin), *point(0, ymax)), fill=MUTED, width=2)
    draw.line((*point(xmin, 0), *point(xmax, 0)), fill=MUTED, width=2)

    funcs: list[tuple[str, Callable[[float], float], str, int, str]] = [
        ("sin(x)", math.sin, CYAN, 9, "solid"),
        ("x", lambda x: x, MUTED, 4, "dash"),
        ("x - x^3/3!", lambda x: x - x**3 / math.factorial(3), BONE, 5, "dash"),
        ("x - x^3/3! + x^5/5!", lambda x: x - x**3 / math.factorial(3) + x**5 / math.factorial(5), BONE, 7, "solid"),
    ]
    for _, fn, color, width, style in funcs:
        pts = [point(xmin + (xmax - xmin) * i / 520, fn(xmin + (xmax - xmin) * i / 520)) for i in range(521)]
        if style == "dash":
            _dashed(draw, pts, color, width, 22, 14)
        else:
            draw.line(pts, fill=color, width=width, joint="curve")

    legend_y = 1800
    legend = [
        (CYAN, "sin(x)"),
        (MUTED, "x"),
        (BONE, "x - x^3/3!"),
        (BONE, "x - x^3/3! + x^5/5!"),
    ]
    x = 120
    for color, value in legend:
        draw.line((x, legend_y + 18, x + 44, legend_y + 18), fill=color, width=6)
        draw.text((x + 60, legend_y), value, font=font(25, "mono"), fill=MUTED)
        x += int(draw.textlength(value, font=font(25, "mono"))) + 130
    footer(draw, "FIELD 02")
    return save(image, "pattern_post_06_taylor-series_2160_v01.png")


def render_chess() -> Path:
    image = canvas()
    draw = ImageDraw.Draw(image)
    label(draw, "FIELD 03 / CHESS")
    mark(draw, (1790, 108), 30)

    draw.text((120, 240), "ONE MOVE.", font=font(116), fill=BONE)
    draw.text((120, 365), "ONE KNOWN SHAPE.", font=font(116), fill=BONE)
    draw.text((126, 535), "Re8#", font=font(76, "mono"), fill=CYAN)
    draw.text((128, 635), "FIND THE FORCING PATTERN", font=font(28, "mono"), fill=MUTED)

    bx, by, cell = 665, 750, 156
    board = Image.new("RGBA", (cell * 8, cell * 8), (0, 0, 0, 0))
    bd = ImageDraw.Draw(board)
    for rank in range(8):
        for file in range(8):
            c = rgba(SURFACE, 255) if (rank + file) % 2 == 0 else rgba(GRID, 255)
            bd.rectangle((file * cell, rank * cell, (file + 1) * cell, (rank + 1) * cell), fill=c)
    # e-file from e1 to e8; cyan is information, not a price signal.
    path_layer = Image.new("RGBA", board.size, (0, 0, 0, 0))
    pl = ImageDraw.Draw(path_layer)
    pl.rectangle((4 * cell, 0, 5 * cell, 8 * cell), fill=rgba(CYAN, 25))
    pl.rectangle((4 * cell, 0, 5 * cell, cell), outline=rgba(CYAN, 230), width=8)
    board = Image.alpha_composite(board, path_layer)
    bd = ImageDraw.Draw(board)

    def square(file: str, rank: int) -> tuple[float, float]:
        fx = ord(file) - ord("a")
        ry = 8 - rank
        return (fx + 0.5) * cell, (ry + 0.5) * cell

    def piece(file: str, rank: int, symbol: str, side: str, ghost: bool = False) -> None:
        x, y = square(file, rank)
        radius = 49
        if ghost:
            bd.ellipse((x - radius, y - radius, x + radius, y + radius), outline=rgba(CYAN, 130), width=5)
            bd.text((x, y - 3), symbol, font=font(48, "mono"), fill=rgba(CYAN, 145), anchor="mm")
            return
        fill = BONE if side == "white" else VOID
        outline = CYAN if (file, rank) == ("e", 8) else BONE
        bd.ellipse((x - radius, y - radius, x + radius, y + radius), fill=fill, outline=outline, width=6)
        ink = VOID if side == "white" else BONE
        bd.text((x, y - 3), symbol, font=font(48, "mono"), fill=ink, anchor="mm")

    # Final board after Re8#, with e1 retained only as an origin trace.
    piece("g", 8, "K", "black")
    for file in ("f", "g", "h"):
        piece(file, 7, "P", "black")
    piece("g", 1, "K", "white")
    piece("e", 8, "R", "white")
    piece("e", 1, "R", "white", ghost=True)

    # Direction arrow and coordinates.
    sx, sy = square("e", 1)
    ex, ey = square("e", 8)
    bd.line((sx, sy - 60, ex, ey + 62), fill=CYAN, width=7)
    bd.polygon(((ex, ey + 52), (ex - 18, ey + 85), (ex + 18, ey + 85)), fill=CYAN)
    for i, file in enumerate("abcdefgh"):
        bd.text((i * cell + 10, cell * 8 - 38), file, font=font(23, "mono"), fill=MUTED)
    for i, rank in enumerate(range(8, 0, -1)):
        bd.text((cell * 8 - 28, i * cell + 9), str(rank), font=font(23, "mono"), fill=MUTED)

    image.paste(board, (bx, by), board)
    draw = ImageDraw.Draw(image)
    draw.text((120, 1805), "POSITION", font=font(25, "mono"), fill=MUTED)
    draw.text((120, 1845), "6k1/5ppp/8/8/8/8/8/4R1K1", font=font(28, "mono"), fill=BONE)
    draw.text((120, 1890), "WHITE TO MOVE / CHECKMATE IN ONE", font=font(25, "mono"), fill=MUTED)
    footer(draw, "FIELD 03")
    return save(image, "pattern_post_07_chess-re8_2160_v01.png")


def render_pattern_index() -> Path:
    image = canvas()
    draw = ImageDraw.Draw(image)
    label(draw, "RESEARCH 00 / PROTOCOL DRAFT")
    mark(draw, (1790, 108), 30)

    draw.text((120, 240), "PATTERN INDEX", font=font(122), fill=BONE)
    draw.text((124, 385), "/ BUILDING IN PUBLIC", font=font(58, "mono"), fill=CYAN)

    # Warnings are intentionally prominent and never relegated to fine print.
    draw.rounded_rectangle((120, 520, 1160, 625), radius=18, fill=CYAN)
    draw.text((157, 545), "SYNTHETIC / NOT MARKET DATA", font=font(38, "mono"), fill=VOID)
    draw.rounded_rectangle((1190, 520, 2040, 625), radius=18, outline=BONE, width=3)
    draw.text((1234, 545), "RESULT / NOT CLAIMED", font=font(38, "mono"), fill=BONE)

    left, top, right, bottom = 120, 750, 2040, 1690
    draw.rounded_rectangle((left, top, right, bottom), radius=24, fill=SURFACE, outline=GRID, width=2)
    for i in range(1, 12):
        x = left + (right - left) * i / 12
        draw.line((x, top, x, bottom), fill=GRID, width=1)
    for i in range(1, 7):
        y = top + (bottom - top) * i / 7
        draw.line((left, y, right, y), fill=GRID, width=1)

    def curve(seed: int, amp: float, phase: float) -> list[tuple[float, float]]:
        pts = []
        for i in range(481):
            t = i / 480
            baseline = 0.62 - 0.19 * t
            yv = baseline + amp * math.sin(18 * t + phase) * math.exp(-1.25 * t)
            yv += 0.055 * math.sin((seed + 3) * t * 2.2 + phase / 2)
            pts.append((left + t * (right - left), top + yv * (bottom - top)))
        return pts

    for seed, amp, phase in ((7, 0.11, 0.8), (11, 0.09, 2.2), (17, 0.08, 4.1)):
        draw.line(curve(seed, amp, phase), fill=MUTED, width=3)
    signal = curve(5, 0.16, 5.1)
    draw.line(signal, fill=CYAN, width=8, joint="curve")
    # Keep the single focal anomaly logic even in the chart field.
    ax, ay = signal[347]
    draw.ellipse((ax - 13, ay - 13, ax + 13, ay + 13), fill=CYAN, outline=BONE, width=4)

    draw.text((145, 785), "NORMALIZED SYNTHETIC TRAJECTORIES", font=font(24, "mono"), fill=MUTED)
    draw.text((145, 1628), "T0", font=font(23, "mono"), fill=MUTED)
    draw.text((1940, 1628), "T+N", font=font(23, "mono"), fill=MUTED)

    cols = [
        (120, "01 / DATA", "DEFINE THE COHORT"),
        (600, "02 / FEATURES", "MEASURE THE SHAPE"),
        (1095, "03 / TEST", "OUT-OF-SAMPLE"),
        (1570, "04 / REPORT", "PUBLISH LIMITS"),
    ]
    for x, num, copy in cols:
        draw.text((x, 1760), num, font=font(25, "mono"), fill=CYAN)
        draw.text((x, 1810), copy, font=font(27, "mono"), fill=BONE)
    footer(draw, "RESEARCH 00")
    return save(image, "pattern_post_09_pattern-index_2160_v01.png")


def render_contact_sheet(paths: Iterable[Path]) -> Path:
    paths = list(paths)
    width, height = 3840, 2810
    sheet = Image.new("RGB", (width, height), VOID)
    draw = ImageDraw.Draw(sheet)
    draw.text((120, 86), "PATTERN / LAUNCH POST SYSTEM", font=font(76), fill=BONE)
    draw.text((124, 184), "INTERNAL QA CONTACT SHEET / DO NOT PUBLISH", font=font(32, "mono"), fill=CYAN)
    card = 1080
    slots = [(120, 330), (1380, 330), (2640, 330), (750, 1570), (2010, 1570)]
    labels = ["POST 01 / GENESIS", "POST 05 / GOLDEN ANGLE", "POST 06 / TAYLOR", "POST 07 / CHESS", "POST 09 / INDEX"]
    for path, (x, y), cap in zip(paths, slots, labels):
        image = Image.open(path).convert("RGB").resize((card, card), Image.Resampling.LANCZOS)
        sheet.paste(image, (x, y))
        draw.text((x, y + card + 30), cap, font=font(29, "mono"), fill=MUTED)
    draw.line((120, 2750, 3720, 2750), fill=GRID, width=2)
    text_tracking(draw, (120, 2770), "$P4663 / PRE-LAUNCH", font(25, "mono"), MUTED, tracking=4)
    return save(sheet, "pattern_posts_contact-sheet_v01.png")


def verify(paths: Iterable[Path]) -> None:
    expected = {
        "pattern_posts_contact-sheet_v01.png": (3840, 2810),
    }
    errors: list[str] = []
    for path in paths:
        with Image.open(path) as image:
            size = expected.get(path.name, (SIZE, SIZE))
            if image.size != size:
                errors.append(f"{path.name}: size {image.size}, expected {size}")
            if image.mode != "RGB":
                errors.append(f"{path.name}: mode {image.mode}, expected RGB")
            if not image.info.get("icc_profile"):
                errors.append(f"{path.name}: missing embedded ICC profile")
    if errors:
        raise RuntimeError("Asset verification failed:\n" + "\n".join(errors))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        type=Path,
        default=DEFAULT_SOURCE,
        help=f"Post 01 ImageGen source (default: {DEFAULT_SOURCE.relative_to(ROOT)})",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    source_path = args.source.expanduser().resolve()
    outputs = [
        render_genesis(source_path),
        render_golden_angle(),
        render_taylor(),
        render_chess(),
        render_pattern_index(),
    ]
    contact = render_contact_sheet(outputs)
    verify([*outputs, contact])
    for path in [*outputs, contact]:
        with Image.open(path) as image:
            print(f"OK  {path.relative_to(ROOT)}  {image.width}x{image.height}  {image.mode}  sRGB")


if __name__ == "__main__":
    main()
