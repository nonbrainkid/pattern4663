# PATTERN Brand System

Version 1.0 — SIGNAL / 4663

## Brand idea

PATTERN is an independent culture coin designed for chain 4663. The central metaphor is perception: a field reads as noise until one precise anomaly reveals its structure.

Primary line:

> Everything is noise until you see the pattern.

Secondary line:

> All patterns reduce to mathematics.

`SIGNAL / 4663` is the visual direction, not a claim of affiliation, status, utility, or performance. The work should feel engineered, observant, sparse, and slightly uncanny. It should never read as an official Robinhood project or as a token made for Vlad.

## Color system

| Token | Hex | Use |
| --- | --- | --- |
| Void | `#07090C` | Default canvas and dominant field |
| Surface | `#0D1219` | Raised panels, secondary fields, cards |
| Bone | `#F2EFE7` | Primary type and regular active dots |
| Signal Cyan | `#39D9FF` | The anomaly, focus states, one decisive accent |
| Ion | `#5968FF` | Glow only; never a flat fill, type color, or CTA |
| Grid | `#28313B` | Grid lines, separators, quiet structure |
| Muted | `#88939F` | Secondary copy, labels, metadata |

Void should occupy most of every composition. Bone carries the message. Signal Cyan identifies the one meaningful break in the system. Ion may appear only as a soft glow behind Signal Cyan and must not become a second accent. Do not introduce brand green or sample colors from Robinhood materials.

## Typography

- Use **Geist Sans** for display lines, headlines, body copy, navigation, and calls to action.
- Use **Geist Mono** for `4663`, coordinates, system labels, timestamps, status text, and compact metadata.
- Set display copy in sentence case or restrained uppercase. Reserve full uppercase for short labels such as `PATTERN`, `SIGNAL`, `CHAIN 4663`, and `PRE-LAUNCH`.
- Use Geist Sans 500–600 for headlines and 400–500 for body copy. Do not simulate extra-bold or extended faces.
- Use Geist Mono 400–500 with modest positive tracking for labels. Do not set paragraphs in Mono.
- Keep headlines short. Favor one hard line break over stacked slogans. Never use decorative techno fonts, fake equations, or invented mathematical notation.
- Write the chain identifier exactly as `4663`. Do not add commas, decimals, or stylized substitutions.

## Modular P mark

The core mark is a seven-column by nine-row dot field. Coordinates use `(x,y)`, with `(1,1)` at the top left, `x` increasing to the right, and `y` increasing downward. One cell equals one unit.

Active coordinates:

```text
(1,1) (2,1) (3,1) (4,1)
(1,2)                   (5,2)
(1,3)                   (5,3)
(1,4) (2,4) (3,4) (4,4) (5,4)
(1,5)
(1,6)
(1,7)
```

Rows 8 and 9 contain no active dots. The passive field uses smaller, dim Grid dots. Every active dot uses one uniform, larger diameter and is Bone except for the logical dot at `(5,4)`: it is the sole Signal Cyan anomaly and is rendered `0.35` cell to the right, at visual position `(5.35,4)`. A smaller, dim passive trace remains at the logical `(5,4)` grid position; it is background structure, not a second active dot.

The anomaly changes position and color only—never active-dot size or shape. Do not rotate, mirror, skew, connect, or randomly rearrange the mark. Preserve at least one cell of clear space around the full seven-by-nine field.

## Usage hierarchy

1. Establish the Void field and quiet grid.
2. Lead with the modular P or a single short statement, not both at equal scale.
3. Use one Signal Cyan anomaly as the focal point.
4. Add `SIGNAL / 4663`, `CHAIN 4663`, or other Mono metadata as supporting evidence.
5. Place the independence disclosure where affiliation could otherwise be inferred.

For a hero or social image, the preferred reading order is: anomaly → P mark → `PATTERN` → narrative line → chain label. One composition gets one dominant idea.

## Do / do not

Do:

- Use negative space, grids, coordinates, cropping, and repetition with intent.
- Keep copy literal, intelligent, short, and readable.
- Treat `4663` as a chain identifier and the cyan dot as a perceptual break.
- Include `Independent. Not affiliated with Robinhood.` in profile and launch contexts.
- Verify deployment, contract, domain, and status before publishing factual claims.

Do not:

- Use the Robinhood logo, feather, brand green, UI likeness, or endorsement language.
- Call PATTERN official, Robinhood-backed, a token for Vlad, or a Robinhood project.
- Promise profit, returns, price movement, exchange listing, access, utility, or passive income.
- Invent a contract address, holder count, partnership, roadmap fact, or current status.
- Fill layouts with fake formulas, trading charts, candlesticks, coins, rockets, or generic cyberpunk noise.
- Use `live`, `launched`, or `born on chain 4663` before deployment is independently verified.

## Asset contract and provenance

Production assets live under `public/brand/`. Fixed deliverable names are:

| File | Purpose |
| --- | --- |
| `pattern_master_signal-noise_3840x2160_v01.png` | 4K production master for large-format and flexible crops |
| `pattern_identity_avatar_master_2048_v01.png` | High-resolution avatar master |
| `pattern_x_avatar_800x800_v01.png` | X profile avatar |
| `pattern_x_header_1500x500_v01.png` | X profile header |
| `pattern_og_1200x630_v01.png` | Open Graph and link preview image |
| `pattern_instagram_portrait_1080x1350_v01.png` | Instagram portrait post |
| `pattern_instagram_square_1080x1080_v01.png` | Instagram square post |
| `pattern_story_1080x1920_v01.png` | Stories and vertical status surfaces |
| `pattern_youtube_banner_2560x1440_v01.png` | YouTube channel banner |
| `pattern_teaser_1080x1350_v01.png` | Pre-launch teaser |
| `pattern_announcement_1080x1350_v01.png` | Launch or verified announcement card |
| `pattern_quote_1080x1080_v01.png` | Short quote card |
| `pattern_social_contact-sheet_v01.png` | Internal visual QA sheet; never publish as campaign creative |

`public/og.png` is a runtime alias, not a separate creative master.

The AI source render was **1672×941** and remains outside the repository. `pattern_master_signal-noise_3840x2160_v01.png` is a high-quality production upscale/export derived from that source. It must always be described as a **4K production master/export**, never as native 4K generation or a natively generated 4K image.

For new derivatives, use lowercase, underscore-separated fields and retain a version suffix: `pattern_<surface-or-role>_<size>_vNN.<ext>`. Use `widthxheight` for non-square sizes and a single dimension for square masters. A hyphen may join a fixed compound descriptor such as `signal-noise`; do not mix separators arbitrarily. Never overwrite an approved version silently; increment `vNN`.
