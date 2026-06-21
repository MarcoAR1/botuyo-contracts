/**
 * Agent export/import contract — the on-disk "portable" shape shared by the MCP
 * (writer/reader) and the backend (producer), so the two NEVER drift.
 *
 * Uniform layout for every logical agent (simple OR multi-variant): a family folder
 *   family.json          → { _meta, name, slug, entryVariantKey, base }
 *   variants/<key>.json  → PortableVariant   (ALWAYS ≥ 1; a "simple" agent = exactly one)
 *
 * Secret-free by construction: members' `agentId`/`apiKey`/`status`/timestamps are
 * never written — ids come from `_meta.familyId` + each variant `key`.
 */

/** Versioned schema id stamped into every export's `_meta` envelope. Bump on breaking shape changes. */
export const AGENT_EXPORT_SCHEMA = 'botuyo.agent/v1'

/** Provenance envelope written to `family.json` (never contains secrets). */
export interface AgentExportMeta {
  schema: typeof AGENT_EXPORT_SCHEMA
  slug?: string
  familyId?: string
  exportedAt: string
}

/** A single variant as stored on disk — only authoring fields (no member ids/apiKeys). */
export interface PortableVariant {
  key: string
  label: string
  overrides: Record<string, unknown>
  handoffTargets?: string[]
  order?: number
}

/** A logical agent (family) as stored on disk — base + variants, no internal/runtime fields. */
export interface PortableFamily {
  name: string
  slug: string
  entryVariantKey: string
  base: Record<string, unknown>
  variants: PortableVariant[]
}

/** Loose shape of a family aggregate accepted by {@link sanitizeFamilyForExport}. */
export interface FamilyLike {
  name: string
  slug: string
  entryVariantKey: string
  base?: Record<string, unknown> | null
  variants?: Array<Record<string, unknown>> | null
}

/**
 * Reduce a family aggregate to its portable shape: keep ONLY authoring fields
 * (allowlist), dropping member `agentId`/`apiKey`/`status`/`_id`/timestamps and any
 * `undefined` values, for clean, secret-free, stable diffs.
 */
export function sanitizeFamilyForExport(family: FamilyLike): PortableFamily {
  const portable: PortableFamily = {
    name: family.name,
    slug: family.slug,
    entryVariantKey: family.entryVariantKey,
    base: family.base ?? {},
    variants: (family.variants ?? []).map(sanitizeVariant)
  }
  // JSON round-trip drops `undefined` keys so the export stays minimal/stable.
  return JSON.parse(JSON.stringify(portable)) as PortableFamily
}

function sanitizeVariant(v: Record<string, unknown>): PortableVariant {
  return {
    key: String(v.key),
    label: String(v.label),
    overrides: (v.overrides as Record<string, unknown>) ?? {},
    handoffTargets: v.handoffTargets as string[] | undefined,
    order: typeof v.order === 'number' ? (v.order as number) : undefined
  }
}

/** Build the provenance `_meta` envelope for a family export. `exportedAt` defaults to now. */
export function buildExportMeta(input: { slug?: string; familyId?: string; exportedAt?: string }): AgentExportMeta {
  return {
    schema: AGENT_EXPORT_SCHEMA,
    slug: input.slug,
    familyId: input.familyId,
    exportedAt: input.exportedAt ?? new Date().toISOString()
  }
}

/**
 * Resolve provenance from a parsed `family.json` that may carry either the versioned
 * `_meta` envelope OR the legacy flat `_familyId`/`_exportedAt` fields (back-compat).
 */
export function parseExportMeta(parsed: Record<string, unknown>): { familyId?: string } {
  const meta = parsed._meta as AgentExportMeta | undefined
  const familyId = meta?.familyId ?? (parsed._familyId as string | undefined)
  return { familyId }
}

/**
 * Stable-sort variants by their `order` field (the source of truth for sequence);
 * variants without an `order` sink to the end, preserving their relative order.
 * Returns a NEW array — the input is not mutated.
 */
export function sortVariantsByOrder<T extends { order?: number }>(variants: T[]): T[] {
  return [...variants].sort((a, b) => orderOf(a) - orderOf(b))
}

function orderOf(v: { order?: number }): number {
  return typeof v.order === 'number' ? v.order : Number.MAX_SAFE_INTEGER
}
