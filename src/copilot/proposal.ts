/**
 * Copilot tool-approval contract — the ONE definition the internal apps share for
 * the "authenticated agents + tool approval" capability (OPERATOR_COPILOT_PLATFORM.md).
 *
 * When an authenticated agent wants to run a mutating tool that needs explicit human
 * confirmation, the backend emits a `tool_proposal` over the widget socket (through the
 * existing `custom_event` envelope). `botuyo-landing` embeds that widget for the recruiting
 * copilot, so it types proposals/auth against THIS module instead of re-declaring them.
 *
 * IMPORTANT: the public chat widget (`@botuyo/chat-widget-standalone`) does NOT depend on
 * this package — it keeps its own copy of the socket payload type (`ToolProposalData`) so
 * external consumers never need a separate dep. These types are byte-compatible BY DESIGN
 * (identical field names) so the widget and the internal apps cannot drift.
 */

/** Terminal state of a proposal once the user — or the server, on expiry — resolves it. */
export type CopilotProposalStatus = 'confirmed' | 'cancelled' | 'expired'

/**
 * A mutating tool the agent wants to run, surfaced to the user as a confirm card.
 *
 * The client confirms with ONLY `proposalId`; the server re-derives `args` from its
 * persisted proposal and never trusts client-sent args — so `args` here is purely
 * informational/display-only. Mirrors the widget's `tool_proposal` payload.
 */
export interface CopilotProposal {
  /** Stable id correlating the proposal across propose → confirm/reject/expire. */
  proposalId: string
  /** Tool name the agent proposed (e.g. `create_vacancy`). */
  tool: string
  /** Short, human-readable title for the confirm card. */
  title?: string
  /** Longer summary of what will happen if confirmed. */
  summary?: string
  /** Informational/display args (server re-derives the real args on confirm). */
  args?: Record<string, unknown>
  /** When true, only the tenant owner may confirm (server stays the authority). */
  ownerOnly?: boolean
}

/** Payload of a `tool_proposal_resolved` / `tool_proposal_expired` event. */
export interface CopilotProposalResolved {
  proposalId: string
  status?: CopilotProposalStatus
}

/**
 * Handle a consumer needs to embed the platform widget for a tenant's managed copilot
 * agent — returned by `GET /api/recruiting/copilot/agent`. Mirrors the backend
 * `CopilotAgentService` return shape so landing and backend cannot drift.
 */
export interface CopilotAgentRef {
  /** Id of the tenant's hidden, managed copilot agent. */
  agentId: string
  /** The agent's API key used as the widget `apiKey` (omitted if not provisioned yet). */
  apiKey?: string
}

/**
 * Resolve a (refreshable) end-user token for the authenticated-agent socket handshake.
 * The host app returns its own short-lived user token; the widget supplies it as
 * `auth.token` and re-invokes this on `AUTH_EXPIRED`/`USER_IDENTITY_REQUIRED`.
 */
export type GetUserToken = () => Promise<string>

/** Fired when the agent requires identity and no (or an expired) token is available. */
export type OnAuthRequired = () => void

/**
 * Auth props a host app passes to the widget when embedding an authenticated agent.
 * Byte-compatible with the widget's public `ChatWidgetProps` auth surface.
 */
export interface CopilotAuthProps {
  getUserToken?: GetUserToken
  onAuthRequired?: OnAuthRequired
}
