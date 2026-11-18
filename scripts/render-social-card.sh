#!/bin/sh
# Optional regeneration with ImageMagick; static assets need no build-time tools.
# Supply a compatible sans-serif font file if Arial is unavailable locally.
set -eu
cd "$(dirname "$0")/.."
font=${1:-/System/Library/Fonts/Supplemental/Arial.ttf}
magick -background none -font "$font" scripts/social-card.svg -strip -depth 8 public/social-card.png
magick -background none -font "$font" scripts/social-card-home.svg -strip -depth 8 public/social-card-home.png
