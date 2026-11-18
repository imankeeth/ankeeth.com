#!/bin/sh
# Requires ImageMagick for one-time static asset generation; not used by builds.
set -eu
cd "$(dirname "$0")/.."
photo=src/assets/ankeeth-profile.webp
for size in 32 48; do
  magick "$photo" -strip -resize "${size}x${size}" "public/favicon-${size}.png"
done
magick "$photo" -strip -resize 180x180 public/apple-touch-icon.png
magick "$photo" -strip -define icon:auto-resize=48,32,16 public/favicon.ico
