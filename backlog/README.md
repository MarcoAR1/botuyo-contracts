# botuyo-contracts — Code Audit Backlog

Audit of the shared contracts package (`@botuyo/contracts`). Generated Jun 2026.

## Priority legend

| Pri | Meaning |
|-----|---------|
| **P0** | Critical — security / breaks all consumers |
| **P1** | High — real bug |
| **P2** | Medium — coverage gap, security housekeeping |
| **P3** | Low — cleanup, naming |

## Files

- [`P2-medium.md`](./P2-medium.md)
- [`P3-low.md`](./P3-low.md)

(No P0/P1: the package is small, secret-free, types-and-constants only, and its consumers carry compile-time drift guards.)

## Summary

| Pri | Count | Headline |
|-----|-------|----------|
| P2 | 1 | Stale `NPM_TOKEN` secret after OIDC migration (manual settings change) |
| P3 | 2 | `ApiError` name overlaps the MCP client's `ApiError` class; `ApiResponse` could be a discriminated union |

## Method & confidence

Read `package.json`, `src/index.ts`, `src/ai/models.ts`, `src/voice/profiles.ts`, `src/http/envelope.ts`; `find` for tests (0 found). High confidence — it's a small package. CHANGELOG-on-bump rule applies (this package already bumps on every model/voice change).

## Strength (no action needed)

The package is correctly the **single source of truth** (AI models, voice profiles, API base URL, REST envelope), `sideEffects: false`, dual ESM/CJS, secret-free. Consumers (backend `MODEL_FAMILIES`, admin `ModelVoiceTab`) pin to it with `satisfies` drift guards.
