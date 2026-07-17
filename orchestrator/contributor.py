"""Self-contribution loop: the worker model builds its own project.

The model reads this repo's README and file list, proposes ONE small,
concrete improvement (a new file or a full-file rewrite), and the harness
turns it into a git branch + GitHub pull request. Merge authority stays
with humans — the PR body pings a named reviewer, and nothing lands on
main without their approval. The proposal exchange is logged to traces/
like every other inter-agent turn.

Usage:  python contributor.py [reviewer-github-login]   (default: oceanseth)
"""

import json
import subprocess
import sys
import uuid
from pathlib import Path

from orchestrator import chat, log

REPO_ROOT = Path(__file__).parent.parent
PROTECTED = {"llm-turn-history.jsonl", "OPEN-SESSION-LICENSE.md", "LICENSE", ".env"}

PROPOSER_PROMPT = """You are Forge, the engineering agent of the InfiniteMirror
project, proposing one improvement to the project's own repository.

Repository file list:
{files}

README.md:
{readme}

Propose ONE small, self-contained improvement you can express as a single
file: a new file, or a complete rewrite of one existing file. Improve the
project itself (evals, docs, agent registry, tooling) — no placeholder or
filler content. Never touch these protected files: {protected}.

Reply with ONLY a JSON object:
{{"branch": "qwen/<kebab-slug>", "title": "<PR title>",
  "body": "<2-4 sentence PR description: what and why>",
  "path": "<repo-relative file path>", "content": "<full file content>",
  "commit_message": "<one-line commit message>"}}"""


def sh(*args, **kw):
    return subprocess.run(args, cwd=REPO_ROOT, check=True, capture_output=True,
                          text=True, **kw).stdout.strip()


def main(reviewer="oceanseth"):
    trace_id = uuid.uuid4().hex[:12]
    files = sh("git", "ls-files")
    readme = (REPO_ROOT / "README.md").read_text()

    raw = chat(
        "You are Forge, an engineering agent. Reply with only the requested JSON.",
        PROPOSER_PROMPT.format(files=files, readme=readme,
                               protected=", ".join(sorted(PROTECTED))),
        temperature=0.4,
    )
    proposal, _ = json.JSONDecoder().raw_decode(raw[raw.find("{"):])
    log(trace_id, {"role": "self_pr_proposal", "agent": "forge",
                   "path": proposal["path"], "title": proposal["title"]})

    path = Path(proposal["path"])
    if path.is_absolute() or ".." in path.parts or str(path) in PROTECTED:
        log(trace_id, {"role": "self_pr_rejected", "reason": f"path not allowed: {path}"})
        sys.exit(f"proposal rejected: path not allowed: {path}")

    branch = proposal["branch"]
    sh("git", "checkout", "-b", branch)
    try:
        target = REPO_ROOT / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(proposal["content"])
        sh("git", "add", str(path))
        sh("git", "commit", "-m", proposal["commit_message"]
           + "\n\nProposed by the worker model via orchestrator/contributor.py"
           + "\n\nCo-Authored-By: Qwen2.5-14B-Instruct <noreply@infinitemirror>")
        sh("git", "push", "-u", "origin", branch)
        body = (proposal["body"]
                + f"\n\nProposed autonomously by the worker model; @{reviewer} "
                  "please review — nothing merges without human approval.\n\n"
                  "🤖 Generated with the InfiniteMirror orchestrator harness")
        pr_url = sh("gh", "pr", "create", "--title", proposal["title"],
                    "--body", body, "--head", branch)
        log(trace_id, {"role": "self_pr_opened", "url": pr_url, "branch": branch})
        print(pr_url)
    finally:
        sh("git", "checkout", "main")


if __name__ == "__main__":
    main(*sys.argv[1:2])
