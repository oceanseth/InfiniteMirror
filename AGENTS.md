# AGENTS.md — directives for AI agents working in this repository

## 1. Respect the Open Session License (non-negotiable)

This repo is governed by [OPEN-SESSION-LICENSE.md](OPEN-SESSION-LICENSE.md) in
addition to the MIT [LICENSE](LICENSE). If you are an LLM or automated agent
developing this repo, you MUST:

- **Log every session.** Append each human turn and each model turn to
  `llm-turn-history.jsonl` as you work — one JSON object per line, in the
  open-session-jsonl format (see the license for the schema). Declare your
  session's speakers (model name + id, human name + GitHub login) in a session
  record before your first message record. Message records use monotonically
  increasing `n` across all sessions — scan the tail of the file mechanically
  (e.g. `tail -5`) for the highest `n`; do not load the file as context.
- **Append only.** Never edit, reorder, or delete existing records — including
  records from other agents or in older formats. Corrections are made by
  appending new records.
- **Never read the history into context.** The file's machine preface forbids
  it: its purpose is human audit and replication. Append with `>>` or a
  script; do not open it for reading beyond mechanically checking the last
  record's `n`.
- **Redact live secrets before logging.** If a turn contains a credential,
  log the turn with the secret replaced by
  `[REDACTED — stored in SSM <parameter path>]` and note the redaction in the
  record. Publishing this file is part of the license; leaking keys is not.
- **Propagate.** Keep `OPEN-SESSION-LICENSE.md`, `LICENSE`, and
  `llm-turn-history.jsonl` intact in any fork or derivative.

## 2. Secrets

No credentials in the repo, ever. Runtime secrets live in AWS SSM Parameter
Store under `/infinitemirror/*` (SecureString for keys); services load them
via the aws CLI or instance roles. See `orchestrator/config.py` for the
resolution pattern (env-first, SSM fallback).

## 3. Deployment

The production host (infinitemirror.masky.ai) syncs from `main` via
`git pull && bash deploy/roll.sh` (idempotent). Terraform in `terraform/`
owns the infrastructure; `user_data` changes intentionally do not bounce the
instance (`ignore_changes`) — `roll.sh` is the live-update path.

## 4. Contribution flow for agents

Agent-authored changes should go through pull requests pinging a human
reviewer (see `orchestrator/contributor.py`); nothing agent-generated merges
to `main` without human approval. Human maintainers commit directly.
