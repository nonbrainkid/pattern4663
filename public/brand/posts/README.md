# PATTERN launch post assets

Version 1.0 — pre-launch social package for token ticker `$P4663`.

## Post mapping

| X post | Creative | Dimensions | Use |
| --- | --- | ---: | --- |
| 01 — Genesis thesis | `pattern_post_01_genesis_2160_v02.png` | 2160×2160 | Campaign opener: “Everything is noise until you see the pattern.” |
| 05 — Golden angle | `pattern_post_05_golden-angle_2160_v01.png` | 2160×2160 | Phyllotaxis / 137.507764° explainer |
| 06 — Taylor series | `pattern_post_06_taylor-series_2160_v01.png` | 2160×2160 | Exact `sin(x)` Taylor approximations, written in ASCII-safe mathematical notation |
| 07 — Chess pattern | `pattern_post_07_chess-re8_2160_v01.png` | 2160×2160 | Position `6k1/5ppp/8/8/8/8/8/4R1K1`, `Re8#` |
| 09 — Pattern Index | `pattern_post_09_pattern-index_2160_v01.png` | 2160×2160 | Research protocol teaser with synthetic-data disclosure |

`pattern_posts_contact-sheet_v01.png` is a 3840×2810 internal QA sheet. Never publish it as campaign creative.

## Status and provenance

- Every deliverable is RGB PNG with an embedded sRGB ICC profile.
- Every asset is **pre-launch**. Do not replace `$P4663 / PRE-LAUNCH` with launch language until the contract address and deployment are independently verified.
- Post 01 is **campaign art**, not the canonical PATTERN mark. It is a 2160×2160 LANCZOS production upscale/export from a preserved 1254×1254 RGB ImageGen source, followed by moderate sharpening and a local ticker-label correction from the obsolete draft ticker label to `$P4663`. It must not be described as native 2160 generation or as the canonical logo.
- Posts 05, 06, 07, and 09 are deterministic Pillow renders. Their small top-right mark follows the canonical 7×9 dotted-P construction from `BRAND_SYSTEM.md`, including the passive trace at logical `(5,4)` and the sole cyan active anomaly displaced to visual `x=5.35`.
- The Pattern Index card says `SYNTHETIC / NOT MARKET DATA` and `RESULT / NOT CLAIMED` prominently. Do not pair it with claims of completed token research until a real dataset and reproducible result exist.
- No creative uses Robinhood branding, brand green, price promises, or invented performance claims.

## Re-render and verify

From the repository root:

```powershell
python scripts/render_post_assets.py
```

The renderer recreates all six PNGs and exits non-zero if an output has the wrong dimensions, is not RGB, or lacks an embedded ICC profile. It uses the Geist webfont subsets already emitted in `dist`; on Windows it falls back to Bahnschrift and Consolas if those files are unavailable.

The default campaign source is committed at:

```text
public/brand/posts/sources/pattern_post_01_genesis_imagegen_1254_v01.png
```

Source facts:

- Exact dimensions and mode: 1254×1254 RGB.
- SHA-256: `a62142647dbe6c3ece7f48a36197e143bf7b0e8e60c23732cee725aabe53e5db`.
- The source file is preserved byte-for-byte and intentionally has no post-production ICC metadata. The renderer embeds sRGB in every publishable output.
- `sources/srgb.icc` is the packaged color profile used for deterministic output bytes; its SHA-256 is `b4c87642c8dc53f895199c0fc3c271a8a4baffeb375d2030c69ee34dae4ec6ba`.

To reproduce with another preserved source of the same dimensions, use the optional override:

```powershell
python scripts/render_post_assets.py --source C:\path\to\source.png
```
