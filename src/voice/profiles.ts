/**
 * Voice Profile Catalog
 *
 * Predefined voice profiles with descriptive display names.
 * MCP and frontend use display names; internally we map to Gemini voice IDs.
 *
 * Source of truth shared by backend, mcp, admin and landing.
 */

/** Internal Gemini voice identifiers */
export type VoiceProfileId = 'kore' | 'puck' | 'charon' | 'fenrir' | 'aoede' | 'leda' | 'orus' | 'zephyr'

/** User-facing display names */
export type VoiceProfileDisplayName =
  | 'Profesional Femenina'
  | 'Amigable Femenina'
  | 'Serena Femenina'
  | 'Energético Masculino'
  | 'Formal Masculino'
  | 'Cálido Masculino'
  | 'Neutro Profesional'
  | 'Suave Neutral'

/** Legacy Gemini API voice names */
export type VoiceProfileGeminiName = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Aoede' | 'Leda' | 'Orus' | 'Zephyr'

/** Accepts any of: internal ID, display name, or Gemini name. Resolved by resolveVoiceProfile(). */
export type VoiceProfileInput = VoiceProfileId | VoiceProfileDisplayName | VoiceProfileGeminiName

export interface VoiceProfile {
  id: VoiceProfileId
  displayName: string // User-facing name (MCP, frontend, JSON configs)
  description: string
  gender: 'F' | 'M' | 'NB'
  tone: string
  /** The actual Gemini voice name used in the API (e.g., 'Kore') */
  geminiVoiceName: string
}

/**
 * Master catalog of available voice profiles.
 * Display names are what users see/set via MCP and frontend.
 * IDs are what we store internally and pass to Gemini.
 */
export const VOICE_PROFILES: readonly VoiceProfile[] = [
  {
    id: 'kore',
    displayName: 'Profesional Femenina',
    description: 'Voz femenina cálida y profesional',
    gender: 'F',
    tone: 'Cálida',
    geminiVoiceName: 'Kore'
  },
  {
    id: 'aoede',
    displayName: 'Amigable Femenina',
    description: 'Voz femenina joven y amigable',
    gender: 'F',
    tone: 'Amigable',
    geminiVoiceName: 'Aoede'
  },
  {
    id: 'leda',
    displayName: 'Serena Femenina',
    description: 'Voz femenina suave y tranquilizadora',
    gender: 'F',
    tone: 'Serena',
    geminiVoiceName: 'Leda'
  },
  {
    id: 'puck',
    displayName: 'Energético Masculino',
    description: 'Voz masculina joven y dinámica',
    gender: 'M',
    tone: 'Energético',
    geminiVoiceName: 'Puck'
  },
  {
    id: 'charon',
    displayName: 'Formal Masculino',
    description: 'Voz masculina grave y profesional',
    gender: 'M',
    tone: 'Formal',
    geminiVoiceName: 'Charon'
  },
  {
    id: 'fenrir',
    displayName: 'Cálido Masculino',
    description: 'Voz masculina amigable y cercana',
    gender: 'M',
    tone: 'Cálido',
    geminiVoiceName: 'Fenrir'
  },
  {
    id: 'orus',
    displayName: 'Neutro Profesional',
    description: 'Voz neutral y profesional',
    gender: 'NB',
    tone: 'Profesional',
    geminiVoiceName: 'Orus'
  },
  {
    id: 'zephyr',
    displayName: 'Suave Neutral',
    description: 'Voz suave y relajante',
    gender: 'NB',
    tone: 'Suave',
    geminiVoiceName: 'Zephyr'
  }
] as const

// ── Lookup helpers ─────────────────────────────────────────────────────────────

const byId = new Map(VOICE_PROFILES.map((p) => [p.id, p]))
const byDisplayName = new Map(VOICE_PROFILES.map((p) => [p.displayName.toLowerCase(), p]))
const byGeminiName = new Map(VOICE_PROFILES.map((p) => [p.geminiVoiceName.toLowerCase(), p]))

/** Get profile by internal ID */
export function getVoiceProfile(id: string): VoiceProfile | undefined {
  return byId.get(id as VoiceProfileId)
}

/** Get profile by display name (case-insensitive) */
export function getVoiceProfileByDisplayName(displayName: string): VoiceProfile | undefined {
  return byDisplayName.get(displayName.toLowerCase())
}

/** Get profile by legacy Gemini voice name (e.g., 'Kore') — backward compat */
export function getVoiceProfileByGeminiName(geminiName: string): VoiceProfile | undefined {
  return byGeminiName.get(geminiName.toLowerCase())
}

/**
 * Resolve any voice reference (display name, ID, or legacy Gemini name) to a profile.
 * Returns undefined if not found.
 */
export function resolveVoiceProfile(input: string): VoiceProfile | undefined {
  return getVoiceProfileByDisplayName(input) || getVoiceProfile(input) || getVoiceProfileByGeminiName(input)
}

/** List all profiles (for API responses) */
export function listVoiceProfiles(): VoiceProfile[] {
  return [...VOICE_PROFILES]
}
