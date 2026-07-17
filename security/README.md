# Security layer — scoping the "Nick" agent (Masky MCP behind Pomerium)

Nick is a Masky avatar exposed by `masky-mcp-server`. That server, given the account's
`MASKY_API_KEY`, exposes **22 tools** — including ones that enumerate the whole account
(`list_my_avatars`), administer OAuth/SSO credentials, and spend credits. We put a security
layer in front so a consuming agent gets a **scoped** slice: converse + speak with **Nick only**.

```
consuming agent
  → Pomerium        identity (OAuth 2.1) + per-tool policy + audit     [Zero console / :443]
     → masky-bridge scoped MCP proxy: tool allowlist + avatar pinning   [this repo, :8080/mcp]
        → masky     npx -y masky-mcp-server (stdio); holds MASKY_API_KEY
```

**Why two layers?** Pomerium authenticates *who* the agent is and allows/denies *which tools*
by name — but it matches tool **names**, not **arguments**, so it cannot stop the agent from
targeting a different avatar. The bridge closes that gap: it pins every avatar argument to Nick
and strips any attempt to summon another avatar (e.g. the account's personal "Rajvi" avatar).

## What's enforced

- **Tool allowlist** (`masky-bridge/scope.js`): only `start_conversation`, `inject_turn`,
  `avatar_speak`, `get_avatar_speak` are visible/callable. The other 18 tools — account
  enumeration, OAuth admin, create/delete/set, bulk media gen — are invisible and rejected.
  Enforced in **both** the bridge and the Pomerium route (`pomerium/route-masky.yaml`).
- **Avatar pinning** (bridge only): `avatarId`/`avatarOwnerUserId` are overwritten with Nick's;
  `inject_turn.speakerAvatarId` is dropped unless it is Nick. See `scope.js` → `NICK`.
- **Key isolation**: `MASKY_API_KEY` lives only in the bridge process env — never in the agent
  config, never in a response. Every call is audit-logged as JSON to stdout.

See `tools-inventory.md` for the full 22-tool classification.

## Status

- ✅ **Bridge (Step 2)** — built and verified end-to-end locally (allowlist + pinning + deny).
- ⏳ **Pomerium (Steps 3–5)** — config written (`pomerium/route-masky.yaml`, `docker-compose.yml`);
  needs the manual Zero-console steps below (account + cluster token + IdP + public hostname).
- ⏳ **Agent host (Step 6)** — point Claude Desktop/Code or the InfiniteMirror orchestrator at
  the Pomerium route URL once it's live.

## Run

### Bridge alone (local dev — what's already verified)
```bash
cd security/masky-bridge
npm install
npm start                 # reads MASKY_API_KEY from ../../.env, listens on 127.0.0.1:8080/mcp
# smoke test:
npx @modelcontextprotocol/inspector --cli http://127.0.0.1:8080/mcp --transport http --method tools/list
```

### Full stack (bridge + Pomerium data-plane)
1. Copy `masky-bridge/.env.example` values into the repo-root `.env` (gitignored):
   `MASKY_API_KEY` (rotated) and `POMERIUM_ZERO_TOKEN`.
2. `cd security/masky-bridge && docker compose up --build`
   (Only Pomerium's :443 is published; the bridge stays internal to the compose network.)

## Remaining manual steps (Pomerium Zero console — needs your login)

1. **Cluster**: at https://console.pomerium.app create a cluster → copy its **connection token**
   into `.env` as `POMERIUM_ZERO_TOKEN`. (This is *not* the management API key `bf91fbb`.)
2. **IdP**: connect an identity provider (Google/GitHub/…) so the agent principal carries
   `email`/`domain`/`groups` for the policy's `allow` block.
3. **Route**: create the route from `pomerium/route-masky.yaml` — `from:` a public hostname that
   resolves to the data-plane with TLS, `to: http://masky-bridge:8080/mcp`, `mcp: server: {}`,
   and the tool-allowlist policy. A real hostname is required for the OAuth 2.1 sign-in.
4. **Connect the agent** to `https://<your-host>`, complete sign-in once to get the External
   Token, then it calls with `Authorization: Bearer <token>`. Verify a denied tool is refused
   and shows in the Pomerium audit log.

## Rotate the exposed keys

`MASKY_API_KEY` and the Pomerium key were pasted in plaintext during setup — rotate both:
- Masky: regenerate the API key in the Masky dashboard, update `.env`, restart the bridge.
- Pomerium: rotate the console API key / cluster token, update `.env`.
Then confirm nothing leaked into git: `git grep -nE 'mky_|POMERIUM_API_KEY=.+'` should be clean.

## Pin a different / additional avatar

Edit `masky-bridge/scope.js`: change `NICK` (from a one-time `list_my_avatars` call) and/or the
`ALLOWLIST`. Restart the bridge. This same pattern is the template for every future teammate
agent — one scoped bridge per persona, all fronted by Pomerium.
