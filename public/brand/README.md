# PATTERN social asset kit

Deterministic social exports for the PATTERN / SIGNAL 4663 identity. Rebuild from the repository root with:

```powershell
python scripts/render_social_assets.py
```

The renderer requires Pillow and the standard Windows Arial and Consolas font files. All deliverables are RGB PNGs with an embedded sRGB ICC profile. Artwork uses only the approved Void `#07090C`, Surface `#0D1219`, Bone `#F2EFE7`, Cyan `#39D9FF`, Ion `#5968FF`, Grid `#28313B`, and Muted `#88939F` palette.

## Deliverables

| File | Dimensions | Intended use | Baked text |
| --- | ---: | --- | --- |
| `pattern_master_signal-noise_3840x2160_v01.png` | 3840 x 2160 | Production 4K hero master | Source headline, meta, and tagline |
| `pattern_identity_avatar_master_2048_v01.png` | 2048 x 2048 | Canonical 7 x 9 dot-P identity/avatar master | None |
| `pattern_x_avatar_800x800_v01.png` | 800 x 800 | X profile image | None |
| `pattern_x_header_1500x500_v01.png` | 1500 x 500 | X header; bottom-left avatar overlay stays clear of the PATTERN meta | Source headline, meta, and tagline |
| `pattern_og_1200x630_v01.png` | 1200 x 630 | Open Graph and link previews | Source headline, meta, and tagline |
| `pattern_instagram_portrait_1080x1350_v01.png` | 1080 x 1350 | Instagram portrait feed post | Headline, meta, and tagline |
| `pattern_instagram_square_1080x1080_v01.png` | 1080 x 1080 | Square social post | Headline, meta, and tagline |
| `pattern_story_1080x1920_v01.png` | 1080 x 1920 | Story/Reel cover; essential content is within y=250..1620 | Headline, meta, and tagline |
| `pattern_youtube_banner_2560x1440_v01.png` | 2560 x 1440 | YouTube channel banner; essentials stay within x=507..2053, y=509..932 | Headline, meta, and tagline |
| `pattern_announcement_1080x1350_v01.png` | 1080 x 1350 | Post-launch-only announcement template; publish only after the canonical contract is live and verified | `THE SIGNAL IS LIVE.` and `VERIFY THE CANONICAL CONTRACT` |
| `pattern_teaser_1080x1350_v01.png` | 1080 x 1350 | Pre-launch-safe teaser template | `THE PATTERN IS EMERGING.` and `NO CONTRACT PUBLISHED` |
| `pattern_quote_1080x1080_v01.png` | 1080 x 1080 | Reusable quote card | Quote and `PATTERN 4663` attribution |
| `pattern_social_contact-sheet_v01.png` | 2340 x 2120 | Visual QA index | File labels and dimensions |

`../og.png` is a byte-identical compatibility alias of `pattern_og_1200x630_v01.png`.

## Source provenance

The unchanged source is the AI render `C:\Users\daniy\.codex\generated_images\019febe8-3b06-7020-9b91-80ec80ca54c3\exec-3c30a27d-8966-4059-a79a-f3bd18097447.png`, originally 1672 x 941. The 3840 x 2160 file is a production 4K master export made with an aspect-preserving Pillow LANCZOS upscale and mild UnsharpMask; it is not claimed to be a native 4K neural render. The original source is not copied, modified, or deleted by this pipeline.

Square and vertical layouts use a blurred/darkened crop of the source hero only as an atmospheric layer. Their type is rendered afresh at 2x resolution and downsampled, and their P artwork comes from the canonical procedural 7 x 9 dot-P identity master. Active points are uniform Bone dots except logical `(5,4)`: its dim trace remains in place while the sole Signal Cyan anomaly is displaced to visual `x=5.35`.
