import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LIVE_MODEL,
  DEFAULT_TEXT_MODEL,
  DEPRECATED_MODEL_MAP,
  GEMINI_LIVE_MODELS,
  GEMINI_TEXT_MODELS,
  isDeprecatedModel,
  normalizeModel
} from '../models'

describe('GEMINI_TEXT_MODELS invariants', () => {
  it('is non-empty and all string ids', () => {
    expect(GEMINI_TEXT_MODELS.length).toBeGreaterThan(0)
    for (const m of GEMINI_TEXT_MODELS) {
      expect(typeof m).toBe('string')
      expect(m.length).toBeGreaterThan(0)
    }
  })

  it('has unique ids', () => {
    expect(new Set(GEMINI_TEXT_MODELS).size).toBe(GEMINI_TEXT_MODELS.length)
  })

  it('includes the platform default text model', () => {
    expect(GEMINI_TEXT_MODELS).toContain(DEFAULT_TEXT_MODEL)
  })
})

describe('GEMINI_LIVE_MODELS invariants', () => {
  it('is non-empty and includes the platform default live model', () => {
    expect(GEMINI_LIVE_MODELS.length).toBeGreaterThan(0)
    expect(GEMINI_LIVE_MODELS).toContain(DEFAULT_LIVE_MODEL)
  })
})

describe('DEPRECATED_MODEL_MAP invariants', () => {
  it('maps every deprecated id to a live text model', () => {
    for (const successor of Object.values(DEPRECATED_MODEL_MAP)) {
      expect(GEMINI_TEXT_MODELS).toContain(successor)
    }
  })

  it('never lists a live model as deprecated', () => {
    for (const key of Object.keys(DEPRECATED_MODEL_MAP)) {
      expect(GEMINI_TEXT_MODELS).not.toContain(key)
    }
  })
})

describe('isDeprecatedModel', () => {
  it('returns true for every deprecated id', () => {
    for (const key of Object.keys(DEPRECATED_MODEL_MAP)) {
      expect(isDeprecatedModel(key)).toBe(true)
    }
  })

  it('returns false for live text models', () => {
    for (const m of GEMINI_TEXT_MODELS) {
      expect(isDeprecatedModel(m)).toBe(false)
    }
  })

  it('returns false for unknown ids', () => {
    expect(isDeprecatedModel('gemini-9000')).toBe(false)
    expect(isDeprecatedModel('')).toBe(false)
  })
})

describe('normalizeModel', () => {
  it('maps every deprecated id to its live successor', () => {
    for (const [dead, live] of Object.entries(DEPRECATED_MODEL_MAP)) {
      expect(normalizeModel(dead)).toBe(live)
    }
  })

  it('passes through live text models unchanged', () => {
    for (const m of GEMINI_TEXT_MODELS) {
      expect(normalizeModel(m)).toBe(m)
    }
  })

  it('passes through unknown ids unchanged', () => {
    expect(normalizeModel('gemini-9000')).toBe('gemini-9000')
    expect(normalizeModel('')).toBe('')
  })
})
