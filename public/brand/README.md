# PATTERN social asset kit

Deterministic social exports for the PATTERN / SIGNAL 4663 identity.

Live-state context checked **2026-08-12 10:59 +06:00 (04:59 UTC)**:

- Token: `PATTERN / $P4663`
- Chain: Robinhood Chain mainnet, chain ID `4663`
- Contract address: `0xB74E8B647517813D8b3790240e98F2E9A09cf5a3`
- Website: <https://pattern4663.com>
- X: <https://x.com/Pattern4663>
- Blockscout: <https://robinhoodchain.blockscout.com/token/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3>
- pons: <https://www.ponsfamily.com/launchpad/0xB74E8B647517813D8b3790240e98F2E9A09cf5a3>

Rebuild from the repository root with:

```powershell
python scripts/render_social_assets.py
```

The renderer requires Pillow and the standard Windows Arial and Consolas font files. All deliverables are RGB PNGs with an embedded sRGB ICC profile. Artwork uses only the approved Void `#07090C`, Surface `#0D1219`, Bone `#F2EFE7`, Cyan `#39D9FF`, Ion `#5968FF`, Grid `#28313B`, and Muted `#88939F` palette.

## Launch-state use policy

- Never publish artwork whose baked text contradicts the live token state.
- Keep the exact CA in selectable post/site text. Do not bake it into generic raster art.
- Do not add price, market cap, volume, holders, transfers, graduation, pool, listing, return, utility, Robinhood endorsement, or pons endorsement claims to artwork.
- Existing provenance masters must not be renamed, overwritten, recompressed, or silently “fixed.” Create a new versioned derivative and document its source.
- `public/brand/posts/` is a historical launch package. Its state is documented in [`posts/README.md`](posts/README.md).

## Deliverables

| File | Dimensions | Current use | Baked text / state |
| --- | ---: | --- | --- |
| `pattern_master_signal-noise_3840x2160_v01.png` | 3840 x 2160 | Current narrative master after caption QA | Source headline, meta, and tagline |
| `pattern_identity_avatar_master_2048_v01.png` | 2048 x 2048 | Canonical 7 x 9 dot-P identity/avatar master | None |
| `pattern_x_avatar_800x800_v01.png` | 800 x 800 | Current X profile image | None |
| `pattern_x_header_1500x500_v01.png` | 1500 x 500 | Current X header; recheck desktop/mobile crop | Source headline, meta, and tagline |
| `pattern_og_1200x630_v01.png` | 1200 x 630 | Current Open Graph/link preview | Source headline, meta, and tagline |
| `pattern_instagram_portrait_1080x1350_v01.png` | 1080 x 1350 | Current narrative feed art after caption QA | Headline, meta, and tagline |
| `pattern_instagram_square_1080x1080_v01.png` | 1080 x 1080 | Current narrative square after caption QA | Headline, meta, and tagline |
| `pattern_story_1080x1920_v01.png` | 1080 x 1920 | Current Story/Reel cover after safe-zone QA | Headline, meta, and tagline |
| `pattern_youtube_banner_2560x1440_v01.png` | 2560 x 1440 | Current YouTube banner after crop QA | Headline, meta, and tagline |
| `pattern_announcement_1080x1350_v01.png` | 1080 x 1350 | Current live-state announcement template; exact CA remains in copyable post text | `THE SIGNAL IS LIVE.` and `VERIFY THE CANONICAL CONTRACT` |
| `pattern_quote_1080x1080_v01.png` | 1080 x 1080 | Current reusable quote card | Quote and `PATTERN 4663` attribution |
| `pattern_social_contact-sheet_v01.png` | 2340 x 2120 | Internal QA only; never publish | File labels and dimensions |
| `pattern_teaser_1080x1350_v01.png` | 1080 x 1350 | **HISTORICAL / DO NOT PUBLISH** | `THE PATTERN IS EMERGING.` and stale `NO CONTRACT PUBLISHED` text |

`../og.png` is a byte-identical compatibility alias of `pattern_og_1200x630_v01.png`.

## Source provenance

The unchanged source is the AI render `C:\Users\daniy\.codex\generated_images\019febe8-3b06-7020-9b91-80ec80ca54c3\exec-3c30a27d-8966-4059-a79a-f3bd18097447.png`, originally 1672 x 941. The 3840 x 2160 file is a production 4K master export made with an aspect-preserving Pillow LANCZOS upscale and mild UnsharpMask; it is not claimed to be a native 4K neural render. The original source is not copied, modified, or deleted by this pipeline.

Square and vertical layouts use a blurred/darkened crop of the source hero only as an atmospheric layer. Their type is rendered afresh at 2x resolution and downsampled, and their P artwork comes from the canonical procedural 7 x 9 dot-P identity master. Active points are uniform Bone dots except logical `(5,4)`: its dim trace remains in place while the sole Signal Cyan anomaly is displaced to visual `x=5.35`.
