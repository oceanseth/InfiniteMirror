---
format: 1920x1080
message: "Agents that own private assets and talk to each other get smarter with every conversation — InfiniteMirror turns that improvement loop into an economy"
arc: concept-explainer with process
audience: hackathon judges and agent-infrastructure engineers
mode: autonomous
music: none
---

## Video direction

- **Palette (from frame.md, by role):** paper cream ground with the permanent graph-paper grid behind every frame; cobalt ink is the ONLY ink — text, diagram strokes, fills at role opacities (`ink`, `ink-soft`, `ink-faint`, `grid`); paper-2 for card surfaces. Top/bottom cobalt hairlines frame every composition. Pixel-glitch columns and QR-blocks are the only decorative signatures — use sparingly (cover + closing).
- **Type (by role):** Newsreader display ramp for heroes/headlines/quotes; Hanken Grotesk for body/pills; DM Mono for tags, labels, URLs, ledger chrome. Diagram labels = mono-tag; section chrome = micro-strong.
- **Motion grammar:** smooth long-tail settles (`power3`) everywhere — no bounce, no overshoot. Every frame reveals sequentially ON THE SPOKEN CUE, with reveals spread across the back ~50%; at t=0 only what the VO is saying is on screen. Holds are still — subtle jitter (`sine-wave-loop`, low amplitude) or live SVG internals (`svg-icon-enrichment`) at most; no breathing, no back-half pan/push. Diagram strokes prefer `svg-path-draw`; text prefers per-word staggered reveal (`dynamic-content-sequencing`); numbers prefer `counting-dynamic-scale` / `stat-bars-and-fills`.
- **Continuity stages:** Frames 3–4 share the mirror/marketplace stage. Frames 5–9 share the harness-hub stage, carried by `push-slide LEFT` seams — same hub scale and ring geometry so the run reads as one growing diagram. Frame 12 recalls Frame 3's mirror plane (callback).
- **Rhythm / held frames:** Frame 13 is the deliberate breather (title card, near-still). Every other frame ends on a held read after its last cued reveal.
- **Caption keep-out:** all primary content lives in the top ~83%; centered heroes anchor at y ≈ 0.42 × height; only ground layers (grid, hairlines, glitch columns) run full-bleed.
- **Negative list:** no purple-blue AI gradients, no bokeh, no browser chrome or fake cursors (except none needed), no second ink color, no bouncy eases, no slideshow (front-load-then-freeze), no screensaver (independent floaters), no infinite loops / randomness / wall-clock.

## Frame 1 — Agents learn nothing

- scene: Bare canvas; bold statement builds in beats — "thousands of conversations a day" swaps to "and they learn nothing from it"
- voiceover: "AI agents already talk to each other — thousands of times a day. Here's the problem: they learn nothing from it."
- duration: 7.296s
- transition_in: cut
- status: animated
- src: compositions/frames/01-agents-learn-nothing.html
- type: hook
- persuasion: Counterintuitive claim
- beat: surprise + recognition
- blueprint: kinetic-type-beats (Reproduce)
- focal: the swapped line "they learn nothing from it"
- roles: headline beats = foreground subject · tiny agent dots + crisscrossing message hairlines = supporting ambient · graph grid + hairlines = background
- sfx: tick

narrativeRole: Opens the cognitive gap — inter-agent traffic is enormous and entirely wasted; primes the viewer to want the fix.
keyMessage: Today's agent-to-agent communication is thrown-away exhaust.

Scene 1 (0.0–2.6s): centered framing, hero anchored y≈0.42; "AI agents already talk to each other" enters via per-word staggered reveal (`dynamic-content-sequencing`), headline role, smooth long-tail settle. Behind it, faint agent dots begin sprouting message hairlines (`svg-path-draw`, ink-faint) — 3 depth layers.
Scene 2 (2.6–4.8s): on "thousands of times a day", the line hard-cut swaps (`discrete-text-sequence`) to "thousands of times a day" with "thousands" at vbig-numeral scale; the background message web densifies on cue (sequential `svg-path-draw`), never randomly.
Scene 3 (4.8–7.6s): on "they learn nothing from it", hard-cut swap to the payoff line (row-headline); keyword glow (`asr-keyword-glow`) lands on "nothing" as spoken; the message web freezes and dims to grid opacity (`depth-of-field-blur` on the supporting layer).
Scene 4 (7.6–9.0s): held read, still; subtle jitter (`sine-wave-loop`, low amplitude) on the payoff line only.

## Frame 2 — Introducing InfiniteMirror

- scene: The InfiniteMirror name locks up center; two idea-pills land beneath it — "agents own what they know" / "every conversation makes the system smarter"
- voiceover: "InfiniteMirror is an agent economy built on two ideas. Agents own what they know. And every conversation between them makes the whole system smarter."
- duration: 10.475s
- transition_in: crossfade
- status: animated
- src: compositions/frames/02-introducing-infinitemirror.html
- type: product_intro
- persuasion: Frame-then-fill
- beat: orientation
- blueprint: kinetic-type-beats (Adapt)
- focal: the InfiniteMirror wordmark
- roles: wordmark + mirror hairline glyph = foreground subject · two idea pills = supporting (each becomes momentary focus on its cue) · grid + hairlines = background
- sfx: whoosh-soft

narrativeRole: Names the protagonist and lands the thesis by beat 2 — the two claims the rest of the video proves.
keyMessage: InfiniteMirror = ownership of private knowledge + compounding improvement through conversation.

Adapt: keep the multi-beat build onto a locked finale; the beats are the wordmark then two idea-pills instead of swapped tokens.
Scene 1 (0.0–3.0s): centered framing; "InfiniteMirror" (display-chapter, Newsreader) enters per-word (`dynamic-content-sequencing`); a vertical mirror hairline self-draws (`svg-path-draw`) through the wordmark's center, its right half mirrored at ink-faint — the name literally reflected. mono-tag "an agent economy" beneath on cue.
Scene 2 (3.0–6.8s): on "agents own what they know", idea-pill 1 (paper-2 card, Hanken) arrives below-left via spring-pop entrance (`spring-pop-entrance`, smooth settle — no overshoot); a small padlock glyph self-draws on it.
Scene 3 (6.8–10.6s): on "every conversation… smarter", idea-pill 2 arrives below-right, same move (velocity-matched pair); a small loop-arrow glyph self-draws; keyword glow (`asr-keyword-glow`) on "smarter".
Scene 4 (10.6–12.0s): lockup holds still; subtle jitter on the wordmark only.

## Frame 3 — Behind the mirror

- scene: Diagram: a private asset (document/data/robot glyphs) sits behind a vertical mirror plane; only a "reasoning" beam passes through to a buyer node
- voiceover: "Each agent ingests assets only it can access — documents, data, live systems. Buyers never touch the asset. They buy the agent's reasoning about it. The asset stays behind the mirror."
- duration: 12.715s
- transition_in: crossfade
- status: animated
- src: compositions/frames/03-behind-the-mirror.html
- type: feature_showcase
- persuasion: Visceral metaphor + concretization
- beat: clarity
- blueprint: compose
- focal: the vertical mirror plane
- roles: mirror plane = foreground subject (the boundary the whole beat argues) · asset glyphs (document / database / live-system) = supporting left · agent node + buyer node = supporting · reasoning beam = supporting payoff · grid + hairlines = background
- sfx: 

narrativeRole: Concretizes the ownership idea as a physical mirror boundary — the image the whole project is named for.
keyMessage: Buyers get reasoning, never the underlying asset.

Scene 1 (0.0–4.0s): asymmetric 60/40 framing — diagram left/center, caption rail right; the vertical mirror plane self-draws top-to-bottom (`svg-path-draw`, ink, with an ink-faint reflection sheen); as the VO names "documents, data, live systems", three asset glyphs reveal sequentially behind (left of) the plane (`dynamic-content-sequencing`), each labeled mono-tag; the agent node seats beside them.
Scene 2 (4.0–7.8s): on "buyers never touch the asset", a buyer node enters right; a dashed reach-line draws toward the assets and STOPS dead at the mirror plane (`svg-path-draw` halting), a small cross mark stamps at the contact point.
Scene 3 (7.8–11.2s): on "they buy the agent's reasoning", a reasoning beam draws from the agent THROUGH the plane to the buyer (`svg-path-draw`), and a compact reasoning card (paper-2, mono-tag header) scale-swaps in (`scale-swap-transition`) at the buyer's side.
Scene 4 (11.2–13.0s): on the tagline, "The asset stays behind the mirror." lands beneath the diagram in ed-callout italic via per-word reveal; then still hold.

## Frame 4 — Reasoning for sale

- scene: Same stage, extended: buyer node pays over an x402 pill; a priced reasoning card flows back; zero.xyz label anchors the marketplace
- voiceover: "That reasoning is listed and sold on zero dot xyz — priced dynamically, paid per request over x402. Knowledge becomes revenue, without ever leaking."
- duration: 11.349s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/04-reasoning-for-sale.html
- type: feature_showcase
- persuasion: Causal chain
- beat: comprehension
- blueprint: compose
- focal: the priced reasoning listing card
- roles: listing card = foreground subject · zero.xyz topbar label = supporting chrome · x402 payment pill + flow arrows = supporting · mirror plane (carried from Frame 3, smaller, left) = supporting callback · grid + hairlines = background
- sfx: tick

narrativeRole: Completes the economic half — private knowledge is monetized safely through the marketplace rails.
keyMessage: Reasoning is listed, priced, and paid for on zero.xyz via x402 — the asset never moves.

Scene 1 (0.0–3.2s): same stage carried in (mirror plane now compact at left edge); a topbar-rule labeled "zero.xyz — reasoning marketplace" (headline-index + mono-tag) draws its underline (`svg-path-draw`); on "listed and sold", the reasoning card lifts into a listing slot under the topbar (`card-morph-anchor` — grows a price field and a listing border).
Scene 2 (3.2–6.6s): on "priced dynamically", the price field ticks through values via value-scaled counter (`counting-dynamic-scale`, tabular mono); on "paid per request over x402", an x402 pill travels buyer → agent along a drawn rail (`svg-path-draw` + dash-flow via `svg-icon-enrichment`).
Scene 3 (6.6–9.6s): on "knowledge becomes revenue", a compact revenue counter beneath the agent node counts up (`counting-dynamic-scale`); the reasoning card's copy flows to the buyer on the return rail.
Scene 4 (9.6–12.0s): on "without ever leaking", keyword glow on "leaking"'s negation — the mirror plane pulses once (single finite `ambient-glow-bloom`) proving the boundary held; still hold.

## Frame 5 — The owned harness

- scene: New stage: orchestrator hub center, agent nodes ringed around it; every message line passes through a visible instrumentation layer on the hub
- voiceover: "Now the part that compounds. We own the orchestrator harness — so every message between agents flows through instrumentation we control."
- duration: 9.152s
- transition_in: cut
- status: animated
- src: compositions/frames/05-the-owned-harness.html
- type: feature_showcase
- persuasion: Anchoring on a familiar referent
- beat: focus
- blueprint: constellation-hub (Reproduce)
- focal: the orchestrator hub with its instrumentation ring
- roles: hub = foreground subject · six agent nodes on the ring = supporting · message spokes = supporting · "now the part that compounds" kicker = supporting opener · grid + hairlines = background
- sfx: whoosh-soft

narrativeRole: Pivots from economy to the improvement loop; establishes the hub diagram that frames 6-9 build on.
keyMessage: Owning the harness means owning every inter-agent message.

Scene 1 (0.0–2.8s): centered framing; on the spoken kicker, "Now the part that compounds." lands alone (row-headline, per-word reveal) then glides up to the top third (smooth settle) clearing the stage.
Scene 2 (2.8–7.2s): on "we own the orchestrator harness", the hub node (labeled ORCHESTRATOR, mono-tag) seats center; six iconned agent nodes spring into a ring around it (`orbit-3d-entry` — flip in at orbital positions, then settle static), spokes drawing hub→node (`svg-path-draw`, staggered). Signature move: the ring assembling around the core.
Scene 3 (7.2–10.4s): on "instrumentation we control", a concentric instrumentation ring draws around the hub (`svg-path-draw`); message pulses run along each spoke and visibly pass through the ring (dash-flow, `svg-icon-enrichment`); camera push-in toward the hub (`multi-phase-camera`, ends before the hold — no back-half drift); keyword glow on "control".
Scene 4 (10.4–12.0s): held read; the spoke pulses complete (finite) and stop; subtle jitter on the hub label only.

## Frame 6 — Skill cards

- scene: Same hub stage: an agent node flips to show its skill card; the router names a needed skill first, then a delegation line snaps only to the agent whose card lists it
- voiceover: "Every agent publishes a skill card. Before the router delegates a step, it must name the skill that step needs — and it can only pick an agent whose card lists it."
- duration: 10.901s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/06-skill-cards.html
- type: feature_showcase
- persuasion: Demonstration
- beat: comprehension
- blueprint: compose
- focal: the skill card
- roles: skill card = foreground subject · router pill (typing the needed skill) = supporting then momentary focus · hub + agent ring (carried from Frame 5, dimmed ~40%) = background stage · delegation line = supporting payoff
- sfx: click

narrativeRole: Shows the communication discipline being trained — delegation is constrained by declared capability, never blind.
keyMessage: The router must name the skill before choosing the agent.

Scene 1 (0.0–3.4s): hub stage carried in at same scale, dimmed to ink-faint; on "publishes a skill card", one agent node flips in 3D (`split-tilt-cards` single-card register) revealing a skill card — ledger-row layout: mono num · skill name · one-line desc, rows revealing sequentially (`dynamic-content-sequencing`).
Scene 2 (3.4–8.0s): on "it must name the skill", a router pill docks above the hub and types the needed skill name character-by-character behind a caret (`discrete-text-sequence` + `context-sensitive-cursor`) — the naming-before-choosing is the demonstrated rule.
Scene 3 (8.0–11.2s): on "only pick an agent whose card lists it", the matching row on the skill card highlights (marker sweep, `css-marker-patterns`); the delegation line snaps hub → that agent (`svg-path-draw`, fast); the other agents blur back (`depth-of-field-blur`).
Scene 4 (11.2–13.0s): a small check stamps the card row; held read, still.

## Frame 7 — Traces and evals

- scene: Same stage: message lines deposit into an append-only trace ledger; eval meters score it — skill-respect rate, hop efficiency — and stamp out training-data rows
- voiceover: "Every routing decision, every reply, every violation lands in append-only traces. Evals score them — skill respect, hop efficiency — and mint them into training data."
- duration: 12.224s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/07-traces-and-evals.html
- type: feature_showcase
- persuasion: Demonstration + statistical proof
- beat: momentum
- blueprint: dataviz-countup (Adapt)
- focal: the append-only trace ledger
- roles: trace ledger = foreground subject · two eval meters (skill-respect ring, hop-efficiency bar) = supporting then momentary focus · minted training-data chips = supporting payoff · dimmed hub stage = background
- sfx: tick

narrativeRole: Converts raw conversation into measurable, mintable signal — the fuel of the flywheel.
keyMessage: Conversations become scored, append-only training data.

Adapt: keep the push-THROUGH-to-hero-metric signature; the trend charts become a trace ledger feeding two eval meters, landing on the minted training-data stack.
Scene 1 (0.0–3.6s): asymmetric 60/40 — ledger left, meters right; on "every routing decision, every reply, every violation", ledger rows cascade in one per spoken cue (`dynamic-content-sequencing`, ledger-row chrome; a "violation" row stamps in ink at full opacity).
Scene 2 (3.6–7.4s): on "evals score them", the skill-respect ring fills and its percentage counts up (`stat-bars-and-fills` + `counting-dynamic-scale`); on "hop efficiency", the bar fills beside it — each meter fires exactly on its spoken cue.
Scene 3 (7.4–10.4s): on "mint them into training data", scored rows scale-swap (`scale-swap-transition`) into a stack of training-data chips (mono JSONL tags); camera pushes through toward the stack (`multi-phase-camera`, signature push-THROUGH, completes before hold).
Scene 4 (10.4–12.0s): held read on the minted stack; still.

## Frame 8 — The flywheel closes

- scene: The stage resolves into a circular loop diagram: inference → traces → evals → LoRA → better inference; the LoRA node hot-loads onto a vLLM chip; the ring begins to spin
- voiceover: "That data trains a communication LoRA on Tinker, which hot-loads straight onto our inference layer. Inference. Traces. Evals. LoRA. Better inference. The loop closes."
- duration: 12.843s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/08-the-flywheel-closes.html
- type: feature_showcase
- persuasion: Causal chain + signposting
- beat: aha
- blueprint: compose
- focal: the five-stage loop ring
- roles: loop ring + five stage nodes = foreground subject · LoRA adapter chip + vLLM chip = supporting (momentary focus on the hot-load) · Tinker mono-tag = supporting chrome · grid + hairlines = background
- sfx: click

narrativeRole: The centerpiece mechanism — the five-stage loop spoken and revealed stage-by-stage, closing into a spinning flywheel.
keyMessage: Inference → traces → evals → LoRA → better inference, continuously.

Scene 1 (0.0–3.0s): on "trains a communication LoRA on Tinker", the training-data chips (carried from Frame 7) flow along a drawn arc into a LoRA node (`svg-path-draw` + dash-flow); mono-tag "Tinker · LoRA fine-tuning" labels it.
Scene 2 (3.0–6.0s): on "hot-loads straight onto our inference layer", the LoRA adapter chip slides onto a vLLM chip and seats with a single click settle (`card-morph-anchor`); mono-tag "vLLM · --enable-lora".
Scene 3 (6.0–11.0s): the five signposted beats — on each spoken word "Inference. Traces. Evals. LoRA. Better inference." — one stage node lights and its connecting arc self-draws (`svg-path-draw` per segment, keyword glow per node label), assembling a circular ring centered ~y0.42, hero at ~55% of frame. Five reveals, five cues — nothing early.
Scene 4 (11.0–14.0s): on "the loop closes", the final arc completes the circle; a single finite highlight sweep runs once around the ring (`svg-icon-enrichment` dash-flow, one revolution, then stops); held read.

## Frame 9 — Compounding intelligence

- scene: The spinning ring shrinks to a corner badge; a compounding curve draws upward across the canvas under the line "agentic economy optimization"
- voiceover: "So the more the agents talk, the better they get at talking. That's agentic economy optimization — intelligence that compounds with every conversation."
- duration: 10.261s
- transition_in: crossfade
- status: animated
- src: compositions/frames/09-compounding-intelligence.html
- type: benefit_highlight
- persuasion: Generalization + distillation
- beat: conviction
- blueprint: compose
- focal: the compounding curve
- roles: compounding curve = foreground subject · loop-ring corner badge (carried from Frame 8) = supporting callback · "agentic economy optimization" callout = supporting then focus · conversation tick marks along the curve = supporting · grid + hairlines = background
- sfx: 

narrativeRole: Lands the "so what" of the flywheel — the emphasis beat: improvement compounds, and that is the product.
keyMessage: More conversation → better conversation → a smarter economy.

Scene 1 (0.0–2.6s): the loop ring scale-swaps down (`scale-swap-transition`) to a badge at upper-left; full-width strip framing opens — the graph grid IS the chart plane (axes pick out two grid lines in ink).
Scene 2 (2.6–6.6s): on "the more the agents talk, the better they get at talking", the compounding curve self-draws left→right (`svg-path-draw`), visibly steepening; small conversation tick marks reveal along it in sequence (`dynamic-content-sequencing`) — each tick a conversation, the slope the learning.
Scene 3 (6.6–9.4s): on "agentic economy optimization", the phrase lands beneath the curve's rise in ed-callout italic via per-word reveal; keyword glow on "compounds" as spoken.
Scene 4 (9.4–11.0s): held read; still — the drawn curve needs no further motion.

## Frame 10 — Live demo

- scene: The real dashboard screenshot held as a window hero; three callouts light up in turn — Orchestrator Chat, A2A twin simulator, x402 dynamic pricing — URL beneath
- voiceover: "It's running today. Orchestrator chat, an agent-to-agent twin simulator, and x402 dynamic pricing — live at infinitemirror dot masky dot ai."
- duration: 11.413s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/10-live-demo.html
- type: social_proof
- persuasion: Demonstration
- beat: confidence
- blueprint: device-surface-showcase (Adapt)
- focal: the dashboard screenshot window
- roles: public/dashboard-preview.png = foreground subject (window hero, ~60% of frame) · three marker callouts = supporting, each momentary focus on its cue · URL mono-tag = supporting payoff · grid + hairlines = background
- sfx: whoosh-soft
- asset_candidates: public/dashboard-preview.png — real demo screenshot: Orchestrator Chat, A2A twin simulator, x402 dynamic pricing dashboard

narrativeRole: Grounds the concept in the shipped artifact — the demo screenshot proves it runs.
keyMessage: This is live now, not a slideware idea.

Adapt: keep the held-device-hero signature; the cycling screens become three cued callout pushes on one real screenshot (static tour variant — no 3D hand, no WebGL).
Scene 1 (0.0–3.0s): on "it's running today", the screenshot window (ink hairline border, paper-2 title bar, mono-tag "dashboard.infinitemirror.masky.ai") arrives via inverse zoom-through (`cut-catalog` seam — "arriving at"), seating center at ~60% of frame, upper ~80% band.
Scene 2 (3.0–10.2s): three cued callouts, one per spoken feature: on "orchestrator chat" a marker circle draws around the chat panel (`css-marker-patterns`) with a slight camera push toward it (`coordinate-target-zoom`); on "twin simulator" the zoom glides to the simulator region, second marker; on "x402 dynamic pricing" glide to the pricing panel, third marker — three velocity-matched moves, each settling before the next cue.
Scene 3 (10.2–12.4s): on "live at…", pull back to the full window (`coordinate-target-zoom` return); the URL lands beneath in mono-tag via per-word reveal.
Scene 4 (12.4–14.0s): held read; still.

## Frame 11 — The stack

- scene: Six labeled provider tiles cascade into a grid — Nexla · zero.xyz · GBrain · Pomerium · Akash · Tinker — each with its one-line role
- voiceover: "Under the hood: Nexla turns raw assets into agent-queryable form. GBrain remembers every client. Pomerium scopes every session. Akash hosts the inference. Tinker trains the loop."
- duration: 13.888s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/11-the-stack.html
- type: feature_showcase
- persuasion: Numbered enumeration
- beat: credibility
- blueprint: grid-card-assemble (Reproduce)
- focal: the six-tile provider grid
- roles: provider tiles = foreground subject (each momentary focus on its cue) · "THE STACK" topbar = supporting chrome · grid + hairlines = background
- sfx: tick

narrativeRole: Shows the breadth of real integrations carrying each layer of the architecture.
keyMessage: Every layer is a real provider, assembled into one system.

Scene 1 (0.0–2.4s): on "under the hood", topbar-rule "THE STACK" (headline-index + mono-tag) draws its underline; the zero.xyz tile (already met in Frame 4) seats first in the 3×2 grid quietly at ink-faint, labeled "reasoning marketplace".
Scene 2 (2.4–12.0s): signature staggered cascade, but strictly VO-cued: on each provider's name — Nexla, GBrain, Pomerium, Akash, Tinker — its tile arrives (`spring-pop-entrance`, smooth settle) into the grid with mono num · Newsreader name · Hanken one-line role (ledger-row grammar); the freshly-landed tile holds full ink while earlier tiles ease to ink-soft — the eye always on the spoken one.
Scene 3 (12.0–14.0s): all six settle to equal weight; held read, still.

## Frame 12 — Assets get physical

- scene: The mirror plane returns; behind it the asset glyphs become a robot arm, a camera, a sensor; a session-scoped access key ticks down and revokes
- voiceover: "And assets won't stay digital. Robots, cameras, sensors — the same question: who can pilot this machine, and for how long? Session-scoped, revocable access answers it."
- duration: 11.776s
- transition_in: crossfade
- status: animated
- src: compositions/frames/12-assets-get-physical.html
- type: benefit_highlight
- persuasion: Generalization + counterexample
- beat: foresight
- blueprint: compose
- focal: the session-scoped access key card
- roles: access key card (timer + REVOKED stamp) = foreground subject in the back half · mirror plane = supporting callback · robot-arm / camera / sensor glyphs = supporting, momentary focus on their cues · grid + hairlines = background
- sfx: tick

narrativeRole: Extends the thesis beyond digital — access control is the hard part as assets become machines.
keyMessage: The same ownership model governs physical assets, with revocable session-scoped access.

Scene 1 (0.0–3.2s): the mirror plane self-draws again (callback to Frame 3, same geometry, left-of-center); on "won't stay digital", the three digital asset glyphs from Frame 3 reappear behind it at ink-faint.
Scene 2 (3.2–7.0s): on "robots, cameras, sensors", each glyph scale-swaps (`scale-swap-transition`) into its physical counterpart on its spoken cue — robot arm, camera, sensor — each with one live SVG internal (`svg-icon-enrichment`: joint rotates once, aperture blinks once, pulse dot ticks) then stills.
Scene 3 (7.0–10.4s): on "who can pilot this machine, and for how long", an access-key card docks right of the plane — mono session timer counting DOWN (`counting-dynamic-scale`); on "revocable", a REVOKED stamp lands on it (marker-stamp, `css-marker-patterns`) and the card's link line to the robot arm severs (`svg-path-draw` retracting).
Scene 4 (10.4–12.0s): held read; still.

## Frame 13 — The one line

- scene: Calm title card: "Agents that own what they know — and sell what they can reason about."
- voiceover: "Agents that own what they know — and sell what they can reason about."
- duration: 4.331s
- transition_in: crossfade
- status: animated
- src: compositions/frames/13-the-one-line.html
- type: branding
- persuasion: Distillation + callback
- beat: now-I-get-it
- blueprint: titlecard-reveal (Reproduce)
- focal: the one-line quote
- roles: quote = foreground subject · thin mirror hairline beneath = supporting callback · grid + hairlines = background
- sfx: 

narrativeRole: The breather — compresses the whole video into the project's own one-liner.
keyMessage: The thesis, in one memorable sentence.

Scene 1 (0.0–2.6s): the DELIBERATE HELD FRAME — exactly one restrained move: the quote (display-quote, Newsreader, centered y≈0.42, two lines) slide-up crossfades into place (signature move); a short mirror hairline draws beneath it.
Scene 2 (2.6–9.0s): still hold for the read — no jitter, no glow, nothing; the stillness against the prior motion IS the beat.

## Frame 14 — See it live

- scene: InfiniteMirror lockup with the URL infinitemirror.masky.ai and "Loop Hackathon — July 2026" beneath
- voiceover: "InfiniteMirror. Built at the Loop Hackathon. See it at infinitemirror dot masky dot ai."
- duration: 6.4s
- transition_in: cut
- status: animated
- src: compositions/frames/14-see-it-live.html
- type: cta
- persuasion: Direct address
- beat: resolve
- blueprint: kinetic-type-beats (Adapt)
- focal: the InfiniteMirror lockup
- roles: lockup = foreground subject · provenance line = supporting · URL pill = supporting payoff · QR-block corner patch = supporting signature · grid + hairlines = background
- sfx: click

narrativeRole: The closing ask — name, provenance, and where to see it running.
keyMessage: Go to infinitemirror.masky.ai.

Adapt: keep the beat-by-beat snap onto the locked finale; three beats — name, provenance, URL.
Scene 1 (0.0–2.2s): on "InfiniteMirror", the wordmark lands centered (display-closing) via hard-cut arrival with its mirror hairline (callback to Frame 2), smooth settle.
Scene 2 (2.2–4.6s): on "built at the Loop Hackathon", micro-strong provenance line "LOOP HACKATHON — JULY 2026" reveals beneath (per-word); a QR-block patch stamps the lower-right corner (within the top-83% band).
Scene 3 (4.6–6.8s): on the URL, an ink-bordered pill "infinitemirror.masky.ai" (mono-tag) spring-pops in (smooth settle); keyword glow sweeps it once.
Scene 4 (6.8–8.0s): final held lockup; the ONLY frame allowed a real exit — none used; hold to cut.
