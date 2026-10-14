#!/bin/sh

set -eu

asset_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
source_svg="$asset_dir/KiwiCV.svg"
source_png="$asset_dir/KiwiCV.png"
social_svg="$asset_dir/og.svg"
github_svg="$asset_dir/github-social.svg"
temp_dir=$(mktemp -d "${TMPDIR:-/tmp}/kiwicv-assets.XXXXXX")

cleanup() {
  rm -rf "$temp_dir"
}
trap cleanup EXIT HUP INT TERM

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required macOS command: $1" >&2
    exit 1
  fi
}

assert_transparent_corners() {
  /usr/bin/swift -module-cache-path "$temp_dir/swift-cache" -e '
    import AppKit
    let path = CommandLine.arguments[1]
    guard
      let image = NSImage(contentsOfFile: path),
      let data = image.tiffRepresentation,
      let bitmap = NSBitmapImageRep(data: data)
    else {
      fatalError("Could not inspect generated image")
    }
    let points = [
      (0, 0),
      (bitmap.pixelsWide - 1, 0),
      (0, bitmap.pixelsHigh - 1),
      (bitmap.pixelsWide - 1, bitmap.pixelsHigh - 1),
    ]
    for point in points {
      guard let color = bitmap.colorAt(x: point.0, y: point.1) else {
        fatalError("Could not inspect generated image corner")
      }
      precondition(color.alphaComponent == 0, "Generated image corner is not transparent")
    }
  ' "$1"
}

require_command qlmanage
require_command sips
require_command swift
require_command xmllint

xmllint --noout "$source_svg" "$social_svg" "$github_svg"
assert_transparent_corners "$source_png"

sips -z 192 192 "$source_png" --out "$asset_dir/icon-192.png" >/dev/null
sips -z 512 512 "$source_png" --out "$asset_dir/icon-512.png" >/dev/null
sips -z 512 512 "$source_png" --out "$asset_dir/email-avatar.png" >/dev/null

# Tile = the mark's own outer-ring colour (owner, 2026-10-08). The disc
# is 86% wide, past the 80% safe circle, so a round mask lets it bleed; the CV
# glyph stays well inside.
sips -z 471 471 "$source_png" --out "$temp_dir/maskable-mark.png" >/dev/null
sips --padToHeightWidth 512 512 --padColor 14343A "$temp_dir/maskable-mark.png" \
  --out "$asset_dir/icon-maskable-512.png" >/dev/null

# iOS paints transparency black, so the tile is opaque, in the same ring colour.
sips -z 166 166 "$source_png" --out "$temp_dir/apple-mark.png" >/dev/null
sips --padToHeightWidth 180 180 --padColor 14343A "$temp_dir/apple-mark.png" \
  --out "$asset_dir/apple-touch-icon.png" >/dev/null

sips -z 64 64 "$source_png" --out "$temp_dir/favicon.png" >/dev/null
sips -s format ico "$temp_dir/favicon.png" --out "$asset_dir/favicon.ico" >/dev/null

qlmanage -t -s 1200 -o "$temp_dir" "$social_svg" >/dev/null
sips --cropToHeightWidth 630 1200 "$temp_dir/og.svg.png" \
  --out "$temp_dir/og.png" >/dev/null
sips -s format jpeg -s formatOptions 88 "$temp_dir/og.png" \
  --out "$asset_dir/og.jpg" >/dev/null

# Uploaded by hand in the repository's Settings; GitHub crops to 2:1.
qlmanage -t -s 1280 -o "$temp_dir" "$github_svg" >/dev/null
sips --cropToHeightWidth 640 1280 "$temp_dir/github-social.svg.png" \
  --out "$asset_dir/github-social.png" >/dev/null

assert_transparent_corners "$asset_dir/icon-192.png"
assert_transparent_corners "$asset_dir/icon-512.png"
assert_transparent_corners "$asset_dir/email-avatar.png"
assert_transparent_corners "$asset_dir/favicon.ico"

echo "Regenerated KiwiCV launch assets from KiwiCV.svg and KiwiCV.png"
