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
