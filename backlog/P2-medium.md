# P2 — Medium

## CON-P2-2 — Stale `NPM_TOKEN` secret after OIDC migration

- **Category:** security housekeeping
- **Location:** GitHub repo settings (secret `NPM_TOKEN`) + npmjs token; `.github/workflows/publish.yml`
- **Problem:** Publishing migrated to OIDC (trusted publisher), so the long-lived `NPM_TOKEN` is no longer needed. Leaving the secret + npmjs token alive is unnecessary standing credential risk.
- **Verified 2026-07:** `publish.yml` is already OIDC-only — `permissions: id-token: write` (line 15) + a bare `npm publish` with **no** `NODE_AUTH_TOKEN`/`NPM_TOKEN` anywhere. So the workflow needs no change.
- **Fix (remaining — manual, out of repo):** Delete the `NPM_TOKEN` repo secret in GitHub settings and revoke the matching token in npmjs.
- **Confidence:** High (workflow confirmed OIDC-only). **Effort:** XS (settings change, no code).
