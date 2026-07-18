#!/bin/bash
# Idempotent roll script for the EC2 host: syncs running services and the
# Pomerium config with the repo. Run via SSM:
#   cd /opt/infinitemirror && git pull && bash deploy/roll.sh
set -euo pipefail

REPO=/opt/infinitemirror

# --- MCP server deps + unit ---
cd "$REPO/mcp-server" && npm install --no-audit --no-fund >/dev/null

cat > /etc/systemd/system/infinitemirror-mcp.service <<'UNIT'
[Unit]
Description=InfiniteMirror MCP server
After=network-online.target

[Service]
WorkingDirectory=/opt/infinitemirror/mcp-server
Environment=PORT=3001
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now infinitemirror-mcp
systemctl restart infinitemirror-mcp infinitemirror-dashboard

# --- Landing page unit ---
cat > /etc/systemd/system/infinitemirror-landing.service <<'UNIT'
[Unit]
Description=InfiniteMirror landing page
After=network-online.target

[Service]
WorkingDirectory=/opt/infinitemirror/landing
Environment=PORT=3002
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now infinitemirror-landing
systemctl restart infinitemirror-landing

# --- Pomerium: ensure mcp runtime flag + MCP route ---
python3 - <<'PY'
cfg_path = "/etc/pomerium/config.yaml"
cfg = open(cfg_path).read()
changed = False

if "runtime_flags" not in cfg:
    cfg = cfg.replace(
        "authenticate_service_url: https://authenticate.pomerium.app",
        "authenticate_service_url: https://authenticate.pomerium.app\nruntime_flags:\n  mcp: true",
        1)
    changed = True

if "mcp.infinitemirror.masky.ai" not in cfg:
    route = (
        "routes:\n"
        "  - from: https://mcp.infinitemirror.masky.ai\n"
        "    to: http://127.0.0.1:3001\n"
        "    name: InfiniteMirror Orchestrator\n"
        "    mcp:\n"
        "      server: {}\n"
        "    policy:\n"
        "      - allow:\n"
        "          or:\n"
        "            - email:\n"
        "                is: seth@voicecert.com\n"
        "    pass_identity_headers: true\n")
    cfg = cfg.replace("routes:\n", route, 1)
    changed = True

if "jwt_claims_headers" not in cfg:
    cfg = cfg.replace(
        "authenticate_service_url: https://authenticate.pomerium.app",
        "authenticate_service_url: https://authenticate.pomerium.app\njwt_claims_headers:\n  X-Pomerium-Claim-Email: email",
        1)
    changed = True

if "dashboard.infinitemirror.masky.ai" not in cfg:
    route = (
        "routes:\n"
        "  - from: https://dashboard.infinitemirror.masky.ai\n"
        "    to: http://127.0.0.1:3000\n"
        "    policy:\n"
        "      - allow:\n"
        "          or:\n"
        "            - email:\n"
        "                is: seth@voicecert.com\n"
        "    pass_identity_headers: true\n")
    cfg = cfg.replace("routes:\n", route, 1)
    changed = True

if "seth@snapchallenge.net" not in cfg:
    single = "            - email:\n                is: seth@voicecert.com"
    both = (single +
            "\n            - email:\n                is: seth@snapchallenge.net")
    cfg = cfg.replace(single, both)
    changed = True

if "shah.raj.s@gmail.com" not in cfg:
    anchor = "            - email:\n                is: seth@snapchallenge.net"
    more = (anchor +
            "\n            - email:\n                is: shah.raj.s@gmail.com" +
            "\n            - email:\n                is: rajvi.m7@gmail.com")
    cfg = cfg.replace(anchor, more)
    changed = True

if "nick@nickyt.co" not in cfg:
    anchor = "            - email:\n                is: rajvi.m7@gmail.com"
    cfg = cfg.replace(anchor, anchor + "\n            - email:\n                is: nick@nickyt.co")
    changed = True

import re
if "127.0.0.1:3002" not in cfg:
    # apex catchall (gated dashboard) -> public landing; dashboard stays gated
    # on dashboard.infinitemirror.masky.ai
    pattern = re.compile(
        r"  - from: https://infinitemirror\.masky\.ai\n"
        r"    to: http://127\.0\.0\.1:3000\n"
        r"    policy:.*?\n    pass_identity_headers: true\n",
        re.DOTALL)
    landing = ("  - from: https://infinitemirror.masky.ai\n"
               "    to: http://127.0.0.1:3002\n"
               "    allow_public_unauthenticated_access: true\n")
    cfg, n = pattern.subn(landing, cfg, count=1)
    if n:
        changed = True
        print("apex route -> public landing")

if changed:
    open(cfg_path, "w").write(cfg)
    print("pomerium config updated")
else:
    print("pomerium config already current")
PY

docker restart pomerium >/dev/null
sleep 4
echo "--- status ---"
systemctl is-active infinitemirror-mcp infinitemirror-dashboard
docker logs pomerium --since 30s 2>&1 | grep -iE "error|invalid" | head -5 || true
curl -s -m 5 localhost:3001/healthz
echo
echo "roll complete"
