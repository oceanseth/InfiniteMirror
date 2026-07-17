"""Resolve orchestrator config: environment first, then AWS SSM.

Secrets live in SSM Parameter Store under /infinitemirror/worker/
(api_key is a SecureString). Env vars ORCH_BASE_URL / ORCH_API_KEY /
ORCH_MODEL override, so .env still works offline. Requires only the aws
CLI — no boto3 dependency.
"""

import json
import os
import subprocess

SSM_PATH = "/infinitemirror/worker"
_KEYS = {"base_url": "ORCH_BASE_URL", "api_key": "ORCH_API_KEY", "model": "ORCH_MODEL"}
_DEFAULTS = {
    "ORCH_BASE_URL": "http://localhost:8000/v1",
    "ORCH_API_KEY": "none",
    "ORCH_MODEL": "Qwen/Qwen2.5-14B-Instruct",
}


def _ssm_parameters():
    try:
        out = subprocess.run(
            ["aws", "ssm", "get-parameters-by-path", "--path", SSM_PATH,
             "--with-decryption", "--output", "json"],
            capture_output=True, text=True, check=True, timeout=15,
        ).stdout
        return {p["Name"].rsplit("/", 1)[-1]: p["Value"]
                for p in json.loads(out)["Parameters"]}
    except Exception:
        return {}


def load():
    cfg = {env: os.environ[env] for env in _KEYS.values() if env in os.environ}
    if len(cfg) < len(_KEYS):
        ssm = _ssm_parameters()
        for key, env in _KEYS.items():
            if env not in cfg and key in ssm:
                cfg[env] = ssm[key]
    for env, default in _DEFAULTS.items():
        cfg.setdefault(env, default)
    return cfg
