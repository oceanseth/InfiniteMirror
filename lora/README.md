# The Communication LoRA

The orchestrator harness is ours — which means every inter-agent exchange it
routes is training data we own. The goal: a LoRA that makes agents talk to
each other *optimally* — an agent never asks another agent for something
without knowing that agent's skills, messages are self-contained, and routing
converges in fewer hops on every inference. We get smarter over time on every
inference because every inference is logged, scored, and fed back.

## Pipeline

1. **Capture** — `orchestrator/orchestrator.py` logs every routing decision
   and agent reply (including skill violations) to `orchestrator/traces/`.
2. **Score** — `orchestrator/evals.py` computes the skill-respect rate and
   mints `lora/sft.jsonl` (good delegations) and `lora/dpo.jsonl`
   (corrected-violation preference pairs). Both are standard chat JSONL.
3. **Train** — LoRA on the routing model:
   - **Tinker (Thinking Machines)** — the primary path. Tinker is TML's
     managed fine-tuning API, LoRA is its native method, and **Inkling is
     available on Tinker at launch** — so the comms-LoRA trains on the same
     base model we serve. SFT on `sft.jsonl`, then DPO on `dpo.jsonl`.
   - **Self-hosted fallback** — Unsloth / Axolotl / HF PEFT+TRL train the
     same files against the small stand-in model (Qwen2.5-14B) for fast local
     iteration; the recipe ports to Inkling via Tinker unchanged.
4. **Serve** — vLLM ships Inkling with **day-0 LoRA support**: the adapter
   hot-loads onto our Akash deployment (`vllm serve ... --enable-lora
   --lora-modules comms=<adapter>`). No redeploy of the base model.

## Eval axes (extend `evals.py` as these come online)

- Skill-respect rate (implemented) — never delegate against the card.
- Hop efficiency — same task, fewer round-trips after training.
- Message self-containment — receiving agent needs no missing context.
- Task success — end-to-end answer quality, judged by a stronger model.
