# KiwiCV Logo Drop Zone

The owner-provided KiwiCV masters are the only source of truth for the launch
identity. Phase 3 wired these assets into the active KiwiCV runtime and retired
the superseded CVCanvas launch assets.

## Owner Masters

- `KiwiCV.svg`: approved vector product symbol, without a wordmark.
- `KiwiCV.png`: high-resolution transparent raster source for derived platform
  assets.
- `KiwiCanopy.png`: transparent parent-brand mark without text for compact
  endorsement contexts. **96×78, ~18 KB** — sized for the 48×40 box the landing
  footer paints it into at 2× DPR. It was 1536×1245 and 3 MB until 2026-07-23;
  if a larger surface ever needs the mark, add a separate file rather
  than growing this one back.
- `KiwiCanopy_wordmark.png`: transparent parent-brand artwork with wordmark and
  tagline for larger endorsement contexts.

Keep this exact casing in code references because deployed paths are
case-sensitive. Product UI may pair the symbol with live `KiwiCV` text until a
dedicated horizontal wordmark is approved.

## Derived Launch Assets

- `favicon.ico`: 64 px compatibility favicon.
- `icon-192.png` and `icon-512.png`: transparent PWA/app icons.
- `icon-maskable-512.png`: maskable PWA icon on the mark's outer-ring green (`#14343A`), so a launcher mask that trims the ring stays invisible.
- `apple-touch-icon.png`: 180 px iOS home-screen icon on the same `#14343A` tile (iOS paints transparency black).
- `email-avatar.png`: 512 px transparent mailbox/profile image.
- `og.svg`: editable 1200 × 630 social master, English for every locale.
- `og.jpg`: rendered 1200 × 630 social image.

One English social image ships for every locale; there are no locale variants.
The localized `og:title` and `og:description` beside it carry the message, so
keep the image tagline short enough to read for a non-English audience. When
`og.jpg` changes, bump the `?v=` on `socialImage` in `src/config/brand.ts` and
on the JSON-LD `image` in `index.html`, or link previews keep the cached card.

## Regenerating Assets

On macOS, replace `KiwiCV.svg`, then run:

```sh
./public/logos/kiwicv/generate-assets.sh
```

The script validates both SVG files and recreates the favicon, standard and
maskable PWA icons, the email avatar, and `og.jpg` at their fixed launch sizes.
Transparent raster derivatives use the owner-supplied `KiwiCV.png`; this avoids
SVG renderers that silently flatten transparency. The built-in `qlmanage`,
`sips`, `swift`, and `xmllint` commands are sufficient, and the script verifies
all four corner pixels for every asset that must remain transparent. `og.svg`
remains the editable social template and references the canonical vector master
directly.

## Optional Future Variants

- `logo-dark.svg`: compact symbol for dark surfaces.
- `logo-mono.svg`: one-color symbol.
- `wordmark.svg`: horizontal KiwiCV logo for light surfaces.
- `wordmark-dark.svg`: horizontal logo for dark surfaces.
- `lockup.svg`: optional “KiwiCV by KiwiCanopy” endorsed form if a future vector
  export can preserve the approved color transitions faithfully.

Use clean SVGs with an explicit `viewBox`, outlined type, no linked fonts or
external images, and a transparent background. Keep any editable design-source
file next to the SVGs only if it is safe to publish in the repository.

## Usage

- Use the vector master or transparent PNG icons on light surfaces.
- Use the padded maskable icon only for a manifest entry with
  `purpose: "maskable"`.
- Keep at least 10% clear space around the circular logo in layouts.
- Pair the symbol with live `KiwiCV` text until a wordmark is approved.
- Use the mark-only KiwiCanopy PNG beside live endorsement text in compact
  contexts. Keep the wordmark artwork for layouts large enough to preserve its
  typography and tagline.
- Do not place the KiwiCanopy parent logo throughout the core app; reserve it for
  contexts where the endorsement adds useful trust or ownership context.
- Use a plain-text email signature: Maikel Hajiabadi, KiwiCV by KiwiCanopy,
  selected public address, and `https://kiwicv.kiwicanopy.com`.
- Generated CV templates must remain brand-neutral and must never include the
  product mark.

## Palette Extracted from the Master

`#1c373d`, `#89b3b5`, `#8db354`, `#aacb5d`, `#cce0a2`, `#dbeeee`, and
`#ffffff`. Do not recolor individual paths without a separately approved logo
variant.

## License

The image files in this folder (`.svg`, `.png`, `.jpg`, `.ico`) are
© Maikel Hajiabadi and are not covered by the repository's AGPL
license. [TRADEMARKS.md](../../../TRADEMARKS.md) says how they may be
used.
