# Film runbook — scroll-world cinematic for infinitemirror.masky.ai

Status: **waiting on Higgsfield credits** (balance was 6.4; full run needs ~450
standard / ~160 draft). Everything else is staged: prompts, pipeline, engine,
and the live landing page (which this film upgrades, copy unchanged).

Decisions locked (2026-07-17): 6 scenes, architecture **A** (one continuous
forward take — realistic walkthrough, no connectors), desktop-only,
`seedance_2_0` standard tier (or `seedance_2_0_mini` to previz first).

## Pipeline (when credits land)

1. **Calibrate cost** — run ONE still + ONE video, diff `higgsfield workspace
   list` before/after, extrapolate; warn if estimate > 70% of balance.
2. **Stills** (6, concurrent, detached):
   `higgsfield generate create gpt_image_2 --prompt "$(cat prompts/still_i.txt)" --aspect_ratio 3:2 --resolution 2k --quality high --wait --wait-timeout 15m --json > still_i.json`
   Review all six for cohesion before continuing (same light/palette/angle family).
3. **Legs** (6, STRICTLY SEQUENTIAL — run in bash, not zsh):
   - Leg 1: `--start-image still_1.png`, prompt `prompts/leg_1.txt`
   - Leg i: `--start-image leg_{i-1}_last.png` (extract:
     `ffmpeg -sseof -0.15 -i leg_{i-1}.mp4 -frames:v 1 -q:v 2 leg_{i-1}_last.png`)
   - Params: `--mode std --resolution 1080p --aspect_ratio 16:9 --duration 8`
   - NO `--end-image` (forces pull-back = stutter). Eyeball each leg's last
     frame before chaining (must read as a gentle forward glide).
   - NSFW false-positives: re-roll up to 3×; strip trigger words; fall back to
     `kling3_0` (same start frame, `--mode std --sound off --duration 10`,
     no `--resolution`) for a stubborn leg.
4. **Encode** (all 6 legs):
   `ffmpeg -i leg_i.mp4 -an -vf "unsharp=5:5:0.8:5:5:0.0" -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart ../assets/leg_i.mp4`
   Poster stills: first frame of each leg → `../assets/scene_i.webp`.
5. **Wire** — swap `landing/index.html`'s sections into `mountScrollWorld`
   (engine: `film/scrub-engine.js`, template: `film/index-template.html`).
   Copy transfers 1:1: each section's eyebrow/title/body/tags is already
   written in the current landing page. `connectors: []`, `crossfade: 0.08`,
   give scenes 05 (robot) and 06 (finale) `scroll: 1.6, linger: 0.45`.
6. **QA seams** (SKILL.md Step 8): headless screenshots either side of each
   seam must be near-identical; `video.seekable.end(0) > 0`; reduced-motion
   falls back to stills. The landing server already serves byte ranges.
