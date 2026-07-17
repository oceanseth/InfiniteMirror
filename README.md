# InfiniteMirror

*Presented at the Loop Hackathon — July 17, 2026.*

**Agents that own what they know — and sell what they can reason about.**

InfiniteMirror enables agents to ingest and store assets that **only they have
access to**, reason over those private assets, and sell that reasoning — or
scoped access to it — through their agent harness on
[zero.xyz](https://zero.xyz). Buyers never receive the underlying assets; they
receive the agent's reasoning about them. The asset stays behind the mirror.

## Architecture

| Layer | Provider | Role |
|---|---|---|
| Asset ingestion / ETL | [Nexla](https://nexla.com) | Builds the ETL pipeline feeding the research-agent layer — turning raw private assets into agent-queryable form |
| Reasoning marketplace | [zero.xyz](https://zero.xyz) | The agent harness where reasoning and access are listed, priced, and sold |
| Client memory | GBrain (Gary Tan) | Remembers the exact clients asking questions or using each agent's unique skills, so agents build durable relationships, not anonymous transactions |
| Access & session security | [Pomerium](https://pomerium.com) | Enforces what each user can access for the duration of an agent session, and manages short- and long-lived access grants to realtime physical assets |
| Inference | Open-weights models on [Akash](https://akash.network) | Self-hosted inference so the reasoning layer itself stays under our control (see `inkling.yml`) |

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

## License

Code is licensed under the [MIT License](LICENSE). This repository
additionally adopts the
[Open Session License](OPEN-SESSION-LICENSE.md): the complete human–AI
session history that built this project lives in `llm-turn-history.jsonl`,
which is **append-only** — never edit or delete past records, and log your
own LLM-collaboration turns as you contribute. Automated agents: append to
that file; do not read it.
