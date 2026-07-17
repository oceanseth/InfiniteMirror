"""Score orchestrator traces and mint LoRA training pairs.

Reads traces/*.jsonl, scores each routing decision on the axis we care about
— did the router respect the skill cards? — and writes:

  lora/sft.jsonl   chat-format records of correct skill-aware delegations
                   (supervised fine-tuning corpus)
  lora/dpo.jsonl   {"prompt", "chosen", "rejected"} preference pairs where a
                   bad delegation (skill_match=false) was later corrected —
                   the corrected route is `chosen`, the violation `rejected`

Both files are in the de-facto chat JSONL format so they feed directly into
Tinker, Unsloth, Axolotl, or TRL without conversion.
"""

import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).parent
LORA = ROOT.parent / "lora"


def load_traces():
    traces = defaultdict(list)
    for path in sorted((ROOT / "traces").glob("*.jsonl")):
        for line in path.read_text().splitlines():
            r = json.loads(line)
            traces[r["trace"]].append(r)
    return traces


def route_prompt(record, task):
    cards = "\n".join(f"- {n}: skills={s}" for n, s in record["cards_shown"].items())
    return (
        f"Agents:\n{cards}\n\nTask state: {task}\n"
        "Delegate the next step as JSON {skill, agent, message}."
    )


def route_completion(record):
    return json.dumps({
        "skill": record["skill"], "agent": record["agent"],
        "message": record["message"],
    }, ensure_ascii=False)


def main():
    LORA.mkdir(exist_ok=True)
    sft, dpo, total, violations = [], [], 0, 0

    for records in load_traces().values():
        task = next((r["text"] for r in records if r["role"] == "task"), "")
        routes = [r for r in records if r["role"] == "route"]
        total += len(routes)
        for i, r in enumerate(routes):
            if r["skill_match"]:
                sft.append({"messages": [
                    {"role": "user", "content": route_prompt(r, task)},
                    {"role": "assistant", "content": route_completion(r)},
                ]})
            else:
                violations += 1
                fix = next((n for n in routes[i + 1:] if n["skill_match"]), None)
                if fix:
                    dpo.append({
                        "prompt": route_prompt(r, task),
                        "chosen": route_completion(fix),
                        "rejected": route_completion(r),
                    })

    (LORA / "sft.jsonl").write_text(
        "".join(json.dumps(r, ensure_ascii=False) + "\n" for r in sft))
    (LORA / "dpo.jsonl").write_text(
        "".join(json.dumps(r, ensure_ascii=False) + "\n" for r in dpo))

    rate = (total - violations) / total if total else 0.0
    print(f"routes={total} skill_violations={violations} "
          f"skill_respect_rate={rate:.1%} sft={len(sft)} dpo_pairs={len(dpo)}")


if __name__ == "__main__":
    main()
