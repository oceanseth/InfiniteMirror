# Masky MCP — Tool Inventory & Access Classification

Source: `npx -y masky-mcp-server` → `tools/list` (22 tools). Generated for the Pomerium
scoping policy. Masky exposes **AI avatars** (personas); "Nick" is one avatar owned by the
API-key holder. Every tool acts with the holder's `MASKY_API_KEY`.

## Key finding (Step 1 decision gate)

**The tool surface is GRANULAR → Pomerium's per-tool `mcp_tool` policy is sufficient** for the
core goal. No field-redaction bridge is required to stop an agent from reaching the whole account.

**One caveat — argument-level scoping:** the conversational tools take `avatarId` +
`avatarOwnerUserId` as *arguments*. Pomerium matches by **tool name**, not arguments, so it can
allow "may converse" but cannot by itself pin the agent to **Nick specifically** vs the holder's
other owned avatars. If we must hard-lock to Nick, add argument validation in the bridge (thin
shim that rejects any `avatarId` ≠ Nick). For a first prototype the per-tool allowlist is the 90% win.

## Classification

### ✅ ALLOW — conversational core (what a "talk to Nick" agent needs)
| tool | why |
|---|---|
| `list_public_avatars` | read-only, **public** avatars only — safe way to discover Nick |
| `start_conversation` | open a dialogue with an avatar |
| `inject_turn` | the actual back-and-forth turns |

### ⚠️ ALLOW ONLY IF the agent's job includes generating media (spends credits)
| tool | risk |
|---|---|
| `avatar_speak` | makes Nick say a line → **costs credits** |
| `get_avatar_speak` | legacy poll for the above |
| `generate_image` / `edit_image` | image gen → **costs credits** |
| `generate_video` / `get_video` | video gen → **costs more credits** |
| `list_voices` | read-only, harmless (only needed to pick a voice) |

### ⛔ DENY — account enumeration ("ALL personal details" risk)
| tool | risk |
|---|---|
| `list_my_avatars` | lists **every** avatar the key holder owns — this is the "access ALL details" leak |
| `list_avatar_folders` | reveals the holder's account/organization structure |

### ⛔ DENY — destructive / account-mutating
`create_avatar`, `create_avatar_folder`, `delete_avatar_folder`, `set_avatar_voice`,
`set_avatar_publicly_renderable`, `set_conversation_visibility`

### ⛔ DENY — OAuth / SSO app administration (highest sensitivity: issues/deletes credentials)
`register_oauth_client`, `list_oauth_clients`, `delete_oauth_client`, `get_sso_integration_guide`

## Recommended minimal policy (converse-only first agent)

Allowlist = `['list_public_avatars', 'start_conversation', 'inject_turn']`; deny everything else.
Pomerium PPL (deny by allowlist so `tools/list` still works):

```yaml
policy:
  allow:
    and:
      - domain: { is: your-domain.com }        # identity of the calling agent
  deny:
    and:
      - mcp_tool:
          not_in: ['list_public_avatars', 'start_conversation', 'inject_turn']
```

If the agent also produces media, add `avatar_speak` (+ `get_avatar_speak`) to the allowlist.
