/**
 * AI model contracts — single source of truth for provider + model identifiers.
 *
 * Mirrors the strings actually used across the platform today. When a model is
 * shut down, add it to `DEPRECATED_MODEL_MAP` (never remove the mapping) so old
 * stored configs keep resolving to a live successor.
 */

/** Supported AI providers (matches TenantSchema `ai.provider` enum). */
export const AI_PROVIDERS = ['gemini', 'openai', 'claude', 'custom'] as const
export type AIProvider = (typeof AI_PROVIDERS)[number]

/**
 * Gemini text models currently in use across the platform.
 *
 * The `*-preview` entries are frontier Gemini 3 models offered as opt-in choices
 * in the admin panel; the stable defaults remain the non-preview ids.
 */
export const GEMINI_TEXT_MODELS = [
  'gemini-3.1-pro-preview',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro'
] as const
export type GeminiTextModel = (typeof GEMINI_TEXT_MODELS)[number]

/**
 * Gemini live (voice) models.
 * - `gemini-3.1-flash-live-preview`: half-cascade, reliable function-calling (default).
 * - `gemini-2.5-flash-native-audio-preview-12-2025`: more expressive voice, less
 *   reliable with tools — offered only as a labeled alternative.
 */
export const GEMINI_LIVE_MODELS = [
  'gemini-3.1-flash-live-preview',
  'gemini-2.5-flash-native-audio-preview-12-2025'
] as const
export type GeminiLiveModel = (typeof GEMINI_LIVE_MODELS)[number]

/** OpenAI models used by the model router. */
export const OPENAI_MODELS = ['gpt-4o', 'gpt-4o-mini'] as const
export type OpenAIModel = (typeof OPENAI_MODELS)[number]

/** Platform default text model (was hardcoded ~10x across the backend). */
export const DEFAULT_TEXT_MODEL: GeminiTextModel = 'gemini-3.1-flash-lite'

/** Platform default live/voice model. */
export const DEFAULT_LIVE_MODEL: GeminiLiveModel = 'gemini-3.1-flash-live-preview'

/**
 * Shut-down / deprecated text models → stable successor.
 * Kept in sync with the backend GeminiModelsMigration. NEVER remove an entry:
 * existing stored documents may still reference the dead id.
 */
export const DEPRECATED_MODEL_MAP: Readonly<Record<string, GeminiTextModel>> = {
  'gemini-3.1-flash-lite-preview': 'gemini-3.1-flash-lite',
  'gemini-2.0-flash': 'gemini-2.5-flash',
  'gemini-2.0-flash-lite': 'gemini-2.5-flash-lite'
}

/** Returns true if `model` is a known shut-down identifier. */
export function isDeprecatedModel(model: string): boolean {
  return Object.prototype.hasOwnProperty.call(DEPRECATED_MODEL_MAP, model)
}

/** Map a possibly-deprecated model id to its live successor (id unchanged if current). */
export function normalizeModel(model: string): string {
  return DEPRECATED_MODEL_MAP[model] ?? model
}
