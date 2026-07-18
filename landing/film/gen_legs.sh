#!/bin/bash
# Sequential leg chain (architecture A). Run from landing/film/work via:
#   bash ../gen_legs.sh 2>&1 | tee legs.log
# Requires still_1.png present. Emits LEG_i_DONE / LEG_i_FAILED lines.
set -uo pipefail
cd "$(dirname "$0")/work"

start_img="still_1.png"
for i in 1 2 3 4 5 6; do
  ok=0
  for attempt in 1 2 3; do
    echo "leg $i attempt $attempt (start: $start_img)"
    higgsfield generate create seedance_2_0 \
      --prompt "$(cat ../prompts/leg_$i.txt)" \
      --start-image "$start_img" \
      --mode std --resolution 1080p --aspect_ratio 16:9 --duration 8 \
      --wait --wait-timeout 20m --json > "leg_$i.json" 2>"leg_$i.err"
    url=$(python3 -c "import json;d=json.load(open('leg_$i.json'));print(d[0].get('result_url') or '')" 2>/dev/null)
    status=$(python3 -c "import json;d=json.load(open('leg_$i.json'));print(d[0].get('status',''))" 2>/dev/null)
    if [ -n "$url" ]; then
      curl -fsSL "$url" -o "leg_$i.mp4" && ok=1 && break
    fi
    echo "leg $i attempt $attempt failed (status=$status)"
    sleep 5
  done
  if [ "$ok" != "1" ]; then echo "LEG_${i}_FAILED"; exit 1; fi
  ffmpeg -y -loglevel error -sseof -0.15 -i "leg_$i.mp4" -frames:v 1 -q:v 2 "leg_${i}_last.png"
  echo "LEG_${i}_DONE"
  start_img="leg_${i}_last.png"
done
echo "ALL_LEGS_DONE"
