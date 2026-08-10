#!/usr/bin/env python3
"""Render the PATTERN reusable social image kit.

The source hero is an AI-generated 1672 x 941 PNG.  This script keeps that
file untouched and makes a production 3840 x 2160 master with Pillow's LANCZOS
resampler plus deliberately mild output sharpening.  Square and vertical
formats are composed from a darkened atmospheric crop, freshly rendered type,
and a procedural canonical dot-P so that no source typography is stretched.

The renderer is deterministic: it uses fixed geometry, installed Windows
fonts, no random values, and embeds an sRGB ICC profile in every PNG.
"""

from __future__ import annotations

import argparse
import base64
import math
import shutil
from pathlib import Path
from typing import Iterable, Sequence

from PIL import Image, ImageCms, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = Path(
    r"C:\Users\daniy\.codex\generated_images\019febe8-3b06-7020-9b91-80ec80ca54c3"
    r"\exec-3c30a27d-8966-4059-a79a-f3bd18097447.png"
)
DEFAULT_BRAND_DIR = ROOT / "public" / "brand"
DEFAULT_OG_ALIAS = ROOT / "public" / "og.png"

FONT_BOLD = Path(r"C:\Windows\Fonts\arialbd.ttf")
FONT_REGULAR = Path(r"C:\Windows\Fonts\arial.ttf")
FONT_MONO = Path(r"C:\Windows\Fonts\consola.ttf")
FONT_MONO_BOLD = Path(r"C:\Windows\Fonts\consolab.ttf")

VOID = (7, 9, 12)
SURFACE = (13, 18, 25)
BONE = (242, 239, 231)
CYAN = (57, 217, 255)
ION = (89, 104, 255)
GRID = (40, 49, 59)
MUTED = (136, 147, 159)

RENDER_SCALE = 2


# Fixed LittleCMS sRGB profile. Creating it at runtime embeds the current date
# in the ICC header and would make otherwise identical PNG reruns differ.
SRGB_PROFILE = base64.b64decode(
    "AAACTGxjbXMEQAAAbW50clJHQiBYWVogB+oACAAKAA4AKQA6YWNzcE1TRlQAAAAAAAAA"
    "AAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1sY21zAAAAAAAAAAAAAAAAAAAAAAAA"
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALZGVzYwAAAQgAAAA2Y3BydAAAAUAA"
    "AABMd3RwdAAAAYwAAAAUY2hhZAAAAaAAAAAsclhZWgAAAcwAAAAUYlhZWgAAAeAAAAAU"
    "Z1hZWgAAAfQAAAAUclRSQwAAAggAAAAgZ1RSQwAAAggAAAAgYlRSQwAAAggAAAAgY2hy"
    "bQAAAigAAAAkbWx1YwAAAAAAAAABAAAADGVuVVMAAAAaAAAAHABzAFIARwBCACAAYgB1"
    "AGkAbAB0AC0AaQBuAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAADAAAAAcAE4AbwAgAGMA"
    "bwBwAHkAcgBpAGcAaAB0ACwAIAB1AHMAZQAgAGYAcgBlAGUAbAB5WFlaIAAAAAAAAPbW"
    "AAEAAAAA0y1zZjMyAAAAAAABDEIAAAXe///zJQAAB5MAAP2Q///7of///aIAAAPcAADA"
    "blhZWiAAAAAAAABvoAAAOPUAAAOQWFlaIAAAAAAAACSfAAAPhAAAtsNYWVogAAAAAAAA"
    "YpcAALeHAAAY2XBhcmEAAAAAAAMAAAACZmYAAPKnAAANWQAAE9AAAApbY2hybQAAAAAA"
    "AwAAAACj1wAAVHsAAEzNAACZmgAAJmYAAA9c"
)


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    if not path.exists():
        raise FileNotFoundError(f"Required font not found: {path}")
    return ImageFont.truetype(str(path), max(1, int(size)))


def to_srgb_rgb(image: Image.Image) -> Image.Image:
    """Convert embedded-profile images to sRGB; assume sRGB when untagged."""
    embedded = image.info.get("icc_profile")
    if embedded:
        try:
            source_profile = ImageCms.ImageCmsProfile(embedded)
            output_profile = ImageCms.createProfile("sRGB")
            return ImageCms.profileToProfile(
                image.convert("RGB"), source_profile, output_profile, outputMode="RGB"
            )
        except Exception:
            pass
    return image.convert("RGB")


def save_png(
    image: Image.Image,
    path: Path,
    expected_size: tuple[int, int],
    *,
    sharpen_percent: int = 38,
) -> None:
    """Save a deterministic sRGB PNG after mild, halo-safe sharpening."""
    if image.size != expected_size:
        raise ValueError(f"{path.name}: expected {expected_size}, got {image.size}")
    out = image.convert("RGB")
    if sharpen_percent:
        out = out.filter(
            ImageFilter.UnsharpMask(radius=0.72, percent=sharpen_percent, threshold=3)
        )
    path.parent.mkdir(parents=True, exist_ok=True)
    save_args: dict[str, object] = {
        "format": "PNG",
        "compress_level": 9,
        "optimize": False,
    }
    if SRGB_PROFILE:
        save_args["icc_profile"] = SRGB_PROFILE
    out.save(path, **save_args)


def cover_resize(
    image: Image.Image,
    target: tuple[int, int],
    focus: tuple[float, float] = (0.5, 0.5),
) -> Image.Image:
    """Aspect-preserving cover crop followed by one LANCZOS resize."""
    sw, sh = image.size
    tw, th = target
    source_ratio = sw / sh
    target_ratio = tw / th
    fx = min(1.0, max(0.0, focus[0]))
    fy = min(1.0, max(0.0, focus[1]))

    if source_ratio > target_ratio:
        crop_w = int(round(sh * target_ratio))
        left = int(round((sw - crop_w) * fx))
        left = min(max(0, left), sw - crop_w)
        box = (left, 0, left + crop_w, sh)
    else:
        crop_h = int(round(sw / target_ratio))
        top = int(round((sh - crop_h) * fy))
        top = min(max(0, top), sh - crop_h)
        box = (0, top, sw, top + crop_h)
    return image.crop(box).resize(target, Image.Resampling.LANCZOS)


def alpha_composite_at(base: Image.Image, overlay: Image.Image, xy: tuple[int, int]) -> None:
    base.alpha_composite(overlay, dest=xy)


def build_identity_art() -> tuple[Image.Image, Image.Image]:
    """Return the canonical 7 x 9 dot-P as opaque and transparent 2048px art."""
    work_size = 2048 * RENDER_SCALE
    mult = float(RENDER_SCALE)
    art = Image.new("RGBA", (work_size, work_size), (0, 0, 0, 0))

    # The complete 7 x 9 field fits inside radius 820, including passive dots.
    x0, y0, step = 544, 384, 160
    passive_radius = 13
    active_radius = 54
    assert math.hypot(3 * step + passive_radius, 4 * step + passive_radius) < 820

    active_dots = {
        (1, 1), (2, 1), (3, 1), (4, 1),
        (1, 2), (5, 2),
        (1, 3), (5, 3),
        (1, 4), (2, 4), (3, 4), (4, 4), (5, 4),
        (1, 5),
        (1, 6),
        (1, 7),
    }
    anomaly_source = (5, 4)

    # Passive field first. The logical anomaly source remains as a dim trace dot.
    grid_layer = Image.new("RGBA", art.size, (0, 0, 0, 0))
    grid_draw = ImageDraw.Draw(grid_layer, "RGBA")
    passive_r = int(passive_radius * mult)
    for row in range(9):
        for col in range(7):
            px = int((x0 + col * step) * mult)
            py = int((y0 + row * step) * mult)
            if (col, row) == anomaly_source:
                color = (*BONE, 68)
            elif (row * 7 + col) % 11 == 0:
                color = (*BONE, 38)
            else:
                color = (*GRID, 156)
            grid_draw.ellipse(
                (px - passive_r, py - passive_r, px + passive_r, py + passive_r),
                fill=color,
            )
    art = Image.alpha_composite(art, grid_layer)

    # Uniform Bone active points; the logical (5,4) point is deliberately absent.
    active_layer = Image.new("RGBA", art.size, (0, 0, 0, 0))
    active_draw = ImageDraw.Draw(active_layer, "RGBA")
    active_r = int(active_radius * mult)
    for col, row in sorted(active_dots, key=lambda point: (point[1], point[0])):
        if (col, row) == anomaly_source:
            continue
        px = int((x0 + col * step) * mult)
        py = int((y0 + row * step) * mult)
        active_draw.ellipse(
            (px - active_r, py - active_r, px + active_r, py + active_r),
            fill=(*BONE, 255),
        )
    art = Image.alpha_composite(art, active_layer)

    # Exactly one Signal Cyan point, displaced from logical x=5 to visual x=5.35.
    anomaly_x = int((x0 + 5.35 * step) * mult)
    anomaly_y = int((y0 + 4 * step) * mult)
    anomaly_glow = Image.new("RGBA", art.size, (0, 0, 0, 0))
    anomaly_glow_draw = ImageDraw.Draw(anomaly_glow, "RGBA")
    glow_radius = int(142 * mult)
    anomaly_glow_draw.ellipse(
        (
            anomaly_x - glow_radius,
            anomaly_y - glow_radius,
            anomaly_x + glow_radius,
            anomaly_y + glow_radius,
        ),
        fill=(*ION, 108),
    )
    anomaly_glow = anomaly_glow.filter(ImageFilter.GaussianBlur(72 * mult))
    art = Image.alpha_composite(art, anomaly_glow)

    anomaly_layer = Image.new("RGBA", art.size, (0, 0, 0, 0))
    anomaly_draw = ImageDraw.Draw(anomaly_layer, "RGBA")
    anomaly_draw.ellipse(
        (
            anomaly_x - active_r,
            anomaly_y - active_r,
            anomaly_x + active_r,
            anomaly_y + active_r,
        ),
        fill=(*CYAN, 255),
    )
    art = Image.alpha_composite(art, anomaly_layer)

    transparent = art.resize((2048, 2048), Image.Resampling.LANCZOS)
    opaque = Image.new("RGBA", (2048, 2048), (*VOID, 255))
    opaque = Image.alpha_composite(opaque, transparent)
    return opaque, transparent


def atmospheric_background(
    master: Image.Image,
    size: tuple[int, int],
    *,
    focus: tuple[float, float],
    darkness: int = 188,
) -> Image.Image:
    """Use the hero as a blurred, dark supporting texture, never distorted."""
    background = cover_resize(master, size, focus).convert("RGBA")
    blur_radius = max(8, int(round(min(size) / 86)))
    background = background.filter(ImageFilter.GaussianBlur(blur_radius))
    background = Image.alpha_composite(
        background, Image.new("RGBA", size, (*VOID, darkness))
    )

    # A quiet cyan/ion light field behind the signal mark.
    light = Image.new("RGBA", size, (0, 0, 0, 0))
    light_draw = ImageDraw.Draw(light, "RGBA")
    w, h = size
    light_draw.ellipse(
        (int(w * 0.36), int(h * 0.22), int(w * 1.05), int(h * 0.88)),
        fill=(*ION, 32),
    )
    light_draw.ellipse(
        (int(w * 0.54), int(h * 0.30), int(w * 0.94), int(h * 0.74)),
        fill=(*CYAN, 20),
    )
    light = light.filter(ImageFilter.GaussianBlur(max(28, int(min(size) * 0.08))))
    background = Image.alpha_composite(background, light)

    # Subtle grid reinstates texture lost during the blur.
    grid = Image.new("RGBA", size, (0, 0, 0, 0))
    grid_draw = ImageDraw.Draw(grid, "RGBA")
    spacing = max(72, int(round(min(size) / 15)))
    radius = max(2, int(round(spacing / 34)))
    for y in range(spacing // 2, h, spacing):
        for x in range(spacing // 2, w, spacing):
            alpha = 28 if ((x // spacing) + (y // spacing)) % 5 else 46
            grid_draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*GRID, alpha))
    background = Image.alpha_composite(background, grid)

    # Radial edge control keeps type legible at every crop.
    vignette_mask = Image.radial_gradient("L").resize(size, Image.Resampling.BICUBIC)
    vignette_mask = vignette_mask.point(lambda value: int(value * 0.42))
    vignette = Image.new("RGBA", size, (*VOID, 0))
    vignette.putalpha(vignette_mask)
    return Image.alpha_composite(background, vignette)


def draw_tracking_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    text_font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int, int] | tuple[int, int, int],
    tracking: int,
) -> float:
    x, y = xy
    cursor = float(x)
    for character in text:
        draw.text((int(round(cursor)), y), character, font=text_font, fill=fill)
        cursor += draw.textlength(character, font=text_font) + tracking
    return cursor


def draw_headline(
    canvas: Image.Image,
    xy: tuple[int, int],
    lines: Sequence[str],
    *,
    point_size: int,
    line_step: int,
) -> None:
    draw = ImageDraw.Draw(canvas, "RGBA")
    headline_font = font(FONT_BOLD, point_size)
    x, y = xy
    for line_index, line in enumerate(lines):
        draw.text(
            (x, y + line_index * line_step),
            line,
            font=headline_font,
            fill=(*BONE, 255),
            stroke_width=0,
        )


def draw_rule(draw: ImageDraw.ImageDraw, xy: tuple[int, int], width: int, scale: int) -> None:
    x, y = xy
    draw.rounded_rectangle(
        (x, y, x + width, y + max(3, 3 * scale)),
        radius=max(1, scale),
        fill=(*CYAN, 225),
    )


def place_signal_mark(
    canvas: Image.Image,
    transparent_identity: Image.Image,
    box: tuple[int, int, int, int],
    *,
    opacity: int = 255,
) -> None:
    x0, y0, x1, y1 = box
    art = transparent_identity.resize((x1 - x0, y1 - y0), Image.Resampling.LANCZOS)
    if opacity < 255:
        alpha = art.getchannel("A").point(lambda value: value * opacity // 255)
        art.putalpha(alpha)
    alpha_composite_at(canvas, art, (x0, y0))


def render_instagram_portrait(
    master: Image.Image, transparent_identity: Image.Image
) -> Image.Image:
    s = RENDER_SCALE
    final = (1080, 1350)
    canvas = atmospheric_background(
        master, (final[0] * s, final[1] * s), focus=(0.88, 0.52), darkness=202
    )
    draw = ImageDraw.Draw(canvas, "RGBA")
    draw_rule(draw, (104 * s, 96 * s), 78 * s, s)
    draw_headline(
        canvas,
        (104 * s, 132 * s),
        ("SEE THE", "PATTERN."),
        point_size=102 * s,
        line_step=100 * s,
    )
    meta_font = font(FONT_MONO_BOLD, 25 * s)
    draw_tracking_text(
        draw,
        (108 * s, 358 * s),
        "PATTERN / SIGNAL 4663",
        meta_font,
        (*BONE, 224),
        2 * s,
    )
    place_signal_mark(
        canvas,
        transparent_identity,
        (182 * s, 414 * s, 898 * s, 1130 * s),
    )
    tagline_font = font(FONT_MONO, 21 * s)
    draw_tracking_text(
        draw,
        (106 * s, 1228 * s),
        "EVERYTHING IS NOISE UNTIL YOU SEE THE PATTERN.",
        tagline_font,
        (*MUTED, 238),
        0,
    )
    return canvas.resize(final, Image.Resampling.LANCZOS)


def render_instagram_square(
    master: Image.Image, transparent_identity: Image.Image
) -> Image.Image:
    s = RENDER_SCALE
    final = (1080, 1080)
    canvas = atmospheric_background(
        master, (final[0] * s, final[1] * s), focus=(0.86, 0.49), darkness=202
    )
    draw = ImageDraw.Draw(canvas, "RGBA")
    draw_rule(draw, (82 * s, 72 * s), 66 * s, s)
    draw_headline(
        canvas,
        (82 * s, 105 * s),
        ("SEE THE PATTERN.",),
        point_size=76 * s,
        line_step=82 * s,
    )
    meta_font = font(FONT_MONO_BOLD, 22 * s)
    draw_tracking_text(
        draw,
        (86 * s, 218 * s),
        "PATTERN / SIGNAL 4663",
        meta_font,
        (*BONE, 220),
        2 * s,
    )
    place_signal_mark(
        canvas,
        transparent_identity,
        (246 * s, 250 * s, 834 * s, 838 * s),
    )
    tagline_font = font(FONT_MONO, 19 * s)
    draw_tracking_text(
        draw,
        (82 * s, 944 * s),
        "EVERYTHING IS NOISE UNTIL YOU SEE THE PATTERN.",
        tagline_font,
        (*MUTED, 238),
        0,
    )
    return canvas.resize(final, Image.Resampling.LANCZOS)


def render_story(master: Image.Image, transparent_identity: Image.Image) -> Image.Image:
    s = RENDER_SCALE
    final = (1080, 1920)
    canvas = atmospheric_background(
        master, (final[0] * s, final[1] * s), focus=(0.92, 0.53), darkness=207
    )
    draw = ImageDraw.Draw(canvas, "RGBA")
    # All essential content is between y=250 and y=1620.
    draw_rule(draw, (108 * s, 252 * s), 76 * s, s)
    draw_headline(
        canvas,
        (108 * s, 292 * s),
        ("SEE THE", "PATTERN."),
        point_size=104 * s,
        line_step=103 * s,
    )
    meta_font = font(FONT_MONO_BOLD, 25 * s)
    draw_tracking_text(
        draw,
        (112 * s, 526 * s),
        "PATTERN / SIGNAL 4663",
        meta_font,
        (*BONE, 226),
        2 * s,
    )
    place_signal_mark(
        canvas,
        transparent_identity,
        (144 * s, 620 * s, 936 * s, 1412 * s),
    )
    tagline_font = font(FONT_MONO, 21 * s)
    draw_tracking_text(
        draw,
        (110 * s, 1516 * s),
        "EVERYTHING IS NOISE UNTIL YOU SEE THE PATTERN.",
        tagline_font,
        (*MUTED, 242),
        0,
    )
    return canvas.resize(final, Image.Resampling.LANCZOS)


def render_youtube_banner(
    master: Image.Image, transparent_identity: Image.Image
) -> Image.Image:
    s = RENDER_SCALE
    final = (2560, 1440)
    canvas = atmospheric_background(
        master, (final[0] * s, final[1] * s), focus=(0.55, 0.52), darkness=185
    )
    draw = ImageDraw.Draw(canvas, "RGBA")
    # YouTube universal safe area: x=507..2053, y=509..932.
    draw_rule(draw, (596 * s, 560 * s), 70 * s, s)
    draw_headline(
        canvas,
        (596 * s, 598 * s),
        ("SEE THE PATTERN.",),
        point_size=91 * s,
        line_step=96 * s,
    )
    meta_font = font(FONT_MONO_BOLD, 24 * s)
    draw_tracking_text(
        draw,
        (602 * s, 728 * s),
        "PATTERN / SIGNAL 4663",
        meta_font,
        (*BONE, 224),
        2 * s,
    )
    tagline_font = font(FONT_MONO, 18 * s)
    draw_tracking_text(
        draw,
        (602 * s, 795 * s),
        "EVERYTHING IS NOISE UNTIL YOU SEE THE PATTERN.",
        tagline_font,
        (*MUTED, 240),
        0,
    )
    place_signal_mark(
        canvas,
        transparent_identity,
        (1572 * s, 504 * s, 1994 * s, 926 * s),
    )
    return canvas.resize(final, Image.Resampling.LANCZOS)


def render_announcement(
    master: Image.Image, transparent_identity: Image.Image
) -> Image.Image:
    s = RENDER_SCALE
    final = (1080, 1350)
    canvas = atmospheric_background(
        master, (final[0] * s, final[1] * s), focus=(0.88, 0.5), darkness=211
    )
    draw = ImageDraw.Draw(canvas, "RGBA")
    draw_rule(draw, (92 * s, 104 * s), 76 * s, s)
    draw_headline(
        canvas,
        (92 * s, 144 * s),
        ("THE SIGNAL", "IS LIVE."),
        point_size=96 * s,
        line_step=96 * s,
    )
    meta_font = font(FONT_MONO_BOLD, 24 * s)
    draw_tracking_text(
        draw,
        (96 * s, 374 * s),
        "VERIFY THE CANONICAL CONTRACT",
        meta_font,
        (*BONE, 226),
        1 * s,
    )
    place_signal_mark(
        canvas,
        transparent_identity,
        (182 * s, 470 * s, 898 * s, 1186 * s),
    )
    return canvas.resize(final, Image.Resampling.LANCZOS)


def render_teaser(master: Image.Image, transparent_identity: Image.Image) -> Image.Image:
    """Pre-launch-safe card: it makes no live-contract or launch claim."""
    s = RENDER_SCALE
    final = (1080, 1350)
    canvas = atmospheric_background(
        master, (final[0] * s, final[1] * s), focus=(0.88, 0.5), darkness=211
    )
    draw = ImageDraw.Draw(canvas, "RGBA")
    draw_rule(draw, (92 * s, 104 * s), 76 * s, s)
    draw_headline(
        canvas,
        (92 * s, 144 * s),
        ("THE PATTERN", "IS EMERGING."),
        point_size=82 * s,
        line_step=88 * s,
    )
    meta_font = font(FONT_MONO_BOLD, 25 * s)
    draw_tracking_text(
        draw,
        (96 * s, 354 * s),
        "NO CONTRACT PUBLISHED",
        meta_font,
        (*BONE, 226),
        2 * s,
    )
    place_signal_mark(
        canvas,
        transparent_identity,
        (182 * s, 470 * s, 898 * s, 1186 * s),
    )
    return canvas.resize(final, Image.Resampling.LANCZOS)


def render_quote(master: Image.Image, transparent_identity: Image.Image) -> Image.Image:
    s = RENDER_SCALE
    final = (1080, 1080)
    canvas = atmospheric_background(
        master, (final[0] * s, final[1] * s), focus=(0.82, 0.5), darkness=214
    )
    place_signal_mark(
        canvas,
        transparent_identity,
        (554 * s, 480 * s, 1030 * s, 956 * s),
        opacity=108,
    )
    draw = ImageDraw.Draw(canvas, "RGBA")
    draw_rule(draw, (92 * s, 102 * s), 72 * s, s)
    draw_headline(
        canvas,
        (92 * s, 150 * s),
        ("EVERYTHING IS NOISE", "UNTIL YOU SEE", "THE PATTERN."),
        point_size=65 * s,
        line_step=76 * s,
    )
    attribution_font = font(FONT_MONO_BOLD, 27 * s)
    draw_tracking_text(
        draw,
        (96 * s, 858 * s),
        "PATTERN 4663",
        attribution_font,
        (*CYAN, 245),
        3 * s,
    )
    return canvas.resize(final, Image.Resampling.LANCZOS)


def make_contact_sheet(brand_dir: Path, items: Sequence[tuple[str, tuple[int, int]]]) -> Image.Image:
    columns = 3
    cell_w, cell_h = 780, 500
    header_h = 120
    rows = math.ceil(len(items) / columns)
    size = (columns * cell_w, header_h + rows * cell_h)
    sheet = Image.new("RGBA", size, (*VOID, 255))
    draw = ImageDraw.Draw(sheet, "RGBA")
    title_font = font(FONT_BOLD, 42)
    label_font = font(FONT_MONO_BOLD, 22)
    meta_font = font(FONT_MONO, 18)
    draw.text((42, 30), "PATTERN / SOCIAL KIT / QA", font=title_font, fill=(*BONE, 255))
    draw.text((42, 82), "sRGB PNG / v01", font=meta_font, fill=(*MUTED, 230))

    # True-size micro previews make 32px/48px avatar legibility inspectable.
    avatar_path = brand_dir / "pattern_x_avatar_800x800_v01.png"
    if avatar_path.exists():
        with Image.open(avatar_path) as opened:
            avatar = opened.convert("RGB")
            avatar_32 = avatar.resize((32, 32), Image.Resampling.LANCZOS)
            avatar_48 = avatar.resize((48, 48), Image.Resampling.LANCZOS)
        micro_x = size[0] - 390
        draw.text((micro_x, 27), "AVATAR / TRUE SIZE", font=label_font, fill=(*BONE, 238))
        sheet.paste(avatar_32, (micro_x, 67))
        sheet.paste(avatar_48, (micro_x + 126, 55))
        draw.text((micro_x + 42, 73), "32", font=meta_font, fill=(*MUTED, 230))
        draw.text((micro_x + 184, 73), "48", font=meta_font, fill=(*MUTED, 230))

    for index, (filename, dimensions) in enumerate(items):
        col = index % columns
        row = index // columns
        x0 = col * cell_w
        y0 = header_h + row * cell_h
        draw.rectangle(
            (x0 + 14, y0 + 14, x0 + cell_w - 14, y0 + cell_h - 14),
            outline=(*GRID, 235),
            width=2,
        )
        with Image.open(brand_dir / filename) as opened:
            preview = opened.convert("RGB")
            preview.thumbnail((cell_w - 72, cell_h - 112), Image.Resampling.LANCZOS)
        px = x0 + (cell_w - preview.width) // 2
        py = y0 + 34 + (cell_h - 112 - preview.height) // 2
        sheet.paste(preview, (px, py))
        draw.text((x0 + 34, y0 + cell_h - 66), filename, font=label_font, fill=(*BONE, 244))
        draw.text(
            (x0 + 34, y0 + cell_h - 38),
            f"{dimensions[0]} x {dimensions[1]}",
            font=meta_font,
            fill=(*MUTED, 232),
        )
    return sheet.convert("RGB")


def verify_outputs(paths_and_sizes: Iterable[tuple[Path, tuple[int, int]]]) -> None:
    failures: list[str] = []
    for path, expected in paths_and_sizes:
        if not path.exists():
            failures.append(f"missing: {path}")
            continue
        with Image.open(path) as image:
            actual = image.size
            profile = bool(image.info.get("icc_profile"))
            if actual != expected:
                failures.append(f"{path.name}: {actual} != {expected}")
            if image.mode != "RGB":
                failures.append(f"{path.name}: mode {image.mode} != RGB")
            if not profile:
                failures.append(f"{path.name}: missing embedded ICC profile")
    if failures:
        raise RuntimeError("Output verification failed:\n" + "\n".join(failures))


def render_all(source_path: Path, brand_dir: Path, og_alias: Path) -> None:
    if not source_path.exists():
        raise FileNotFoundError(f"Source image not found: {source_path}")
    brand_dir.mkdir(parents=True, exist_ok=True)
    with Image.open(source_path) as opened:
        source = to_srgb_rgb(opened)
    if source.size != (1672, 941):
        raise ValueError(f"Expected 1672 x 941 source, got {source.size}")

    names: dict[str, tuple[int, int]] = {
        "pattern_master_signal-noise_3840x2160_v01.png": (3840, 2160),
        "pattern_identity_avatar_master_2048_v01.png": (2048, 2048),
        "pattern_x_header_1500x500_v01.png": (1500, 500),
        "pattern_x_avatar_800x800_v01.png": (800, 800),
        "pattern_og_1200x630_v01.png": (1200, 630),
        "pattern_instagram_portrait_1080x1350_v01.png": (1080, 1350),
        "pattern_instagram_square_1080x1080_v01.png": (1080, 1080),
        "pattern_story_1080x1920_v01.png": (1080, 1920),
        "pattern_youtube_banner_2560x1440_v01.png": (2560, 1440),
        "pattern_announcement_1080x1350_v01.png": (1080, 1350),
        "pattern_teaser_1080x1350_v01.png": (1080, 1350),
        "pattern_quote_1080x1080_v01.png": (1080, 1080),
    }

    master = cover_resize(source, names["pattern_master_signal-noise_3840x2160_v01.png"])
    master_path = brand_dir / "pattern_master_signal-noise_3840x2160_v01.png"
    save_png(master, master_path, master.size, sharpen_percent=42)
    # Re-open the tagged, sharpened master so derivative source crops match the deliverable.
    with Image.open(master_path) as opened:
        master = opened.convert("RGB")

    identity, transparent_identity = build_identity_art()
    save_png(
        identity,
        brand_dir / "pattern_identity_avatar_master_2048_v01.png",
        names["pattern_identity_avatar_master_2048_v01.png"],
        sharpen_percent=34,
    )
    x_avatar = identity.resize((800, 800), Image.Resampling.LANCZOS)
    save_png(
        x_avatar,
        brand_dir / "pattern_x_avatar_800x800_v01.png",
        names["pattern_x_avatar_800x800_v01.png"],
        sharpen_percent=34,
    )

    x_header = cover_resize(master, (1500, 500), focus=(0.5, 0.51))
    save_png(
        x_header,
        brand_dir / "pattern_x_header_1500x500_v01.png",
        names["pattern_x_header_1500x500_v01.png"],
        sharpen_percent=36,
    )

    og = cover_resize(master, (1200, 630), focus=(0.5, 0.5))
    og_path = brand_dir / "pattern_og_1200x630_v01.png"
    save_png(og, og_path, names[og_path.name], sharpen_percent=36)
    og_alias.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(og_path, og_alias)

    composed: list[tuple[str, Image.Image]] = [
        (
            "pattern_instagram_portrait_1080x1350_v01.png",
            render_instagram_portrait(master, transparent_identity),
        ),
        (
            "pattern_instagram_square_1080x1080_v01.png",
            render_instagram_square(master, transparent_identity),
        ),
        ("pattern_story_1080x1920_v01.png", render_story(master, transparent_identity)),
        (
            "pattern_youtube_banner_2560x1440_v01.png",
            render_youtube_banner(master, transparent_identity),
        ),
        (
            "pattern_announcement_1080x1350_v01.png",
            render_announcement(master, transparent_identity),
        ),
        (
            "pattern_teaser_1080x1350_v01.png",
            render_teaser(master, transparent_identity),
        ),
        ("pattern_quote_1080x1080_v01.png", render_quote(master, transparent_identity)),
    ]
    for filename, image in composed:
        save_png(image, brand_dir / filename, names[filename], sharpen_percent=32)

    contact_items = [(filename, dimensions) for filename, dimensions in names.items()]
    contact_sheet = make_contact_sheet(brand_dir, contact_items)
    contact_path = brand_dir / "pattern_social_contact-sheet_v01.png"
    save_png(contact_sheet, contact_path, contact_sheet.size, sharpen_percent=24)

    expected = [(brand_dir / name, size) for name, size in names.items()]
    expected.extend(
        [
            (contact_path, contact_sheet.size),
            (og_alias, (1200, 630)),
        ]
    )
    verify_outputs(expected)
    if og_path.read_bytes() != og_alias.read_bytes():
        raise RuntimeError("public/og.png is not byte-identical to the branded OG export")

    print(f"Rendered {len(names) + 2} verified PNGs")
    for path, size in expected:
        print(f"{path}: {size[0]}x{size[1]}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--brand-dir", type=Path, default=DEFAULT_BRAND_DIR)
    parser.add_argument("--og-alias", type=Path, default=DEFAULT_OG_ALIAS)
    return parser.parse_args()


if __name__ == "__main__":
    arguments = parse_args()
    render_all(arguments.source, arguments.brand_dir, arguments.og_alias)
