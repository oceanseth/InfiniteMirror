// Scope policy for the Masky bridge — the security boundary for the "Nick" agent.
// Edit this file to change which tools are exposed or which avatar is pinned.
//
// Two layers of enforcement live here:
//   1. ALLOWLIST  — only these masky tools are visible/callable through the bridge.
//   2. pinArgs()  — rewrites avatar-targeting arguments so every call is forced onto Nick,
//                   never the key holder's other avatars (e.g. the personal "Rajvi Mehta" one).
//
// (Pomerium ALSO enforces the tool allowlist at the identity/proxy layer — defense in depth.
//  Argument pinning can only happen here, because Pomerium matches tool *names*, not arguments.)

// --- The pinned avatar: Nick Taylor ---------------------------------------------------------
export const NICK = {
  avatarId: "PFdHnDvMuPHlHtMwMi7K",
  ownerUserId: "CMdVAXSKlwhImFJV6dq97ajEjj93",
  displayName: "Nick Taylor",
};

// --- Speaking mode --------------------------------------------------------------------------
// Nick has no voice attached yet (humeVoiceId: null), so audio/video turns can't render.
// While false, pinArgs() coerces every turn's output to text. Flip to true once a voice is
// attached to Nick in Masky and audio/video turns will work with no other changes.
export const SPEAKING_ENABLED = false;

// --- Tool allowlist: converse + speak/media, scoped to Nick ---------------------------------
// Everything not listed here is invisible to the agent and rejected if called directly.
// Deliberately EXCLUDED: list_my_avatars / list_avatar_folders (account enumeration),
// all *_oauth_client + get_sso_integration_guide (credential admin), create/delete/set_* tools
// (destructive/costly account mutation), and bulk media gen (generate_image/video, edit_image).
export const ALLOWLIST = new Set([
  "start_conversation", // open a dialogue — avatar pinned to Nick
  "inject_turn",        // the back-and-forth turns
  "avatar_speak",       // talking-head / voice line — avatar pinned to Nick (costs credits)
  "get_avatar_speak",   // poll a prior avatar_speak job
]);

// --- Argument pinning: force every avatar reference onto Nick --------------------------------
// Returns the (possibly rewritten) arguments object. Throws to hard-reject a call.
export function pinArgs(toolName, args = {}) {
  const a = { ...args };
  switch (toolName) {
    case "start_conversation":
      // Override whatever the agent asked for — it can only ever reach Nick.
      a.avatarId = NICK.avatarId;
      a.avatarOwnerUserId = NICK.ownerUserId;
      return a;

    case "avatar_speak":
      a.avatarId = NICK.avatarId;
      a.avatarOwnerUserId = NICK.ownerUserId;
      if (!SPEAKING_ENABLED) a.output = "text"; // caption only until Nick has a voice
      return a;

    case "inject_turn":
      // The conversation avatar is fixed by the conversationId (created as Nick).
      // But speakerAvatarId can render the USER turn as ANOTHER owned avatar — strip it
      // unless it is explicitly Nick, so the personal avatar can never be summoned here.
      if (a.speakerAvatarId && a.speakerAvatarId !== NICK.avatarId) {
        delete a.speakerAvatarId;
        delete a.userOutput; // userOutput audio/video only meaningful with a speaker avatar
      }
      if (!SPEAKING_ENABLED) {
        a.output = "text";     // Nick's reply comes back as text
        a.userOutput = "text"; // and so does the user/speaker turn
      }
      return a;

    case "get_avatar_speak":
      return a; // poll by job id — no avatar argument to pin

    default:
      // Should be unreachable: allowlist is checked before pinArgs is ever called.
      throw new Error(`tool '${toolName}' is not permitted by the bridge scope`);
  }
}
