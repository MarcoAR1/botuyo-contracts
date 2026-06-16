# @botuyo/contracts

Shared TypeScript **contracts** (types & constants) for the BotUyo platform. Public on npm, **secret-free** — it only contains identifiers, enums and pure helpers that several repos must agree on.

## Why this package exists

The BotUyo system is split across independent repos (`botuyo-backend`, `botuyo-landing`, `botuyo-admin`, `botuyo-mcp`, `botuyo-kiosk`, `botuyo-widget-chatbot`). Without a shared package, the same contracts (model IDs, voice profiles, the REST envelope, the API base URL) were re-declared by hand in each one and drifted apart. This package centralizes them so a change happens **once**.

## What lives here (and what does NOT)

| In this package | Why |
| --- | --- |
| Gemini/OpenAI model IDs + defaults + deprecation map | Hardcoded ~10x across repos |
| Voice profile catalog (`VOICE_PROFILES`, `resolveVoiceProfile`) | Shared by backend, mcp, admin, landing |
| REST envelope (`ApiResponse<T>`, `PaginatedData<T>`) | Every frontend reads `res.data.data` |
| `DEFAULT_API_BASE_URL` | Hardcoded across all consumers |

| **NOT** here | Why |
| --- | --- |
| Chat-widget socket events / props / theme | The widget (`@botuyo/chat-widget-standalone`) is **public and self-contained**. External consumers must never need a separate contracts package, so the widget keeps its own public contracts. |
| Secrets, env values, API keys | This package is public. |
| Business logic, framework code | Types & pure constants only. |

## Install

```bash
npm install @botuyo/contracts
```

## Usage

```ts
import {
  DEFAULT_API_BASE_URL,
  DEFAULT_TEXT_MODEL,
  normalizeModel,
  VOICE_PROFILES,
  resolveVoiceProfile,
  type ApiResponse,
  type AIProvider
} from '@botuyo/contracts'

// API base (frontends)
const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL

// Models
const model = normalizeModel(stored.model) // dead ids → live successor

// Voice
const profile = resolveVoiceProfile('Profesional Femenina') // → { id: 'kore', ... }

// REST typing
type AgentResponse = ApiResponse<{ id: string; name: string }>
```

## Build

Dual ESM + CJS via `tsup` so both the CommonJS backend and the ESM frontends can import it.

```bash
npm install
npm run build      # → dist/index.js (esm), dist/index.cjs (cjs), dist/index.d.ts
npm run typecheck
```

## Publishing

Versioned with semver. Publishing is **fully automated** by CI (`.github/workflows/publish.yml`):

- **Trigger:** any push to `main` that changes `package.json`. A version guard compares the local version against the one on npm and publishes only when they differ — so a version bump is all you need.
- **Auth:** [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) via **OIDC** — no `NPM_TOKEN`, no long-lived secrets. Provenance is generated and signed automatically (proof the artifact came from this workflow).
- **Runner:** `ubuntu-latest` (GitHub-hosted is required for provenance).
- **Fallback:** the workflow also exposes `workflow_dispatch` for a manual re-run.

To cut a release, just bump and push:

```bash
npm version patch   # or minor / major
git push            # CI publishes the new version
```

## Adding a contract

1. Add/extend a module under `src/` (e.g. `src/ai/models.ts`).
2. Re-export it from `src/index.ts`.
3. Bump the version and push — CI publishes — then bump the dependency in each consumer.

> Keep it **dependency-free at runtime** and **secret-free**. If something is private or widget-public, it does not belong here.
