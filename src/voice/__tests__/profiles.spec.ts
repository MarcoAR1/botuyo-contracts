import { describe, expect, it } from 'vitest'
import {
  VOICE_PROFILES,
  getVoiceProfile,
  getVoiceProfileByDisplayName,
  getVoiceProfileByGeminiName,
  listVoiceProfiles,
  resolveVoiceProfile
} from '../profiles'

describe('VOICE_PROFILES invariants', () => {
  it('is non-empty', () => {
    expect(VOICE_PROFILES.length).toBeGreaterThan(0)
  })

  it('has unique ids, display names and gemini names', () => {
    const ids = VOICE_PROFILES.map((p) => p.id)
    const displayNames = VOICE_PROFILES.map((p) => p.displayName.toLowerCase())
    const geminiNames = VOICE_PROFILES.map((p) => p.geminiVoiceName.toLowerCase())
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(displayNames).size).toBe(displayNames.length)
    expect(new Set(geminiNames).size).toBe(geminiNames.length)
  })

  it('every profile has the expected shape', () => {
    for (const p of VOICE_PROFILES) {
      expect(typeof p.id).toBe('string')
      expect(p.id.length).toBeGreaterThan(0)
      expect(p.displayName.length).toBeGreaterThan(0)
      expect(p.description.length).toBeGreaterThan(0)
      expect(p.tone.length).toBeGreaterThan(0)
      expect(p.geminiVoiceName.length).toBeGreaterThan(0)
      expect(['F', 'M', 'NB']).toContain(p.gender)
    }
  })
})

describe('getVoiceProfile', () => {
  it('returns the profile for an exact internal id', () => {
    expect(getVoiceProfile('kore')?.id).toBe('kore')
  })

  it('is case-sensitive on the internal id', () => {
    expect(getVoiceProfile('Kore')).toBeUndefined()
  })

  it('returns undefined for an unknown id', () => {
    expect(getVoiceProfile('does-not-exist')).toBeUndefined()
  })
})

describe('getVoiceProfileByDisplayName', () => {
  it('resolves an exact display name', () => {
    expect(getVoiceProfileByDisplayName('Profesional Femenina')?.id).toBe('kore')
  })

  it('is case-insensitive', () => {
    expect(getVoiceProfileByDisplayName('profesional femenina')?.id).toBe('kore')
    expect(getVoiceProfileByDisplayName('PROFESIONAL FEMENINA')?.id).toBe('kore')
  })

  it('returns undefined for an unknown display name', () => {
    expect(getVoiceProfileByDisplayName('Nope')).toBeUndefined()
  })
})

describe('getVoiceProfileByGeminiName', () => {
  it('resolves an exact legacy Gemini name', () => {
    expect(getVoiceProfileByGeminiName('Kore')?.id).toBe('kore')
  })

  it('is case-insensitive', () => {
    expect(getVoiceProfileByGeminiName('kore')?.id).toBe('kore')
    expect(getVoiceProfileByGeminiName('KORE')?.id).toBe('kore')
  })

  it('returns undefined for an unknown Gemini name', () => {
    expect(getVoiceProfileByGeminiName('Nope')).toBeUndefined()
  })
})

describe('resolveVoiceProfile', () => {
  it('accepts the internal id', () => {
    expect(resolveVoiceProfile('kore')?.id).toBe('kore')
  })

  it('accepts the display name', () => {
    expect(resolveVoiceProfile('Profesional Femenina')?.id).toBe('kore')
  })

  it('accepts the legacy Gemini name', () => {
    expect(resolveVoiceProfile('Kore')?.id).toBe('kore')
  })

  it('is case-tolerant across all reference kinds', () => {
    expect(resolveVoiceProfile('KORE')?.id).toBe('kore')
    expect(resolveVoiceProfile('profesional femenina')?.id).toBe('kore')
    expect(resolveVoiceProfile('AoEdE')?.id).toBe('aoede')
  })

  it('resolves every profile by id, display name and Gemini name', () => {
    for (const p of VOICE_PROFILES) {
      expect(resolveVoiceProfile(p.id)?.id).toBe(p.id)
      expect(resolveVoiceProfile(p.displayName)?.id).toBe(p.id)
      expect(resolveVoiceProfile(p.geminiVoiceName)?.id).toBe(p.id)
    }
  })

  it('returns undefined for an unknown reference', () => {
    expect(resolveVoiceProfile('unknown-voice')).toBeUndefined()
    expect(resolveVoiceProfile('')).toBeUndefined()
  })
})

describe('listVoiceProfiles', () => {
  it('returns every profile', () => {
    expect(listVoiceProfiles()).toHaveLength(VOICE_PROFILES.length)
  })

  it('returns a fresh array (not the frozen catalog reference)', () => {
    const list = listVoiceProfiles()
    expect(list).not.toBe(VOICE_PROFILES)
    expect(list).toEqual([...VOICE_PROFILES])
  })
})
