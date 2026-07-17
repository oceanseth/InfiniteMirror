"""InfiniteMirror orchestrator harness (MVP).

Routes a task across registered agents, enforcing skill-aware delegation:
the router must name the skill it needs and may only delegate to an agent
whose card lists that skill. Every inter-agent message — including rejected
routing attempts — is appended to traces/<date>.jsonl. Those traces are the
training corpus for the communication LoRA (see lora/README.md).

Usage:
  export ORCH_BASE_URL=http://<endpoint>/v1
  export ORCH_API_KEY=<key>
  export ORCH_MODEL=Qwen/Qwen2.5-14B-Instruct
  python orchestrator.py "your task here"
"""

import json
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

import yaml
from openai import OpenAI

ROOT = Path(__file__).parent
TRACES = ROOT / "traces"
MAX_HOPS = 6

client = OpenAI(
    base_url=os.environ.get("ORCH_BASE_URL", "http://localhost:8000/v1"),
    api_key=os.environ.get("ORCH_API_KEY", "none"),
)
MODEL = os.environ.get("ORCH_MODEL", "Qwen/Qwen2.5-14B-Instruct")


def load_registry():
    return yaml.safe_load((ROOT / "registry.yaml").read_text())["agents"]


def log(trace_id, record):
    TRACES.mkdir(exist_ok=True)
    record = {"trace": trace_id, "ts": datetime.now(timezone.utc).isoformat(), **record}
    path = TRACES / f"{datetime.now(timezone.utc):%Y-%m-%d}.jsonl"
    with path.open("a") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def chat(system, user, temperature=0.2):
    resp = client.chat.completions.create(
        model=MODEL,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )
    return resp.choices[0].message.content


ROUTER_PROMPT = """You are the InfiniteMirror orchestrator. You never answer tasks
yourself; you route work to agents. These are the ONLY agents and their ONLY
skills (an agent has no skills beyond its card):

{cards}

Given the task state, either delegate one step or finish. Reply with ONLY a
JSON object, no prose:
  {{"action": "delegate", "skill": "<skill the step needs>",
    "agent": "<agent name>", "message": "<instruction for that agent>"}}
or
  {{"action": "finish", "answer": "<final assembled answer>"}}

Rules: name the skill FIRST, then pick an agent whose card lists that exact
skill. Never delegate to an agent missing the skill. Keep messages
self-contained — the agent sees nothing but your message."""


def route(registry, transcript):
    cards = "\n".join(
        f"- {name}: skills={a['skills']} — {a['description']}"
        for name, a in registry.items()
    )
    raw = chat(ROUTER_PROMPT.format(cards=cards), transcript)
    start, end = raw.find("{"), raw.rfind("}")
    return json.loads(raw[start : end + 1])


def run(task):
    registry = load_registry()
    trace_id = uuid.uuid4().hex[:12]
    log(trace_id, {"role": "task", "text": task})
    transcript = f"TASK: {task}\n"

    for hop in range(MAX_HOPS):
        decision = route(registry, transcript)
        if decision["action"] == "finish":
            log(trace_id, {"role": "finish", "text": decision["answer"]})
            return decision["answer"]

        agent, skill = decision.get("agent"), decision.get("skill")
        valid = agent in registry and skill in registry.get(agent, {}).get("skills", [])
        log(trace_id, {
            "role": "route", "hop": hop, "agent": agent, "skill": skill,
            "message": decision.get("message", ""), "skill_match": valid,
            "cards_shown": {n: a["skills"] for n, a in registry.items()},
        })
        if not valid:
            # The mistake we are training out of the model: delegating without
            # (or against) skill knowledge. Log it, correct course, continue.
            transcript += (
                f"\n[orchestrator error] '{agent}' does not have skill "
                f"'{skill}'. Re-route to an agent that does.\n"
            )
            continue

        reply = chat(registry[agent]["system_prompt"], decision["message"])
        log(trace_id, {"role": "agent_reply", "hop": hop, "agent": agent, "text": reply})
        transcript += f"\n[{agent} ({skill}) replied] {reply}\n"

    log(trace_id, {"role": "finish", "text": "hop limit reached", "error": True})
    return "hop limit reached; partial transcript:\n" + transcript


if __name__ == "__main__":
    task = " ".join(sys.argv[1:]) or (
        "Estimate the monthly cost of one A100 at $1.10/hour, write a python "
        "one-liner that computes it, and summarize the result in one sentence."
    )
    print(run(task))
