# BotUyo — Guía de Contratos Compartidos

> Documento guía del ecosistema BotUyo: cómo centralizar contratos entre repos, cuál es el límite con el widget público, y el plan de migración. Nace del análisis cruzado de los 6 repos.

## 1. Principios

1. **Una sola fuente de verdad** por contrato. Si dos repos deben coincidir en un identificador/forma, vive en `@botuyo/contracts`, no copiado a mano.
2. **`@botuyo/contracts` es público y libre de secretos.** Solo tipos, enums y constantes/helpers puros. Nada de API keys, env, ni lógica de negocio.
3. **El widget es público y autocontenido.** `@botuyo/chat-widget-standalone` NO depende de `@botuyo/contracts`. Sus contratos públicos (eventos socket, props, theme) viven dentro del widget para que un consumidor externo nunca necesite un paquete extra.
4. **Sin runtime deps.** El paquete no agrega peso ni dependencias a quien lo consume.

## 2. Mapa de repos

| Repo | Rol | Consume `@botuyo/contracts` |
| --- | --- | --- |
| `botuyo-backend` | API/DDD (fuente de verdad de DTOs vía tsoa) | Sí (Fase 3) |
| `botuyo-landing` | SPA público + dashboard | Sí |
| `botuyo-admin` | Panel super-admin | Sí |
| `botuyo-mcp` | MCP server (npm público) | Sí |
| `botuyo-kiosk` | App kiosko | Opcional |
| `botuyo-widget-chatbot` | Widget embebible (npm **público**) | **No** (autocontenido) |

## 3. Qué hay en `@botuyo/contracts` (v1)

| Módulo | Export | Reemplaza |
| --- | --- | --- |
| `ai/models` | `AI_PROVIDERS`, `GEMINI_TEXT_MODELS`, `DEFAULT_TEXT_MODEL`, `DEFAULT_LIVE_MODEL`, `DEPRECATED_MODEL_MAP`, `normalizeModel()`, `isDeprecatedModel()` | `gemini-3.1-flash-lite` hardcodeado ~10x en el backend |
| `voice/profiles` | `VOICE_PROFILES`, `resolveVoiceProfile()`, `VoiceProfileId/DisplayName/GeminiName` | `VoiceProfiles.ts` del backend (espejado) |
| `http/envelope` | `ApiResponse<T>`, `PaginatedData<T>`, `ApiError` | `res.data.data` tipado a mano en cada front |
| `http/constants` | `DEFAULT_API_BASE_URL` | `'https://api.botuyo.com'` hardcodeado en todos los consumidores |

**NO va acá:** eventos socket / props / theme del widget (públicos → quedan en el widget), secretos, env, lógica.

## 4. Cómo consumir

### Frontends (landing, admin, kiosk)
```ts
import { DEFAULT_API_BASE_URL, type ApiResponse } from '@botuyo/contracts'

export const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL
```

### Backend (CommonJS)
```ts
import { DEFAULT_TEXT_MODEL, normalizeModel, resolveVoiceProfile } from '@botuyo/contracts'

const model = normalizeModel(stored.model) // ids muertos → sucesor vivo
```

### MCP (ESM)
```ts
import { listVoiceProfiles } from '@botuyo/contracts'
```

## 5. Publicar y versionar

- Semver. Publica CI (`.github/workflows/publish.yml`) **automáticamente** ante cualquier push a `main` que cambie `package.json`. Un *version guard* compara la versión local contra la de npm y publica solo si difieren → un bump de versión alcanza.
- Auth por **OIDC trusted publishing** (sin `NPM_TOKEN`, sin secretos largos); la provenance se firma sola. Runner `ubuntu-latest` (obligatorio para provenance). Fallback manual: `workflow_dispatch`.
- Para publicar: `npm version patch|minor|major && git push`.
- **Regla de oro:** un cambio que rompe (rename/remove de un export) = **major**. Agregar = minor. Fix interno = patch.

## 6. Plan de migración

### Fase 1 — Publicar (ahora)
1. `cd botuyo-contracts && npm install && npm run build && npm run typecheck`.
2. `git init` (identidad personal por `includeIf`), push a `github.com/MarcoAR1/botuyo-contracts`.
3. Publicado `@botuyo/contracts@0.1.0` (primer publish con token efímero — npm no permite registrar un Trusted Publisher de un paquete inexistente). Luego: Trusted Publisher registrado en npmjs.com + token quitado del workflow → **OIDC puro**.

### Fase 2 — Cablear consumidores (bajo riesgo)
Por cada front: `npm i @botuyo/contracts` y cambiar 1 línea:
- `botuyo-landing/src/shared/lib/config.ts` → `import { DEFAULT_API_BASE_URL }` y usarlo en el fallback (ya quedó preparado con un comentario MIGRATION).
- `botuyo-admin/src/lib/api.ts` → idem para `API_BASE`.
- `botuyo-kiosk/src/main.tsx` → idem para el default `?api=`.

### Fase 3 — Adopción en el backend (con cuidado + suite completa)
1. `npm i @botuyo/contracts`.
2. Reemplazar `src/contexts/voice/domain/VoiceProfiles.ts` por un re-export: `export * from '@botuyo/contracts'` (mantiene los imports actuales de `resolveVoiceProfile`, etc.).
3. Reemplazar literales `'gemini-3.1-flash-lite'` por `DEFAULT_TEXT_MODEL` (schemas, AIController, knowledge services, recruiting, seed).
4. `GeminiModelsMigration.TEXT_MODEL_MAP` → importar `DEPRECATED_MODEL_MAP`.
5. `npm test && npx tsc --noEmit && npm run lint` (los 3 en verde) y regenerar tsoa si tocaste DTOs.

> **Ojo:** el backend es la fuente de verdad de DTOs (tsoa). Para REST, evaluar a futuro generar tipos desde `swagger.json` en vez de mantenerlos a mano.

## 7. Quick wins ya aplicados (changelog de este pase)

| # | Repo | Cambio |
| --- | --- | --- |
| 3 | landing | `API_URL` único en `shared/lib/config.ts`; eliminadas 5 copias; 3 demos dejaron de hardcodear prod (ahora respetan `VITE_API_URL`) |
| 9 | backend | Removido `vite` de `dependencies` (solo era transitivo de `vitest`) |
| 6 | admin | API key del soporte ahora por `VITE_SUPPORT_AGENT_KEY` (fallback al valor actual); widget subido a `^1.2.5` |
| 2 | backend | `isOriginAllowed` deja el match por substring (bypasseable) → política pura `originPolicy.ts` con host exacto/subdominio + tests |

## 8. Brechas pendientes (roadmap, no incluidas en este pase)

1. **Drift del contrato socket widget↔backend** — `connection_ack` real ≠ tipo del widget, y todo el protocolo de voz está sin tipar. Vive en el widget (público). Fix: actualizar `socket.ts` del widget al payload real + tipar eventos de voz.
2. **Config de voz por tenant no se aplica** — el widget hardcodea `{language:'es-AR', voice:'Kore'}` en `voice_start`. Fix: pasar idioma/voz desde `connection_ack`/props; backend preferir la voz del agente.
3. **`kiosk` sin quality gates** — sin lint/test/typecheck, React 18 (resto 19), widget `^1.0.88`. Fix: agregar gates + subir deps.
4. **Assets binarios duplicados** — `public/voices/*.mp3` en landing y admin. Fix: servir desde backend/CDN.
5. **Header `X-San-CorrelationId`** corporativo en código de producto — revisar si debe estar en lo que se vende afuera.
6. **Drift de stack** — React 18/19, Router 6/7, Vite 6/7, Tailwind 3/4, Zod 3/4. Definir baseline y converger.

## 9. Agregar un contrato nuevo

1. Crear/extender un módulo en `src/` (ej. `src/ai/models.ts`).
2. Re-exportar desde `src/index.ts`.
3. Bump de versión y push → CI publica → bump de la dependencia en cada consumidor.
4. Mantener **sin deps de runtime** y **sin secretos**. Si es privado o público-del-widget, no va acá.
