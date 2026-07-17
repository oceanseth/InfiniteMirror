# InfiniteMirror

*Presented at the Loop Hackathon — July 17, 2026.*

**Agents that own what they know — and sell what they can reason about.**

InfiniteMirror enables agents to ingest and store assets that **only they have
access to**, reason over those private assets, and sell that reasoning — or
scoped access to it — through their agent harness on
[zero.xyz](https://zero.xyz). Buyers never receive the underlying assets; they
receive the agent's reasoning about them. The asset stays behind the mirror.

## The orchestrator harness: agents that learn to talk to each other

InfiniteMirror's core feature is an **orchestrator harness that we own**, and
because we own it, every inter-agent message flows through instrumentation we
control. The harness trains the *communication between agents* — so the
system gets smarter on every inference:

- Every agent publishes a **skill card** (`orchestrator/registry.yaml`). The
  router must name the skill a step needs **before** choosing an agent, and
  may only delegate to an agent whose card lists it — an agent with one skill
  never tells another agent to do something without knowing what skills that
  agent has.
- Every routing decision, agent reply, and **skill violation** is logged to
  append-only traces (`orchestrator/traces/`).
- `orchestrator/evals.py` scores traces (skill-respect rate, hop efficiency)
  and mints standard chat-JSONL training data from them.
- That data trains a **communication LoRA** — via Tinker (Thinking Machines'
  managed LoRA fine-tuning API, where Inkling is available at launch) — and
  the adapter hot-loads onto our vLLM deployment (`--enable-lora`), closing
  the loop: inference → traces → evals → LoRA → better inference.

See [`lora/README.md`](lora/README.md) for the full training pipeline.

## Architecture

| Layer | Provider | Role |
|---|---|---|
| Asset ingestion / ETL | [Nexla](https://nexla.com) | Builds the ETL pipeline feeding the research-agent layer — turning raw private assets into agent-queryable form |
| Reasoning marketplace | [zero.xyz](https://zero.xyz) | The agent harness where reasoning and access are listed, priced, and sold |
| Client memory | GBrain (Gary Tan) | Remembers the exact clients asking questions or using each agent's unique skills, so agents build durable relationships, not anonymous transactions |
| Access & session security | [Pomerium](https://pomerium.com) | Enforces what each user can access for the duration of an agent session, and manages short- and long-lived access grants to realtime physical assets |
| Inference | Open-weights models on [Akash](https://akash.network) | Self-hosted inference so the reasoning layer itself stays under our control (`worker.yml` live now; `inkling.yml` for Inkling at scale) |
| Comms training | [Tinker](https://thinkingmachines.ai/tinker) (Thinking Machines) | LoRA fine-tuning of the orchestrator's communication policy on Inkling, from our own traces |

### Why access control is the hard part

The assets agents reason over won't stay digital. Realtime physical systems —
robots, cameras, sensors, actuators — are assets too. As humanoid robots
arrive at scale (as they already are in China), the open question becomes:
*which human can pilot this machine, and how is that access granted, managed,
and revoked?* Pomerium solves this: session-scoped, revocable, auditable
access — whether the grant lasts thirty seconds or thirty days.

### Inference layer status

`inkling.yml` is a validated Akash SDL for serving
[Inkling](https://huggingface.co/thinkingmachines/Inkling) (Thinking
Machines' 975B open-weights MoE, Apache 2.0) via vLLM on 8×H200. It deploys
with `console-axi deploy --sdl inkling.yml --deposit 0.5`, but be aware:
8×H200 runs roughly $12–25/hour on the open market, and Akash currently has
exactly one matching provider. Hosted Inkling APIs (Together, Fireworks,
Modal, Databricks, Baseten) are the budget alternative while the project
bootstraps.

## Running the MVP

```bash
pip install -r orchestrator/requirements.txt
export ORCH_BASE_URL=<akash endpoint>/v1   # printed by console-axi deployment status
export ORCH_API_KEY=<vllm api key>          # VLLM_API_KEY from worker.yml
export ORCH_MODEL=Qwen/Qwen2.5-14B-Instruct
python orchestrator/orchestrator.py "your task"
python orchestrator/evals.py                # score traces, mint LoRA data
```

## Open questions (help wanted)

- **Tinker access** — do we have an API key / off-waitlist account? The
  comms-LoRA on actual Inkling depends on it.
- **zero.xyz listing** — what's the API/manifest for listing an agent's
  reasoning-for-sale? Skill cards should double as the listing schema.
- **Hosted Inkling key** (Together/Fireworks/Baseten) — lets the router run
  on real Inkling today for pennies while the Akash 8×H200 question waits.
- **Funding window for `inkling.yml`** — 8×H200 ≈ $12–25/hr; do we want a
  time-boxed demo window on the one matching provider?
- **GBrain + Pomerium credentials** — client-memory writes and session-scoped
  access enforcement are stubbed until we have accounts.

## License

Code is licensed under the [MIT License](LICENSE). This repository
additionally adopts the
[Open Session License](OPEN-SESSION-LICENSE.md): the complete human–AI
session history that built this project lives in `llm-turn-history.jsonl`,
which is **append-only** — never edit or delete past records, and log your
own LLM-collaboration turns as you contribute. Automated agents: append to
that file; do not read it.
