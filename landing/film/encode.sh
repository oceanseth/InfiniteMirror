#!/bin/bash
# Encode legs for scrubbing + extract posters. Run after ALL_LEGS_DONE:
#   bash landing/film/encode.sh
set -euo pipefail
cd "$(dirname "$0")/work"
mkdir -p ../../assets/vid
for i in 1 2 3 4 5 6; do
  ffmpeg -y -loglevel error -i "leg_$i.mp4" -an -vf "unsharp=5:5:0.8:5:5:0.0" \
    -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
    -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart "../../assets/vid/leg_$i.mp4"
  ffmpeg -y -loglevel error -ss 0 -i "leg_$i.mp4" -frames:v 1 -vf scale=1600:-2 "poster_$i.png"
  cwebp -quiet -q 82 "poster_$i.png" -o "../../assets/scene_$i.webp" 2>/dev/null || \
    ffmpeg -y -loglevel error -i "poster_$i.png" -q:v 4 "../../assets/scene_$i.webp"
  echo "ENCODED_$i $(du -h ../../assets/vid/leg_$i.mp4 | cut -f1)"
done
echo ALL_ENCODED
