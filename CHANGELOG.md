# Changelog

All notable changes to **@botuyo/contracts** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Release rule:** every `package.json` version bump MUST add its entry here in the
> **same commit** as the bump. Add changes under `[Unreleased]`, then move them into a
> dated version section when you bump + publish. This package is the single source of
> truth consumed by every other repo — call out any model/voice/contract change here.

## [Unreleased]

## [0.3.0]

### Added

- **`copilot/proposal`** — shared "tool approval" contract for the Authenticated
  Agents + Tool Approval capability, so `botuyo-landing` (which embeds the platform
  widget for the recruiting copilot) and the backend share ONE definition:
  - Types: `CopilotProposal` (`{ proposalId, tool, title?, summary?, args?, ownerOnly? }`),
    `CopilotProposalStatus` (`'confirmed' | 'cancelled' | 'expired'`),
    `CopilotProposalResolved`, and `CopilotAgentRef` (the `{ agentId, apiKey? }` handle
    returned by `GET /api/recruiting/copilot/agent`).
  - Auth prop types: `GetUserToken`, `OnAuthRequired`, `CopilotAuthProps`.
  - Byte-compatible BY DESIGN with the widget's self-contained `tool_proposal` payload
    (`ToolProposalData`) — the public widget keeps its own copy and does NOT depend on
    this package.

## [0.2.0]

### Added

- **`agents/export`** — shared agent export/import contract so the MCP (writer/reader)
  and the backend (producer) never drift on the on-disk "portable" layout:
  - `AGENT_EXPORT_SCHEMA` (`'botuyo.agent/v1'`) — versioned schema id for the `_meta` envelope.
  - Types: `AgentExportMeta`, `PortableVariant`, `PortableFamily`, `FamilyLike`.
  - `sanitizeFamilyForExport()` — allowlist a family to authoring fields only (no
    `agentId`/`apiKey`/`status`/`_id`/timestamps; drops `undefined`).
  - `buildExportMeta()` / `parseExportMeta()` — write the versioned `_meta` envelope and
    read it back (with legacy flat `_familyId` back-compat).
  - `sortVariantsByOrder()` — stable sequence by each variant's `order` (folder reassembly).

## [0.1.2] — baseline

Changelog introduced at this version. For prior history, see `git log`.
