# P2 — Medium

## CON-P2-1 — No unit tests for platform-critical helpers (`test` is just a typecheck)

- **Category:** test coverage gap
- **Location:** `package.json` → `"test": "tsc --noEmit"`; helpers in `src/voice/profiles.ts` (`resolveVoiceProfile`, `getVoiceProfile`, `getVoiceProfileByDisplayName`, `getVoiceProfileByGeminiName`, `listVoiceProfiles`) and `src/ai/models.ts` (`normalizeModel`, `isDeprecatedModel`).
- **Problem:** This package is the **single source of truth** consumed by backend, admin, landing, mcp and (indirectly) the widget. Its `test` script only typechecks — there are **no runtime tests** (0 spec files). A regression in `resolveVoiceProfile` (alias/case handling) or `normalizeModel` (deprecated→successor mapping) would silently break voice/model resolution across **every** repo, and nothing here would catch it.
- **Fix:** Add Vitest; write unit tests for each exported helper (e.g. `resolveVoiceProfile` accepts id/displayName/geminiName and is case-tolerant; `normalizeModel` maps each `DEPRECATED_MODEL_MAP` key to a live model; `isDeprecatedModel` true/false cases; `GEMINI_TEXT_MODELS`/`VOICE_PROFILES` invariants). Change `"test"` to run Vitest (keep typecheck separate). Wire into the publish workflow as a gate.
- **Confidence:** High. **Effort:** S–M.

## CON-P2-2 — Stale `NPM_TOKEN` secret after OIDC migration

- **Category:** security housekeeping
- **Location:** GitHub repo settings (secret `NPM_TOKEN`) + npmjs token; `.github/workflows/publish.yml`
- **Problem:** Publishing migrated to OIDC (trusted publisher), so the long-lived `NPM_TOKEN` is no longer needed. Leaving the secret + npmjs token alive is unnecessary standing credential risk.
- **Fix:** Delete the `NPM_TOKEN` repo secret and revoke the token in npmjs; confirm `publish.yml` relies solely on OIDC (`id-token: write`).
- **Confidence:** Med — **(verify)** the secret/token still exist and `publish.yml` is OIDC-only. **Effort:** XS (settings change, no code).
