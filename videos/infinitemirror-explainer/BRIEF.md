---
workflow: faceless-explainer
flow: automation
storyboard: no
message: "Agents that own private assets and talk to each other get smarter with every conversation — InfiniteMirror turns that improvement loop into an economy"
destination: youtube
aspect: 1920x1080
language: en
length: 180s
angle: concept
narration: yes
---

## Intent

A ~3-minute explainer of InfiniteMirror, the Loop Hackathon (July 17, 2026)
project, for a technical audience (hackathon judges, agent-infrastructure
engineers). The core emphasis the user asked for: **agentic economy
optimization — agents improve the more they talk to each other.** The video
should teach the concept with diagrams and narration: agents own private
assets, sell reasoning (not the assets) on zero.xyz, and every inter-agent
message flows through an owned orchestrator harness whose traces train a
communication LoRA — inference → traces → evals → LoRA → better inference.
Confident, technical, diagram-forward.

## Assets

- public/dashboard-preview.png — the real demo screenshot (Orchestrator Chat,
  A2A twin simulator, x402 dynamic pricing); the demo beat builds on it.

## Customizations

- Diagrams: the architecture stack (Nexla → orchestrator → zero.xyz, with
  Pomerium, GBrain, Akash, Tinker) and the self-improvement flywheel
  (traces → evals → LoRA → hot-load) as invented diagram scenes.
- Show the demo screenshot (demo/dashboard-preview.png) in a dedicated scene.

## Notes

- Source of truth is the repo README.md; sequence is narrative-designed, not
  README order.
- Key vocabulary to keep: skill cards, append-only traces, communication
  LoRA, x402, "the asset stays behind the mirror".
- Emphasize the value: the system gets smarter on every inference because
  the harness owns inter-agent communication.
